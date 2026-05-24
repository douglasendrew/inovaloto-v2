<?php

namespace App\Controllers;

use App\Models\Master\Banca;
use App\Models\User;
use App\Database\TenantContext;
use App\Middleware\MasterAuthMiddleware;
use App\Utils\Response;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;

class BancaController
{
    /**
     * List all bancas.
     */
    public function index(Request $request, SwooleResponse $response): void
    {
        if (!MasterAuthMiddleware::handle($request, $response)) {
            return;
        }

        $search = $request->get['search'] ?? null;
        $query = Banca::with('gateway');

        if ($search) {
            $query->where('nome', 'like', '%' . $search . '%');
        }

        $bancas = $query->orderBy('nome')->get();

        Response::json($response, ['bancas' => $bancas]);
    }

    /**
     * Create a new banca.
     */
    public function store(Request $request, SwooleResponse $response): void
    {
        if (!MasterAuthMiddleware::handle($request, $response)) {
            return;
        }

        $rawContent = $request->rawContent();
        $data = json_decode($rawContent, true) ?? [];

        $nome = $data['nome'] ?? null;
        $dbName = $data['db_name'] ?? null;
        $loginPath = $data['login_path'] ?? null;
        $loginCode = $data['login_code'] ?? null;
        $gatewayId = $data['gateway_id'] ?? null;

        if (empty($nome) || empty($dbName) || empty($loginPath) || empty($loginCode)) {
            Response::json($response, ['error' => 'Nome, nome do banco de dados, login_path e login_code são obrigatórios.'], 400);
            return;
        }

        // Validate uniqueness in master DB
        if (Banca::where('nome', $nome)->exists()) {
            Response::json($response, ['error' => 'Já existe uma banca com este nome.'], 400);
            return;
        }
        if (Banca::where('db_name', $dbName)->exists()) {
            Response::json($response, ['error' => 'Este nome de banco de dados já está em uso.'], 400);
            return;
        }
        if (Banca::where('login_path', $loginPath)->exists()) {
            Response::json($response, ['error' => 'Este login_path já está em uso.'], 400);
            return;
        }
        if (Banca::where('login_code', $loginCode)->exists()) {
            Response::json($response, ['error' => 'Este login_code já está em uso.'], 400);
            return;
        }

        // Generate UUID
        $bancaUuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $banca = Banca::create([
            'uuid' => $bancaUuid,
            'nome' => $nome,
            'db_name' => $dbName,
            'login_path' => $loginPath,
            'login_code' => $loginCode,
            'status' => 'active',
            'gateway_id' => $gatewayId ?: null,
        ]);

        $username = $loginPath . '-admin';

        try {
            // Switch connection to the new tenant DB to create the admin user
            $connectionName = "tenant_temp_" . $banca->uuid;
            \DbConfig::registerTenantConnection($connectionName, $banca->db_name);
            TenantContext::setConnectionName($connectionName);

            $adminUuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );

            // Create admin user on tenant database
            User::create([
                'uuid' => $adminUuid,
                'name' => 'Admin ' . $banca->nome,
                'username' => $username,
                'email' => $username . '@' . str_replace('-', '', $loginPath) . '.com',
                'role' => 'admin',
                'status' => 'active',
                'password' => password_hash('123456', PASSWORD_BCRYPT),
            ]);
        } catch (\Throwable $e) {
            // Just log/warn, database tables might not exist or migrations haven't run yet
            echo "Warning: Could not create admin user in tenant DB yet: " . $e->getMessage() . "\n";
        } finally {
            TenantContext::clear();
        }

        Response::json($response, [
            'success' => true,
            'message' => "Banca '{$banca->nome}' criada com sucesso! Admin: {$username}",
            'banca' => $banca
        ], 201);
    }

    /**
     * Update an existing banca.
     */
    public function update(Request $request, SwooleResponse $response, string $uuid): void
    {
        if (!MasterAuthMiddleware::handle($request, $response)) {
            return;
        }

        $banca = Banca::where('uuid', $uuid)->first();
        if (!$banca) {
            Response::json($response, ['error' => 'Banca não encontrada.'], 404);
            return;
        }

        $rawContent = $request->rawContent();
        $data = json_decode($rawContent, true) ?? [];

        $nome = $data['nome'] ?? null;
        $dbName = $data['db_name'] ?? null;
        $loginPath = $data['login_path'] ?? null;
        $loginCode = $data['login_code'] ?? null;
        $status = $data['status'] ?? null;
        $gatewayId = $data['gateway_id'] ?? null;

        if ($nome) $banca->nome = $nome;
        if ($dbName) $banca->db_name = $dbName;
        if ($loginPath) $banca->login_path = $loginPath;
        if ($loginCode) $banca->login_code = $loginCode;
        if ($status) $banca->status = $status;
        if (array_key_exists('gateway_id', $data)) $banca->gateway_id = $gatewayId ?: null;

        $banca->save();

        Response::json($response, [
            'success' => true,
            'message' => 'Banca atualizada com sucesso!',
            'banca' => $banca
        ]);
    }

    /**
     * Toggle status.
     */
    public function toggleStatus(Request $request, SwooleResponse $response, string $uuid): void
    {
        if (!MasterAuthMiddleware::handle($request, $response)) {
            return;
        }

        $banca = Banca::where('uuid', $uuid)->first();
        if (!$banca) {
            Response::json($response, ['error' => 'Banca não encontrada.'], 404);
            return;
        }

        $banca->status = $banca->status === 'active' ? 'inactive' : 'active';
        $banca->save();

        Response::json($response, [
            'success' => true,
            'status' => $banca->status,
            'message' => "Banca {$banca->nome} " . ($banca->status === 'active' ? 'ativada' : 'inativada') . " com sucesso!"
        ]);
    }
}
