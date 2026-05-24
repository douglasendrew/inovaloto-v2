<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class ExclusiveLoginAttempt extends Model
{
    protected $connection = 'master';
    protected $table = 'exclusive_login_attempts';

    public $timestamps = false;

    protected $fillable = [
        'ip',
        'email',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
