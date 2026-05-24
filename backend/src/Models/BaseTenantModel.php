<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Database\TenantContext;

abstract class BaseTenantModel extends Model
{
    /**
     * Get the database connection name for the model dynamically.
     *
     * @return string
     */
    public function getConnectionName()
    {
        return TenantContext::getConnectionName() ?? 'tenant';
    }
}
