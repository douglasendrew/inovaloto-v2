<?php

namespace App\Controllers;

use App\Models\Banca;
use App\Models\LogSorteios;
use App\Models\Sorteios;
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
use Illuminate\Support\Str;
use Illuminate\Database\Capsule\Manager as Capsule;

class ApostadoresController
{
    /**
     * GET /apostadores
     */
    public function index(Request $request, SwooleResponse $response): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        $query = User::where('banca_id', $bancaId)->where('role', 'gambler');

        if ($user->role !== 'admin') {
            $query->where('vendedor_id', $user->id);
        }

        $nameFilter = $request->get['name'] ?? null;
        if ($nameFilter) {
            $query->where('name', 'like', '%' . $nameFilter . '%');
        }

        $apostadores = $query->orderBy('name', 'asc')->get();

        Response::json($response, ['success' => true, 'apostadores' => $apostadores]);
    }

    /**
     * POST /apostadores/save
     */
    public function saveApostador(Request $request, SwooleResponse $response): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['nome_apostador']) || empty($input['telefone_apostador']) || empty($input['pix_apostador'])) {
            Response::json($response, ['error' => 'Campos obrigatórios ausentes.'], 422);
            return;
        }

        $username = Str::random(10);
        $email = trim($username) . '@' . strtolower(trim(str_replace(' ', '', $tenant->nome))) . '.com';

        try {
            $connName = TenantContext::getConnectionName();

            $newGambler = Capsule::connection($connName)->transaction(function () use ($bancaId, $user, $input, $username, $email) {
                $gambler = User::create([
                    'uuid' => Uuid::uuid4()->toString(),
                    'banca_id' => $bancaId,
                    'vendedor_id' => $user->id,
                    'name' => $input['nome_apostador'],
                    'nickname' => $input['apelido_apostador'] ?? null,
                    'phone' => $input['telefone_apostador'],
                    'pix' => $input['pix_apostador'],
                    'username' => $username,
                    'email' => $email,
                    'role' => 'gambler',
                    'status' => 'active',
                ]);

                Wallet::create([
                    'uuid' => Uuid::uuid4()->toString(),
                    'banca_id' => $bancaId,
                    'user_id' => $gambler->id,
                    'saldo' => 0,
                ]);

                return $gambler;
            ]);

            Response::json($response, ['success' => true, 'message' => 'Apostador cadastrado com sucesso!', 'apostador' => $newGambler]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * GET /apostadores/{apostador_uuid}
     */
    public function viewApostador(Request $request, SwooleResponse $response, string $apostador_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            $apostador = User::where('banca_id', $bancaId)
                ->where('role', 'gambler')
                ->where('uuid', $apostador_uuid)
                ->firstOrFail();

            $bilhetesApostador = SorteiosApostas::with(['user', 'sorteio.modalidade']);

            $dateRange = $request->get['dateRange'] ?? null;
            if ($dateRange) {
                $parts = explode(' até ', $dateRange);
                if (isset($parts[1])) {
                    $bilhetesApostador->whereDate('created_at', '>=', $parts[0])
                                      ->whereDate('created_at', '<=', $parts[1]);
                } else {
                    $bilhetesApostador->whereDate('created_at', '=', $parts[0]);
                }
            } else {
                $bilhetesApostador->whereDate('created_at', '=', Carbon::today());
            }

            $tipoBilhete = $request->get['tipoBilhete'] ?? null;
            if ($tipoBilhete === 'awarded') {
                $bilhetesApostador->where('status', 'awarded');
            }

            $bilhetes = $bilhetesApostador->where('user_id', $apostador->id)
                ->orderBy('created_at', 'desc')
                ->get();

            $sorteio = Sorteios::with('modalidade')
                ->where('banca_id', $bancaId)
                ->where('status', 'pending')
                ->where('data_sorteio', '>=', Carbon::now())
                ->orderBy('data_sorteio', 'asc')
                ->first();

            Response::json($response, [
                'success' => true,
                'apostador' => $apostador,
                'bilhetes' => $bilhetes,
                'proximo_sorteio' => $sorteio
            ]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Não foi possível buscar o apostador solicitado.'], 404);
        }
    }

    /**
     * POST /apostadores/{apostador_uuid}/edit/save
     */
    public function saveEditApostador(Request $request, SwooleResponse $response, string $apostador_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['nome_apostador']) || empty($input['telefone_apostador']) || empty($input['pix_apostador'])) {
            Response::json($response, ['error' => 'Campos obrigatórios ausentes.'], 422);
            return;
        }

        try {
            $apostador = User::where('uuid', $apostador_uuid)
                ->where('banca_id', $bancaId)
                ->where('role', 'gambler')
                ->firstOrFail();

            $apostador->update([
                'name' => $input['nome_apostador'],
                'nickname' => $input['apelido_apostador'] ?? null,
                'phone' => $input['telefone_apostador'],
                'pix' => $input['pix_apostador'],
            ]);

            Response::json($response, ['success' => true, 'message' => 'Dados do apostador atualizados com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /apostadores/{apostador_uuid}/disable
     */
    public function disableUser(Request $request, SwooleResponse $response, string $apostador_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $type = $request->post['type'] ?? 'disable';

        try {
            $targetUser = User::where('uuid', $apostador_uuid)
                ->where('banca_id', $bancaId)
                ->firstOrFail();

            if ($targetUser->is_permanent) {
                Response::json($response, ['error' => 'Este usuário é permanente e não pode ser alterado.'], 400);
                return;
            }

            if ($type === 'disable') {
                $targetUser->update(['status' => 'disabled']);

                LogSorteios::create([
                    'user_id' => $user->id,
                    'log_titulo' => 'Usuário Desativado',
                    'log_detalhes' => json_encode([
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'user_afetado' => [
                            'id' => $targetUser->id,
                            'name' => $targetUser->name,
                            'role' => $targetUser->role,
                        ]
                    ]),
                ]);
            } else {
                $targetUser->update(['status' => 'active']);

                LogSorteios::create([
                    'user_id' => $user->id,
                    'log_titulo' => 'Usuário Ativado',
                    'log_detalhes' => json_encode([
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'user_afetado' => [
                            'id' => $targetUser->id,
                            'name' => $targetUser->name,
                            'role' => $targetUser->role,
                        ]
                    ]),
                ]);
            }

            Response::json($response, ['success' => true, 'message' => 'Status do apostador alterado com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /apostadores/{apostador_uuid}/reset-password
     */
    public function resetPasswordUser(Request $request, SwooleResponse $response, string $apostador_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            $targetUser = User::where('uuid', $apostador_uuid)
                ->where('banca_id', $bancaId)
                ->firstOrFail();

            if ($targetUser->is_permanent) {
                Response::json($response, ['error' => 'Este usuário é permanente e sua senha não pode ser resetada.'], 400);
                return;
            }

            $targetUser->update(['password' => null]);

            Response::json($response, ['success' => true, 'message' => 'Senha do usuário resetada com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /apostadores/clone
     */
    public function cloneAposta(Request $request, SwooleResponse $response): void
    {
        $authUser = TenantAuthMiddleware::handle($request, $response);
        if (!$authUser) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $input = $request->post ?? [];

        if (empty($input['bilhetes'])) {
            Response::json($response, ['error' => 'Nenhum bilhete informado para clonar.'], 422);
            return;
        }

        $bilhetes = is_string($input['bilhetes']) ? json_decode($input['bilhetes'], true) : $input['bilhetes'];

        if (empty($bilhetes)) {
            Response::json($response, ['error' => 'Nenhum bilhete válido para clonar.'], 422);
            return;
        }

        try {
            $connName = TenantContext::getConnectionName();

            Capsule::connection($connName)->transaction(function () use ($bilhetes, $bancaId, $authUser) {
                $allApostas = SorteiosApostas::with(['sorteio', 'user'])
                    ->whereIn('uuid', $bilhetes)
                    ->whereHas('sorteio', function ($query) use ($bancaId) {
                        $query->where('banca_id', $bancaId);
                    })
                    ->get();

                $valTotal = $allApostas->sum('val_apostado');

                foreach ($bilhetes as $bilhete_uuid) {
                    $apostaCloneQuery = SorteiosApostas::with(['sorteio', 'user'])
                        ->where('uuid', $bilhete_uuid)
                        ->whereHas('sorteio', function ($query) use ($bancaId) {
                            $query->where('banca_id', $bancaId);
                        })
                        ->firstOrFail();

                    if ($apostaCloneQuery->sorteio->status === 'completed') {
                        $sorteioModalidade = Sorteios::where('modalidade_id', $apostaCloneQuery->sorteio->modalidade_id)
                            ->where('status', 'pending')
                            ->where('banca_id', $bancaId)
                            ->first();

                        if (!$sorteioModalidade) {
                            throw new Exception("Operação cancelada: Concurso para bilhete ID #" . str_pad($apostaCloneQuery->id, 8, "0", STR_PAD_LEFT) . " não está disponível no momento");
                        }

                        $sorteioUuid = $sorteioModalidade->uuid;
                        $sorteioId = $sorteioModalidade->id;
                    } else {
                        $sorteioUuid = $apostaCloneQuery->sorteio->uuid;
                        $sorteioId = $apostaCloneQuery->sorteio->id;
                    }

                    $concursoController = new ConcursosController();
                    $preValidation = $concursoController->realizePreValidationBilhete(
                        userId: $apostaCloneQuery->user_id,
                        concurso_uuid: $sorteioUuid,
                        totalGames: count($bilhetes),
                        valTotal: $valTotal,
                    );

                    if ($preValidation !== true) {
                        throw new Exception($preValidation);
                    }

                    $individualValidation = $concursoController->realizeIndidualValidationBilhete(
                        userId: $apostaCloneQuery->user_id,
                        concurso_uuid: $sorteioUuid,
                        isSurpresinha: $apostaCloneQuery->is_surpresinha,
                        isImporte: $apostaCloneQuery->is_importe,
                        numbers: explode(',', $apostaCloneQuery->numeros),
                        valAposta: $apostaCloneQuery->val_apostado,
                    );

                    if ($individualValidation !== true) {
                        throw new Exception($individualValidation);
                    }

                    $wallet = Wallet::firstOrCreate(
                        ['user_id' => $apostaCloneQuery->user_id, 'banca_id' => $bancaId],
                        ['uuid' => Uuid::uuid4()->toString(), 'saldo' => 0]
                    );

                    $bilhete = SorteiosApostas::create([
                        'uuid'         => Uuid::uuid4()->toString(),
                        'sorteio_id'   => $sorteioId,
                        'user_id'      => $apostaCloneQuery->user_id,
                        'vendedor_id'  => $apostaCloneQuery->user->vendedor_id,
                        'added_user_id' => $authUser->id,
                        'numeros'      => $apostaCloneQuery->numeros,
                        'qtd_dezenas'  => $apostaCloneQuery->qtd_dezenas,
                        'val_apostado' => $apostaCloneQuery->val_apostado,
                        'ganho_maximo' => $apostaCloneQuery->ganho_maximo,
                        'is_surpresinha' => $apostaCloneQuery->is_surpresinha,
                        'is_importe' => $apostaCloneQuery->is_importe,
                        'wallet_id' => $wallet->id,
                    ]);

                    if ($wallet->status === 'active') {
                        $oldBalance = $wallet->saldo;
                        $balance = $oldBalance - $apostaCloneQuery->val_apostado;
                        $wallet->update(['saldo' => $balance]);
                    } else {
                        $oldBalance = 0;
                        $balance = 0;
                    }

                    WalletTransactions::create([
                        'wallet_id' => $wallet->id,
                        'aposta_id' => $bilhete->id,
                        'transacao_titulo' => 'Compra de bilhete',
                        'transacao_valor' => -abs($apostaCloneQuery->val_apostado),
                        'saldo_anterior' => $oldBalance,
                        'saldo_atual' => $balance,
                        'carteira_desabilitada' => $wallet->status === 'active' ? 0 : 1,
                    ]);

                    LogSorteios::create([
                        "user_id" => $authUser->id,
                        "sorteio_id" => $sorteioId,
                        "log_titulo" => "Bilhete clonado",
                        "log_detalhes" => json_encode([
                            "ApostaClonada" => $apostaCloneQuery->toArray(),
                            "idBilhete" => $bilhete->id,
                            "numerosApostados" => $apostaCloneQuery->numeros,
                            "dezenasApostadas" => $apostaCloneQuery->qtd_dezenas,
                            "valorApostado" => $apostaCloneQuery->val_apostado,
                        ]),
                    ]);

                    if ($apostaCloneQuery->user->vendedor_id) {
                        $vendedor = User::with('wallet')
                            ->where('id', $apostaCloneQuery->user->vendedor_id)
                            ->where('role', 'seller')
                            ->first();

                        if ($vendedor) {
                            if ($vendedor->comissao_tipo === 'value_percent') {
                                $comissionValue = (float) (($apostaCloneQuery->val_apostado / 100) * $vendedor->comissao);
                            } else {
                                $comissionValue = (float) ($vendedor->comissao);
                            }

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

                            $bilhete->update([
                                'vendedor_comissao_venda' => $comissionValue,
                            ]);
                        }
                    }
                }
            });

            Response::json($response, ['success' => true, 'message' => 'Aposta clonada com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }
}
