<?php

namespace App\Core;

class App
{
    private $router;
    private $request;

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

        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: {$origin}");
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }

    private function handleRequest()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        $this->request = new Request();
        $this->router = new Router();

        require dirname(__DIR__, 2) . '/routes/api.php';

        $this->router->dispatch(
            $this->request->getMethod(),
            $this->request->getUri()
        );
    }
}
