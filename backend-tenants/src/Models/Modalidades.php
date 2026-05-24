<?php

namespace App\Models;

class Modalidades extends BaseTenantModel
{
    protected $fillable = [
        'uuid',
        'id_banca',
        'nome',
        'icone',
        'sort_numbers',
        'qtd_sorteios',
        'max_numbers',
        'val_max_bilhete',
        'val_min_bilhete',
        'max_bilhete_cliente',
        'qtd_bilhete_duplicados_sorteio',
        'qtd_bilhete_duplicados_dezenas',
        'bloq_blihetes_duplicados',
        'exib_tbl_premicoes',
        'perm_surpresinhas_ilimitado',
        'perm_surpresinhas_duplicado_ilimitado',
        'numbers_start_from',
        'max_val_premiacoes',
        'cor',
    ];

    public function premiacoes() {
        return $this->hasMany(ModalidadesPremiacoes::class, 'modalidade_id', 'id');
    }

    public function sorteios() {
        return $this->hasMany(Sorteios::class, 'modalidade_id', 'id');
    }
}
