<?php

require_once __DIR__ . '/bootstrap.php';

use App\Middleware\CorsMiddleware;
use App\Utils\Response;
use App\Database\TenantContext;
use FastRoute\RouteCollector;
use function FastRoute\simpleDispatcher;

// Define dispatcher with routes
$dispatcher = simpleDispatcher(function (RouteCollector $r) {
    $r->post('/auth/login', [App\Controllers\AuthController::class, 'login']);
});

$host = $_ENV['HTTP_HOST'] ?? '0.0.0.0';
$port = (int)($_ENV['HTTP_PORT'] ?? 8000);

$server = new \Swoole\Http\Server($host, $port);

// Configure server parameters
$server->set([
    'worker_num' => swoole_cpu_num() * 2,
    'enable_coroutine' => true,
    'max_coroutine' => 10000,
    'open_http2_protocol' => true,
    'log_level' => SWOOLE_LOG_INFO,
]);

$server->on('start', function ($server) use ($host, $port) {
    echo "Swoole HTTP Server started at http://{$host}:{$port}\n";
});

$server->on('request', function ($request, $response) use ($dispatcher) {
    // 1. Process CORS middleware
    if (!CorsMiddleware::handle($request, $response)) {
        return;
    }

    $uri = $request->server['request_uri'];
    $method = $request->server['request_method'];

    // Strip query string from URI
    if (false !== $pos = strpos($uri, '?')) {
        $uri = substr($uri, 0, $pos);
    }
    $uri = rawurldecode($uri);

    try {
        // Dispatch route
        $routeInfo = $dispatcher->dispatch($method, $uri);

        switch ($routeInfo[0]) {
            case \FastRoute\Dispatcher::NOT_FOUND:
                Response::json($response, ['error' => 'Not Found'], 404);
                break;

            case \FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
                Response::json($response, ['error' => 'Method Not Allowed'], 405);
                break;

            case \FastRoute\Dispatcher::FOUND:
                $handler = $routeInfo[1];
                $vars = $routeInfo[2];

                if (is_array($handler) && count($handler) === 2) {
                    $controllerClass = $handler[0];
                    $methodName = $handler[1];

                    $controller = new $controllerClass();
                    $controller->$methodName($request, $response, ...array_values($vars));
                } else {
                    Response::json($response, ['error' => 'Internal Server Error: Invalid handler'], 500);
                }
                break;
        }
    } catch (\Throwable $e) {
        // Log error
        echo "Error: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n";
        echo $e->getTraceAsString() . "\n";

        Response::json($response, [
            'error' => 'Internal Server Error',
            'message' => $_ENV['APP_DEBUG'] === 'true' ? $e->getMessage() : null,
            'trace' => $_ENV['APP_DEBUG'] === 'true' ? $e->getTrace() : null
        ], 500);
    } finally {
        // Clean up coroutine context
        TenantContext::clear();
    }
});

$server->start();
