<?php

namespace App\Core;

class Request
{
    private string $method;
    private string $uri;
    private array $body;
    private array $query;
    private array $files;
    private array $headers;
    private array $server;

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $this->uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        // Strip the /api prefix (deployment rewrites /api/* to api/public/index.php)
        // This ensures /api/auth/login becomes /auth/login for route matching
        if (str_starts_with($this->uri, '/api/')) {
            $this->uri = substr($this->uri, 4); // remove '/api' prefix, keep leading slash
        } elseif ($this->uri === '/api') {
            $this->uri = '/';
        }

        // Strip /public/index.php if present in URI (happens on some server configs)
        $this->uri = str_replace('/public/index.php', '', $this->uri);

        if ($this->uri !== '/' && str_ends_with($this->uri, '/')) {
            $this->uri = rtrim($this->uri, '/');
        }

        $this->query = $_GET;
        $this->files = $_FILES;
        $this->server = $_SERVER;
        $this->headers = $this->getAllHeaders();
        $this->body = $this->parseBody();
    }

    private function getAllHeaders()
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $header = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
                $headers[$header] = $value;
            }
        }
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $headers['Content-Type'] = $_SERVER['CONTENT_TYPE'];
        }
        if (isset($_SERVER['CONTENT_LENGTH'])) {
            $headers['Content-Length'] = $_SERVER['CONTENT_LENGTH'];
        }
        return $headers;
    }

    private function parseBody()
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            return is_array($data) ? $data : [];
        }

        if (str_contains($contentType, 'multipart/form-data')) {
            return $_POST;
        }

        return $_POST;
    }

    public function getMethod()
    {
        return $this->method;
    }

    public function getUri()
    {
        return $this->uri;
    }

    public function getBody()
    {
        return $this->body;
    }

    public function input(string $key, $default = null)
    {
        return $this->body[$key] ?? $default;
    }

    public function query(string $key, $default = null)
    {
        return $this->query[$key] ?? $default;
    }

    public function file(string $key)
    {
        return $this->files[$key] ?? null;
    }

    public function files(): array
    {
        return $this->files;
    }

    public function header(string $key, $default = null)
    {
        return $this->headers[$key] ?? $default;
    }

    public function getAuthorizationHeader(): ?string
    {
        $authHeader = $this->header('Authorization');
        if (!$authHeader) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        }
        return $authHeader;
    }

    public function getBearerToken(): ?string
    {
        $header = $this->getAuthorizationHeader();
        if ($header && preg_match('/Bearer\s(\S+)/', $header, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public function ip()
    {
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    public function userAgent()
    {
        return $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    }
}
