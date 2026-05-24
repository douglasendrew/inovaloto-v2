<?php

namespace App\Controllers;

use App\Models\Banca;
use App\Models\LogSorteios;
use App\Models\Modalidades;
use App\Models\Sorteios;
use App\Models\SorteiosApostas;
use App\Models\SorteiosGanhadores;
use App\Models\SorteiosAgenda;
use App\Models\SorteiosResultados;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransactions;
use App\Database\TenantContext;
use App\Middleware\TenantAuthMiddleware;
use App\Utils\Response;
use Carbon\Carbon;
use DateTime;
use Exception;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;
use Ramsey\Uuid\Uuid;
use Illuminate\Database\Capsule\Manager as Capsule;

class SorteiosController
{
    /**
     * GET /sorteios
     */
    public function index(Request $request, SwooleResponse $response): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        $sorteios = Sorteios::with('modalidade')->where('banca_id', $bancaId);

        $filterPeriod = $request->get['filterPeriod'] ?? null;
        $filterDate = $request->get['filterDate'] ?? null;
        $filterStatus = $request->get['filterStatus'] ?? null;

        if ($filterPeriod) {
            if ($filterPeriod === "today") {
                $sorteios->whereDate('data_sorteio', Carbon::today());
            }
            if ($filterPeriod === "tomorrow") {
                $sorteios->whereDate('data_sorteio', Carbon::tomorrow());
            }
            if ($filterPeriod === "custom" && $filterDate) {
                $sorteios->whereDate('data_sorteio', $filterDate);
            }
        }

        if ($filterStatus) {
            if ($filterStatus === "pending") {
                $sorteios->where('status', 'pending');
            }
            if ($filterStatus === "completed") {
                $sorteios->where('status', 'completed');
            }
        } else {
            if (!$filterPeriod) {
                $sorteios->where('status', 'pending');
            }
        }

        $result = $sorteios->orderBy('data_sorteio')->get();

        Response::json($response, ['success' => true, 'sorteios' => $result]);
    }

    /**
     * POST /sorteios/save
     */
    public function saveSorteio(Request $request, SwooleResponse $response): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        if ($user->role !== 'admin') {
            Response::json($response, ['error' => 'Acesso proibido.'], 403);
            return;
        }

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        $input = $request->post ?? [];

        // Manual validation replacement
        if (empty($input['modalidade']) || empty($input['concurso']) || empty($input['data_sorteio'])) {
            Response::json($response, ['error' => 'Campos obrigatórios ausentes: modalidade, concurso, data_sorteio.'], 422);
            return;
        }

        try {
            $existsModalidadeConcurso = Sorteios::where('modalidade_id', $input['modalidade'])
                ->where('concurso', $input['concurso'])
                ->first();

            if ($existsModalidadeConcurso) {
                Response::json($response, ['error' => 'Já existe um sorteio com este concurso para esta modalidade.'], 400);
                return;
            }

            $sorteio = Sorteios::create([
                "uuid" => Uuid::uuid4()->toString(),
                "banca_id" => $bancaId,
                "modalidade_id" => $input['modalidade'],
                "concurso" => $input['concurso'],
                "inicio_venda_imediato" => !empty($input['inicio_venda_imediato']) ? 1 : 0,
                "data_sorteio" => $input['data_sorteio'],
                "data_limite_apostas" => $input['data_limite_aposta'] ?? null,
                "data_limite_exclusao_apostas" => $input['data_limite_excluir_aposta'] ?? null,
                "inicio_vendas" => $input['data_inicio_venda'] ?? null,
            ]);

            Response::json($response, ['success' => true, 'message' => 'Sorteio criado com sucesso!', 'sorteio' => $sorteio]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Ocorreu um erro ao criar este sorteio: ' . $e->getMessage()], 500);
        }
    }

    /**
     * GET /sorteios/{sorteio_uuid}
     */
    public function editSorteio(Request $request, SwooleResponse $response, string $sorteio_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $search = $request->get['search_user'] ?? null;

        try {
            $sorteio = Sorteios::with(['modalidade', 'resultados', 'apostas' => function ($query) use ($search) {
                $query->where('status', 'awarded');
                if ($search) {
                    $query->whereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
                }
                $query->with('user');
            }])
            ->where('uuid', $sorteio_uuid)
            ->firstOrFail();

            Response::json($response, ['success' => true, 'sorteio' => $sorteio]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Sorteio não encontrado.'], 404);
        }
    }

    /**
     * POST /sorteios/{sorteio_uuid}/edit/save
     */
    public function saveEditSorteio(Request $request, SwooleResponse $response, string $sorteio_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        if ($user->role !== 'admin') {
            Response::json($response, ['error' => 'Acesso proibido.'], 403);
            return;
        }

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['modalidade']) || empty($input['concurso']) || empty($input['data_sorteio'])) {
            Response::json($response, ['error' => 'Campos obrigatórios ausentes.'], 422);
            return;
        }

        try {
            $sorteioQuery = Sorteios::where('uuid', $sorteio_uuid)->where('banca_id', $bancaId);
            $currentSorteio = $sorteioQuery->first();

            if (!$currentSorteio) {
                Response::json($response, ['error' => 'O sorteio informado não existe.'], 404);
                return;
            }

            $existsSorteio = Sorteios::where('modalidade_id', $input['modalidade'])
                ->where('concurso', $input['concurso'])
                ->where('uuid', '!=', $sorteio_uuid)
                ->first();

            if ($existsSorteio) {
                Response::json($response, ['error' => 'Já existe um sorteio com este concurso para esta modalidade.'], 400);
                return;
            }

            $oldData = $currentSorteio->toArray();

            $currentSorteio->update([
                "modalidade_id" => $input['modalidade'],
                "concurso" => $input['concurso'],
                "inicio_venda_imediato" => !empty($input['inicio_venda_imediato']) ? 1 : 0,
                "data_sorteio" => $input['data_sorteio'],
                "data_limite_apostas" => $input['data_limite_aposta'] ?? null,
                "data_limite_exclusao_apostas" => $input['data_limite_excluir_aposta'] ?? null,
                "inicio_vendas" => $input['data_inicio_venda'] ?? null,
            ]);

            LogSorteios::create([
                "user_id" => $user->id,
                "sorteio_id" => $currentSorteio->id,
                "log_titulo" => "Sorteio alterado",
                "log_detalhes" => json_encode([
                    "dados_antigos" => $oldData,
                    "dados_novos" => $input,
                ]),
                "ip" => $request->header['x-real-ip'] ?? $request->server['remote_addr'] ?? null
            ]);

            Response::json($response, ['success' => true, 'message' => 'Sorteio atualizado com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Erro ao salvar alterações: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /sorteios/{sorteio_uuid}/conferir
     */
    public function conferirResultado(Request $request, SwooleResponse $response, string $sorteio_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        if ($user->role !== 'admin') {
            Response::json($response, ['error' => 'Acesso proibido.'], 403);
            return;
        }

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['resultado']) || !is_array($input['resultado'])) {
            Response::json($response, ['error' => 'Lista de resultados inválida ou ausente.'], 422);
            return;
        }

        try {
            $connName = TenantContext::getConnectionName();

            Capsule::connection($connName)->transaction(function () use ($sorteio_uuid, $bancaId, $input, $user, $request) {
                $sorteioCheck = Sorteios::where('banca_id', $bancaId)
                    ->where('uuid', $sorteio_uuid)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($sorteioCheck->status === 'completed') {
                    throw new Exception('Este sorteio já foi conferido anteriormente.');
                }

                $listaResultados = $input['resultado'];

                foreach ($listaResultados as $i => $numeros) {
                    $numSorteio = $i + 1;

                    $resultado = preg_split('/[\s,]+/', trim($numeros));
                    sort($resultado);

                    $duplicates = array_unique(array_diff_assoc($resultado, array_unique($resultado)));
                    if (!empty($duplicates)) {
                        $duplicatesStr = implode(', ', array_map(fn($n) => str_pad($n, 2, '0', STR_PAD_LEFT), $duplicates));
                        throw new Exception("O sorteio #$numSorteio possui dezenas repetidas: $duplicatesStr");
                    }

                    $currentSorteio = Sorteios::with(['modalidade', 'premiacoes'])
                        ->where('banca_id', $bancaId)
                        ->where('uuid', $sorteio_uuid)
                        ->first();

                    if (!$currentSorteio) {
                        throw new Exception('O sorteio informado não existe');
                    }

                    $isDifferenteSortNumbers = $currentSorteio->modalidade->sort_numbers != count($resultado);
                    if ($isDifferenteSortNumbers) {
                        throw new Exception("O sorteio #$numSorteio precisa ter {$currentSorteio->modalidade->sort_numbers} dezenas sorteadas");
                    }

                    foreach ($resultado as $num) {
                        if ($num < $currentSorteio->modalidade->numbers_start_from) {
                            throw new Exception("A dezena mínima para esta modalidade é {$currentSorteio->modalidade->numbers_start_from}");
                        }
                        if ($num > $currentSorteio->modalidade->max_numbers) {
                            throw new Exception("A dezena máxima para esta modalidade é {$currentSorteio->modalidade->max_numbers}");
                        }
                    }

                    $sorteioResultado = SorteiosResultados::create([
                        'sorteio_id' => $currentSorteio->id,
                        'num_sorteio' => $numSorteio,
                        'resultado' => implode(',', $resultado)
                    ]);

                    Sorteios::where('uuid', $sorteio_uuid)
                        ->where('banca_id', $bancaId)
                        ->update([
                            'status' => 'completed',
                        ]);

                    LogSorteios::create([
                        "user_id" => $user->id,
                        "sorteio_id" => $currentSorteio->id,
                        "log_titulo" => "Conferência realizada - Sorteio #$numSorteio",
                        "log_detalhes" => json_encode([
                            "resultado" => implode(',', $resultado),
                            "tabela_premiacao" => $currentSorteio->premiacoes
                        ]),
                        "ip" => $request->header['x-real-ip'] ?? $request->server['remote_addr'] ?? null
                    ]);

                    $apostas = SorteiosApostas::where('sorteio_id', $currentSorteio->id)->get();
                    $resultadoArray = array_map('intval', $resultado);

                    foreach ($apostas as $aposta) {
                        $premiacao = $currentSorteio->premiacoes->where('qtd_dezenas', $aposta->qtd_dezenas)->first();
                        if (!$premiacao) continue;

                        $premiacoesList = json_decode($premiacao->premiacoes, true) ?: [];

                        $apostaArray = array_map('intval', explode(',', $aposta->numeros));
                        $acertos = array_intersect($resultadoArray, $apostaArray);
                        $qtdAcertos = count($acertos);

                        $resultadoPremiacao = array_filter($premiacoesList, function ($item) use ($qtdAcertos) {
                            return (int) $item['acertos'] === $qtdAcertos;
                        });

                        $premioItem = array_values($resultadoPremiacao)[0] ?? null;

                        $usarApostador = User::with('wallet')
                            ->where('id', $aposta->user_id)
                            ->where('banca_id', $bancaId)
                            ->first();

                        if ($premioItem && $usarApostador) {
                            $valPremiacao = floatval($premioItem['premio']) * $aposta->val_apostado;

                            if ($valPremiacao > $aposta->ganho_maximo) {
                                $valPremiacao = $aposta->ganho_maximo;
                            }

                            // Update balance on wallet directly
                            $wallet = $usarApostador->wallet;
                            $oldBalance = $wallet->saldo;
                            $newBalance = $oldBalance + $valPremiacao;

                            $wallet->update(['saldo' => $newBalance]);

                            WalletTransactions::create([
                                'wallet_id' => $wallet->id,
                                'aposta_id' => $aposta->id,
                                'transacao_titulo' => "Premiação - Sorteio #" . $numSorteio,
                                'transacao_valor' => $valPremiacao,
                                'saldo_anterior' => $oldBalance,
                                'saldo_atual' => $newBalance,
                                'carteira_desabilitada' => $wallet->status === 'active' ? 0 : 1,
                            ]);

                            if ($usarApostador->vendedor_id) {
                                $vendedor = User::with('wallet')
                                    ->where('id', $usarApostador->vendedor_id)
                                    ->where('role', 'seller')
                                    ->first();

                                if ($vendedor && $vendedor->comissao_bonus) {
                                    $comissionValue = (float) (($valPremiacao / 100) * $vendedor->comissao_bonus);

                                    $vendedorWallet = $vendedor->wallet;
                                    $oldVendedorBalance = $vendedorWallet->saldo;
                                    $newVendedorBalance = $oldVendedorBalance + $comissionValue;

                                    $vendedorWallet->update(['saldo' => $newVendedorBalance]);

                                    WalletTransactions::create([
                                        'wallet_id' => $vendedorWallet->id,
                                        'aposta_id' => $aposta->id,
                                        'transacao_titulo' => 'Comissão de premiação - Sorteio #' . $numSorteio,
                                        'transacao_valor' => $comissionValue,
                                        'saldo_anterior' => $oldVendedorBalance,
                                        'saldo_atual' => $newVendedorBalance,
                                        'carteira_desabilitada' => $vendedorWallet->status === 'active' ? 0 : 1,
                                        'vendedor_comissao_parametros' => json_encode([
                                            'comissao_bonus' => $vendedor->comissao_bonus,
                                            'comissao' => $vendedor->comissao,
                                            'comissao_tipo' => $vendedor->comissao_tipo,
                                        ]),
                                    ]);

                                    $aposta->update([
                                        'vendedor_comissao_bonus' => $comissionValue,
                                    ]);
                                }
                            }

                            $aposta->update([
                                'status' => 'awarded',
                                'qtd_acertos' => $qtdAcertos,
                                'val_premiacao' => $aposta->val_premiacao + $valPremiacao,
                            ]);

                            SorteiosGanhadores::create([
                                'sorteio_id' => $currentSorteio->id,
                                'resultado_id' => $sorteioResultado->id,
                                'bilhete_id' => $aposta->id,
                                'val_premiacao' => $valPremiacao,
                                'qtd_acertos' => $qtdAcertos,
                            ]);
                        } else {
                            if ($aposta->val_premiacao == 0) {
                                $aposta->update([
                                    'status' => 'not_awarded',
                                    'qtd_acertos' => $qtdAcertos,
                                    'val_premiacao' => 0,
                                ]);
                            }
                        }
                    }
                }

                // Schedule next draw automatically
                $scheduleConcurso = new ScheduleConcursoController();
                $scheduleConcurso->scheduleNextConcurse($currentSorteio->modalidade->id);
            });

            Response::json($response, ['success' => true, 'message' => 'Sorteio conferido com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /sorteios/{sorteio_uuid}/desfazer-conferencia
     */
    public function desfazerConferenciaResultado(Request $request, SwooleResponse $response, string $sorteio_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        if ($user->role !== 'admin') {
            Response::json($response, ['error' => 'Acesso proibido.'], 403);
            return;
        }

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            $sorteio = Sorteios::where('uuid', $sorteio_uuid)
                ->where('status', 'completed')
                ->where('banca_id', $bancaId)
                ->first();

            if (!$sorteio) {
                Response::json($response, ['error' => 'O sorteio informado não existe ou não está finalizado.'], 404);
                return;
            }

            $connName = TenantContext::getConnectionName();

            Capsule::connection($connName)->transaction(function () use ($sorteio, $user, $request) {
                $apostas = SorteiosApostas::where('sorteio_id', $sorteio->id)->get();

                $ganhadores = SorteiosGanhadores::where('sorteio_id', $sorteio->id);
                $resultados = SorteiosResultados::where('sorteio_id', $sorteio->id);

                foreach ($apostas as $aposta) {
                    if ($aposta->status === 'awarded') {
                        $userApostador = User::with('wallet')
                            ->where('id', $aposta->user_id)
                            ->first();

                        if ($userApostador) {
                            $valApostado = $aposta->val_premiacao;
                            $wallet = $userApostador->wallet;
                            $oldBalance = $wallet->saldo;
                            $newBalance = $oldBalance - $valApostado;

                            $wallet->update(['saldo' => $newBalance]);

                            WalletTransactions::create([
                                'wallet_id' => $wallet->id,
                                'aposta_id' => $aposta->id,
                                'transacao_titulo' => "Remoção de Premiação por Reversão de Conferência",
                                'transacao_valor' => -abs($valApostado),
                                'saldo_anterior' => $oldBalance,
                                'saldo_atual' => $newBalance,
                                'carteira_desabilitada' => $wallet->status === 'active' ? 0 : 1,
                            ]);

                            if ($userApostador->vendedor_id) {
                                $userVendedor = User::with('wallet')
                                    ->where('id', $userApostador->vendedor_id)
                                    ->first();

                                if ($userVendedor && $userVendedor->comissao_bonus) {
                                    $valBonusComissao = ($valApostado / 100) * $userVendedor->comissao_bonus;
                                    $vendedorWallet = $userVendedor->wallet;
                                    $oldVendedorBalance = $vendedorWallet->saldo;
                                    $newVendedorBalance = $oldVendedorBalance - $valBonusComissao;

                                    $vendedorWallet->update(['saldo' => $newVendedorBalance]);

                                    WalletTransactions::create([
                                        'wallet_id' => $vendedorWallet->id,
                                        'aposta_id' => $aposta->id,
                                        'transacao_titulo' => "Remoção de Comissão Bônus de Premiação por Reversão de Conferência",
                                        'transacao_valor' => -abs($valBonusComissao),
                                        'saldo_anterior' => $oldVendedorBalance,
                                        'saldo_atual' => $newVendedorBalance,
                                        'carteira_desabilitada' => $vendedorWallet->status === 'active' ? 0 : 1,
                                    ]);
                                }
                            }
                        }
                    }

                    $aposta->update([
                        'status' => 'not_validated',
                        'qtd_acertos' => null,
                        'val_premiacao' => null,
                        'vendedor_comissao_bonus' => 0,
                    ]);
                }

                LogSorteios::create([
                    "user_id" => $user->id,
                    "sorteio_id" => $sorteio->id,
                    "log_titulo" => "Conferência de sorteio excluída",
                    "log_detalhes" => json_encode([
                        "resultados" => $resultados->get()->toArray(),
                        "ganhadores" => $ganhadores->get()->toArray(),
                    ]),
                    "ip" => $request->header['x-real-ip'] ?? $request->server['remote_addr'] ?? null
                ]);

                $resultados->delete();
                $ganhadores->delete();

                $sorteio->update([
                    'resultado' => null,
                    'status' => 'pending',
                ]);
            });

            Response::json($response, ['success' => true, 'message' => 'Conferência desfeita com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Erro ao desfazer a conferência: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /sorteios/{sorteio_uuid}/delete
     */
    public function deleteSorteio(Request $request, SwooleResponse $response, string $sorteio_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        if ($user->role !== 'admin') {
            Response::json($response, ['error' => 'Acesso proibido.'], 403);
            return;
        }

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            $sorteio = Sorteios::where('uuid', $sorteio_uuid)
                ->where('banca_id', $bancaId)
                ->first();

            if (!$sorteio) {
                Response::json($response, ['error' => 'O sorteio informado não existe.'], 404);
                return;
            }

            if ($sorteio->status === 'completed') {
                Response::json($response, ['error' => 'Não é possível deletar este sorteio, pois já foi finalizado.'], 400);
                return;
            }

            $apostas = SorteiosApostas::where('sorteio_id', $sorteio->id)->get();
            if ($apostas->count() > 0) {
                Response::json($response, ['error' => 'Não é possível deletar este sorteio, pois já possui apostas confirmadas.'], 400);
                return;
            }

            $apostasWithDeletions = SorteiosApostas::withoutGlobalScopes()->where('sorteio_id', $sorteio->id)->get();
            if ($apostasWithDeletions->count() > 0) {
                Response::json($response, ['error' => 'Não é possível deletar este sorteio, pois existem bilhetes pendentes nesta modalidade.'], 400);
                return;
            }

            LogSorteios::create([
                "user_id" => $user->id,
                "sorteio_id" => $sorteio->id,
                "log_titulo" => "Sorteio deletado",
                "log_detalhes" => json_encode([
                    "detalhes_sorteio" => $sorteio->toArray()
                ]),
                "ip" => $request->header['x-real-ip'] ?? $request->server['remote_addr'] ?? null
            ]);

            $sorteio->delete();

            Response::json($response, ['success' => true, 'message' => 'Sorteio deletado com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Erro ao deletar sorteio: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /sorteios/one-click/save
     */
    public function oneClickAddSorteioSave(Request $request, SwooleResponse $response): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        if ($user->role !== 'admin') {
            Response::json($response, ['error' => 'Acesso proibido.'], 403);
            return;
        }

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['modalidade_item']) || !is_array($input['modalidade_item']) || empty($input['data_sorteio'])) {
            Response::json($response, ['error' => 'Campos obrigatórios ausentes.'], 422);
            return;
        }

        try {
            $connName = TenantContext::getConnectionName();

            Capsule::connection($connName)->transaction(function () use ($input, $bancaId) {
                foreach ($input['modalidade_item'] as $modalidadeUuid) {
                    $modalidadeItem = Modalidades::where('id_banca', $bancaId)
                        ->where('uuid', $modalidadeUuid)
                        ->firstOrFail();

                    $lastSorteio = Sorteios::where('modalidade_id', $modalidadeItem->id)
                        ->orderBy('id', 'desc')
                        ->first();

                    $concurso = $lastSorteio ? $this->incrementConcurso($lastSorteio->concurso) : 1;

                    Sorteios::create([
                        "uuid" => Uuid::uuid4()->toString(),
                        "banca_id" => $bancaId,
                        "modalidade_id" => $modalidadeItem->id,
                        "concurso" => $concurso,
                        "inicio_venda_imediato" => !empty($input['inicio_venda_imediato']) ? 1 : 0,
                        "data_sorteio" => $input['data_sorteio'],
                        "data_limite_apostas" => $input['data_limite_aposta'] ?? null,
                        "data_limite_exclusao_apostas" => $input['data_limite_excluir_aposta'] ?? null,
                        "inicio_vendas" => $input['data_inicio_venda'] ?? null,
                    ]);
                }
            });

            Response::json($response, ['success' => true, 'message' => 'Sorteio(s) gerado(s) com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Erro ao gerar sorteios: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /sorteios/{sorteio_uuid}/delete/bilhete
     */
    public function deleteBilheteSorteio(Request $request, SwooleResponse $response, string $sorteio_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['bilhetes'])) {
            Response::json($response, ['error' => 'Nenhum bilhete informado.'], 422);
            return;
        }

        $bilhetes = is_array($input['bilhetes']) ? $input['bilhetes'] : json_decode($input['bilhetes'], true);
        if (empty($bilhetes)) {
            Response::json($response, ['error' => 'Formato de bilhetes inválido.'], 422);
            return;
        }

        try {
            $sorteio = Sorteios::where('uuid', $sorteio_uuid)
                ->where('banca_id', $bancaId)
                ->first();

            if (!$sorteio) {
                Response::json($response, ['error' => 'O sorteio informado não existe.'], 404);
                return;
            }

            if ($sorteio->status === 'completed' && $user->role !== 'admin') {
                Response::json($response, ['error' => 'Não é possível deletar este bilhete, pois o sorteio já foi finalizado.'], 400);
                return;
            }

            $connName = TenantContext::getConnectionName();

            Capsule::connection($connName)->transaction(function () use ($bilhetes, $sorteio, $user, $request) {
                foreach ($bilhetes as $bilheteUuid) {
                    $aposta = SorteiosApostas::where('uuid', $bilheteUuid)
                        ->where('sorteio_id', $sorteio->id)
                        ->first();

                    if (!$aposta) {
                        throw new Exception("Bilhete $bilheteUuid não encontrado.");
                    }

                    $wallet = Wallet::where('user_id', $aposta->user_id)->first();
                    if ($wallet) {
                        $oldBalance = $wallet->saldo;
                        $newBalance = $oldBalance + $aposta->val_apostado;

                        $wallet->update([
                            'saldo' => $newBalance,
                        ]);

                        WalletTransactions::create([
                            'wallet_id' => $wallet->id,
                            'aposta_id' => $aposta->id,
                            'transacao_titulo' => 'Estorno de Bilhete - Exclusão Direta',
                            'transacao_valor' => $aposta->val_apostado,
                            'saldo_anterior' => $oldBalance,
                            'saldo_atual' => $newBalance,
                            'carteira_desabilitada' => $wallet->status === 'active' ? 0 : 1,
                        ]);
                    }

                    $aposta->delete();

                    LogSorteios::create([
                        "user_id" => $user->id,
                        "sorteio_id" => $sorteio->id,
                        "log_titulo" => "Bilhete deletado",
                        "log_detalhes" => json_encode([
                            "bilhete" => $aposta->toArray()
                        ]),
                        "ip" => $request->header['x-real-ip'] ?? $request->server['remote_addr'] ?? null
                    ]);
                }
            });

            Response::json($response, ['success' => true, 'message' => 'Bilhete(s) deletado(s) com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Erro ao deletar bilhete: ' . $e->getMessage()], 400);
        }
    }

    /**
     * GET /sorteios/get-modality-data/{modalidade_id}
     */
    public function getModalityData(Request $request, SwooleResponse $response, string $modalidade_id): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            $banca = Banca::where('id', $bancaId)->first();
            $modalidade = Modalidades::where('id_banca', $bancaId)
                ->where(function ($query) use ($modalidade_id) {
                    if (is_numeric($modalidade_id)) {
                        $query->where('id', (int)$modalidade_id);
                    } else {
                        $query->where('uuid', $modalidade_id);
                    }
                })
                ->firstOrFail();

            $modalidade_id = $modalidade->id;

            $lastSorteio = Sorteios::where('modalidade_id', $modalidade_id)
                ->orderBy('id', 'desc')
                ->first();

            $nextConcurso = $lastSorteio ? $this->incrementConcurso($lastSorteio->concurso) : 1;

            $agenda = SorteiosAgenda::where('modalidade_id', $modalidade_id)->first();
            $nextDate = null;

            if ($agenda && $agenda->dias_agendados) {
                $horarios = json_decode($agenda->dias_agendados);
                $nextDate = $this->calculateNextAvailableDate($modalidade_id, $horarios);
            }

            $horarioLimiteAposta = null;
            $horarioLimiteExclusao = null;

            if ($nextDate) {
                $dateOnly = date('Y-m-d', strtotime($nextDate));
                $drawTime = strtotime($nextDate);

                if ($banca->horario_limite_apostas) {
                    $horarioLimiteAposta = $dateOnly . ' ' . $banca->horario_limite_apostas;
                    if (strtotime($horarioLimiteAposta) > $drawTime) {
                        $horarioLimiteAposta = $nextDate;
                    }
                }
                if ($banca->horario_limite_exclusao_apostas) {
                    $horarioLimiteExclusao = $dateOnly . ' ' . $banca->horario_limite_exclusao_apostas;
                    if (strtotime($horarioLimiteExclusao) > $drawTime) {
                        $horarioLimiteExclusao = $nextDate;
                    }
                }
            }

            Response::json($response, [
                'success' => true,
                'concurso' => $nextConcurso,
                'data_sorteio' => $nextDate ? date('Y-m-d H:i', strtotime($nextDate)) : null,
                'data_limite_aposta' => $horarioLimiteAposta ? date('Y-m-d H:i', strtotime($horarioLimiteAposta)) : null,
                'data_limite_excluir_aposta' => $horarioLimiteExclusao ? date('Y-m-d H:i', strtotime($horarioLimiteExclusao)) : null,
            ]);
        } catch (\Throwable $e) {
            Response::json($response, ['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    private function calculateNextAvailableDate($modalidade_id, $horarios)
    {
        $mapDias = [
            'SEG' => 1,
            'TER' => 2,
            'QUA' => 3,
            'QUI' => 4,
            'SEX' => 5,
            'SAB' => 6,
            'DOM' => 7,
        ];

        $agora = Carbon::now();
        $availableDates = [];

        foreach ($horarios as $item) {
            if (!isset($item->active) || !$item->active) continue;

            $diaSemana = $mapDias[$item->dia] ?? null;
            if (!$diaSemana) continue;

            [$hora, $minuto] = explode(':', $item->hora);

            $data = $agora->copy()->startOfWeek()->addDays($diaSemana - 1)->setHour((int)$hora)->setMinute((int)$minuto)->setSecond(0);

            if ($data->lte($agora)) {
                $data->addWeek();
            }

            $safety = 0;
            while ($safety < 52) { 
                $exists = Sorteios::where('modalidade_id', $modalidade_id)
                    ->where('data_sorteio', $data->format('Y-m-d H:i:s'))
                    ->exists();

                if (!$exists) {
                    $availableDates[] = $data->copy();
                    break;
                }

                $data->addWeek();
                $safety++;
            }
        }

        if (empty($availableDates)) return null;

        usort($availableDates, function ($a, $b) {
            return $a->gt($b) ? 1 : -1;
        });

        return $availableDates[0]->format('Y-m-d H:i:s');
    }

    private function incrementConcurso($concurso)
    {
        if (preg_match('/^(.*?)(\d+)([^\d]*)$/', $concurso, $matches)) {
            $prefix = $matches[1];
            $numberStr = $matches[2];
            $suffix = $matches[3];

            $newNumber = str_pad(intval($numberStr) + 1, strlen($numberStr), '0', STR_PAD_LEFT);
            return $prefix . $newNumber . $suffix;
        }

        return $concurso . '1';
    }
}
