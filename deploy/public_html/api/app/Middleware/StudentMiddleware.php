<?php

namespace App\Middleware;

use App\Core\Response;

class StudentMiddleware
{
    public function handle()
    {
        $user = $GLOBALS['auth_user'] ?? null;

        if (!$user) {
            return Response::unauthorized('Authentication required');
        }

        if (($user['role'] ?? '') !== 'student') {
            return Response::forbidden('Student access required');
        }

        return null;
    }
}
