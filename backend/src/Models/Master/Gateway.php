<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class Gateway extends Model
{
    protected $connection = 'master';
    protected $table = 'gateways';

    protected $fillable = [
        'gateway_name',
        'gateway_status',
        'gateway_url',
    ];

    /**
     * Relationship with Bancas.
     */
    public function bancas()
    {
        return $this->hasMany(Banca::class, 'gateway_id');
    }
}
