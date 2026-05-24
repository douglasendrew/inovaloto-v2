<?php

namespace App\Controllers;

use App\Models\FechamentoCaixa;
use App\Models\SorteiosApostas;
use App\Models\User;
use App\Models\Wallet;
use App\Database\TenantContext;
use App\Middleware\TenantAuthMiddleware;
use App\Utils\Response;
use Carbon\Carbon;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;

class DashboardController
{
    /**
     * Helper to build dynamic date range query.
     */
    private function getBaseQuery(Request $request, int $bancaId)
    {
        $query = SorteiosApostas::whereHas('sorteio', function ($q) use ($bancaId) {
            $q->where('banca_id', $bancaId);
        });

        $dateRange = $request->get['dateRange'] ?? null;

        if ($dateRange && $dateRange !== 'undefined') {
            try {
                $dateRangeSplit = explode(' até ', $dateRange);
                $startDate = trim($dateRangeSplit[0]);
                $endDate = isset($dateRangeSplit[1]) ? trim($dateRangeSplit[1]) : $startDate;

                $query->whereHas('sorteio', function($q) use ($startDate, $endDate) {
                    $q->where('data_sorteio', '>=', $startDate . ' 00:00:00')
                      ->where('data_sorteio', '<=', $endDate . ' 23:59:59');
                });
            } catch (\Exception $e) {
                // Fallback today
                $query->whereHas('sorteio', function($q) {
                    $today = Carbon::today()->format('Y-m-d');
                    $q->where('data_sorteio', '>=', $today . ' 00:00:00')
                      ->where('data_sorteio', '<=', $today . ' 23:59:59');
                });
            }
        } else {
            $query->whereHas('sorteio', function($q) {
                $today = Carbon::today()->format('Y-m-d');
                $q->where('data_sorteio', '>=', $today . ' 00:00:00')
                  ->where('data_sorteio', '<=', $today . ' 23:59:59');
            });
        }

        return $query;
    }

    /**
     * Return dashboard raw summary metrics.
     */
    public function index(Request $request, SwooleResponse $response): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) {
            return;
        }

        if ($user->role !== 'admin') {
            Response::json($response, ['error' => 'Acesso proibido. Apenas administradores possuem acesso ao painel.'], 403);
            return;
        }

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        // 1. Core bet and prizes summary
        $baseQuery = $this->getBaseQuery($request, $bancaId);
        $summary = (clone $baseQuery)->selectRaw('
            COUNT(*) as total_apostas,
            SUM(COALESCE(val_apostado, 0)) as val_apostado,
            SUM(COALESCE(val_premiacao, 0)) as val_premiacao,
            SUM(COALESCE(vendedor_comissao_venda, 0)) as val_comissoes
        ')->first();

        $totalApostas = $summary->total_apostas ?? 0;
        $valApostado = $summary->val_apostado ?? 0;
        $valPremiacao = $summary->val_premiacao ?? 0;
        $valComissoes = $summary->val_comissoes ?? 0;

        // 2. Saldo Apostadores Total
        $saldoApostadores = Wallet::whereHas('user', function ($q) use ($bancaId) {
                $q->where('banca_id', $bancaId);
            })
            ->where('status', 'active')
            ->sum('saldo');

        // 3. Saldo Vendedores Total
        $fechamentosStats = FechamentoCaixa::whereHas('user', function ($q) use ($bancaId) {
                $q->where('banca_id', $bancaId);
            })
            ->selectRaw('
                SUM(val_vendas) as val_vendas,
                SUM(val_comissoes) as val_comissoes,
                SUM(val_premiacoes) as val_premiacoes,
                SUM(valor) as valor
            ')
            ->first();

        $val = ($fechamentosStats->val_vendas ?? 0) - (($fechamentosStats->val_premiacoes ?? 0) + ($fechamentosStats->val_comissoes ?? 0));
        $saldoVendedores = ($fechamentosStats->valor ?? 0) + $val;

        $saldoLiquido = $valApostado - ($valComissoes + $valPremiacao);

        Response::json($response, [
            'totalBilhetes' => (int)$totalApostas,
            'valTotalApostado' => (float)$valApostado,
            'valTotalPremiacao' => (float)$valPremiacao,
            'valTotalComissoes' => (float)$valComissoes,
            'saldoApostadores' => (float)$saldoApostadores,
            'saldoVendedores' => (float)$saldoVendedores,
            'saldoLiquido' => (float)$saldoLiquido,
            'formatted' => [
                'valTotalApostado' => 'R$ ' . number_format($valApostado, 2, ',', '.'),
                'valTotalPremiacao' => 'R$ ' . number_format($valPremiacao, 2, ',', '.'),
                'valTotalComissoes' => 'R$ ' . number_format($valComissoes, 2, ',', '.'),
                'saldoVendedores' => 'R$ ' . number_format($saldoVendedores, 2, ',', '.'),
                'saldoApostadores' => 'R$ ' . number_format($saldoApostadores, 2, ',', '.'),
                'saldoLiquido' => 'R$ ' . number_format($saldoLiquido, 2, ',', '.'),
            ]
        ]);
    }
}
