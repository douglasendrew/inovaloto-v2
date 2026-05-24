<?php

namespace App\Models;

class Sorteios extends BaseTenantModel
{
    protected $fillable = [
        'uuid',
        'banca_id',
        'modalidade_id',
        'concurso',
        'data_sorteio',
        'data_limite_apostas',
        'data_limite_exclusao_apostas',
        'inicio_venda_imediato',
        'inicio_vendas',
        'is_auto_criado',
        'descarrego_enviado',
    ];

    public function modalidade() {
        return $this->belongsTo(Modalidades::class, 'modalidade_id', 'id');
    }

    public function premiacoes() {
        return $this->hasMany(ModalidadesPremiacoes::class, 'modalidade_id', 'modalidade_id');
    }

    public function apostas() {
        return $this->hasMany(SorteiosApostas::class, 'sorteio_id', 'id');
    }

    public function resultados() {
        return $this->hasMany(SorteiosResultados::class, 'sorteio_id', 'id');
    }

    public function ganhadores() {
        return $this->hasMany(SorteiosGanhadores::class, 'sorteio_id', 'id');
    }
}
