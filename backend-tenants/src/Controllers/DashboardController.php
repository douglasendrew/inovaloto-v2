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
     * Return dashboard raw summary metrics or specific details based on type.
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

        $type = $request->get['type'] ?? 'summary';

        switch ($type) {
            case 'summary':
                $data = $this->getSummaryRawData($request, $bancaId);
                Response::json($response, $data);
                break;
            case 'creditosVendedores':
                $data = $this->getCreditosVendedores($bancaId);
                Response::json($response, $data);
                break;
            case 'creditosApostadores':
                $data = $this->getCreditosApostadores($bancaId);
                Response::json($response, $data);
                break;
            case 'bilhetes':
                $data = $this->getBilhetesData($request, $bancaId);
                Response::json($response, $data);
                break;
            case 'extratoBanca':
                $data = $this->getExtratoBanca($request, $bancaId);
                Response::json($response, $data);
                break;
            case 'extratoVendedor':
                $data = $this->getExtratoVendedor($request, $bancaId);
                Response::json($response, $data);
                break;
            default:
                Response::json($response, ['error' => 'Tipo inválido.'], 400);
                break;
        }
    }

    private function getSummaryRawData(Request $request, int $bancaId)
    {
        // 1. Core bet and prizes summary
        $baseQuery = $this->getBaseQuery($request, $bancaId);
        $summary = (clone $baseQuery)->selectRaw('
            COUNT(*) as total_apostas,
            SUM(COALESCE(val_apostado, 0)) as val_apostado,
            SUM(COALESCE(val_premiacao, 0)) as val_premiacao,
            SUM(COALESCE(vendedor_comissao_venda, 0) + COALESCE(vendedor_comissao_bonus, 0)) as val_comissoes
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

        return [
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
        ];
    }

    private function getCreditosVendedores(int $bancaId)
    {
        $fechamentosPorUsuario = FechamentoCaixa::with('user')
            ->whereHas('user', function ($query) use ($bancaId) {
                $query->where('banca_id', $bancaId);
            })
            ->select('user_id')
            ->selectRaw('
                SUM(val_vendas) as val_vendas,
                SUM(val_comissoes) as val_comissoes,
                SUM(val_premiacoes) as val_premiacoes,
                SUM(valor) as valor
            ')
            ->groupBy('user_id')
            ->get();

        return $fechamentosPorUsuario->map(function ($item) {
            $saldo = $item->valor + (
                $item->val_vendas - ($item->val_premiacoes + $item->val_comissoes)
            );
            return [
                'name' => $item->user->nickname ?? $item->user->name,
                'saldo' => (float)$saldo,
                'formatted_saldo' => 'R$ ' . number_format($saldo, 2, ',', '.')
            ];
        })->sortBy('name')->values()->toArray();
    }

    private function getCreditosApostadores(int $bancaId)
    {
        $wallets = Wallet::with('user')
            ->whereHas('user', function ($query) use ($bancaId) {
                $query->where('banca_id', $bancaId);
            })
            ->where('status', 'active')
            ->where('saldo', '>', 0)
            ->get();

        return $wallets->map(function ($item) {
            return [
                'name' => $item->user->nickname ?? $item->user->name,
                'saldo' => (float)$item->saldo,
                'formatted_saldo' => 'R$ ' . number_format($item->saldo, 2, ',', '.')
            ];
        })->sortBy('name')->values()->toArray();
    }

    private function getBilhetesData(Request $request, int $bancaId)
    {
        $query = $this->getBaseQuery($request, $bancaId);
        
        $apostas = (clone $query)
            ->with(['sorteio.modalidade'])
            ->get()
            ->groupBy('sorteio.modalidade_id');

        return $apostas->map(function ($items, $modalidade_id) {
            $first = $items->first();
            return [
                'modalidade_nome' => $first->sorteio?->modalidade?->nome ?? 'N/A',
                'modalidade_icone' => $first->sorteio?->modalidade?->icone ?? 'icon.png',
                'total_bilhetes' => $items->count(),
                'bilhetes_normais' => $items->where('is_surpresinha', 0)->where('is_importe', 0)->count(),
                'bilhetes_surpresinha' => $items->where('is_surpresinha', 1)->count(),
                'bilhetes_importados' => $items->where('is_importe', 1)->count(),
            ];
        })->values()->toArray();
    }

    private function getExtratoBanca(Request $request, int $bancaId)
    {
        $query = $this->getBaseQuery($request, $bancaId);

        $apostasPorModalidade = (clone $query)
            ->with(['sorteio.modalidade'])
            ->get()
            ->groupBy('sorteio.modalidade_id')
            ->map(function ($items) {
                $first = $items->first();
                return [
                    'modalidade_nome' => $first->sorteio?->modalidade?->nome ?? 'N/A',
                    'modalidade_icone' => $first->sorteio?->modalidade?->icone ?? 'icon.png',
                    'val_apostado' => (float)$items->sum('val_apostado'),
                    'formatted_val_apostado' => 'R$ ' . number_format($items->sum('val_apostado'), 2, ',', '.')
                ];
            })->values();

        $extratoBanca = (clone $query)
            ->where(function ($query) {
                $query->where('vendedor_comissao_venda', '>', 0);
                $query->orWhere('vendedor_comissao_bonus', '>', 0);
            })
            ->with('vendedor')
            ->get()
            ->groupBy('vendedor_id')
            ->map(function ($items) {
                $first = $items->first();
                $vendedor_name = $first->vendedor?->name ?? 'Vendas Diretas';
                $comissao = $items->sum('vendedor_comissao_venda') + $items->sum('vendedor_comissao_bonus');
                return [
                    'vendedor_name' => $vendedor_name,
                    'comissao' => (float)$comissao,
                    'formatted_comissao' => 'R$ ' . number_format($comissao, 2, ',', '.')
                ];
            })->values();

        return [
            'apostas' => $apostasPorModalidade->toArray(),
            'comissoes' => $extratoBanca->toArray()
        ];
    }

    private function getExtratoVendedor(Request $request, int $bancaId)
    {
        $query = $this->getBaseQuery($request, $bancaId);
        
        $apostasGerais = (clone $query)
            ->whereNotNull('vendedor_id')
            ->select('vendedor_id')
            ->selectRaw('
                SUM(val_apostado) as val_vendas,
                SUM(vendedor_comissao_venda) as comissao_venda,
                SUM(vendedor_comissao_bonus) as comissao_bonus,
                SUM(val_premiacao) as val_premiacao,
                SUM(CASE WHEN is_surpresinha = 1 THEN 1 ELSE 0 END) as surpresinha_count,
                SUM(CASE WHEN is_importe = 1 THEN 1 ELSE 0 END) as imported_count,
                SUM(CASE WHEN is_surpresinha = 0 AND is_importe = 0 THEN 1 ELSE 0 END) as normal_count
            ')
            ->groupBy('vendedor_id')
            ->get()
            ->keyBy('vendedor_id');

        $fechamentosQuery = FechamentoCaixa::whereHas('user', function ($query) use ($bancaId) {
            $query->where('banca_id', $bancaId);
        });

        $dateRange = $request->get['dateRange'] ?? null;
        if ($dateRange && $dateRange !== 'undefined') {
            try {
                $dateRangeSplit = explode(' até ', $dateRange);
                $startDate = trim($dateRangeSplit[0]);
                $endDate = isset($dateRangeSplit[1]) ? trim($dateRangeSplit[1]) : $startDate;

                $fechamentosQuery->where('created_at', '>=', $startDate . ' 00:00:00')
                                 ->where('created_at', '<=', $endDate . ' 23:59:59');
            } catch (\Exception $e) {}
        } else {
            $fechamentosQuery->where('created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                             ->where('created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');
        }

        $fechamentosGerais = $fechamentosQuery->select('user_id')
            ->selectRaw('SUM(val_vendas) as val_vendas, SUM(val_comissoes) as val_comissoes, SUM(val_premiacoes) as val_premiacoes, SUM(valor) as valor')
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        $allVendedorIds = $apostasGerais->keys()->merge($fechamentosGerais->keys())->unique();
        $usersById = User::whereIn('id', $allVendedorIds)->get()->keyBy('id');

        return $allVendedorIds->map(function ($vendedor_id) use ($apostasGerais, $fechamentosGerais, $usersById) {
            $apostaStats = $apostasGerais->get($vendedor_id);
            $fechamento = $fechamentosGerais->get($vendedor_id);
            $vendedor = $usersById->get($vendedor_id);

            if (!$vendedor && ($vendedor_id !== null && $vendedor_id !== "")) return null;

            $vendasRaw = $apostaStats->val_vendas ?? 0;
            $comissaoVendaRaw = $apostaStats->comissao_venda ?? 0;
            $comissaoBonusRaw = $apostaStats->comissao_bonus ?? 0;
            $comissaoRaw = $comissaoVendaRaw + $comissaoBonusRaw;
            $premiacaoRaw = $apostaStats->val_premiacao ?? 0;

            $vendasNet = $vendasRaw - ($fechamento->val_vendas ?? 0);
            $comissaoNet = $comissaoRaw - ($fechamento->val_comissoes ?? 0);
            $premiacaoNet = $premiacaoRaw - ($fechamento->val_premiacoes ?? 0);

            $fechamentoVendas = $fechamento->val_vendas ?? 0;
            $fechamentoComissoes = $fechamento->val_comissoes ?? 0;
            $fechamentoPremiacoes = $fechamento->val_premiacoes ?? 0;
            $fechamentoValor = $fechamento->valor ?? 0;

            $val_diff = $fechamentoVendas - ($fechamentoPremiacoes + $fechamentoComissoes);
            $saldoAtual = $fechamentoValor + $val_diff;

            $saldoFechamento = $vendasNet - $comissaoNet - $premiacaoNet;
            $totalAReceber = $saldoFechamento + $saldoAtual;

            if ($totalAReceber == 0) return null;

            $comissaoVenda = $comissaoRaw > 0 ? $comissaoNet * ($comissaoVendaRaw / $comissaoRaw) : 0;
            $comissaoBonus = $comissaoRaw > 0 ? $comissaoNet * ($comissaoBonusRaw / $comissaoRaw) : 0;

            return [
                'vendedor_name' => $vendedor->name ?? 'Vendas Diretas (Banca)',
                'vendedor_uuid' => $vendedor->uuid ?? null,
                'vendas' => (float)$vendasNet,
                'comissao_venda' => (float)$comissaoVenda,
                'comissao_bonus' => (float)$comissaoBonus,
                'premiacao' => (float)$premiacaoNet,
                'saldo' => (float)$totalAReceber,
                'bilhetes_count' => (int)($apostaStats->normal_count ?? 0),
                'surpresinha_count' => (int)($apostaStats->surpresinha_count ?? 0),
                'imported_count' => (int)($apostaStats->imported_count ?? 0),
                't1' => (float)($vendasNet - $comissaoVenda),
                't2' => (float)($vendasNet - $comissaoVenda - $comissaoBonus),
                't3' => (float)($vendasNet - $comissaoVenda - $comissaoBonus - $premiacaoNet),
                'fechamento_url' => $vendedor ? '/wallet/caixa/fechamento/' . $vendedor->uuid : '#'
            ];
        })->filter()->sortBy('vendedor_name')->values()->toArray();
    }
}

