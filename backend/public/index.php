<?php

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

// Check vendor directory exists
$vendorPath = dirname(__DIR__) . '/vendor/autoload.php';
if (!file_exists($vendorPath)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server setup incomplete: dependencies not installed. Run composer install.',
        'hint' => 'Upload vendor/ directory or run composer install on the server',
    ]);
    exit;
}

require_once $vendorPath;

use App\Core\App;

new App();
