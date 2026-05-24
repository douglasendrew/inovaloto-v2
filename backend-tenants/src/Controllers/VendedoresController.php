<?php

namespace App\Controllers;

use App\Models\Banca;
use App\Models\LogSorteios;
use App\Models\SorteiosApostas;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransactions;
use App\Models\ConsultantCombinationLimit;
use App\Models\Modalidades;
use App\Models\ModalidadesPremiacoes;
use App\Database\TenantContext;
use App\Middleware\TenantAuthMiddleware;
use App\Utils\Response;
use Carbon\Carbon;
use Exception;
use Swoole\Http\Request;
use Swoole\Http\Response as SwooleResponse;
use Ramsey\Uuid\Uuid;
use Illuminate\Database\Capsule\Manager as Capsule;

class VendedoresController
{
    /**
     * GET /vendedores
     */
    public function index(Request $request, SwooleResponse $response): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        $query = User::where('banca_id', $bancaId)->where('role', 'seller');

        if ($user->role !== 'admin') {
            $query->where('vendedor_id', $user->id);
        }

        $nameFilter = $request->get['name'] ?? null;
        if ($nameFilter) {
            $query->where('name', 'like', '%' . $nameFilter . '%');
        }

        $sellers = $query->orderBy('name', 'asc')->get();

        Response::json($response, ['success' => true, 'vendedores' => $sellers]);
    }

    /**
     * GET /vendedores/solicitacoes
     */
    public function pendingConsultants(Request $request, SwooleResponse $response): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        if ($user->role !== 'admin') {
            Response::json($response, ['error' => 'Acesso proibido.'], 403);
            return;
        }

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        $pending = User::where('banca_id', $bancaId)
            ->where('role', 'seller')
            ->where('status', 'pending_aprovation')
            ->orderBy('created_at', 'desc')
            ->get();

        Response::json($response, ['success' => true, 'solicitacoes' => $pending]);
    }

    /**
     * POST /vendedores/save
     */
    public function saveVendedor(Request $request, SwooleResponse $response): void
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

        if (empty($input['nome_vendedor']) || empty($input['telefone_vendedor']) || empty($input['pix_vendedor']) || empty($input['username'])) {
            Response::json($response, ['error' => 'Campos obrigatórios ausentes.'], 422);
            return;
        }

        $comissaoVendedor = $input['comissao_vendedor'] ?? 0;
        $comissaoBonusVendedor = $input['comissao_bonus_vendedor'] ?? 0;

        if (($input['tipo_comissao_vendedor'] ?? '') === 'value_percent') {
            $comissaoVendedor = (float) str_replace(['%', ',', ' '], ['', '.', ''], $comissaoVendedor);
            if ($comissaoVendedor > 100) {
                Response::json($response, ['error' => 'A comissão do vendedor deve ser menor ou igual a 100%'], 400);
                return;
            }
        } elseif (($input['tipo_comissao_vendedor'] ?? '') === 'value_fix') {
            $comissaoVendedor = (float) str_replace([',', ' '], ['.', ''], $comissaoVendedor);
        }

        $comissaoBonusVendedor = (float) str_replace(['%', ',', ' '], ['', '.', ''], $comissaoBonusVendedor);
        if ($comissaoBonusVendedor > 100) {
            Response::json($response, ['error' => 'A comissão bônus do vendedor deve ser menor ou igual a 100%'], 400);
            return;
        }

        $email = trim($input['username']) . '@' . strtolower(trim(str_replace(' ', '', $tenant->nome))) . '.com';
        $username = $tenant->login_code . '-' . trim($input['username']);

        try {
            $connName = TenantContext::getConnectionName();

            $newSeller = Capsule::connection($connName)->transaction(function () use ($bancaId, $input, $username, $email, $comissaoBonusVendedor, $comissaoVendedor) {
                $verifyUsername = User::where('banca_id', $bancaId)
                    ->where('username', $username)
                    ->first();

                if ($verifyUsername) {
                    throw new Exception('O usuário informado já foi cadastrado.');
                }

                $seller = User::create([
                    'uuid' => Uuid::uuid4()->toString(),
                    'banca_id' => $bancaId,
                    'name' => $input['nome_vendedor'],
                    'nickname' => $input['apelido_vendedor'] ?? null,
                    'phone' => $input['telefone_vendedor'],
                    'pix' => $input['pix_vendedor'],
                    'username' => $username,
                    'email' => $email,
                    'comissao_bonus' => $comissaoBonusVendedor,
                    'comissao' => $comissaoVendedor,
                    'comissao_tipo' => $input['tipo_comissao_vendedor'] ?? null,
                    'role' => 'seller',
                    'status' => 'active',
                ]);

                Wallet::create([
                    'uuid' => Uuid::uuid4()->toString(),
                    'banca_id' => $bancaId,
                    'user_id' => $seller->id,
                    'saldo' => 0,
                ]);

                return $seller;
            });

            Response::json($response, ['success' => true, 'message' => 'Vendedor cadastrado com sucesso!', 'vendedor' => $newSeller]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * GET /vendedores/{vendedor_uuid}
     */
    public function viewVendedor(Request $request, SwooleResponse $response, string $vendedor_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            $vendedor = User::where('banca_id', $bancaId)
                ->where('role', 'seller')
                ->where('uuid', $vendedor_uuid)
                ->firstOrFail();

            $bilhetesVendedor = SorteiosApostas::with(['user', 'sorteio.modalidade']);

            $dateRange = $request->get['dateRange'] ?? null;
            if ($dateRange) {
                $parts = explode(' até ', $dateRange);
                $bilhetesVendedor->whereHas('sorteio', function ($query) use ($parts) {
                    if (isset($parts[1])) {
                        $query->whereDate('data_sorteio', '>=', $parts[0])
                              ->whereDate('data_sorteio', '<=', $parts[1]);
                    } else {
                        $query->whereDate('data_sorteio', '=', $parts[0]);
                    }
                });
            } else {
                $bilhetesVendedor->whereHas('sorteio', function ($query) {
                    $query->whereDate('data_sorteio', '=', Carbon::today());
                });
            }

            $tipoBilhete = $request->get['tipoBilhete'] ?? null;
            if ($tipoBilhete === 'awarded') {
                $bilhetesVendedor->where('status', 'awarded');
            }

            $criadoPor = $request->get['criadoPor'] ?? null;
            if ($criadoPor === 'seller') {
                $bilhetesVendedor->where(function ($q) use ($vendedor) {
                    $q->where('added_user_id', $vendedor->id)
                      ->where('vendedor_id', $vendedor->id);
                });
            } elseif ($criadoPor === 'gambler') {
                $bilhetesVendedor->where('vendedor_id', $vendedor->id);
            } else {
                $bilhetesVendedor->where(function ($q) use ($vendedor) {
                    $q->where('added_user_id', $vendedor->id)
                      ->orWhere('vendedor_id', $vendedor->id);
                });
            }

            $bilhetes = $bilhetesVendedor->orderBy('created_at', 'desc')->get();

            Response::json($response, [
                'success' => true,
                'vendedor' => $vendedor,
                'bilhetes' => $bilhetes
            ]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => 'Não foi possível buscar o vendedor solicitado.'], 404);
        }
    }

    /**
     * POST /vendedores/{vendedor_uuid}/edit/save
     */
    public function saveEditVendedor(Request $request, SwooleResponse $response, string $vendedor_uuid): void
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

        if (empty($input['nome_vendedor']) || empty($input['telefone_vendedor']) || empty($input['pix_vendedor'])) {
            Response::json($response, ['error' => 'Campos obrigatórios ausentes.'], 422);
            return;
        }

        try {
            $vendedorInfos = User::where('uuid', $vendedor_uuid)
                ->where('banca_id', $bancaId)
                ->where('role', 'seller')
                ->firstOrFail();

            $comissaoVendedor = $input['comissao_vendedor'] ?? 0;
            $comissaoBonusVendedor = $input['comissao_bonus_vendedor'] ?? 0;

            if (($input['tipo_comissao_vendedor'] ?? '') === 'value_percent') {
                $comissaoVendedor = (float) str_replace(['%', ',', ' '], ['', '.', ''], $comissaoVendedor);
                if ($comissaoVendedor > 100) {
                    Response::json($response, ['error' => 'A comissão do vendedor deve ser menor ou igual a 100%'], 400);
                    return;
                }
            } elseif (($input['tipo_comissao_vendedor'] ?? '') === 'value_fix') {
                $comissaoVendedor = (float) str_replace([',', ' '], ['.', ''], $comissaoVendedor);
            }

            $comissaoBonusVendedor = (float) str_replace(['%', ',', ' '], ['', '.', ''], $comissaoBonusVendedor);
            if ($comissaoBonusVendedor > 100) {
                Response::json($response, ['error' => 'A comissão bônus do vendedor deve ser menor ou igual a 100%'], 400);
                return;
            }

            $vendedorInfos->update([
                'name' => $input['nome_vendedor'],
                'nickname' => $input['apelido_vendedor'] ?? null,
                'phone' => $input['telefone_vendedor'],
                'pix' => $input['pix_vendedor'],
                'comissao_bonus' => $comissaoBonusVendedor,
                'comissao' => $comissaoVendedor,
                'comissao_tipo' => $input['tipo_comissao_vendedor'] ?? null,
            ]);

            LogSorteios::create([
                "user_id" => $user->id,
                "log_titulo" => "Alteração de usuário",
                "log_detalhes" => json_encode([
                    "admin_id" => $user->id,
                    "admin_name" => $user->name,
                    "dadosAntigos" => $vendedorInfos->toArray(),
                    "dadosAlterados" => $input
                ])
            ]);

            Response::json($response, ['success' => true, 'message' => 'Dados do vendedor atualizados com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /vendedores/{vendedor_uuid}/disable
     */
    public function disableUser(Request $request, SwooleResponse $response, string $vendedor_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        if ($user->role !== 'admin') {
            Response::json($response, ['error' => 'Acesso proibido.'], 403);
            return;
        }

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;
        $type = $request->post['type'] ?? 'disable';

        try {
            $targetUser = User::where('uuid', $vendedor_uuid)
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
                        'admin_id' => $user->id,
                        'admin_name' => $user->name,
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
                        'admin_id' => $user->id,
                        'admin_name' => $user->name,
                        'user_afetado' => [
                            'id' => $targetUser->id,
                            'name' => $targetUser->name,
                            'role' => $targetUser->role,
                        ]
                    ]),
                ]);
            }

            Response::json($response, ['success' => true, 'message' => 'Status do usuário alterado com sucesso!']);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /vendedores/{vendedor_uuid}/reset-password
     */
    public function resetPasswordUser(Request $request, SwooleResponse $response, string $vendedor_uuid): void
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
            $targetUser = User::where('uuid', $vendedor_uuid)
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
     * GET /vendedores/{vendedor_uuid}/limites
     */
    public function listModalitiesLimits(Request $request, SwooleResponse $response, string $vendedor_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            $vendedor = User::where('uuid', $vendedor_uuid)->where('banca_id', $bancaId)->firstOrFail();
            $modalidades = Modalidades::where('id_banca', $bancaId)->orderBy('nome')->get();

            Response::json($response, [
                'success' => true,
                'vendedor' => $vendedor,
                'modalidades' => $modalidades
            ]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 404);
        }
    }

    /**
     * GET /vendedores/{vendedor_uuid}/limites/modalidade/{modalidade_uuid}
     */
    public function listDozensLimits(Request $request, SwooleResponse $response, string $vendedor_uuid, string $modalidade_uuid): void
    {
        $user = TenantAuthMiddleware::handle($request, $response);
        if (!$user) return;

        $tenant = TenantContext::getResolvedTenant();
        $bancaId = $tenant->id;

        try {
            $vendedor = User::where('uuid', $vendedor_uuid)->where('banca_id', $bancaId)->firstOrFail();
            $modalidade = Modalidades::where('uuid', $modalidade_uuid)->where('id_banca', $bancaId)->firstOrFail();

            $premiacoes = ModalidadesPremiacoes::where('modalidade_id', $modalidade->id)
                ->orderBy('qtd_dezenas', 'asc')
                ->get();

            $existingLimits = ConsultantCombinationLimit::where('user_id', $vendedor->id)
                ->where('modalidade_id', $modalidade->id)
                ->get();

            Response::json($response, [
                'success' => true,
                'vendedor' => $vendedor,
                'modalidade' => $modalidade,
                'premiacoes' => $premiacoes,
                'existingLimits' => $existingLimits
            ]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 404);
        }
    }

    /**
     * POST /vendedores/limites/save
     */
    public function saveConsultantLimit(Request $request, SwooleResponse $response): void
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

        if (empty($input['user_id']) || empty($input['modalidade_id']) || empty($input['qtd_dezenas'])) {
            Response::json($response, ['error' => 'Campos obrigatórios ausentes.'], 422);
            return;
        }

        try {
            $limit = ConsultantCombinationLimit::updateOrCreate(
                [
                    'user_id' => $input['user_id'],
                    'modalidade_id' => $input['modalidade_id'],
                    'qtd_dezenas' => $input['qtd_dezenas'],
                    'banca_id' => $bancaId,
                ],
                [
                    'limite_combinacoes' => $input['limite_combinacoes'] ?? null
                ]
            );

            Response::json($response, ['success' => true, 'message' => 'Limite atualizado com sucesso!', 'limit' => $limit]);
        } catch (\Throwable $e) {
            Response::json($response, ['error' => $e->getMessage()], 400);
        }
    }
}
