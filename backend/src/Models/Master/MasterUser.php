<?php

namespace App\Models\Master;

use Illuminate\Database\Eloquent\Model;

class MasterUser extends Model
{
    protected $connection = 'master';
    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
}
