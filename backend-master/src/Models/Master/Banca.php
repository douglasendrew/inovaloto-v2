<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class Banca extends Model
{
    protected $connection = 'master';
    protected $table = 'bancas';

    protected $fillable = [
        'uuid',
        'nome',
        'db_name',
        'login_path',
        'login_code',
        'logo',
        'status',
        'config',
        'gateway_id',
    ];

    protected $casts = [
        'config' => 'json',
    ];

    public function gateway()
    {
        return $this->belongsTo(Gateway::class, 'gateway_id');
    }
}
