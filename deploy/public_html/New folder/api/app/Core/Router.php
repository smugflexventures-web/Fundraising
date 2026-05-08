<?php

namespace App\Core;

class Router
{
    private $routes = [];
    private $middleware = [];

    public function addRoute($method, $path, $handler, $middleware = [])
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler,
            'middleware' => $middleware,
        ];
    }

    public function get($path, $handler, $middleware = [])
    {
        $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post($path, $handler, $middleware = [])
    {
        $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put($path, $handler, $middleware = [])
    {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function delete($path, $handler, $middleware = [])
    {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    public function group($middleware, $callback)
    {
        $this->middleware[] = $middleware;
        $callback($this);
        array_pop($this->middleware);
    }

    public function dispatch($method, $uri)
    {
        $method = strtoupper($method);

        foreach ($this->routes as $route) {
            $pattern = $this->convertToRegex($route['path']);

            if ($route['method'] === $method && preg_match($pattern, $uri, $matches)) {
                $params = $this->extractParams($matches);

                $allMiddleware = array_merge($this->middleware, $route['middleware']);

                foreach ($allMiddleware as $mw) {
                    $result = $this->runMiddleware($mw);
                    if ($result !== null) {
                        return $result;
                    }
                }

                return $this->callHandler($route['handler'], $params);
            }
        }

        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Route not found',
        ]);
    }

    private function convertToRegex($path)
    {
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    private function extractParams($matches)
    {
        $params = [];
        foreach ($matches as $key => $value) {
            if (is_string($key)) {
                $params[$key] = $value;
            }
        }
        return $params;
    }

    private function runMiddleware($middleware)
    {
        if (is_string($middleware)) {
            $class = "App\\Middleware\\{$middleware}";
            if (class_exists($class)) {
                $instance = new $class();
                return $instance->handle();
            }
        } elseif (is_callable($middleware)) {
            return $middleware();
        }
        return null;
    }

    private function callHandler($handler, $params)
    {
        if (is_string($handler) && str_contains($handler, '@')) {
            [$controller, $method] = explode('@', $handler);
            $class = "App\\Controllers\\{$controller}";
            $instance = new $class();
            return $instance->$method($params);
        } elseif (is_callable($handler)) {
            return $handler($params);
        }

        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid handler',
        ]);
    }
}
