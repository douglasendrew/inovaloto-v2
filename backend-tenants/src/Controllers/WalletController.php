<?php

namespace App\Controllers;

use App\Models\FechamentoCaixa;
use App\Models\LogSorteios;
use App\Models\SorteiosApostas;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransactions;
use App\Database\TenantContext;
use App\Middleware\TenantAuthMiddleware;
use App\Utils\Response;
use Carbon\Carbon;
use Exception;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;
use Ramsey\Uuid\Uuid;
use Illuminate\Database\Capsule\Manager as Capsule;

class WalletController
{
    /**
     * GET /wallet/info[/{user_uuid}]
     */
    public function index(Request $request, SwooleResponse $response, ?string $user_uuid = null): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            if ($authUser->role !== 'admin' && $authUser->role !== 'seller' && $user_uuid) {
                $user_uuid = $authUser->uuid;
            }

            $query = User::with('wallet')
                ->where('banca_id', $bancaId)
                ->where('uuid', $user_uuid ?? $authUser->uuid);

            if ($authUser->role === 'seller' && $user_uuid) {
                $query->where('vendedor_id', $authUser->id);
            }

            $user = $query->firstOrFail();

            if (!$user->wallet) {
                $connName = TenantContext::getConnectionName();
                $wallet = Capsule::connection($connName)->transaction(function () use ($bancaId, $user) {
                    return Wallet::create([
                        'uuid' => Uuid::uuid4()->toString(),
                        'banca_id' => $bancaId,
                        'user_id' => $user->id,
                        'saldo' => 0,
                    ]);
                });
                $user->setRelation('wallet', $wallet);
            }

            Response::json($response, ['success' => true, 'user' => $user]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Não é possível buscar pelo usuário solicitado.'], 404);
        }
    }

    /**
     * POST /wallet/credito[/{user_uuid}]
     */
    public function addCredito(Request $request, SwooleResponse $response, ?string $user_uuid = null): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['valor'])) {
            Response::json($response, ['error' => 'O campo valor é obrigatório.'], 422);
            return;
        }

        try {
            $query = User::with('wallet')
                ->where('banca_id', $bancaId)
                ->where('uuid', $user_uuid ?? $authUser->uuid);

            if ($authUser->role === 'seller' && $user_uuid) {
                $query->where('vendedor_id', $authUser->id);
            }

            $targetUser = $query->firstOrFail();

            if ($targetUser->status !== 'active') {
                Response::json($response, ['error' => 'Não é possível adicionar saldo para este usuário pois ele se encontra desabilitado.'], 400);
                return;
            }

            $creditValue = $input['valor'];
            $creditValue = str_replace('.', '', $creditValue);
            $creditValue = str_replace(',', '.', $creditValue);
            $creditValue = floatval($creditValue);

            if ($creditValue <= 0) {
                Response::json($response, ['error' => 'O valor para adicionar deve ser maior ou igual a R$ 1,00.'], 400);
                return;
            }

            // Protection against duplicates
            $lastTransaction = WalletTransactions::where('wallet_id', $targetUser->wallet?->id)
                ->where('transacao_valor', $creditValue)
                ->where('created_at', '>=', Carbon::now()->subSeconds(30))
                ->exists();

            if ($lastTransaction) {
                Response::json($response, ['error' => 'Uma transação idêntica foi detectada recentemente. Aguarde alguns instantes.'], 409);
                return;
            }

            $connName = TenantContext::getConnectionName();

            Capsule::connection($connName)->transaction(function () use ($authUser, $targetUser, $creditValue, $bancaId, $input) {
                if ($authUser->role !== 'admin') {
                    $senderWallet = Wallet::where('user_id', $authUser->id)
                        ->where('banca_id', $bancaId)
                        ->firstOrFail();

                    $isUnlimited = ($senderWallet->status !== 'active');

                    if ($isUnlimited) {
                        $todayTransfers = WalletTransactions::where('wallet_id', $senderWallet->id)
                            ->where('transacao_valor', '<', 0)
                            ->whereDate('created_at', Carbon::today())
                            ->where('transacao_titulo', 'like', 'Transferência para%')
                            ->sum('transacao_valor');

                        $totalSentToday = abs($todayTransfers);

                        if (($totalSentToday + $creditValue) > 500000) {
                            $restante = max(0, 500000 - $totalSentToday);
                            throw new Exception("Usuários com crédito ilimitado podem transferir no máximo R$ 500.000,00 por dia. Restante: R$ " . number_format($restante, 2, ',', '.'));
                        }

                        $oldSenderBalance = 0;
                        $newSenderBalance = 0;
                    } else {
                        if (floatval($senderWallet->saldo) < $creditValue) {
                            throw new Exception("Você não possui saldo suficiente para realizar esta transferência.");
                        }

                        $oldSenderBalance = floatval($senderWallet->saldo);
                        $newSenderBalance = $oldSenderBalance - $creditValue;

                        $senderWallet->update(['saldo' => $newSenderBalance]);
                    }

                    WalletTransactions::create([
                        'wallet_id' => $senderWallet->id,
                        'admin_id' => $authUser->id,
                        'transacao_titulo' => "Transferência para (" . $targetUser->name . ")",
                        'transacao_valor' => -abs($creditValue),
                        'saldo_anterior' => $oldSenderBalance,
                        'saldo_atual' => $newSenderBalance,
                        'carteira_desabilitada' => $isUnlimited ? 1 : 0
                    ]);
                }

                if (!$targetUser->wallet) {
                    $targetCurrentBalance = 0;
                    $targetNewBalance = $creditValue;

                    $targetWallet = Wallet::create([
                        'uuid' => Uuid::uuid4()->toString(),
                        'banca_id' => $bancaId,
                        'user_id' => $targetUser->id,
                        'saldo' => $targetNewBalance,
                    ]);

                    $targetWalletId = $targetWallet->id;
                } else {
                    if ($targetUser->wallet->status !== 'active') {
                        throw new Exception("A carteira do destinatário não se encontra ativa.");
                    }

                    $targetCurrentBalance = floatval($targetUser->wallet->saldo);
                    $targetNewBalance = $targetCurrentBalance + $creditValue;

                    $targetUser->wallet->update(['saldo' => $targetNewBalance]);
                    $targetWalletId = $targetUser->wallet->id;
                }

                WalletTransactions::create([
                    'wallet_id' => $targetWalletId,
                    'admin_id' => $authUser->id,
                    'transacao_titulo' => "Crédito Adicionado",
                    'transacao_valor' => $creditValue,
                    'saldo_anterior' => $targetCurrentBalance,
                    'saldo_atual' => $targetNewBalance,
                    'carteira_desabilitada' => 0
                ]);

                LogSorteios::create([
                    'user_id' => $authUser->id,
                    'log_titulo' => 'Add Crédito',
                    'log_detalhes' => json_encode([
                        'adicionadoPor' => $authUser->name,
                        'usuarioDestinatarioId' => $targetUser->id,
                        'usuarioDestinatarioName' => $targetUser->name,
                        'valorAdicionado' => $input['valor'],
                        'saldoDestinatarioAnterior' => $targetCurrentBalance,
                        'saldoDestinatarioAtual' => $targetNewBalance,
                    ]),
                ]);
            });

            Response::json($response, ['success' => true, 'message' => 'Crédito transferido com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /wallet/debit[/{user_uuid}]
     */
    public function rmCredito(Request $request, SwooleResponse $response, ?string $user_uuid = null): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['valor'])) {
            Response::json($response, ['error' => 'O campo valor é obrigatório.'], 422);
            return;
        }

        try {
            $query = User::with('wallet')
                ->where('banca_id', $bancaId)
                ->where('uuid', $user_uuid ?? $authUser->uuid);

            if ($authUser->role === 'seller' && $user_uuid) {
                $query->where('vendedor_id', $authUser->id);
            }

            $user = $query->firstOrFail();

            if ($user->status !== 'active') {
                Response::json($response, ['error' => 'Não é possível remover saldo deste usuário pois ele se encontra desabilitado.'], 400);
                return;
            }

            $creditValue = $input['valor'];
            $creditValue = str_replace('.', '', $creditValue);
            $creditValue = str_replace(',', '.', $creditValue);
            $creditValue = floatval($creditValue);

            if ($creditValue <= 0) {
                Response::json($response, ['error' => 'O valor para remover deve ser maior ou igual a R$ 1,00.'], 400);
                return;
            }

            // Protection against duplicates
            $lastTransaction = WalletTransactions::where('wallet_id', $user->wallet?->id)
                ->where('transacao_valor', -abs($creditValue))
                ->where('created_at', '>=', Carbon::now()->subSeconds(30))
                ->exists();

            if ($lastTransaction) {
                Response::json($response, ['error' => 'Uma transação idêntica foi detectada recentemente. Aguarde alguns instantes.'], 409);
                return;
            }

            if (!$user->wallet) {
                Response::json($response, ['error' => 'Este usuário não possui saldo.'], 400);
                return;
            }

            if ($user->wallet->status !== 'active') {
                Response::json($response, ['error' => 'A carteira deste usuário não se encontra ativa.'], 400);
                return;
            }

            if (floatval($user->wallet->saldo) < $creditValue) {
                Response::json($response, ['error' => 'O usuário possui saldo menor do que o solicitado.'], 400);
                return;
            }

            $connName = TenantContext::getConnectionName();

            Capsule::connection($connName)->transaction(function () use ($authUser, $user, $creditValue, $input) {
                $currentBalance = floatval($user->wallet->saldo);
                $newBalance = $currentBalance - $creditValue;

                $user->wallet->update(['saldo' => $newBalance]);

                WalletTransactions::create([
                    'wallet_id' => $user->wallet->id,
                    'admin_id' => $authUser->id,
                    'transacao_titulo' => "Crédito Removido",
                    'transacao_valor' => -abs($creditValue),
                    'saldo_anterior' => $currentBalance,
                    'saldo_atual' => $newBalance
                ]);

                LogSorteios::create([
                    'user_id' => $authUser->id,
                    'log_titulo' => 'Remover Crédito',
                    'log_detalhes' => json_encode([
                        'usuarioId' => $user->id,
                        'usuarioName' => $user->name,
                        'valorRemovido' => $input['valor'],
                        'saldoAnterior' => $currentBalance,
                        'saldoAtual' => $newBalance,
                    ]),
                ]);
            });

            Response::json($response, ['success' => true, 'message' => 'Saldo removido com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /wallet/status[/{user_uuid}]
     */
    public function changeStatusWallet(Request $request, SwooleResponse $response, ?string $user_uuid = null): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            $user = User::with('wallet')
                ->where('banca_id', $bancaId)
                ->where('uuid', $user_uuid ?? $authUser->uuid)
                ->firstOrFail();

            if ($user->status !== 'active') {
                Response::json($response, ['error' => 'Não é possível alterar o status da carteira deste usuário pois ele se encontra desabilitado.'], 400);
                return;
            }

            $connName = TenantContext::getConnectionName();

            Capsule::connection($connName)->transaction(function () use ($bancaId, $user, $authUser) {
                if (!$user->wallet) {
                    $user->wallet = Wallet::create([
                        'uuid' => Uuid::uuid4()->toString(),
                        'banca_id' => $bancaId,
                        'user_id' => $user->id,
                        'saldo' => 0,
                    ]);
                }

                $newStatus = ($user->wallet->status === 'active') ? 'disabled' : 'active';
                $user->wallet->update(['status' => $newStatus]);

                LogSorteios::create([
                    'user_id' => $authUser->id,
                    'log_titulo' => 'Alteração de Status de Carteira',
                    'log_detalhes' => json_encode([
                        'usuarioId' => $user->id,
                        'usuarioName' => $user->name,
                        'novoStatus' => ($newStatus === 'active') ? 'Habilitado' : 'Desabilitado',
                    ]),
                ]);
            });

            Response::json($response, ['success' => true, 'message' => 'Status da carteira alterado com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * GET /wallet/relatorio[/{user_uuid}]
     */
    public function relatorioView(Request $request, SwooleResponse $response, ?string $user_uuid = null): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            if ($user_uuid) {
                $user = User::where('uuid', $user_uuid)
                    ->where('banca_id', $bancaId)
                    ->firstOrFail();
                $userId = $user->id;
            } else {
                $userId = $authUser->id;
            }

            $wallet = Wallet::where('user_id', $userId)->where('banca_id', $bancaId)->firstOrFail();

            $query = WalletTransactions::with('aposta')->where('wallet_id', $wallet->id);

            $dateRange = $request->get['dateRange'] ?? null;
            if ($dateRange) {
                $dateRangeSplit = explode(' até ', $dateRange);
                if (isset($dateRangeSplit[1])) {
                    $query->whereDate('created_at', '>=', $dateRangeSplit[0])
                          ->whereDate('created_at', '<=', $dateRangeSplit[1]);
                } else {
                    $query->whereDate('created_at', '=', $dateRangeSplit[0]);
                }
            }

            $page = intval($request->get['page'] ?? 1);
            $limit = 15;
            $offset = ($page - 1) * $limit;

            $total = $query->count();
            $transactions = $query->orderBy('id', 'desc')->offset($offset)->limit($limit)->get();

            Response::json($response, [
                'success' => true,
                'wallet' => $wallet,
                'transactions' => $transactions,
                'pagination' => [
                    'current_page' => $page,
                    'total_records' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Não foi possível buscar o relatório solicitado.'], 400);
        }
    }

    /**
     * GET /wallet/relatorio-vendas[/{user_uuid}]
     */
    public function relatorioVendasView(Request $request, SwooleResponse $response, ?string $user_uuid = null): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            if ($user_uuid) {
                $user = User::where('uuid', $user_uuid)->where('banca_id', $bancaId)->firstOrFail();
                $user_id = $user->id;
            } else {
                $user = $authUser;
                $user_id = $authUser->id;
            }

            $bilhetesQuery = SorteiosApostas::with(['sorteio.modalidade', 'user'])
                ->whereHas('user', function ($query) use ($bancaId) {
                    $query->where('banca_id', $bancaId);
                });

            if ($user_uuid || $authUser->role === 'seller') {
                $bilhetesQuery->where('vendedor_id', $user_id);
            }

            $dateRange = $request->get['dateRange'] ?? null;
            if ($dateRange && $dateRange !== 'undefined') {
                $dateRangeSplit = explode(' até ', $dateRange);
                $startDate = $dateRangeSplit[0];
                $endDate = $dateRangeSplit[1] ?? $startDate;

                $bilhetesQuery->whereHas('sorteio', function ($q) use ($startDate, $endDate) {
                    $q->where('data_sorteio', '>=', $startDate . ' 00:00:00')
                      ->where('data_sorteio', '<=', $endDate . ' 23:59:59');
                });
            } else {
                $bilhetesQuery->whereHas('sorteio', function ($q) {
                    $q->where('data_sorteio', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                      ->where('data_sorteio', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');
                });
            }

            $bilhetesCollection = (clone $bilhetesQuery)->get();
            $valTotalApostado = $bilhetesCollection->sum('val_apostado');
            $valTotalComissoes = $bilhetesCollection->sum('vendedor_comissao_venda') + $bilhetesCollection->sum('vendedor_comissao_bonus');
            $valTotalPremiacao = $bilhetesCollection->sum('val_premiacao');
            $totalBilhetes = $bilhetesCollection->count();

            $page = intval($request->get['page'] ?? 1);
            $limit = 15;
            $offset = ($page - 1) * $limit;

            $total = $bilhetesQuery->count();
            $listagem = $bilhetesQuery->orderBy('created_at', 'desc')->offset($offset)->limit($limit)->get();

            Response::json($response, [
                'success' => true,
                'transactions' => $listagem,
                'valTotalComissoes' => $valTotalComissoes,
                'valTotalApostado' => $valTotalApostado,
                'valTotalPremiacao' => $valTotalPremiacao,
                'totalBilhetes' => $totalBilhetes,
                'user' => $user,
                'pagination' => [
                    'current_page' => $page,
                    'total_records' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Erro ao processar relatório: ' . $e->getMessage()], 400);
        }
    }

    /**
     * GET /wallet/fechamento-caixa/{user_uuid}
     */
    public function fechamentoCaixaView(Request $request, SwooleResponse $response, string $user_uuid): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        try {
            $dateRange = $request->get['dateRange'] ?? null;
            $data = $this->getFechamentoData($user_uuid, $dateRange);
            Response::json($response, array_merge(['success' => true], $data));
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Não foi possível buscar o fechamento solicitado: ' . $e->getMessage()], 400);
        }
    }

    /**
     * POST /wallet/fechamento-caixa/{user_uuid}/saque
     */
    public function saqueFechamentoCaixa(Request $request, SwooleResponse $response, string $user_uuid): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['val'])) {
            Response::json($response, ['error' => 'O campo val é obrigatório.'], 422);
            return;
        }

        try {
            $userFechamento = User::where('banca_id', $bancaId)
                ->where('uuid', $user_uuid)
                ->firstOrFail();

            $today = Carbon::now()->format('Y-m-d');
            $apostas = SorteiosApostas::with(['user'])
                ->where('vendedor_id', $userFechamento->id)
                ->whereHas('sorteio', function ($q) use ($today) {
                    $q->whereDate('data_sorteio', '<=', $today);
                })
                ->get();

            $totalVendas = $apostas->sum('val_apostado');
            $totalComissao = $apostas->sum('vendedor_comissao_venda') + $apostas->sum('vendedor_comissao_bonus');
            $totalPremiacao = $apostas->sum('val_premiacao');

            $fechamentos = FechamentoCaixa::where('user_id', $userFechamento->id)->get();

            $fechamentoVendas = $fechamentos->sum('val_vendas');
            $fechamentoComissoes = $fechamentos->sum('val_comissoes');
            $fechamentoPremiacoes = $fechamentos->sum('val_premiacoes');
            $fechamentoValor = $fechamentos->sum('valor');

            $val = $fechamentoVendas - ($fechamentoPremiacoes + $fechamentoComissoes);
            $saldoAnterior = $fechamentoValor + $val;

            $totalVendas -= $fechamentoVendas;
            $totalComissao -= $fechamentoComissoes;
            $totalPremiacao -= $fechamentoPremiacoes;
            $saldoFechamento = $totalVendas - ($totalComissao + $totalPremiacao);

            $valFechamento = -abs(floatval(str_replace(',', '.', str_replace('.', '', $input['val']))));
            $saldoAtual = $saldoAnterior + $saldoFechamento + $valFechamento;

            $connName = TenantContext::getConnectionName();
            $fechamentoCriado = Capsule::connection($connName)->transaction(function () use ($userFechamento, $totalVendas, $totalComissao, $totalPremiacao, $saldoFechamento, $valFechamento, $saldoAnterior, $saldoAtual, $authUser) {
                $fc = FechamentoCaixa::create([
                    'uuid' => Uuid::uuid4()->toString(),
                    'user_id' => $userFechamento->id,
                    'val_vendas' => $totalVendas,
                    'val_comissoes' => $totalComissao,
                    'val_premiacoes' => $totalPremiacao,
                    'saldo_fechamento' => $saldoFechamento,
                    'valor' => $valFechamento,
                    'saldo_anterior' => $saldoAnterior,
                    'saldo_atual' => $saldoAtual,
                ]);

                LogSorteios::create([
                    'user_id' => $authUser->id,
                    'log_titulo' => 'Fechamento de saque criado',
                    'log_detalhes' => json_encode([
                        'fechamentoCriado' => $fc->toArray(),
                    ]),
                ]);

                return $fc;
            });

            Response::json($response, ['success' => true, 'fechamento' => $fechamentoCriado]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /wallet/fechamento-caixa/{user_uuid}/deposito
     */
    public function depositoFechamentoCaixa(Request $request, SwooleResponse $response, string $user_uuid): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['val'])) {
            Response::json($response, ['error' => 'O campo val é obrigatório.'], 422);
            return;
        }

        try {
            $userFechamento = User::where('banca_id', $bancaId)
                ->where('uuid', $user_uuid)
                ->firstOrFail();

            $today = Carbon::now()->format('Y-m-d');
            $apostas = SorteiosApostas::with(['user'])
                ->where('vendedor_id', $userFechamento->id)
                ->whereHas('sorteio', function ($q) use ($today) {
                    $q->whereDate('data_sorteio', '<=', $today);
                })
                ->get();

            $totalVendas = $apostas->sum('val_apostado');
            $totalComissao = $apostas->sum('vendedor_comissao_venda') + $apostas->sum('vendedor_comissao_bonus');
            $totalPremiacao = $apostas->sum('val_premiacao');

            $fechamentos = FechamentoCaixa::where('user_id', $userFechamento->id)->get();

            $fechamentoVendas = $fechamentos->sum('val_vendas');
            $fechamentoComissoes = $fechamentos->sum('val_comissoes');
            $fechamentoPremiacoes = $fechamentos->sum('val_premiacoes');
            $fechamentoValor = $fechamentos->sum('valor');

            $val = $fechamentoVendas - ($fechamentoPremiacoes + $fechamentoComissoes);
            $saldoAnterior = $fechamentoValor + $val;

            $totalVendas -= $fechamentoVendas;
            $totalComissao -= $fechamentoComissoes;
            $totalPremiacao -= $fechamentoPremiacoes;
            $saldoFechamento = $totalVendas - ($totalComissao + $totalPremiacao);

            $valFechamento = floatval(str_replace(',', '.', str_replace('.', '', $input['val'])));
            $saldoAtual = $saldoAnterior + $saldoFechamento + $valFechamento;

            $connName = TenantContext::getConnectionName();
            $fechamentoCriado = Capsule::connection($connName)->transaction(function () use ($userFechamento, $totalVendas, $totalComissao, $totalPremiacao, $saldoFechamento, $valFechamento, $saldoAnterior, $saldoAtual, $authUser) {
                $fc = FechamentoCaixa::create([
                    'uuid' => Uuid::uuid4()->toString(),
                    'user_id' => $userFechamento->id,
                    'val_vendas' => $totalVendas,
                    'val_comissoes' => $totalComissao,
                    'val_premiacoes' => $totalPremiacao,
                    'saldo_fechamento' => $saldoFechamento,
                    'valor' => $valFechamento,
                    'saldo_anterior' => $saldoAnterior,
                    'saldo_atual' => $saldoAtual,
                ]);

                LogSorteios::create([
                    'user_id' => $authUser->id,
                    'log_titulo' => 'Fechamento de depósito criado',
                    'log_detalhes' => json_encode([
                        'fechamentoCriado' => $fc->toArray(),
                    ]),
                ]);

                return $fc;
            });

            Response::json($response, ['success' => true, 'fechamento' => $fechamentoCriado]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * DELETE /wallet/fechamento-caixa/{user_uuid}
     */
    public function deleteFechamentoCaixa(Request $request, SwooleResponse $response, string $user_uuid): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['id_fechamento'])) {
            Response::json($response, ['error' => 'O campo id_fechamento é obrigatório.'], 422);
            return;
        }

        try {
            $userFechamento = User::where('banca_id', $bancaId)
                ->where('uuid', $user_uuid)
                ->firstOrFail();

            $fechamento = FechamentoCaixa::where('user_id', $userFechamento->id)
                ->where('uuid', $input['id_fechamento'])
                ->firstOrFail();

            $connName = TenantContext::getConnectionName();
            Capsule::connection($connName)->transaction(function () use ($fechamento, $authUser) {
                $fechamentoInfo = $fechamento->toArray();
                $fechamento->delete();

                LogSorteios::create([
                    'user_id' => $authUser->id,
                    'log_titulo' => 'Fechamento deletado',
                    'log_detalhes' => json_encode([
                        'fechamentoDeletado' => $fechamentoInfo,
                    ]),
                ]);
            });

            Response::json($response, ['success' => true, 'message' => 'Fechamento deletado com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Internal closure resolver helper
     */
    private function getFechamentoData(string $user_uuid, ?string $dateRange = null): array
    {
        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        $userFechamento = User::where('banca_id', $bancaId)
            ->where('uuid', $user_uuid)
            ->firstOrFail();

        $apostas = SorteiosApostas::with(['user'])
            ->where('vendedor_id', $userFechamento->id);

        $today = Carbon::now()->format('Y-m-d');
        $startDate = null;
        $endDate = null;

        if ($dateRange) {
            $dateRangeSplit = explode(' até ', $dateRange);
            try {
                $startDate = Carbon::createFromFormat('d/m/Y', trim($dateRangeSplit[0]))->format('Y-m-d');
            } catch (\Exception $e) {
                $startDate = trim($dateRangeSplit[0]);
            }

            try {
                $endDate = isset($dateRangeSplit[1])
                    ? Carbon::createFromFormat('d/m/Y', trim($dateRangeSplit[1]))->format('Y-m-d')
                    : $startDate;
            } catch (\Exception $e) {
                $endDate = isset($dateRangeSplit[1]) ? trim($dateRangeSplit[1]) : $startDate;
            }

            if ($endDate > $today) $endDate = $today;

            $apostas->whereHas('sorteio', function ($q) use ($startDate, $endDate) {
                $q->whereDate('data_sorteio', '>=', $startDate)
                  ->whereDate('data_sorteio', '<=', $endDate);
            });
        } else {
            $apostas->whereHas('sorteio', function ($q) use ($today) {
                $q->whereDate('data_sorteio', '<=', $today);
            });
        }

        $apostasFull = $apostas->with(['sorteio.modalidade'])->get();
        $totalVendas = $apostasFull->sum('val_apostado');
        $totalComissao = $apostasFull->sum('vendedor_comissao_venda') + $apostasFull->sum('vendedor_comissao_bonus');
        $totalPremiacao = $apostasFull->sum('val_premiacao');

        $fechamentos = FechamentoCaixa::where('user_id', $userFechamento->id)
            ->orderBy('id', 'desc')
            ->get();

        $fechamentoVendas = $fechamentos->sum('val_vendas');
        $fechamentoComissoes = $fechamentos->sum('val_comissoes');
        $fechamentoPremiacoes = $fechamentos->sum('val_premiacoes');
        $fechamentoValor = $fechamentos->sum('valor');

        $val = $fechamentoVendas - ($fechamentoPremiacoes + $fechamentoComissoes);
        $saldoAtual = $fechamentoValor + $val;

        if (!$dateRange) {
            $totalVendas -= $fechamentoVendas;
            $totalComissao -= $fechamentoComissoes;
            $totalPremiacao -= $fechamentoPremiacoes;
        }

        $saldoFechamento = $totalVendas - ($totalComissao + $totalPremiacao);

        $groupedApostas = $apostasFull->groupBy('sorteio_id')->map(function ($group) {
            $first = $group->first();
            return (object)[
                'modalidade_nome' => $first->sorteio?->modalidade?->nome ?? 'N/A',
                'modalidade_icone' => $first->sorteio?->modalidade?->icone ?? 'icon.png',
                'concurso_numero' => $first->sorteio?->concurso ?? 'N/A',
                'qtd_bilhetes' => $group->count(),
                'valor_total' => $group->sum('val_apostado'),
            ];
        });

        return [
            'totalVendas' => $totalVendas,
            'totalComissao' => $totalComissao,
            'totalPremiacao' => $totalPremiacao,
            'saldoFechamento' => $saldoFechamento,
            'saldoAtual' => $saldoAtual,
            'isFiltered' => !empty($dateRange),
            'user' => $userFechamento,
            'fechamentos' => $fechamentos,
            'groupedApostas' => $groupedApostas,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ];
    }
}
