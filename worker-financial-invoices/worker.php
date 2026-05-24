<?php

require_once __DIR__ . '/bootstrap.php';

use App\Models\Master\Banca;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\SorteiosApostas;
use App\Models\LogSorteios;
use App\Database\TenantContext;
use App\Services\FinanceService;
use Carbon\Carbon;
use Swoole\Coroutine;
use Swoole\Timer;
use Ramsey\Uuid\Uuid;

// Flag to run once and exit (for CLI / Cron support)
$runOnce = in_array('--once', $argv) || in_array('-o', $argv);

function processInvoices(?string $date = null)
{
    $referenceDate = $date ?: Carbon::yesterday()->format('Y-m-d');
    echo "[" . date('Y-m-d H:i:s') . "] Starting invoice processing for: {$referenceDate}\n";

    // 1. Fetch active tenants from master
    $bancas = Banca::where('status', 'active')->get();

    if ($bancas->isEmpty()) {
        echo "No active tenants found.\n";
        return;
    }

    $financeService = new FinanceService();

    foreach ($bancas as $banca) {
        echo "--------------------------------------------------\n";
        echo "Processing tenant: {$banca->nome} ({$banca->db_name})\n";

        // Setup tenant connection inside the coroutine context
        $connectionName = "tenant_" . $banca->uuid;
        DbConfig::registerTenantConnection($connectionName, $banca->db_name);
        TenantContext::setConnectionName($connectionName);
        TenantContext::setResolvedTenant($banca);

        try {
            // A. Generate Daily Invoices
            generateInvoicesForTenant($banca, $referenceDate);

            // B. Sync Paid Invoices to Fechamento
            syncPaidInvoices($banca, $financeService);

        } catch (\Throwable $e) {
            echo "Failed to process financial tasks for {$banca->nome}: " . $e->getMessage() . "\n";
        } finally {
            TenantContext::clear();
        }
    }

    echo "--------------------------------------------------\n";
    echo "[" . date('Y-m-d H:i:s') . "] Finished invoice processing.\n";
}

function generateInvoicesForTenant(Banca $banca, string $referenceDate)
{
    // Find all bets for draws on the reference date
    $allApostas = SorteiosApostas::with(['vendedor', 'sorteio'])
        ->whereHas('sorteio', function($query) use ($referenceDate) {
            $query->whereDate('data_sorteio', $referenceDate);
        })
        ->whereNotNull('vendedor_id')
        ->get()
        ->groupBy('vendedor_id');

    if ($allApostas->isEmpty()) {
        echo "-> No tickets found for {$banca->nome} on {$referenceDate}.\n";
        return;
    }

    foreach ($allApostas as $vendedorId => $apostas) {
        $seller = $apostas->first()->vendedor;
        if (!$seller || !$seller->id) continue;

        $totalVendas = $apostas->sum('val_apostado');
        $totalComissoes = $apostas->sum('vendedor_comissao_venda') + $apostas->sum('vendedor_comissao_bonus');
        $totalPremios = $apostas->sum('val_premiacao');
        
        $balance = $totalVendas - ($totalComissoes + $totalPremios);

        if ($balance > 0) {
            // Verify invoice existence
            $exists = Invoice::where('user_id', $seller->id)
                ->where('reference_date', $referenceDate)
                ->exists();

            if (!$exists) {
                $invoice = Invoice::create([
                    'uuid' => Uuid::uuid4()->toString(),
                    'user_id' => $seller->id,
                    'amount' => $balance,
                    'status' => 'pending',
                    'reference_date' => $referenceDate,
                ]);

                // Map invoice items
                foreach ($apostas as $aposta) {
                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'aposta_id' => $aposta->id,
                    ]);
                }

                echo "-> Created Invoice for {$seller->name}: R$ " . number_format($balance, 2, ',', '.') . " ({$apostas->count()} tickets)\n";
            } else {
                echo "-> Invoice already exists for {$seller->name} on {$referenceDate}\n";
            }
        } else {
            echo "-> Balance was non-positive for {$seller->name}: R$ " . number_format($balance, 2, ',', '.') . "\n";
        }
    }
}

function syncPaidInvoices(Banca $banca, FinanceService $financeService)
{
    $invoices = Invoice::where('status', 'paid')->get();

    if ($invoices->isEmpty()) {
        return;
    }

    $count = 0;
    foreach ($invoices as $invoice) {
        // Verify sync logs
        $alreadySynced = LogSorteios::where('log_titulo', 'Baixa automática de fatura no fechamento')
            ->where('log_detalhes', 'like', '%"invoice_id":' . $invoice->id . '%')
            ->exists();

        if ($alreadySynced) {
            continue;
        }

        try {
            $financeService->giveBaixaNoFechamento($invoice);
            $count++;
        } catch (\Throwable $e) {
            echo "-> Failed to sync paid invoice #{$invoice->id}: " . $e->getMessage() . "\n";
        }
    }

    if ($count > 0) {
        echo "-> Synced {$count} paid invoices to Fechamento Caixa.\n";
    }
}

// 2. Running logic
if ($runOnce) {
    // Single coroutine execution
    \Swoole\Coroutine\run(function () {
        global $argv;
        $dateArg = null;
        foreach ($argv as $arg) {
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $arg)) {
                $dateArg = $arg;
                break;
            }
        }
        processInvoices($dateArg);
    });
} else {
    // Running as a persistent worker daemon
    echo "Starting Persistent Financial Invoices Worker Daemon using Swoole...\n";
    
    // Check every 30 minutes
    $intervalMs = 30 * 60 * 1000;
    
    Timer::tick($intervalMs, function () {
        Coroutine::create(function () {
            processInvoices();
        });
    });

    // Run first check immediately
    Coroutine::create(function () {
        processInvoices();
    });
}
