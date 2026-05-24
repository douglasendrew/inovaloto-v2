<?php

namespace App\Middleware;

use App\Models\Master\Banca;
use App\Database\TenantContext;
use App\Utils\Response;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;

class TenantResolutionMiddleware
{
    /**
     * Resolve the tenant from Host header.
     * Returns true if resolved successfully, false otherwise (sends error response).
     */
    public static function handle(Request $request, SwooleResponse $response): bool
    {
        $host = $request->header['host'] ?? '';

        // Strip port if present
        if (false !== $pos = strpos($host, ':')) {
            $host = substr($host, 0, $pos);
        }

        // Identify tenant from domain: api.{tenant-name}.inovaloto.com.br
        // Matches e.g. api.demo.inovaloto.com.br, api.demo.localhost, etc.
        $tenantName = null;
        if (preg_match('/^api\.([a-zA-Z0-9\-]+)\./', $host, $matches)) {
            $tenantName = $matches[1];
        }

        if (!$tenantName) {
            Response::json($response, ['error' => 'Subdomínio do inquilino ausente ou inválido.'], 400);
            return false;
        }

        // Resolve tenant from master database
        $tenant = Banca::where('login_path', $tenantName)
                       ->orWhere('login_code', $tenantName)
                       ->first();

        if (!$tenant) {
            Response::json($response, ['error' => 'Inquilino não encontrado.'], 404);
            return false;
        }

        if ($tenant->status !== 'active') {
            Response::json($response, ['error' => 'Este inquilino está desativado.'], 403);
            return false;
        }

        // Register and switch database connection in this coroutine context
        $connectionName = "tenant_" . $tenant->uuid;
        \DbConfig::registerTenantConnection($connectionName, $tenant->db_name);

        TenantContext::setConnectionName($connectionName);
        TenantContext::setResolvedTenant($tenant);

        return true;
    }
}
