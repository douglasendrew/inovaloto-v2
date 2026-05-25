<?php

namespace App\Controllers;

use App\Models\Modalidades;
use App\Models\SorteiosApostas;
use App\Database\TenantContext;
use App\Middleware\TenantAuthMiddleware;
use App\Utils\Response;
use Illuminate\Database\Capsule\Manager as DB;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;
use Carbon\Carbon;

class MapaRiscoController
{
    public function index(Request $request, SwooleResponse $response, ?string $modalidade_uuid = null): void
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

        // Get active modalities
        $modalidadesItems = Modalidades::where('id_banca', $bancaId)
            ->where('ativo', '1')
            ->orderBy('nome')
            ->get(['id', 'uuid', 'nome', 'icone']);

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

        // 1. Grouped Query
        $query = DB::table('sorteios_apostas as sa')
            ->selectRaw('
                m.id as modalidade_id,
                m.uuid as modalidade_uuid,
                m.nome as modalidade_nome,
                m.icone as modalidade_icone,
                sa.qtd_dezenas,
                COUNT(*) as qtd_vendas,
                SUM(COALESCE(sa.val_apostado, 0)) as valor_vendido,
                SUM(COALESCE(sa.val_premiacao, 0)) as valor_premiado,
                SUM(COALESCE(sa.vendedor_comissao_bonus, 0) + COALESCE(sa.vendedor_comissao_venda, 0)) as val_comissao,
                (SUM(COALESCE(sa.val_apostado, 0)) - SUM(COALESCE(sa.val_premiacao, 0)) - SUM(COALESCE(sa.vendedor_comissao_bonus, 0) + COALESCE(sa.vendedor_comissao_venda, 0))) as lucro
            ')
            ->join('sorteios as s', 's.id', '=', 'sa.sorteio_id')
            ->join('modalidades as m', 'm.id', '=', 's.modalidade_id')
            ->where('s.banca_id', $bancaId)
            ->whereNull('sa.deleted_at')
            ->where('sa.status', '!=', 'pending_deletion');

        if ($startDate) {
            $query->whereDate('s.data_sorteio', '>=', $startDate);
            if ($endDate) {
                $query->whereDate('s.data_sorteio', '<=', $endDate);
            }
        }

        if ($modalidade_uuid) {
            $query->where('m.uuid', $modalidade_uuid);
        }

        $query->groupBy('m.id', 'sa.qtd_dezenas', 'm.uuid', 'm.nome', 'm.icone');

        // Apply risk filter
        $risco = $request->get['risco'] ?? null;
        if ($risco === 'low') {
            $query->having('lucro', '>', 0);
        } elseif ($risco === 'high') {
            $query->having('lucro', '<=', 0);
        }

        // Totals query (ignoring risk/modality pagination filters for period cards)
        $totalsQuery = DB::table('sorteios_apostas as sa')
            ->selectRaw('
                SUM(COALESCE(sa.val_apostado, 0)) as valor_vendido,
                SUM(COALESCE(sa.val_premiacao, 0)) as valor_premiado,
                SUM(COALESCE(sa.vendedor_comissao_bonus, 0) + COALESCE(sa.vendedor_comissao_venda, 0)) as val_comissao,
                COUNT(*) as qtd_vendas
            ')
            ->join('sorteios as s', 's.id', '=', 'sa.sorteio_id')
            ->where('s.banca_id', $bancaId)
            ->whereNull('sa.deleted_at')
            ->where('sa.status', '!=', 'pending_deletion');

        if ($startDate) {
            $totalsQuery->whereDate('s.data_sorteio', '>=', $startDate);
            if ($endDate) {
                $totalsQuery->whereDate('s.data_sorteio', '<=', $endDate);
            }
        }

        if ($modalidade_uuid) {
            $totalsQuery->join('modalidades as m', 'm.id', '=', 's.modalidade_id')
                ->where('m.uuid', $modalidade_uuid);
        }

        $resumo = $totalsQuery->first();
        $resumo->valor_vendido = $resumo->valor_vendido ?? 0;
        $resumo->valor_premiado = $resumo->valor_premiado ?? 0;
        $resumo->val_comissao = $resumo->val_comissao ?? 0;
        $resumo->qtd_vendas = $resumo->qtd_vendas ?? 0;
        $saldoLiquido = $resumo->valor_vendido - $resumo->valor_premiado - $resumo->val_comissao;

        // Pagination
        $page = (int)($request->get['page'] ?? 1);
        if ($page < 1) $page = 1;
        $limit = 5; // 5 items per page like legacy
        $offset = ($page - 1) * $limit;

        // Get total count of grouped results
        $totalResults = DB::table(DB::raw("({$query->toSql()}) as sub"))
            ->mergeBindings($query)
            ->count();

        $lastPage = ceil($totalResults / $limit);
        if ($lastPage < 1) $lastPage = 1;

        $results = $query->offset($offset)->limit($limit)->get();

        Response::json($response, [
            'success' => true,
            'modalidades' => $modalidadesItems,
            'mapa_risco' => [
                'data' => $results,
                'current_page' => $page,
                'last_page' => $lastPage,
                'total' => $totalResults,
            ],
            'resumo' => $resumo,
            'saldoLiquido' => $saldoLiquido,
        ]);
    }
}
