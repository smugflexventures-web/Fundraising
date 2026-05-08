<?php

namespace App\Middleware;

use App\Core\Response;

class DonorMiddleware
{
    public function handle()
    {
        $user = $GLOBALS['auth_user'] ?? null;

        if (!$user) {
            return Response::unauthorized('Authentication required');
        }

        if (($user['role'] ?? '') !== 'donor') {
            return Response::forbidden('Donor access required');
        }

        return null;
    }
}
