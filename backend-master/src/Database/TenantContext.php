<?php

namespace App\Database;

use Swoole\Coroutine;

class TenantContext
{
    public static function setConnectionName(string $name): void
    {
        $cid = Coroutine::getCid();
        if ($cid > 0) {
            Coroutine::getContext($cid)['tenant_connection'] = $name;
        } else {
            $_SERVER['tenant_connection'] = $name;
        }
    }

    public static function getConnectionName(): ?string
    {
        $cid = Coroutine::getCid();
        if ($cid > 0) {
            return Coroutine::getContext($cid)['tenant_connection'] ?? null;
        }
        return $_SERVER['tenant_connection'] ?? null;
    }

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
