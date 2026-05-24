<?php

require_once __DIR__ . '/bootstrap.php';

use App\Models\Master\Banca;
use App\Models\Modalidades;
use App\Database\TenantContext;
use App\Controllers\ScheduleConcursoController;
use Swoole\Coroutine;
use Swoole\Timer;

// Run once support
$runOnce = in_array('--once', $argv) || in_array('-o', $argv);

function runScheduler()
{
    echo "[" . date('Y-m-d H:i:s') . "] Starting lottery scheduler checks...\n";

    // 1. Fetch active tenants
    $bancas = Banca::where('status', 'active')->get();

    if ($bancas->isEmpty()) {
        echo "No active tenants found.\n";
        return;
    }

    $scheduleController = new ScheduleConcursoController();

    foreach ($bancas as $banca) {
        echo "Processing scheduler for tenant: {$banca->nome}\n";

        $connectionName = "tenant_" . $banca->uuid;
        DbConfig::registerTenantConnection($connectionName, $banca->db_name);
        TenantContext::setConnectionName($connectionName);
        TenantContext::setResolvedTenant($banca);

        try {
            // Get all active modalities for this tenant
            $modalidades = Modalidades::where('ativo', '1')->get();

            foreach ($modalidades as $modalidade) {
                $scheduleController->scheduleNextConcurse($modalidade->id);
            }
        } catch (\Throwable $e) {
            echo "Failed to run scheduler for tenant {$banca->nome}: " . $e->getMessage() . "\n";
        } finally {
            TenantContext::clear();
        }
    }

    echo "[" . date('Y-m-d H:i:s') . "] Completed lottery scheduler checks.\n";
}

if ($runOnce) {
    \Swoole\Coroutine\run(function () {
        runScheduler();
    });
} else {
    echo "Starting Persistent Lottery Scheduler Worker Daemon using Swoole...\n";

    // Check every 5 minutes
    $intervalMs = 5 * 60 * 1000;

    Timer::tick($intervalMs, function () {
        Coroutine::create(function () {
            runScheduler();
        });
    });

    // Run first check immediately
    Coroutine::create(function () {
        runScheduler();
    });
}
