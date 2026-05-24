<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Database\TenantContext;

abstract class BaseTenantModel extends Model
{
    public function getConnectionName()
    {
        return TenantContext::getConnectionName() ?? 'tenant';
    }
}
