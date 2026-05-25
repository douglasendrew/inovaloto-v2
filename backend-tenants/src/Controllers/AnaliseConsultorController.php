<?php

namespace App\Controllers;

use App\Models\Modalidades;
use App\Models\SorteiosApostas;
use App\Models\User;
use App\Database\TenantContext;
use App\Middleware\TenantAuthMiddleware;
use App\Utils\Response;
use Illuminate\Database\Capsule\Manager as DB;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;
use Carbon\Carbon;

class AnaliseConsultorController
{
    public function index(Request $request, SwooleResponse $response): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) {
            return;
        }

        if ($user->role !== 'admin') {
            Response::json($response, ['error' => 'Acesso proibido.'], 403);
            return;
        }

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        // Parse date range
        $dateRange = $request->get['dateRange'] ?? null;
        if ($dateRange && $dateRange !== 'undefined') {
            $dates = preg_split('/\s+(até|to|at)\s+/i', $dateRange);
            $startDate = trim($dates[0]);
            $endDate = isset($dates[1]) ? trim($dates[1]) : $startDate;
        } else {
            $startDate = Carbon::today()->format('Y-m-d');
            $endDate = Carbon::today()->format('Y-m-d');
        }

        $modalidadeId = $request->get['modalidade_id'] ?? null;
        $ordem = $request->get['ordem'] ?? null;

        // 1. Subquery for totals per seller in the period
        $totalsSub = DB::table('sorteios_apostas as sa')
            ->selectRaw('
                vendedor_id, 
                SUM(COALESCE(val_apostado, 0)) as total_vendido, 
                SUM(COALESCE(val_premiacao, 0)) as total_premiado, 
                SUM(COALESCE(vendedor_comissao_bonus, 0) + COALESCE(vendedor_comissao_venda, 0)) as total_comissao, 
                COUNT(*) as qtd_bilhetes,
                (
                    SUM(COALESCE(val_apostado, 0)) 
                    - SUM(COALESCE(val_premiacao, 0)) 
                    - SUM(COALESCE(vendedor_comissao_bonus, 0) + COALESCE(vendedor_comissao_venda, 0))
                ) as lucro,
                COUNT(CASE WHEN sa.status = "not_awarded" THEN 1 END) as qtd_lucro,
                COUNT(CASE WHEN sa.status = "awarded" THEN 1 END) as qtd_prejuizo
            ')
            ->join('sorteios as s', 's.id', '=', 'sa.sorteio_id')
            ->where('s.banca_id', $bancaId)
            ->whereDate('s.data_sorteio', '>=', $startDate)
            ->whereDate('s.data_sorteio', '<=', $endDate)
            ->whereNull('sa.deleted_at')
            ->where('sa.status', '!=', 'pending_deletion');

        if ($modalidadeId) {
            $totalsSub->where('s.modalidade_id', $modalidadeId);
        }

        $totalsSub->groupBy('vendedor_id');

        // 2. Main query joining users table
        $query = User::select(
            'users.id',
            'users.uuid',
            'users.name',
            'users.username',
            'totals.total_vendido',
            'totals.total_premiado',
            'totals.total_comissao',
            'totals.qtd_bilhetes',
            'totals.lucro',
            'totals.qtd_lucro',
            'totals.qtd_prejuizo'
        )
            ->joinSub($totalsSub, 'totals', 'totals.vendedor_id', '=', 'users.id')
            ->where('users.banca_id', $bancaId)
            ->where('users.role', 'seller');

        // Order results
        if ($ordem === 'mais_lucrativo') {
            $query->orderByDesc('totals.lucro')->orderBy('users.id');
        } elseif ($ordem === 'mais_prejuizo') {
            $query->orderBy('totals.lucro')->orderBy('users.id');
        } else {
            $query->orderBy('users.name')->orderBy('users.id');
        }

        // 3. Summarized totals for the whole period cards
        $resumoQuery = DB::table('sorteios_apostas as sa')
            ->selectRaw('
                SUM(COALESCE(val_apostado, 0)) as total_vendido, 
                SUM(COALESCE(val_premiacao, 0)) as total_premiado, 
                SUM(COALESCE(vendedor_comissao_bonus, 0) + COALESCE(vendedor_comissao_venda, 0)) as total_comissao,
                COUNT(CASE WHEN sa.status = "not_awarded" THEN 1 END) as qtd_lucro,
                COUNT(CASE WHEN sa.status = "awarded" THEN 1 END) as qtd_prejuizo
            ')
            ->join('sorteios as s', 's.id', '=', 'sa.sorteio_id')
            ->where('s.banca_id', $bancaId)
            ->whereDate('s.data_sorteio', '>=', $startDate)
            ->whereDate('s.data_sorteio', '<=', $endDate)
            ->whereNull('sa.deleted_at')
            ->where('sa.status', '!=', 'pending_deletion');

        if ($modalidadeId) {
            $resumoQuery->where('s.modalidade_id', $modalidadeId);
        }

        $resumo = $resumoQuery->first();
        $resumo->total_vendido = $resumo->total_vendido ?? 0;
        $resumo->total_premiado = $resumo->total_premiado ?? 0;
        $resumo->total_comissao = $resumo->total_comissao ?? 0;
        $resumo->qtd_lucro = $resumo->qtd_lucro ?? 0;
        $resumo->qtd_prejuizo = $resumo->qtd_prejuizo ?? 0;
        $saldoLiquido = $resumo->total_vendido - $resumo->total_premiado - $resumo->total_comissao;

        // Paginate
        $page = (int)($request->get['page'] ?? 1);
        if ($page < 1) $page = 1;
        $limit = 5; // 5 items per page
        $offset = ($page - 1) * $limit;

        $totalResults = $query->count();
        $lastPage = ceil($totalResults / $limit);
        if ($lastPage < 1) $lastPage = 1;

        $results = $query->offset($offset)->limit($limit)->get();

        // Get modalities for filter list
        $modalidades = Modalidades::where('id_banca', $bancaId)->orderBy('nome')->get(['id', 'nome']);

        Response::json($response, [
            'success' => true,
            'analise' => [
                'data' => $results,
                'current_page' => $page,
                'last_page' => $lastPage,
                'total' => $totalResults,
            ],
            'saldoLiquido' => $saldoLiquido,
            'resumo' => $resumo,
            'modalidades' => $modalidades
        ]);
    }

    public function getDetails(Request $request, SwooleResponse $response, string $uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) {
            return;
        }

        if ($user->role !== 'admin') {
            Response::json($response, ['error' => 'Acesso proibido.'], 403);
            return;
        }

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        $vendedor = User::where('uuid', $uuid)->where('banca_id', $bancaId)->first();
        if (!$vendedor) {
            Response::json($response, ['error' => 'Vendedor não encontrado.'], 404);
            return;
        }

        // Handle date range
        $dateRange = $request->get['dateRange'] ?? null;
        if ($dateRange && $dateRange !== 'undefined') {
            $dates = preg_split('/\s+(até|to|at)\s+/i', $dateRange);
            $startDate = trim($dates[0]);
            $endDate = isset($dates[1]) ? trim($dates[1]) : $startDate;
        } else {
            $startDate = Carbon::today()->format('Y-m-d');
            $endDate = Carbon::today()->format('Y-m-d');
        }

        $modalidadeId = $request->get['modalidade_id'] ?? null;

        $query = SorteiosApostas::with(['sorteio', 'sorteio.modalidade'])
            ->where('sorteios_apostas.vendedor_id', $vendedor->id)
            ->whereHas('sorteio', function ($q) use ($bancaId, $startDate, $endDate, $modalidadeId) {
                $q->where('banca_id', $bancaId)
                  ->whereDate('data_sorteio', '>=', $startDate)
                  ->whereDate('data_sorteio', '<=', $endDate);
                
                if ($modalidadeId) {
                    $q->where('modalidade_id', $modalidadeId);
                }
            })
            ->where('status', '!=', 'pending_deletion');

        $bilhetes = $query->get();

        $detalhesModalidades = $bilhetes->groupBy('sorteio.modalidade.id')->map(function ($modGrupo) {
            $sorteio = $modGrupo->first()->sorteio;
            $mod = $sorteio ? $sorteio->modalidade : null;
            if (!$mod) {
                return null;
            }

            $vendasMod = $modGrupo->sum('val_apostado');
            $premiosMod = $modGrupo->sum('val_premiacao');
            $comissoesMod = $modGrupo->sum('vendedor_comissao_bonus') + $modGrupo->sum('vendedor_comissao_venda');

            $dezenasDetalhadas = $modGrupo->groupBy('qtd_dezenas')->map(function ($dezenaGrupo) {
                $vendasDezena = $dezenaGrupo->sum('val_apostado');
                $premiosDezena = $dezenaGrupo->sum('val_premiacao');
                $comissoesDezena = $dezenaGrupo->sum('vendedor_comissao_bonus') + $dezenaGrupo->sum('vendedor_comissao_venda');
                return [
                    'dezena' => $dezenaGrupo->first()->qtd_dezenas . ' dezenas',
                    'qtd' => $dezenaGrupo->count(),
                    'vendas' => $vendasDezena,
                    'premios' => $premiosDezena,
                    'comissao' => $comissoesDezena,
                    'liq_banca' => $vendasDezena - $premiosDezena - $comissoesDezena,
                ];
            })->sortByDesc('vendas')->values();

            $iconUrl = $mod->icone;
            if ($iconUrl && !str_starts_with($iconUrl, 'http') && !str_starts_with($iconUrl, '/')) {
                $iconUrl = '/storage/' . $iconUrl;
            }

            return [
                'nome' => $mod->nome,
                'icone' => $iconUrl,
                'vendas' => $vendasMod,
                'premios' => $premiosMod,
                'comissoes' => $comissoesMod,
                'lucro' => $vendasMod - $premiosMod - $comissoesMod,
                'qtd_vendas' => $modGrupo->count(),
                'qtd_ganhadores' => $modGrupo->where('val_premiacao', '>', 0)->count(),
                'dezenas' => $dezenasDetalhadas,
            ];
        })->filter()->sortBy('lucro')->values();

        // Winners Grouped (Losses for banca - Status AWARDED)
        $premiosDetalhados = $bilhetes->where('status', 'awarded')
            ->groupBy(function($item) {
                $sorteio = $item->sorteio;
                $modalidadeId = $sorteio ? $sorteio->modalidade_id : '0';
                $dataSorteio = $sorteio ? $sorteio->data_sorteio : '0000-00-00';
                return $item->qtd_dezenas . '-' . $modalidadeId . '-' . $dataSorteio;
            })
            ->map(function ($grupo) {
                $first = $grupo->first();
                $sorteio = $first->sorteio;
                $modName = ($sorteio && $sorteio->modalidade) ? $sorteio->modalidade->nome : 'Outros';
                $data = $sorteio ? Carbon::parse($sorteio->data_sorteio)->format('d/m/Y') : '';
                return [
                    'qtd_dezenas' => $first->qtd_dezenas,
                    'valor' => $grupo->sum('val_premiacao') + $grupo->sum('vendedor_comissao_bonus') + $grupo->sum('vendedor_comissao_venda') - $grupo->sum('val_apostado'),
                    'modalidade' => $modName,
                    'data' => $data,
                    'qtd_bilhetes' => $grupo->count(),
                ];
            })
            ->sortByDesc('valor')->values();

        // Losers Grouped (Profits for banca - Status NOT_AWARDED)
        $vendasDetalhadas = $bilhetes->where('status', 'not_awarded')
            ->groupBy(function($item) {
                $sorteio = $item->sorteio;
                $modalidadeId = $sorteio ? $sorteio->modalidade_id : '0';
                $dataSorteio = $sorteio ? $sorteio->data_sorteio : '0000-00-00';
                return $item->qtd_dezenas . '-' . $modalidadeId . '-' . $dataSorteio;
            })
            ->map(function ($grupo) {
                $first = $grupo->first();
                $sorteio = $first->sorteio;
                $modName = ($sorteio && $sorteio->modalidade) ? $sorteio->modalidade->nome : 'Outros';
                $data = $sorteio ? Carbon::parse($sorteio->data_sorteio)->format('d/m/Y') : '';
                return [
                    'qtd_dezenas' => $first->qtd_dezenas,
                    'valor' => $grupo->sum('val_apostado') - ($grupo->sum('vendedor_comissao_bonus') + $grupo->sum('vendedor_comissao_venda')),
                    'modalidade' => $modName,
                    'data' => $data,
                    'qtd_bilhetes' => $grupo->count(),
                ];
            })
            ->sortByDesc('valor')->values();

        $totalPremios = $bilhetes->where('status', 'awarded')->sum('val_premiacao') + $bilhetes->where('status', 'awarded')->sum('vendedor_comissao_bonus') + $bilhetes->where('status', 'awarded')->sum('vendedor_comissao_venda') - $bilhetes->where('status', 'awarded')->sum('val_apostado');
        $totalVendas = $bilhetes->where('status', 'not_awarded')->sum('val_apostado') - ($bilhetes->where('status', 'not_awarded')->sum('vendedor_comissao_bonus') + $bilhetes->where('status', 'not_awarded')->sum('vendedor_comissao_venda'));

        Response::json($response, [
            'detalhes_modalidades' => $detalhesModalidades,
            'premios_detalhados' => $premiosDetalhados,
            'vendas_detalhadas' => $vendasDetalhadas,
            'total_premios' => $totalPremios,
            'total_vendas' => $totalVendas,
            'count_premios' => $bilhetes->where('status', 'awarded')->count(),
            'count_vendas' => $bilhetes->where('status', 'not_awarded')->count(),
        ]);
    }
}
