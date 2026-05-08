<?php

namespace App\Middleware;

use App\Core\Response;

class AdminMiddleware
{
    public function handle()
    {
        $user = $GLOBALS['auth_user'] ?? null;

        if (!$user) {
            return Response::unauthorized('Authentication required');
        }

        if (($user['role'] ?? '') !== 'admin') {
            return Response::forbidden('Admin access required');
        }

        return null;
    }
}
