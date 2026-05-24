<?php

namespace App\Models;

class ModalidadesPremiacoes extends BaseTenantModel
{
    protected $fillable = [
        'uuid',
        'modalidade_id',
        'qtd_dezenas',
        'min_val_aposta',
        'max_val_aposta',
        'max_val_premiacoes',
        'premiacoes',
        'limite_combinacoes',
    ];

    public function modalidade() {
        return $this->belongsTo(Modalidades::class, 'modalidade_id', 'id');
    }
}
