<?php

namespace App\Models;

class LogsConcurso extends BaseTenantModel
{
    protected $table = 'logs_concurso';
    public $timestamps = false; // Using date_created instead

    protected $fillable = [
        'sorteio_id',
        'titulo',
        'detalhes',
        'date_created'
    ];

    protected $casts = [
        'detalhes' => 'array',
        'date_created' => 'datetime'
    ];

    public function sorteio()
    {
        return $this->belongsTo(Sorteios::class, 'sorteio_id');
    }
}
