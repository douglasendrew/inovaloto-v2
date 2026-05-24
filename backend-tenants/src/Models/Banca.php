<?php

namespace App\Models;

class Banca extends BaseTenantModel
{
    protected $table = 'bancas';

    protected $fillable = [
        'uuid',
        'nome',
        'status',
        'descarrego_ativo',
        'descarrego_emails',
        'horario_limite_apostas',
        'horario_limite_exclusao_apostas',
        'val_max_bilhete',
        'qtd_max_bilhete',
        'qtd_max_bilhete_duplicados',
        'qtd_max_bilhete_duplicados_dezenas',
        'bloq_bilhetes_duplicados',
        'perm_surpresinha_ilimitado',
        'perm_surpresinha_duplicada_ilimitado',
        'valid_qtd_max_bilhete_admin',
        'valid_val_max_bilhete_admin',
        'valid_bloq_bilhete_duplicado_admin',
        'valid_horario_limite_aposta_admin',
        'valid_horario_inicio_vendas_admin',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new \App\Models\Scopes\IgnoreBancaInactive);
    }
}
