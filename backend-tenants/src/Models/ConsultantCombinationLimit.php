<?php

namespace App\Models;

class ConsultantCombinationLimit extends BaseTenantModel
{
    protected $table = 'consultant_combination_limits';

    protected $fillable = [
        'user_id',
        'modalidade_id',
        'banca_id',
        'qtd_dezenas',
        'limite_combinacoes'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function modalidade()
    {
        return $this->belongsTo(Modalidades::class, 'modalidade_id');
    }
}
