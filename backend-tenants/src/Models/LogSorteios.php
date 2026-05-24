<?php

namespace App\Models;

class LogSorteios extends BaseTenantModel
{
    public $table = "logs_general";

    protected $fillable = [
        'user_id',
        'sorteio_id',
        'log_titulo',
        'log_detalhes',
        'ip',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function sorteio()
    {
        return $this->belongsTo(Sorteios::class, 'sorteio_id');
    }
}
