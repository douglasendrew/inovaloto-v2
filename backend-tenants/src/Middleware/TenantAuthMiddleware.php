<?php

namespace App\Middleware;

use App\Database\TenantContext;
use App\Models\User;
use App\Utils\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;

class TenantAuthMiddleware
{
    /**
     * Authenticate the incoming tenant request.
     * Returns the tenant User model if successful, otherwise sends a response and returns null.
     */
    public static function handle(Request $request, SwooleResponse $response): ?User
    {
        $authHeader = $request->header['authorization'] ?? '';
        if (!str_starts_with($authHeader, 'Bearer ')) {
            Response::json($response, ['error' => 'Não autorizado. Token ausente.'], 401);
            return null;
        }

        $token = substr($authHeader, 7);
        $secret = $_ENV['JWT_SECRET'] ?? 'inovaloto-secret-replace-in-prod';

        try {
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));

            // Retrieve the active tenant resolved by TenantResolutionMiddleware
            $resolvedTenant = TenantContext::getResolvedTenant();

            if (!$resolvedTenant) {
                Response::json($response, ['error' => 'Inquilino não resolvido no contexto.'], 500);
                return null;
            }

            // Verify that the token belongs to this tenant
            if ($decoded->tenant_uuid !== $resolvedTenant->uuid) {
                Response::json($response, ['error' => 'Token não pertence a esta banca.'], 403);
                return null;
            }

            // Retrieve the user from the tenant database
            $user = User::where('uuid', $decoded->user_uuid)->first();

            if (!$user) {
                Response::json($response, ['error' => 'Usuário não encontrado nesta banca.'], 401);
                return null;
            }

            if ($user->status !== 'active') {
                Response::json($response, ['error' => 'Sua conta não está ativa.'], 403);
                return null;
            }

            return $user;
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Token inválido ou expirado.'], 401);
            return null;
        }
    }
}
