<?php

namespace App\Models;

class LogLogin extends BaseTenantModel
{
    protected $table = 'log_login';

    protected $fillable = [
        'user_id',
        'ip',
        'device',
        'login_success',
        'login_unsuccessfull_reason'
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
