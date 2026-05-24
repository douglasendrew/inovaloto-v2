<?php

namespace App\Controllers;

use App\Models\Master\Banca;
use App\Models\User;
use App\Models\LogLogin;
use App\Database\TenantContext;
use App\Utils\Response;
use Firebase\JWT\JWT;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;

class AuthController
{
    /**
     * Authenticate or check username and login/set password.
     */
    public function login(Request $request, SwooleResponse $response): void
    {
        $rawContent = $request->rawContent();
        $data = json_decode($rawContent, true) ?? [];

        $usernameInput = $data['username'] ?? null;
        $passwordInput = $data['password'] ?? null;
        $passwordConfirmInput = $data['password_confirm'] ?? null;

        if (empty($usernameInput)) {
            Response::json($response, ['error' => 'O campo usuário é obrigatório.'], 400);
            return;
        }

        // 1. Identify the Tenant (Banca) from username prefix (e.g. "code-username" or "path-username")
        $tenant = Banca::where(function ($query) use ($usernameInput) {
            $query->whereRaw('? LIKE CONCAT(login_code, "-%")', [$usernameInput])
                  ->orWhereRaw('? LIKE CONCAT(login_path, "-%")', [$usernameInput]);
        })->first();

        if (!$tenant) {
            Response::json($response, ['error' => 'Banca não encontrada para o usuário informado.'], 404);
            return;
        }

        if ($tenant->status !== 'active') {
            Response::json($response, ['error' => 'Esta banca está temporariamente desativada.'], 403);
            return;
        }

        // 2. Setup tenant database connection dynamically in this coroutine context
        $connectionName = "tenant_" . $tenant->uuid;
        \DbConfig::registerTenantConnection($connectionName, $tenant->db_name);
        TenantContext::setConnectionName($connectionName);

        // 3. Extract the username without prefix to search in the tenant's user table
        $strippedUsername = $usernameInput;
        $prefixes = [$tenant->login_code . '-', $tenant->login_path . '-'];
        foreach ($prefixes as $prefix) {
            if (str_starts_with($usernameInput, $prefix)) {
                $strippedUsername = substr($usernameInput, strlen($prefix));
                break;
            }
        }

        // 4. Find the user in the tenant database
        $user = User::where('username', $strippedUsername)->first();

        if (!$user) {
            Response::json($response, ['error' => 'Usuário inválido.'], 404);
            return;
        }

        // Check if user account is disabled or pending approval
        if ($user->status === 'disabled') {
            Response::json($response, ['error' => 'Sua conta está desabilitada.'], 403);
            return;
        }

        if ($user->status === 'pending_aprovation') {
            Response::json($response, ['error' => 'Sua conta está aguardando aprovação.'], 403);
            return;
        }

        $ip = $request->header['x-forwarded-for'] ?? $request->header['client-ip'] ?? $request->server['remote_addr'] ?? '';
        $userAgent = $request->header['user-agent'] ?? '';

        // 5. If user has no password, they need to create one
        if (empty($user->password)) {
            if (empty($passwordInput) || empty($passwordConfirmInput)) {
                Response::json($response, [
                    'status' => 'create_password_required',
                    'message' => 'Criação de senha necessária.',
                    'username' => $usernameInput
                ]);
                return;
            }

            if (strlen($passwordInput) < 6) {
                Response::json($response, ['error' => 'A senha deve conter no mínimo 6 caracteres.'], 400);
                return;
            }

            if ($passwordInput !== $passwordConfirmInput) {
                Response::json($response, ['error' => 'As senhas não conferem.'], 400);
                return;
            }

            // Update user password
            $user->password = password_hash($passwordInput, PASSWORD_BCRYPT);
            $user->save();
        } else {
            // Password verification
            if (empty($passwordInput)) {
                Response::json($response, [
                    'status' => 'password_required',
                    'message' => 'Por favor, insira sua senha.',
                    'username' => $usernameInput
                ]);
                return;
            }

            if (!password_verify($passwordInput, $user->password)) {
                // Log unsuccessful attempt
                LogLogin::create([
                    'user_id' => $user->id,
                    'ip' => $ip,
                    'device' => substr($userAgent, 0, 255),
                    'login_success' => false,
                    'login_unsuccessfull_reason' => 'Senha incorreta'
                ]);

                Response::json($response, ['error' => 'Usuário e/ou senha inválidos.'], 401);
                return;
            }
        }

        // 6. Log successful login
        LogLogin::create([
            'user_id' => $user->id,
            'ip' => $ip,
            'device' => substr($userAgent, 0, 255),
            'login_success' => true,
            'login_unsuccessfull_reason' => null
        ]);

        // 7. Issue JWT token
        $jwtSecret = $_ENV['JWT_SECRET'] ?? 'inovaloto-secret-replace-in-prod';
        $expiry = (int)($_ENV['JWT_EXPIRY'] ?? 43200);

        $payload = [
            'iss' => 'inovaloto',
            'iat' => time(),
            'exp' => time() + $expiry,
            'user_uuid' => $user->uuid,
            'tenant_uuid' => $tenant->uuid,
            'role' => $user->role,
            'db_name' => $tenant->db_name,
        ];

        $token = JWT::encode($payload, $jwtSecret, 'HS256');

        Response::json($response, [
            'status' => 'success',
            'token' => $token,
            'user' => [
                'uuid' => $user->uuid,
                'name' => $user->name,
                'role' => $user->role,
                'username' => $user->username,
            ],
            'tenant' => [
                'uuid' => $tenant->uuid,
                'nome' => $tenant->nome,
                'login_path' => $tenant->login_path,
                'logo' => $tenant->logo,
            ]
        ]);
    }
}
