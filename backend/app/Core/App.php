<?php

namespace App\Core;

class App
{
    private Router $router;
    private Request $request;

    public function __construct()
    {
        Config::load();
        $this->setCorsHeaders();
        $this->handleRequest();
    }

    private function setCorsHeaders()
    {
        $allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'https://anns.com.gracelandroyalacademy.com.ng',
            'http://anns.com.gracelandroyalacademy.com.ng',
        ];

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Allow the requesting origin if it matches the server's own host (same-origin SPA)
        $serverHost = $_SERVER['HTTP_HOST'] ?? '';
        if ($origin && $serverHost) {
            $originHost = parse_url($origin, PHP_URL_HOST);
            $originPort = parse_url($origin, PHP_URL_PORT);
            $expectedOrigin = 'https://' . $serverHost;
            $expectedOriginHttp = 'http://' . $serverHost;
            if ($origin === $expectedOrigin || $origin === $expectedOriginHttp) {
                $allowedOrigins[] = $origin;
            }
        }

        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: {$origin}");
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        // Security headers
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    }

    private function handleRequest()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        $this->request = new Request();
        $this->router = require dirname(__DIR__, 2) . '/routes/api.php';

        $this->router->dispatch(
            $this->request->getMethod(),
            $this->request->getUri()
        );
    }
}
