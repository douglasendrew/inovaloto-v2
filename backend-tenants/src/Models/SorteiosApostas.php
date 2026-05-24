<?php

namespace App\Models;

class SorteiosApostas extends BaseTenantModel
{
    protected $table = 'sorteios_apostas';

    protected $fillable = [
        'uuid',
        'sorteio_id',
        'user_id',
        'added_user_id',
        'deletion_user_id',
        'vendedor_id',
        'wallet_id',
        'numeros',
        'qtd_dezenas',
        'val_apostado',
        'ganho_maximo',
        'is_surpresinha',
        'is_importe',
        'vendedor_comissao_venda',
        'deleted_at',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new \App\Models\Scopes\IgnorePendingDeletion);
    }

    public function sorteio() {
        return $this->belongsTo(Sorteios::class, 'sorteio_id', 'id');
    }

    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function vendedor() {
        return $this->belongsTo(User::class, 'vendedor_id', 'id');
    }

    public function deletionUser() {
        return $this->belongsTo(User::class, 'deletion_user_id', 'id');
    }

    public function wallet() {
        return $this->belongsTo(Wallet::class, 'wallet_id', 'id');
    }

    public function ganhadores() {
        return $this->hasMany(SorteiosGanhadores::class, 'bilhete_id', 'id');
    }
}
