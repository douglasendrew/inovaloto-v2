<?php

namespace App\Middleware;

use App\Utils\Response;
use App\Models\Master\MasterUser;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;

class MasterAuthMiddleware
{
    /**
     * Authenticate the incoming request.
     * Returns the master user model if successful, otherwise sends a response and returns null.
     */
    public static function handle(Request $request, SwooleResponse $response): ?MasterUser
    {
        $authHeader = $request->header['authorization'] ?? '';
        if (!str_starts_with($authHeader, 'Bearer ')) {
            Response::json($response, ['error' => 'Acesso não autorizado. Token ausente.'], 401);
            return null;
        }

        $token = substr($authHeader, 7);
        $secret = $_ENV['JWT_SECRET_MASTER'] ?? 'inovaloto-master-secret-replace-in-prod';

        try {
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));

            if (!isset($decoded->role) || $decoded->role !== 'master') {
                Response::json($response, ['error' => 'Acesso negado. Apenas usuários master possuem permissão.'], 403);
                return null;
            }

            // Find master user
            $user = MasterUser::find($decoded->user_id);
            if (!$user) {
                Response::json($response, ['error' => 'Usuário master não encontrado.'], 401);
                return null;
            }

            return $user;
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Token inválido ou expirado.'], 401);
            return null;
        }
    }
}
