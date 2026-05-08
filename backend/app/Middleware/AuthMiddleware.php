<?php

namespace App\Middleware;

use App\Helpers\JWT;
use App\Core\Response;

class AuthMiddleware
{
    public function handle()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return Response::unauthorized('Access token is missing');
        }

        $token = $matches[1];
        $payload = JWT::verify($token);

        if (!$payload) {
            return Response::unauthorized('Invalid or expired token');
        }

        $GLOBALS['auth_user'] = $payload;
        return null;
    }
}
