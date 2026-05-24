<?php

namespace App\Models;

class SorteiosGanhadores extends BaseTenantModel
{
    public $fillable = [
        'sorteio_id',
        'resultado_id',
        'bilhete_id',
        'val_premiacao',
        'qtd_acertos',
    ];

    public function sorteio() {
        return $this->belongsTo(Sorteios::class, 'sorteio_id', 'id');
    }

    public function resultado() {
        return $this->belongsTo(SorteiosResultados::class, 'resultado_id', 'id');
    }

    public function bilhete() {
        return $this->belongsTo(SorteiosApostas::class, 'bilhete_id', 'id');
    }
}
