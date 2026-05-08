<?php

namespace App\Middleware;

class RateLimitMiddleware
{
    private static $requests = [];
    private $maxRequests = 60;
    private $windowSeconds = 60;

    public function handle()
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $now = time();

        if (!isset(self::$requests[$ip])) {
            self::$requests[$ip] = [];
        }

        self::$requests[$ip] = array_filter(self::$requests[$ip], function ($timestamp) use ($now) {
            return $timestamp > ($now - $this->windowSeconds);
        });

        if (count(self::$requests[$ip]) >= $this->maxRequests) {
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'message' => 'Too many requests. Please try again later.',
            ]);
            exit;
        }

        self::$requests[$ip][] = $now;
        return null;
    }
}
