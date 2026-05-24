<?php

namespace App\Controllers;

use App\Models\Master\MasterUser;
use App\Models\Master\ExclusiveLoginAttempt;
use App\Utils\Response;
use Firebase\JWT\JWT;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;

class MasterAuthController
{
    private const MAX_ATTEMPTS = 4;
    private const BLOCK_HOURS = 24;

    /**
     * Authenticate master admin user.
     */
    public function login(Request $request, SwooleResponse $response): void
    {
        $rawContent = $request->rawContent();
        $data = json_decode($rawContent, true) ?? [];

        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (empty($email) || empty($password)) {
            Response::json($response, ['error' => 'E-mail e senha são obrigatórios.'], 400);
            return;
        }

        $ip = $request->header['x-forwarded-for'] ?? $request->header['client-ip'] ?? $request->server['remote_addr'] ?? '';

        // Check if IP is blocked due to excessive failed attempts
        $since = date('Y-m-d H:i:s', time() - (self::BLOCK_HOURS * 3600));
        $attempts = ExclusiveLoginAttempt::where('ip', $ip)
            ->where('created_at', '>=', $since)
            ->count();

        if ($attempts >= self::MAX_ATTEMPTS) {
            Response::json($response, [
                'error' => 'Acesso bloqueado por 24h devido a múltiplas tentativas falhas. Tente novamente mais tarde.'
            ], 403);
            return;
        }

        $user = MasterUser::where('email', $email)->first();

        // Standard laravel master user can have password hashed with bcrypt/argon.
        // We will verify using password_verify.
        if (!$user || !password_verify($password, $user->password)) {
            // Record failed attempt
            ExclusiveLoginAttempt::create([
                'ip' => $ip,
                'email' => $email,
                'created_at' => date('Y-m-d H:i:s')
            ]);

            $remaining = self::MAX_ATTEMPTS - ($attempts + 1);
            $message = $remaining > 0
                ? "Credenciais inválidas. {$remaining} tentativa(s) restante(s) antes do bloqueio."
                : 'Credenciais inválidas. Você foi bloqueado por 24h.';

            Response::json($response, ['error' => $message], 401);
            return;
        }

        // Issue master token
        $jwtSecret = $_ENV['JWT_SECRET_MASTER'] ?? 'inovaloto-master-secret-replace-in-prod';
        $expiry = (int)($_ENV['JWT_EXPIRY'] ?? 43200);

        $payload = [
            'iss' => 'inovaloto-master',
            'iat' => time(),
            'exp' => time() + $expiry,
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => 'master',
        ];

        $token = JWT::encode($payload, $jwtSecret, 'HS256');

        Response::json($response, [
            'status' => 'success',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }
}
