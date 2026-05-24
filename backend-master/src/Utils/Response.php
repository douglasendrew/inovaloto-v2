<?php

namespace App\Utils;

use Swoole\Http\Response as SwooleResponse;

class Response
{
    public static function json(SwooleResponse $response, mixed $data, int $status = 200): void
    {
        $response->status($status);
        $response->header('Content-Type', 'application/json; charset=utf-8');
        $response->end(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }
}
