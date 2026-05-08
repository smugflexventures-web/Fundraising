<?php

/**
 * CampusFund API Entry Point
 * All /api/* requests are routed here by FallbackResource
 * The original request URI is used for route matching
 */

// Set JSON content type early
header('Content-Type: application/json; charset=utf-8');

// Error handling - log to file, return JSON to client
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

set_exception_handler(function ($e) {
    error_log($e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    $debug = getenv('APP_DEBUG') === 'true';
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error' => $debug ? $e->getMessage() : null,
        'file' => $debug ? basename($e->getFile()) . ':' . $e->getLine() : null,
    ]);
    exit;
});

// Fallback PSR-4 autoloader for App\ namespace (works without composer vendor)
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/app/';

    if (str_starts_with($class, $prefix)) {
        $relativeClass = substr($class, strlen($prefix));
        $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

// Load Composer autoloader for external packages (firebase/php-jwt, phpmailer)
$vendorPath = __DIR__ . '/vendor/autoload.php';
if (file_exists($vendorPath)) {
    require_once $vendorPath;
}

use App\Core\App;

new App();
