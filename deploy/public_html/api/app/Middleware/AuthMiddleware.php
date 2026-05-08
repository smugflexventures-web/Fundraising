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
            return Response::unauthorized('This access token is invalid or has expired');
        }

        $userId = $payload['user_id'] ?? $payload['sub'] ?? null;
        if ($userId) {
            $userModel = new \App\Models\User();
            $freshUser = $userModel->findById($userId);
            if (!$freshUser) {
                return Response::unauthorized('Account not found');
            }
            if (!$freshUser['is_active']) {
                return Response::forbidden('This account has been deactivated');
            }
            $payload['role'] = $freshUser['role'];
            $payload['is_active'] = $freshUser['is_active'];
            $payload['is_verified'] = $freshUser['is_verified'];
        }

        $GLOBALS['auth_user'] = $payload;
        return null;
    }
}
