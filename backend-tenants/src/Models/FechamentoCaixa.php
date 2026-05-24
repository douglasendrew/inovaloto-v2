<?php

namespace App\Models;

class FechamentoCaixa extends BaseTenantModel
{
    public $table = 'fechamento_caixa';

    protected $fillable = [
        'uuid',
        'user_id',
        'val_vendas',
        'val_comissoes',
        'val_premiacoes',
        'saldo_fechamento',
        'valor',
        'saldo_anterior',
        'saldo_atual',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
