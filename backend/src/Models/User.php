<?php

namespace App\Models;

class User extends BaseTenantModel
{
    protected $table = 'users';

    protected $fillable = [
        'uuid',
        'banca_id',
        'vendedor_id',
        'username',
        'status',
        'name',
        'phone',
        'pix',
        'email',
        'role',
        'password',
        'comissao',
        'comissao_tipo',
        'comissao_bonus',
        'nickname',
        'is_permanent',
        'permissions',
        'two_factor_enabled',
        'two_factor_secret',
        'security_pin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'permissions' => 'array',
    ];

    public function vendedor() {
        return $this->belongsTo(User::class, 'vendedor_id', 'id');
    }
}
