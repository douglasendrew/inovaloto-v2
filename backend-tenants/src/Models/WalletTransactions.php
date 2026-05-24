<?php

namespace App\Models;

class WalletTransactions extends BaseTenantModel
{
    protected $fillable = [
        'wallet_id',
        'aposta_id',
        'admin_id',
        'transacao_titulo',
        'transacao_valor',
        'created_at',
        'saldo_anterior',
        'saldo_atual',
        'carteira_desabilitada',
        'vendedor_comissao_parametros'
    ];

    public function aposta() {
        return $this->belongsTo(SorteiosApostas::class, 'aposta_id', 'id');
    }

    public function wallet() {
        return $this->belongsTo(Wallet::class, 'wallet_id', 'id');
    }
}
