<?php

namespace App\Middleware;

use Swoole\Http\Request;
use Swoole\Http\Response;

class CorsMiddleware
{
    public static function handle(Request $request, Response $response): bool
    {
        $response->header('Access-Control-Allow-Origin', '*');
        $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        if ($request->server['request_method'] === 'OPTIONS') {
            $response->status(204);
            $response->end();
            return false;
        }

        return true;
    }
}
