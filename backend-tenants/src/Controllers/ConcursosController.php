<?php

namespace App\Controllers;

use App\Models\Banca;
use App\Models\LogSorteios;
use App\Models\Sorteios;
use App\Models\SorteiosApostas;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransactions;
use App\Models\ConsultantCombinationLimit;
use App\Database\TenantContext;
use App\Middleware\TenantAuthMiddleware;
use App\Utils\Response;
use Carbon\Carbon;
use Exception;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;
use Ramsey\Uuid\Uuid;
use Illuminate\Database\Capsule\Manager as Capsule;

class ConcursosController
{
    /**
     * GET /concursos
     */
    public function index(Request $request, SwooleResponse $response): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        $sorteio = Sorteios::with('modalidade')
            ->where('banca_id', $bancaId)
            ->where('status', 'pending')
            ->where('data_sorteio', '>=', Carbon::now())
            ->orderBy('data_sorteio', 'asc')
            ->first();

        Response::json($response, ['success' => true, 'sorteio' => $sorteio]);
    }

    /**
     * GET /concursos/view/{concurso_uuid}
     */
    public function viewConcurso(Request $request, SwooleResponse $response, string $concurso_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            $sorteio = Sorteios::with(['modalidade', 'premiacoes'])
                ->where('banca_id', $bancaId)
                ->where('uuid', $concurso_uuid)
                ->firstOrFail();

            Response::json($response, ['success' => true, 'sorteio' => $sorteio]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Concurso não encontrado.'], 404);
        }
    }

    /**
     * POST /concursos/save/{concurso_uuid}/bilhetes
     */
    public function saveBilhete(Request $request, SwooleResponse $response, string $concurso_uuid, ?string $user_uuid = null): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['game'])) {
            Response::json($response, ['error' => 'Nenhum bilhete encontrado no pedido.'], 422);
            return;
        }

        try {
            $targetUuid = $user_uuid ?? ($input['idUser'] ?? null);

            if ($targetUuid) {
                if ($authUser->role !== 'admin') {
                    if ($authUser->role !== 'seller') {
                        Response::json($response, ['error' => 'Acesso proibido.'], 403);
                        return;
                    }

                    $userDetails = User::where('uuid', $targetUuid)
                        ->where('banca_id', $bancaId)
                        ->where('vendedor_id', $authUser->id)
                        ->firstOrFail();
                } else {
                    $userDetails = User::where('uuid', $targetUuid)
                        ->where('banca_id', $bancaId)
                        ->firstOrFail();
                }
            } else {
                $userDetails = $authUser;
            }

            $userApostador_id = $userDetails->id;
            $connName = TenantContext::getConnectionName();

            $gamesData = [];
            $concursoUuuids = [];
            foreach ((array)$input['game'] as $gameRaw) {
                $gam = is_string($gameRaw) ? json_decode($gameRaw, true) : $gameRaw;
                if ($gam) {
                    $gamesData[] = $gam;
                    $concursoUuuids[] = $gam['idConcurso'];
                }
            }

            if (empty($gamesData)) {
                Response::json($response, ['error' => 'Nenhum bilhete válido encontrado.'], 422);
                return;
            }

            $allSorteios = Sorteios::with(['modalidade', 'premiacoes'])
                ->whereIn('uuid', array_unique($concursoUuuids))
                ->where('banca_id', $bancaId)
                ->get()
                ->keyBy('uuid');

            $validateBilhetes = $this->validateGames($gamesData, $allSorteios);
            if (!$validateBilhetes['valid']) {
                Response::json($response, ['error' => $validateBilhetes['message']], 400);
                return;
            }

            $walletApostador = Wallet::firstOrCreate(
                ['user_id' => $userApostador_id, 'banca_id' => $bancaId],
                ['uuid' => Uuid::uuid4()->toString(), 'saldo' => 0]
            );

            $walletVendedor = null;
            if ($authUser->id !== $userApostador_id) {
                $walletVendedor = Wallet::firstOrCreate(
                    ['user_id' => $authUser->id, 'banca_id' => $bancaId],
                    ['uuid' => Uuid::uuid4()->toString(), 'saldo' => 0]
                );
            }

            $currentBalanceApostador = $walletApostador->saldo;
            $currentBalanceVendedor = $walletVendedor ? $walletVendedor->saldo : 0;
            $success_uuids = [];
            $errors = [];
            $msgSuccess = [];
            $success = [];

            $sellerId = ($userDetails->role === 'seller') ? $userDetails->id : $userDetails->vendedor_id;
            $consultantLimitsCache = [];
            if ($sellerId) {
                $consultantLimitsCache = ConsultantCombinationLimit::where('user_id', $sellerId)
                    ->get()
                    ->groupBy(fn($item) => "{$item->modalidade_id}_{$item->qtd_dezenas}")
                    ->map(fn($group) => $group->first());
            }

            $distinctSignaturesCache = [];
            $validatedCombosInThisRequest = [];
            $userTicketsCountCache = [];

            $vendedor = null;
            if ($userDetails->vendedor_id) {
                $vendedor = User::with('wallet')->find($userDetails->vendedor_id);
            }

            $clientIp = $request->header['x-real-ip'] ?? ($request->header['x-forwarded-for'] ?? '127.0.0.1');

            Capsule::connection($connName)->transaction(function () use (
                $gamesData, $allSorteios, $walletApostador, $walletVendedor,
                &$currentBalanceApostador, &$currentBalanceVendedor, $authUser,
                $userDetails, $userApostador_id, $bancaId, $vendedor, $clientIp,
                &$errors, &$msgSuccess, &$success, &$success_uuids,
                &$consultantLimitsCache, &$distinctSignaturesCache,
                &$validatedCombosInThisRequest, &$userTicketsCountCache
            ) {
                foreach ($gamesData as $gam) {
                    $nomeConcurso = $gam['nomeConcurso'];
                    $concurso_uuid = $gam['idConcurso'];
                    $codeBilhete = strtoupper($gam['code']);

                    $sorteio = $allSorteios->get($concurso_uuid);
                    if (!$sorteio) {
                        $errors[$codeBilhete] = "Concurso $nomeConcurso não encontrado.";
                        continue;
                    }

                    $walletToUse = $walletApostador;
                    $isUnlimited = ($walletApostador->status !== 'active');
                    $balanceField = 'currentBalanceApostador';

                    if (!$isUnlimited && $currentBalanceApostador < $gam['value']) {
                        if ($walletVendedor) {
                            $isUnlimited = ($walletVendedor->status !== 'active');
                            if (!$isUnlimited && $currentBalanceVendedor < $gam['value']) {
                                $errors[$codeBilhete] = "Você e o apostador não possuem saldo para completar esta aposta";
                                continue;
                            }
                            $walletToUse = $walletVendedor;
                            $balanceField = 'currentBalanceVendedor';
                        } else {
                            $errors[$codeBilhete] = "Você não possui saldo para completar esta aposta";
                            continue;
                        }
                    }

                    $modalidade = $sorteio->modalidade;
                    $premiacoes = $sorteio->premiacoes;

                    if ($premiacoes->isEmpty()) {
                        $errors[$codeBilhete] = "A modalidade $nomeConcurso não está disponível";
                        continue;
                    }

                    if (!$sorteio->inicio_venda_imediato && strtotime($sorteio->inicio_vendas) > time()) {
                        $dtInicio = date('d/m/Y H:i', strtotime($sorteio->inicio_vendas));
                        $errors[$codeBilhete] = "As vendas para o concurso '$nomeConcurso' não foram iniciadas, iniciando em $dtInicio";
                        continue;
                    }

                    if ($sorteio->data_limite_apostas && strtotime($sorteio->data_limite_apostas) < time()) {
                        $errors[$codeBilhete] = "As vendas para o concurso '$nomeConcurso' já foram encerradas";
                        continue;
                    }

                    if (strtotime($sorteio->data_sorteio) < time()) {
                        $errors[$codeBilhete] = "O concurso '$nomeConcurso' foi encerrado.";
                        continue;
                    }

                    if ($modalidade->max_bilhete_cliente) {
                        $maxBilhete = $modalidade->max_bilhete_cliente;
                        if (!isset($userTicketsCountCache[$sorteio->id])) {
                            $userTicketsCountCache[$sorteio->id] = SorteiosApostas::where('sorteio_id', $sorteio->id)
                                ->where('user_id', $userApostador_id)
                                ->count();
                        }

                        if ($userTicketsCountCache[$sorteio->id] >= $maxBilhete) {
                            $errors[$codeBilhete] = "O máximo de bilhetes para '$nomeConcurso' é de {$maxBilhete} por cliente";
                            continue;
                        }
                    }

                    $numbers = $gam['numbers'];
                    sort($numbers);
                    $valAposta = $gam['value'];
                    $dezenas = count($numbers);
                    $bilheteSearch = implode(',', $numbers);

                    // Duplicate guard
                    $recentDuplicate = SorteiosApostas::where('sorteio_id', $sorteio->id)
                        ->where('user_id', $userApostador_id)
                        ->where('numeros', $bilheteSearch)
                        ->where('created_at', '>=', Carbon::now()->subSeconds(30))
                        ->exists();

                    if ($recentDuplicate) {
                        $errors[$codeBilhete] = "Esta aposta já foi registrada nos últimos 30 segundos.";
                        continue;
                    }

                    if ($modalidade->bloq_blihetes_duplicados) {
                        $existsInDb = SorteiosApostas::where('sorteio_id', $sorteio->id)
                            ->where('qtd_dezenas', $dezenas)
                            ->where('numeros', $bilheteSearch)
                            ->exists();

                        if ($existsInDb || in_array($bilheteSearch, $validatedCombosInThisRequest)) {
                            $errors[$codeBilhete] = "O bilhete com a combinação de números '{$bilheteSearch}' do concurso $nomeConcurso já existe no sistema";
                            continue;
                        }
                    }

                    $premiacaoBilhete = $premiacoes->first(fn($prem) => $prem->qtd_dezenas == $dezenas);
                    if (!$premiacaoBilhete) {
                        $errors[$codeBilhete] = "A modalidade '$nomeConcurso' não está disponível para $dezenas dezenas.";
                        continue;
                    }

                    $combinationValidation = $this->validateAndApplyCombinationLimit(
                        $userApostador_id,
                        $sorteio,
                        $modalidade,
                        $premiacaoBilhete,
                        $numbers,
                        $validatedCombosInThisRequest,
                        $distinctSignaturesCache,
                        $consultantLimitsCache
                    );

                    if ($combinationValidation !== true) {
                        $errors[$codeBilhete] = $combinationValidation;
                        continue;
                    }

                    $validatedCombosInThisRequest[] = $bilheteSearch;

                    $minValBilhete = $premiacaoBilhete->min_val_aposta ?: $modalidade->val_min_bilhete;
                    if ($minValBilhete > 0 && $valAposta < $minValBilhete) {
                        $errors[$codeBilhete] = "O valor do bilhete em '$nomeConcurso' deve ser de no mínimo R$ " . number_format($minValBilhete, 2, ',', '.');
                        continue;
                    }

                    $maxValBilhete = $premiacaoBilhete->max_val_aposta ?: $modalidade->val_max_bilhete;
                    if ($maxValBilhete > 0 && $valAposta > $maxValBilhete) {
                        $errors[$codeBilhete] = "O valor do bilhete em '$nomeConcurso' deve ser de no máximo R$ " . number_format($maxValBilhete, 2, ',', '.');
                        continue;
                    }

                    $premiacoesModalidade = json_decode($premiacaoBilhete->premiacoes, true);
                    $maiorAcertos = max(array_column($premiacoesModalidade, 'acertos'));
                    $premioMaiorAcerto = max(array_map(
                        fn($i) => (int)$i['acertos'] === (int)$maiorAcertos ? (float)$i['premio'] : 0,
                        $premiacoesModalidade
                    ));

                    $maxGanhoLimit = $premiacaoBilhete->max_val_premiacoes ?: $modalidade->max_val_premiacoes;
                    $calculatedMaxGanho = $premioMaiorAcerto * $valAposta;
                    $maxGanho = ($maxGanhoLimit > 0 && $calculatedMaxGanho > $maxGanhoLimit) ? $maxGanhoLimit : $calculatedMaxGanho;

                    $comissionValue = 0;
                    if ($vendedor) {
                        if ($vendedor->comissao_tipo === 'value_percent') {
                            $comissionValue = (float) (($valAposta / 100) * $vendedor->comissao);
                        } else {
                            $comissionValue = (float) ($vendedor->comissao);
                        }
                    }

                    $bilhete = SorteiosApostas::create([
                        'uuid'         => Uuid::uuid4()->toString(),
                        'sorteio_id'   => $sorteio->id,
                        'user_id'      => $userApostador_id,
                        'vendedor_id'  => $userDetails->vendedor_id,
                        'added_user_id' => $authUser->id,
                        'numeros'      => $bilheteSearch,
                        'qtd_dezenas'  => $premiacaoBilhete->qtd_dezenas,
                        'val_apostado' => (float) $valAposta,
                        'ganho_maximo' => $maxGanho,
                        'is_surpresinha' => $isSurpresinha,
                        'is_importe' => $isImporte,
                        'vendedor_comissao_venda' => $comissionValue,
                        'wallet_id' => $walletToUse->id,
                    ]);

                    if (isset($userTicketsCountCache[$sorteio->id])) {
                        $userTicketsCountCache[$sorteio->id]++;
                    }

                    if ($walletToUse->status === 'active') {
                        $oldBalance = $$balanceField;
                        $$balanceField = $oldBalance - $valAposta;
                        $balanceToLog = $$balanceField;
                    } else {
                        $oldBalance = 0;
                        $balanceToLog = 0;
                    }

                    WalletTransactions::create([
                        'wallet_id' => $walletToUse->id,
                        'aposta_id' => $bilhete->id,
                        'transacao_titulo' => 'Compra de bilhete',
                        'transacao_valor' => -abs($valAposta),
                        'saldo_anterior' => $oldBalance,
                        'saldo_atual' => $balanceToLog,
                        'carteira_desabilitada' => $walletToUse->status === 'active' ? 0 : 1,
                    ]);

                    LogSorteios::create([
                        "user_id" => $authUser->id,
                        "sorteio_id" => $sorteio->id,
                        "log_titulo" => "Bilhete adquirido",
                        "log_detalhes" => json_encode([
                            "idBilhete" => $bilhete->id,
                            "numerosApostados" => $bilheteSearch,
                            "dezenasApostadas" => $premiacaoBilhete->qtd_dezenas,
                            "comissaoVendedor" => $comissionValue,
                            "valorApostado" => (float) $valAposta,
                        ]),
                        'ip' => $clientIp
                    ]);

                    $msgSuccess[] = "#$codeBilhete registrado com sucesso";
                    $success[] = strtolower($codeBilhete);
                    $success_uuids[] = $bilhete->uuid;

                    if ($comissionValue > 0 && $vendedor && $vendedor->wallet) {
                        WalletTransactions::create([
                            'wallet_id' => $vendedor->wallet->id,
                            'aposta_id' => $bilhete->id,
                            'transacao_titulo' => 'Comissão de venda',
                            'transacao_valor' => $comissionValue,
                            'saldo_anterior' => $vendedor->wallet->saldo,
                            'saldo_atual' => $vendedor->wallet->saldo,
                            'carteira_desabilitada' => $vendedor->wallet->status === 'active' ? 0 : 1,
                            'vendedor_comissao_parametros' => json_encode([
                                'comissao_bonus' => $vendedor->comissao_bonus,
                                'comissao' => $vendedor->comissao,
                                'comissao_tipo' => $vendedor->comissao_tipo,
                            ]),
                        ]);
                    }
                }

                if ($walletApostador->status === 'active') {
                    $walletApostador->update(['saldo' => $currentBalanceApostador]);
                }

                if ($walletVendedor && $walletVendedor->status === 'active') {
                    $walletVendedor->update(['saldo' => $currentBalanceVendedor]);
                }
            });

            Response::json($response, [
                'success' => true,
                'message' => $msgSuccess,
                'registered_bilhetes' => $success_uuids,
                'errors' => $errors
            ]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Não conseguimos registrar os bilhetes: ' . $e->getMessage()], 400);
        }
    }

    /**
     * POST /concursos/validate/{concurso_uuid}
     */
    public function validateCart(Request $request, SwooleResponse $response, string $concurso_uuid, ?string $user_uuid = null): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['game'])) {
            Response::json($response, ['valid' => false, 'message' => 'Nenhum bilhete no carrinho'], 400);
            return;
        }

        try {
            if ($user_uuid) {
                $userApostador = User::where('uuid', $user_uuid)->where('banca_id', $bancaId)->firstOrFail();
            } else {
                $userApostador = $authUser;
            }

            $userId = $userApostador->id;

            $preVal = $this->realizePreValidationBilhete($userId, $concurso_uuid, 0, 0);
            if ($preVal !== true) {
                Response::json($response, ['valid' => false, 'message' => $preVal]);
                return;
            }

            $walletApostador = Wallet::firstOrCreate(
                ['user_id' => $userId, 'banca_id' => $bancaId],
                ['uuid' => Uuid::uuid4()->toString(), 'saldo' => 0]
            );

            $currentBalanceApostador = $walletApostador->saldo;
            $isUnlimitedApostador = ($walletApostador->status !== 'active');

            $currentBalanceVendedor = 0;
            $isUnlimitedVendedor = false;
            if ($authUser->id !== $userId) {
                $walletVendedor = Wallet::where('user_id', $authUser->id)->where('banca_id', $bancaId)->first();
                if ($walletVendedor) {
                    $currentBalanceVendedor = $walletVendedor->saldo;
                    $isUnlimitedVendedor = ($walletVendedor->status !== 'active');
                }
            }

            $gamesData = [];
            $concursoUuuids = [$concurso_uuid];
            foreach ((array)$input['game'] as $gameRaw) {
                $gam = is_string($gameRaw) ? json_decode($gameRaw, true) : $gameRaw;
                if ($gam) {
                    $gamesData[] = $gam;
                    if (isset($gam['idConcurso'])) $concursoUuuids[] = $gam['idConcurso'];
                }
            }

            $allSorteios = Sorteios::with(['modalidade', 'premiacoes'])
                ->whereIn('uuid', array_unique($concursoUuuids))
                ->where('banca_id', $bancaId)
                ->get()
                ->keyBy('uuid');

            $sellerId = ($userApostador->role === 'seller') ? $userApostador->id : $userApostador->vendedor_id;
            $consultantLimitsCache = [];
            if ($sellerId) {
                $consultantLimitsCache = ConsultantCombinationLimit::where('user_id', $sellerId)
                    ->get()
                    ->groupBy(fn($item) => "{$item->modalidade_id}_{$item->qtd_dezenas}")
                    ->map(fn($group) => $group->first());
            }

            $validatedCombosInThisRequest = [];
            if (!empty($input['cartGames'])) {
                $cartGames = is_string($input['cartGames']) ? json_decode($input['cartGames'], true) : $input['cartGames'];
                if (is_array($cartGames)) {
                    foreach ($cartGames as $g) {
                        $nums = $g['numbers'] ?? [];
                        if ($nums) {
                            sort($nums);
                            $validatedCombosInThisRequest[] = implode(',', $nums);
                        }
                    }
                }
            }

            $distinctSignaturesCache = [];
            $errors = [];
            $validCountPerContest = [];

            foreach ($gamesData as $index => $game) {
                $gameConcursoUuid = $game['idConcurso'] ?? $concurso_uuid;
                $val = (float) ($game['value'] ?? 0);

                $gameSorteio = $allSorteios->get($gameConcursoUuid);
                if (!$gameSorteio) {
                    $errors[$index] = "Concurso não encontrado para este bilhete";
                    continue;
                }

                $maxBilhete = $gameSorteio->modalidade->max_bilhete_cliente;
                if ($maxBilhete > 0) {
                    if (!isset($validCountPerContest[$gameConcursoUuid])) {
                        $validCountPerContest[$gameConcursoUuid] = SorteiosApostas::where('sorteio_id', $gameSorteio->id)
                            ->where('user_id', $userId)
                            ->count();
                    }

                    if (($validCountPerContest[$gameConcursoUuid] + 1) > $maxBilhete) {
                        $errors[$index] = "Máximo de bilhetes para '" . $gameSorteio->modalidade->nome . "' é de $maxBilhete por cliente";
                        continue;
                    }
                }

                if (!$isUnlimitedApostador && $currentBalanceApostador < $val) {
                    if (!$isUnlimitedVendedor && $currentBalanceVendedor < $val) {
                        $errors[$index] = "Saldo insuficiente para adicionar este bilhete";
                        continue;
                    }
                }

                $cache = [
                    'sorteio' => $gameSorteio,
                    'user' => $userApostador,
                    'bancaConf' => Banca::where('id', $bancaId)->first(),
                    'distinctSignaturesCache' => &$distinctSignaturesCache,
                    'consultantLimitsCache' => $consultantLimitsCache
                ];

                $indVal = $this->realizeIndidualValidationBilhete(
                    $userId,
                    $gameConcursoUuid,
                    !empty($game['isSurpresinha']) ? 1 : 0,
                    !empty($game['isImporte']) ? 1 : 0,
                    $game['numbers'],
                    $val,
                    $validatedCombosInThisRequest,
                    $cache
                );

                if ($indVal !== true) {
                    $errors[$index] = $indVal;
                } else {
                    if ($maxBilhete > 0) {
                        $validCountPerContest[$gameConcursoUuid]++;
                    }
                    $comb = $game['numbers'];
                    sort($comb);
                    $validatedCombosInThisRequest[] = implode(',', $comb);
                }
            }

            Response::json($response, [
                'valid' => count($errors) === 0,
                'errors' => $errors
            ]);
        } catch (\Throwable $e) {
            Response::json($response, ['valid' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /concursos/validate-single/{concurso_uuid}
     */
    public function validateSingle(Request $request, SwooleResponse $response, string $concurso_uuid, ?string $user_uuid = null): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['game'])) {
            Response::json($response, ['valid' => false, 'message' => 'Estrutura de bilhete inválida.'], 400);
            return;
        }

        try {
            $game = is_string($input['game']) ? json_decode($input['game'], true) : $input['game'];
            if (!$game) {
                Response::json($response, ['valid' => false, 'message' => 'Estrutura de bilhete inválida'], 400);
                return;
            }

            if ($user_uuid) {
                $userApostador = User::where('uuid', $user_uuid)->where('banca_id', $bancaId)->firstOrFail();
            } else {
                $userApostador = $authUser;
            }

            $userId = $userApostador->id;
            $currentCartTotal = (float) ($input['cartTotal'] ?? 0);
            $currentCartCount = (int) ($input['cartCount'] ?? 0);

            $preVal = $this->realizePreValidationBilhete(
                $userId,
                $concurso_uuid,
                $currentCartCount + 1,
                $currentCartTotal + (float) $game['value']
            );

            if ($preVal !== true) {
                Response::json($response, ['valid' => false, 'message' => $preVal]);
                return;
            }

            $sorteio = Sorteios::with(['modalidade', 'premiacoes'])
                ->where('uuid', $concurso_uuid)
                ->where('banca_id', $bancaId)
                ->firstOrFail();

            $sellerId = ($userApostador->role === 'seller') ? $userApostador->id : $userApostador->vendedor_id;
            $consultantLimitsCache = [];
            if ($sellerId) {
                $consultantLimitsCache = ConsultantCombinationLimit::where('user_id', $sellerId)
                    ->get()
                    ->groupBy(fn($item) => "{$item->modalidade_id}_{$item->qtd_dezenas}")
                    ->map(fn($group) => $group->first());
            }

            $cartGamesSorted = [];
            if (!empty($input['cartGames'])) {
                $cartGames = is_string($input['cartGames']) ? json_decode($input['cartGames'], true) : $input['cartGames'];
                if (is_array($cartGames)) {
                    foreach ($cartGames as $g) {
                        if (($g['idConcurso'] ?? '') === $concurso_uuid && (int)($g['dezenas'] ?? 0) === count($game['numbers'])) {
                            $nums = $g['numbers'];
                            sort($nums);
                            $cartGamesSorted[] = implode(',', $nums);
                        }
                    }
                }
            }

            $distinctSignaturesCache = [];
            $cache = [
                'sorteio' => $sorteio,
                'user' => $userApostador,
                'bancaConf' => Banca::where('id', $bancaId)->first(),
                'distinctSignaturesCache' => &$distinctSignaturesCache,
                'consultantLimitsCache' => $consultantLimitsCache
            ];

            $valid = $this->realizeIndidualValidationBilhete(
                $userId,
                $concurso_uuid,
                !empty($game['isSurpresinha']) ? 1 : 0,
                !empty($game['isImporte']) ? 1 : 0,
                $game['numbers'],
                (float) $game['value'],
                $cartGamesSorted,
                $cache
            );

            if ($valid === true) {
                Response::json($response, ['valid' => true]);
            } else {
                Response::json($response, ['valid' => false, 'message' => $valid]);
            }
        } catch (\Throwable $e) {
            Response::json($response, ['valid' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Legacy internal / external validator
     */
    public function realizePreValidationBilhete(int $userId, string $concurso_uuid, int $totalGames, float $valTotal)
    {
        try {
            $tenant = TenantContext::getResolvedTenant();
            $bancaId = $tenant->id;

            $user = User::where('id', $userId)->where('banca_id', $bancaId)->firstOrFail();
            $bancaConf = Banca::where('id', $bancaId)->firstOrFail();

            $sorteio = Sorteios::with(['modalidade', 'premiacoes'])
                ->where('uuid', $concurso_uuid)
                ->where('banca_id', $bancaId)
                ->firstOrFail();

            $modalidade = $sorteio->modalidade;
            $premiacoes = $sorteio->premiacoes;

            if ($premiacoes->isEmpty()) {
                throw new Exception('A modalidade informada não está disponível');
            }

            if (!$sorteio->inicio_venda_imediato && strtotime($sorteio->inicio_vendas) > time()) {
                $dtInicio = date('d/m/Y H:i', strtotime($sorteio->inicio_vendas));
                throw new Exception("As vendas para este concurso não foram iniciadas, iniciando em $dtInicio");
            }

            if ($sorteio->data_limite_apostas && strtotime($sorteio->data_limite_apostas) < time()) {
                throw new Exception('As vendas para este concurso já foram encerradas');
            }

            if (strtotime($sorteio->data_sorteio) < time()) {
                throw new Exception('Este concurso já foi encerrado.');
            }

            if ($modalidade->max_bilhete_cliente) {
                $maxBilhete = $modalidade->max_bilhete_cliente;
                $apostasCount = SorteiosApostas::where('sorteio_id', $sorteio->id)
                    ->where('user_id', $userId)
                    ->count();

                if ($apostasCount >= $maxBilhete) {
                    throw new Exception("O máximo de bilhetes neste sorteio é de {$maxBilhete} por cliente");
                }

                if ($totalGames > 0 && ($apostasCount + $totalGames) > $maxBilhete) {
                    throw new Exception("Não foi possível concluir o registro: limite de {$maxBilhete} por cliente.");
                }
            }

            if ($totalGames > 0) {
                $wallet = Wallet::firstOrCreate(
                    ['user_id' => $userId, 'banca_id' => $bancaId],
                    ['uuid' => Uuid::uuid4()->toString(), 'saldo' => 0]
                );

                $isUnlimitedApostador = ($wallet->status !== 'active');
                if (!$isUnlimitedApostador && $wallet->saldo < $valTotal) {
                    if ($userId !== Auth::id() && Auth::check()) {
                        $walletVendedor = Wallet::where('user_id', Auth::id())->where('banca_id', $bancaId)->first();
                        if ($walletVendedor) {
                            $isUnlimitedVendedor = ($walletVendedor->status !== 'active');
                            if (!$isUnlimitedVendedor && $walletVendedor->saldo < $valTotal) {
                                throw new Exception('Você e o apostador não possuem saldo para completar esta aposta');
                            }
                        } else {
                            throw new Exception('Você não possui saldo para completar esta aposta');
                        }
                    } else {
                        throw new Exception('Você não possui saldo para completar esta aposta');
                    }
                }
            }

            return true;
        } catch (\Throwable $e) {
            return $e->getMessage();
        }
    }

    public function realizeIndidualValidationBilhete(int $userId, string $concurso_uuid, int $isSurpresinha, int $isImporte, array $numbers, float $valAposta, array $cartGamesSorted = [], array &$cache = [])
    {
        try {
            $tenant = TenantContext::getResolvedTenant();
            $bancaId = $tenant->id;

            $sorteio = $cache['sorteio'] ?? null;
            if (!$sorteio || $sorteio->uuid !== $concurso_uuid) {
                $sorteio = Sorteios::with(['modalidade', 'premiacoes'])
                    ->where('uuid', $concurso_uuid)
                    ->where('banca_id', $bancaId)
                    ->firstOrFail();
            }

            $modalidade = $sorteio->modalidade;
            $premiacoes = $sorteio->premiacoes;

            sort($numbers);
            foreach ($numbers as $num) {
                if ($num < $modalidade->numbers_start_from || $num > $modalidade->max_numbers) {
                    throw new Exception("Os números devem estar entre {$modalidade->numbers_start_from} e {$modalidade->max_numbers}");
                }
            }

            $dezenas = count($numbers);
            $bilheteSearch = implode(',', $numbers);

            if ($modalidade->bloq_blihetes_duplicados) {
                $search = SorteiosApostas::where('sorteio_id', $sorteio->id)
                    ->where('numeros', $bilheteSearch)
                    ->exists();

                if ($search) {
                    throw new Exception("Esta combinação já foi registrada neste concurso");
                }
            }

            $premiacaoBilhete = $premiacoes->first(fn($prem) => $prem->qtd_dezenas == $dezenas);
            if (!$premiacaoBilhete) {
                throw new Exception('A modalidade informada não está disponível para esta quantidade de dezenas.');
            }

            $distinctSignaturesCache = $cache['distinctSignaturesCache'] ?? [];
            $consultantLimitsCache = $cache['consultantLimitsCache'] ?? [];

            $combinationValidation = $this->validateAndApplyCombinationLimit(
                $userId,
                $sorteio,
                $modalidade,
                $premiacaoBilhete,
                $numbers,
                $cartGamesSorted,
                $distinctSignaturesCache,
                $consultantLimitsCache
            );

            // Sync back to referenced cache parameter
            $cache['distinctSignaturesCache'] = $distinctSignaturesCache;

            if ($combinationValidation !== true) {
                throw new Exception($combinationValidation);
            }

            $minValBilhete = $premiacaoBilhete->min_val_aposta ?: $modalidade->val_min_bilhete;
            if ($minValBilhete > 0 && $valAposta < $minValBilhete) {
                throw new Exception('O valor do bilhete deve ser de no mínimo R$ ' . number_format($minValBilhete, 2, ',', '.'));
            }

            $maxValBilhete = $premiacaoBilhete->max_val_aposta ?: $modalidade->val_max_bilhete;
            if ($maxValBilhete > 0 && $valAposta > $maxValBilhete) {
                throw new Exception('O valor do bilhete deve ser de no máximo R$ ' . number_format($maxValBilhete, 2, ',', '.'));
            }

            return true;
        } catch (\Throwable $e) {
            return $e->getMessage();
        }
    }

    private function validateGames(array $games, $allSorteios)
    {
        $uniqueBilhetes = [];

        foreach ($games as $index => $game) {
            $sorteio = $allSorteios->get($game['idConcurso']);

            if (!$sorteio) {
                return ['valid' => false, 'message' => "Concurso não encontrado"];
            }

            $modalidadeMaxNumbers = $sorteio->modalidade->max_numbers;
            $numbersStartFrom = $sorteio->modalidade->numbers_start_from;
            $bloq_bilhetes_duplicados = $sorteio->modalidade->bloq_blihetes_duplicados;

            if (!isset($game['numbers']) || !is_array($game['numbers']) || !isset($game['dezenas'])) {
                return ['valid' => false, 'message' => "Estrutura de bilhete inválida"];
            }

            $numbers = array_map('trim', $game['numbers']);
            if (count($numbers) !== (int) $game['dezenas']) {
                return ['valid' => false, 'message' => "Quantidade de dezenas não confere"];
            }

            foreach ($numbers as $n) {
                if (!ctype_digit((string)$n)) {
                    return ['valid' => false, 'message' => "Existem caracteres inválidos no bilhete"];
                }
            }

            $numbersInt = array_map(fn($n) => (int) $n, $numbers);
            $duplicates = array_unique(array_diff_assoc($numbersInt, array_unique($numbersInt)));
            if (!empty($duplicates)) {
                return ['valid' => false, 'message' => "Existem números repetidos no bilhete"];
            }

            foreach ($numbersInt as $n) {
                if ($n < $numbersStartFrom || $n > $modalidadeMaxNumbers) {
                    return ['valid' => false, 'message' => "Números devem estar entre {$numbersStartFrom} e {$modalidadeMaxNumbers}"];
                }
            }

            sort($numbersInt);
            $signature = implode('-', $numbersInt);

            if ($bloq_bilhetes_duplicados && isset($uniqueBilhetes[$signature])) {
                return ['valid' => false, 'message' => "Existe um bilhete duplicado com a mesma numeração no pedido"];
            }

            $uniqueBilhetes[$signature] = true;
        }

        return ['valid' => true];
    }

    private function validateAndApplyCombinationLimit(
        int $userId, $sorteio, $modalidade, $premiacaoBilhete,
        array $numbers, array $cartGamesSorted = [],
        array &$distinctSignaturesCache = [], array $consultantLimitsCache = []
    ) {
        $qtdDezenas = $premiacaoBilhete->qtd_dezenas;
        $limiteCombinacoes = $premiacaoBilhete->limite_combinacoes;

        $cacheKey = "{$modalidade->id}_{$qtdDezenas}";
        if ($consultantLimitsCache && isset($consultantLimitsCache[$cacheKey])) {
            $consultantLimit = $consultantLimitsCache[$cacheKey];
            if (!is_null($consultantLimit->limite_combinacoes)) {
                $limiteCombinacoes = $consultantLimit->limite_combinacoes;
            }
        }

        if (!is_null($limiteCombinacoes) && $limiteCombinacoes !== '') {
            $n_start = $modalidade->numbers_start_from ?? 1;
            $n_max = $modalidade->max_numbers;
            $n = $n_max - $n_start + 1;
            $r = $qtdDezenas;

            if ($r < 0 || $r > $n) {
                $total_possibilities = 0;
            } else {
                if ($r == 0 || $r == $n) {
                    $total_possibilities = 1;
                } else {
                    if ($r > $n / 2) $r = $n - $r;
                    $total_possibilities = 1;
                    for ($i = 1; $i <= $r; $i++) {
                        $total_possibilities = $total_possibilities * ($n - $i + 1) / $i;
                    }
                    $total_possibilities = floor($total_possibilities);
                }
            }

            $max_enabled = floor($total_possibilities * ($limiteCombinacoes / 100));

            $sigCacheKey = "count_{$sorteio->id}_{$qtdDezenas}";
            if (!isset($distinctSignaturesCache[$sigCacheKey])) {
                $distinctSignaturesCache[$sigCacheKey] = SorteiosApostas::where('sorteio_id', $sorteio->id)
                    ->where('qtd_dezenas', $qtdDezenas)
                    ->distinct('numeros')
                    ->count('numeros');
            }

            $db_distinct_count = $distinctSignaturesCache[$sigCacheKey];

            $cart_new_distinct = 0;
            $uniqueCartGames = array_unique($cartGamesSorted);
            foreach ($uniqueCartGames as $cart_sig) {
                $exists = SorteiosApostas::where('sorteio_id', $sorteio->id)
                    ->where('qtd_dezenas', $qtdDezenas)
                    ->where('numeros', $cart_sig)
                    ->exists();

                if (!$exists) {
                    $cart_new_distinct++;
                }
            }

            $total_currently_active = $db_distinct_count + $cart_new_distinct;

            if ($total_currently_active >= $max_enabled) {
                sort($numbers);
                $signature = implode(',', $numbers);

                $isNewInDb = !SorteiosApostas::where('sorteio_id', $sorteio->id)
                    ->where('qtd_dezenas', $qtdDezenas)
                    ->where('numeros', $signature)
                    ->exists();

                $isNewInCart = !in_array($signature, $cartGamesSorted);

                if ($isNewInDb && $isNewInCart) {
                    return "Esta combinação já excedeu o limite máximo configurado no concurso.";
                }
            }
        }

        return true;
    }
}
