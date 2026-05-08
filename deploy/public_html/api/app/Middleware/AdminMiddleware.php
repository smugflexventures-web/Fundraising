<?php

namespace App\Middleware;

use App\Core\Response;

class AdminMiddleware
{
    public function handle()
    {
        $user = $GLOBALS['auth_user'] ?? null;

        if (!$user) {
            return Response::unauthorized('Authentication is required');
        }

        if (($user['role'] ?? '') !== 'admin') {
            return Response::forbidden('Administrator access is required');
        }

        if (isset($user['is_active']) && !$user['is_active']) {
            return Response::forbidden('This account has been deactivated');
        }

        return null;
    }
}
