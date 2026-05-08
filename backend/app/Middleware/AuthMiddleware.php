<?php

namespace App\Middleware;

use App\Helpers\JWT;
use App\Core\Response;

class AuthMiddleware
{
    public function handle()
    {
        // Try multiple sources for Authorization header (Apache/CGI compatibility)
        $authHeader = null;

        // Method 1: getallheaders() - works on Apache with mod_php
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        }

        // Method 2: $_SERVER HTTP_AUTHORIZATION - works on nginx and some Apache configs
        if (!$authHeader) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        }

        // Method 3: REDIRECT_HTTP_AUTHORIZATION - works on Apache with CGI/FastCGI
        if (!$authHeader) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        }

        // Method 4: PHP_SELF + apache_request_headers fallback
        if (!$authHeader && function_exists('apache_request_headers')) {
            $apacheHeaders = apache_request_headers();
            $authHeader = $apacheHeaders['Authorization'] ?? $apacheHeaders['authorization'] ?? null;
        }

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
