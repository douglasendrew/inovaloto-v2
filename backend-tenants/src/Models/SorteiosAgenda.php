<?php

namespace App\Models;

class SorteiosAgenda extends BaseTenantModel
{
    public $table = 'sorteios_agenda';

    public $fillable = [
        'modalidade_id',
        'dias_agendados',
        'dias_excecoes',
    ];
}
