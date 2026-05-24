<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\FechamentoCaixa;
use App\Models\LogSorteios;
use App\Models\User;
use Carbon\Carbon;
use Ramsey\Uuid\Uuid;

class FinanceService
{
    /**
     * Record the invoice payment in the Fechamento de Caixa.
     */
    public function giveBaixaNoFechamento(Invoice $invoice, ?User $loggedUser = null): FechamentoCaixa
    {
        try {
            $user = $invoice->user;
            
            // 1. Calculate aggregates from this invoice's items using optimized query
            $stats = InvoiceItem::where('invoice_id', $invoice->id)
                ->join('sorteios_apostas', 'invoice_items.aposta_id', '=', 'sorteios_apostas.id')
                ->selectRaw('
                    SUM(COALESCE(sorteios_apostas.val_apostado, 0)) as totalVendas, 
                    SUM(COALESCE(sorteios_apostas.vendedor_comissao_venda, 0) + COALESCE(sorteios_apostas.vendedor_comissao_bonus, 0)) as totalComissao, 
                    SUM(COALESCE(sorteios_apostas.val_premiacao, 0)) as totalPremiacao
                ')
                ->first();

            $totalVendas = (float) ($stats->totalVendas ?? 0);
            $totalComissao = (float) ($stats->totalComissao ?? 0);
            $totalPremiacao = (float) ($stats->totalPremiacao ?? 0);

            $saldoFechamento = $totalVendas - ($totalComissao + $totalPremiacao);
            $valFechamento = (float) $invoice->amount;

            // 2. Calculate Totals from Previous Fechamentos using optimized query
            $prevStats = FechamentoCaixa::where('user_id', $user->id)
                ->selectRaw('
                    SUM(COALESCE(val_vendas, 0)) as v, 
                    SUM(COALESCE(val_comissoes, 0)) as c, 
                    SUM(COALESCE(val_premiacoes, 0)) as p, 
                    SUM(COALESCE(valor, 0)) as val
                ')
                ->first();
            
            $fechamentoVendas = (float) ($prevStats->v ?? 0);
            $fechamentoComissoes = (float) ($prevStats->c ?? 0);
            $fechamentoPremiacoes = (float) ($prevStats->p ?? 0);
            $fechamentoValor = (float) ($prevStats->val ?? 0);

            $netPreviousFechamentos = $fechamentoVendas - ($fechamentoPremiacoes + $fechamentoComissoes);
            $saldoAnterior = $fechamentoValor + $netPreviousFechamentos;

            // 3. Calculate New Saldo Atual
            $saldoAtual = $saldoAnterior + $saldoFechamento + $valFechamento;

            // 4. Create FechamentoCaixa record
            $fechamento = FechamentoCaixa::create([
                'uuid' => Uuid::uuid4()->toString(),
                'user_id' => $user->id,
                'val_vendas' => $totalVendas,
                'val_comissoes' => $totalComissao,
                'val_premiacoes' => $totalPremiacao,
                'saldo_fechamento' => $saldoFechamento,
                'valor' => $valFechamento,
                'saldo_anterior' => $saldoAnterior,
                'saldo_atual' => $saldoAtual,
            ]);

            // 5. Log it
            LogSorteios::create([
                'user_id' => $loggedUser ? $loggedUser->id : $user->id,
                'log_titulo' => 'Baixa automática de fatura no fechamento',
                'log_detalhes' => json_encode([
                    'invoice_id' => $invoice->id,
                    'fechamento_id' => $fechamento->id,
                    'amount' => $valFechamento
                ]),
            ]);

            return $fechamento;
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    /**
     * Get the consultant balance.
     */
    public function getConsultantBalance(User $user): float
    {
        $today = Carbon::now()->format('Y-m-d');
        
        // 1. Total movement since the beginning of time
        $stats = \App\Models\SorteiosApostas::where('vendedor_id', $user->id)
            ->whereHas('sorteio', function ($q) use ($today) {
                $q->whereDate('data_sorteio', '<=', $today);
            })
            ->selectRaw('
                SUM(COALESCE(val_apostado, 0)) as totalVendas, 
                SUM(COALESCE(vendedor_comissao_venda, 0) + COALESCE(vendedor_comissao_bonus, 0)) as totalComissao, 
                SUM(COALESCE(val_premiacao, 0)) as totalPremiacao
            ')
            ->first();

        $totalVendas = (float) ($stats->totalVendas ?? 0);
        $totalComissao = (float) ($stats->totalComissao ?? 0);
        $totalPremiacao = (float) ($stats->totalPremiacao ?? 0);

        // 2. Sum of all FechamentoCaixa entries
        $fechamentos = FechamentoCaixa::where('user_id', $user->id)
            ->selectRaw('
                SUM(COALESCE(val_vendas, 0)) as v, 
                SUM(COALESCE(val_comissoes, 0)) as c, 
                SUM(COALESCE(val_premiacoes, 0)) as p, 
                SUM(COALESCE(valor, 0)) as val
            ')
            ->first();

        $fechamentoVendas = (float) ($fechamentos->v ?? 0);
        $fechamentoComissoes = (float) ($fechamentos->c ?? 0);
        $fechamentoPremiacoes = (float) ($fechamentos->p ?? 0);
        $fechamentoValor = (float) ($fechamentos->val ?? 0);

        // 3. Current closed balance
        $val = $fechamentoVendas - ($fechamentoPremiacoes + $fechamentoComissoes);
        $saldoAtual = $fechamentoValor + $val;

        // 4. Pending movement (since last fechamento)
        $pendingVendas = $totalVendas - $fechamentoVendas;
        $pendingComissao = $totalComissao - $fechamentoComissoes;
        $pendingPremiacao = $totalPremiacao - $fechamentoPremiacoes;
        
        $saldoFechamento = $pendingVendas - ($pendingComissao + $pendingPremiacao);

        return $saldoAtual + $saldoFechamento;
    }
}
