<?php

require_once __DIR__ . '/bootstrap.php';

use App\Middleware\CorsMiddleware;
use App\Middleware\TenantResolutionMiddleware;
use App\Utils\Response;
use App\Database\TenantContext;
use FastRoute\RouteCollector;
use function FastRoute\simpleDispatcher;

// Define dispatcher with routes
$dispatcher = simpleDispatcher(function (RouteCollector $r) {
    $r->get('/dashboard', [App\Controllers\DashboardController::class, 'index']);

    // Sorteios routes
    $r->get('/sorteios', [App\Controllers\SorteiosController::class, 'index']);
    $r->post('/sorteios/save', [App\Controllers\SorteiosController::class, 'saveSorteio']);
    $r->get('/sorteios/get-modality-data/{modalidade_id}', [App\Controllers\SorteiosController::class, 'getModalityData']);
    $r->post('/sorteios/one-click/save', [App\Controllers\SorteiosController::class, 'oneClickAddSorteioSave']);
    $r->get('/sorteios/{sorteio_uuid}', [App\Controllers\SorteiosController::class, 'editSorteio']);
    $r->post('/sorteios/{sorteio_uuid}/edit/save', [App\Controllers\SorteiosController::class, 'saveEditSorteio']);
    $r->post('/sorteios/{sorteio_uuid}/conferir', [App\Controllers\SorteiosController::class, 'conferirResultado']);
    $r->post('/sorteios/{sorteio_uuid}/desfazer-conferencia', [App\Controllers\SorteiosController::class, 'desfazerConferenciaResultado']);
    $r->post('/sorteios/{sorteio_uuid}/delete', [App\Controllers\SorteiosController::class, 'deleteSorteio']);
    $r->post('/sorteios/{sorteio_uuid}/delete/bilhete', [App\Controllers\SorteiosController::class, 'deleteBilheteSorteio']);

    // Vendedores routes
    $r->get('/vendedores', [App\Controllers\VendedoresController::class, 'index']);
    $r->get('/vendedores/solicitacoes', [App\Controllers\VendedoresController::class, 'pendingConsultants']);
    $r->post('/vendedores/save', [App\Controllers\VendedoresController::class, 'saveVendedor']);
    $r->get('/vendedores/{vendedor_uuid}', [App\Controllers\VendedoresController::class, 'viewVendedor']);
    $r->post('/vendedores/{vendedor_uuid}/edit/save', [App\Controllers\VendedoresController::class, 'saveEditVendedor']);
    $r->post('/vendedores/{vendedor_uuid}/disable', [App\Controllers\VendedoresController::class, 'disableUser']);
    $r->post('/vendedores/{vendedor_uuid}/reset-password', [App\Controllers\VendedoresController::class, 'resetPasswordUser']);
    $r->get('/vendedores/{vendedor_uuid}/limites', [App\Controllers\VendedoresController::class, 'listModalitiesLimits']);
    $r->get('/vendedores/{vendedor_uuid}/limites/modalidade/{modalidade_uuid}', [App\Controllers\VendedoresController::class, 'listDozensLimits']);
    $r->post('/vendedores/limites/save', [App\Controllers\VendedoresController::class, 'saveConsultantLimit']);

    // Apostadores routes
    $r->get('/apostadores', [App\Controllers\ApostadoresController::class, 'index']);
    $r->post('/apostadores/save', [App\Controllers\ApostadoresController::class, 'saveApostador']);
    $r->get('/apostadores/{apostador_uuid}', [App\Controllers\ApostadoresController::class, 'viewApostador']);
    $r->post('/apostadores/{apostador_uuid}/edit/save', [App\Controllers\ApostadoresController::class, 'saveEditApostador']);
    $r->post('/apostadores/{apostador_uuid}/disable', [App\Controllers\ApostadoresController::class, 'disableUser']);
    $r->post('/apostadores/{apostador_uuid}/reset-password', [App\Controllers\ApostadoresController::class, 'resetPasswordUser']);
    $r->post('/apostadores/clone', [App\Controllers\ApostadoresController::class, 'cloneAposta']);

    // Concursos routes
    $r->get('/concursos', [App\Controllers\ConcursosController::class, 'index']);
    $r->get('/concursos/view/{concurso_uuid}', [App\Controllers\ConcursosController::class, 'viewConcurso']);
    $r->post('/concursos/save/{concurso_uuid}/bilhetes', [App\Controllers\ConcursosController::class, 'saveBilhete']);
    $r->post('/concursos/save/{concurso_uuid}/bilhetes/{user_uuid}', [App\Controllers\ConcursosController::class, 'saveBilhete']);
    $r->post('/concursos/validate/{concurso_uuid}', [App\Controllers\ConcursosController::class, 'validateCart']);
    $r->post('/concursos/validate/{concurso_uuid}/{user_uuid}', [App\Controllers\ConcursosController::class, 'validateCart']);
    $r->post('/concursos/validate-single/{concurso_uuid}', [App\Controllers\ConcursosController::class, 'validateSingle']);
    $r->post('/concursos/validate-single/{concurso_uuid}/{user_uuid}', [App\Controllers\ConcursosController::class, 'validateSingle']);

    // Wallet routes
    $r->get('/wallet/info', [App\Controllers\WalletController::class, 'index']);
    $r->get('/wallet/info/{user_uuid}', [App\Controllers\WalletController::class, 'index']);
    $r->post('/wallet/credito', [App\Controllers\WalletController::class, 'addCredito']);
    $r->post('/wallet/credito/{user_uuid}', [App\Controllers\WalletController::class, 'addCredito']);
    $r->post('/wallet/debit', [App\Controllers\WalletController::class, 'rmCredito']);
    $r->post('/wallet/debit/{user_uuid}', [App\Controllers\WalletController::class, 'rmCredito']);
    $r->post('/wallet/status', [App\Controllers\WalletController::class, 'changeStatusWallet']);
    $r->post('/wallet/status/{user_uuid}', [App\Controllers\WalletController::class, 'changeStatusWallet']);
    $r->get('/wallet/relatorio', [App\Controllers\WalletController::class, 'relatorioView']);
    $r->get('/wallet/relatorio/{user_uuid}', [App\Controllers\WalletController::class, 'relatorioView']);
    $r->get('/wallet/relatorio-vendas', [App\Controllers\WalletController::class, 'relatorioVendasView']);
    $r->get('/wallet/relatorio-vendas/{user_uuid}', [App\Controllers\WalletController::class, 'relatorioVendasView']);
    $r->get('/wallet/fechamento-caixa/{user_uuid}', [App\Controllers\WalletController::class, 'fechamentoCaixaView']);
    $r->post('/wallet/fechamento-caixa/{user_uuid}/saque', [App\Controllers\WalletController::class, 'saqueFechamentoCaixa']);
    $r->post('/wallet/fechamento-caixa/{user_uuid}/deposito', [App\Controllers\WalletController::class, 'depositoFechamentoCaixa']);
    $r->delete('/wallet/fechamento-caixa/{user_uuid}', [App\Controllers\WalletController::class, 'deleteFechamentoCaixa']);
});


$host = $_ENV['HTTP_HOST'] ?? '0.0.0.0';
$port = (int)($_ENV['HTTP_PORT'] ?? 8002); // tenant service defaults to 8002

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
    echo "Swoole HTTP Tenants Server started at http://{$host}:{$port}\n";
});

$server->on('request', function ($request, $response) use ($dispatcher) {
    // 1. Process CORS middleware
    if (!CorsMiddleware::handle($request, $response)) {
        return;
    }

    // 2. Resolve Tenant from Subdomain
    if (!TenantResolutionMiddleware::handle($request, $response)) {
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
