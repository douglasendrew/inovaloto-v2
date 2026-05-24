<?php

namespace App\Models;

class Wallet extends BaseTenantModel
{
    public $table = 'wallet';

    protected $fillable = [
        'saldo',
        'status',
        'banca_id',
        'user_id',
        'uuid',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
