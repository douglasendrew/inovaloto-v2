<?php

namespace App\Models;

class SorteiosResultados extends BaseTenantModel
{
    public $fillable = [
        'sorteio_id',
        'num_sorteio',
        'resultado',
    ];

    public function sorteio() {
        return $this->belongsTo(Sorteios::class, 'sorteio_id', 'id');
    }

    public function ganhadores() {
        return $this->hasMany(SorteiosGanhadores::class, 'resultado_id', 'id');
    }
}
