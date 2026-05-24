<?php

namespace App\Database;

use Swoole\Coroutine;

class TenantContext
{
    /**
     * Set the database connection name for the current coroutine or request.
     *
     * @param string $name
     */
    public static function setConnectionName(string $name): void
    {
        $cid = Coroutine::getCid();
        if ($cid > 0) {
            Coroutine::getContext($cid)['tenant_connection'] = $name;
        } else {
            $_SERVER['tenant_connection'] = $name;
        }
    }

    /**
     * Get the database connection name for the current coroutine or request.
     *
     * @return string|null
     */
    public static function getConnectionName(): ?string
    {
        $cid = Coroutine::getCid();
        if ($cid > 0) {
            return Coroutine::getContext($cid)['tenant_connection'] ?? null;
        }
        return $_SERVER['tenant_connection'] ?? null;
    }

    /**
     * Clear context (optional cleanup at request end).
     */
    public static function clear(): void
    {
        $cid = Coroutine::getCid();
        if ($cid > 0) {
            unset(Coroutine::getContext($cid)['tenant_connection']);
        } else {
            unset($_SERVER['tenant_connection']);
        }
    }
}
