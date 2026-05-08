<?php
/**
 * CampusFund API Setup & Diagnostics Page
 * Visit https://yourdomain.com/api/setup.php to check server requirements
 * DELETE THIS FILE after setup is complete!
 */

header('Content-Type: application/json; charset=utf-8');

$checks = [];
$allPass = true;

// 1. PHP Version
$phpVersion = phpversion();
$checks[] = [
    'check' => 'PHP Version',
    'value' => $phpVersion,
    'required' => '>= 8.0',
    'pass' => version_compare($phpVersion, '8.0.0', '>='),
];

// 2. PDO MySQL extension
$hasPdo = extension_loaded('pdo_mysql');
$checks[] = [
    'check' => 'PDO MySQL Extension',
    'value' => $hasPdo ? 'Loaded' : 'Missing',
    'required' => 'Required',
    'pass' => $hasPdo,
];

// 3. Vendor directory
$vendorPath = dirname(__DIR__) . '/vendor/autoload.php';
$hasVendor = file_exists($vendorPath);
$checks[] = [
    'check' => 'Composer Vendor Directory',
    'value' => $hasVendor ? 'Found' : 'MISSING - Run composer install!',
    'required' => 'Required',
    'pass' => $hasVendor,
];

// 4. .env file
$envPath = dirname(__DIR__) . '/.env';
$hasEnv = file_exists($envPath);
$checks[] = [
    'check' => '.env Configuration File',
    'value' => $hasEnv ? 'Found' : 'MISSING - Copy .env.example to .env!',
    'required' => 'Required',
    'pass' => $hasEnv,
];

// 5. Database connection (only if .env exists)
if ($hasEnv) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $envVars = [];
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$k, $v] = explode('=', $line, 2);
        $envVars[trim($k)] = trim(trim($v), '"');
    }

    $dbHost = $envVars['DB_HOST'] ?? 'localhost';
    $dbPort = $envVars['DB_PORT'] ?? '3306';
    $dbName = $envVars['DB_DATABASE'] ?? '';
    $dbUser = $envVars['DB_USERNAME'] ?? '';
    $dbPass = $envVars['DB_PASSWORD'] ?? '';

    $checks[] = [
        'check' => 'DB Username Sanity Check',
        'value' => $dbUser === '' ? 'Empty' : $dbUser,
        'required' => 'Do not use root on cPanel; use a cPanel-created MySQL user',
        'pass' => $dbUser !== '' && strtolower($dbUser) !== 'root',
    ];

    $checks[] = [
        'check' => 'DB Password Provided',
        'value' => $dbPass === '' ? 'EMPTY' : 'Provided (hidden)',
        'required' => 'Required (most hosts do not allow empty DB passwords)',
        'pass' => $dbPass !== '',
    ];

    try {
        $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
        $pdo = new PDO($dsn, $dbUser, $dbPass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $checks[] = [
            'check' => 'Database Connection',
            'value' => "Connected to {$dbName}@{$dbHost}",
            'required' => 'Required',
            'pass' => true,
        ];

        // Check ALL required tables (not just users)
        $requiredTables = [
            'users' => 'Required for auth',
            'campaigns' => 'Required for /api/campaigns/*',
            'donations' => 'Required for /api/donations/* and /api/stats/public',
            'student_requests' => 'Required for /api/requests/* and /api/stats/public',
            'request_documents' => 'Required for document uploads',
            'notifications' => 'Required for /api/notifications/*',
            'password_resets' => 'Required for password reset',
            'activity_logs' => 'Required for admin activity logs',
            'settings' => 'Required for admin settings',
            'payments' => 'Required for payment tracking',
        ];

        foreach ($requiredTables as $table => $purpose) {
            try {
                $stmt = $pdo->query("SELECT COUNT(*) FROM `{$table}`");
                $count = $stmt->fetchColumn();
                $checks[] = [
                    'check' => "Table: {$table}",
                    'value' => "{$count} rows",
                    'required' => $purpose,
                    'pass' => true,
                ];
            } catch (PDOException $e) {
                $checks[] = [
                    'check' => "Table: {$table}",
                    'value' => 'MISSING - Import campus_fund.sql!',
                    'required' => $purpose,
                    'pass' => false,
                ];
            }
        }

        // Test exact queries used by failing API endpoints
        $endpointQueries = [
            '/api/campaigns/featured' => "SELECT * FROM campaigns WHERE is_featured = TRUE AND status = 'active' ORDER BY created_at DESC LIMIT 3",
            '/api/campaigns (getActive)' => "SELECT c.*, u.first_name as creator_first_name, u.last_name as creator_last_name FROM campaigns c JOIN users u ON c.created_by = u.id WHERE c.status = 'active' ORDER BY c.is_featured DESC, c.created_at DESC LIMIT 10 OFFSET 0",
            '/api/stats/public (donations total)' => "SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE status = 'completed'",
            '/api/stats/public (donations count)' => "SELECT COUNT(*) as count FROM donations WHERE status = 'completed'",
            '/api/stats/public (students count)' => "SELECT COUNT(*) as count FROM users WHERE role = 'student'",
            '/api/stats/public (donors count)' => "SELECT COUNT(*) as count FROM users WHERE role = 'donor'",
            '/api/stats/public (requests funded)' => "SELECT COALESCE(SUM(amount_funded), 0) as total FROM student_requests",
            '/api/stats/public (funded count)' => "SELECT COUNT(*) as count FROM student_requests WHERE status = 'funded'",
            '/api/stats/public (active campaigns)' => "SELECT COUNT(*) as count FROM campaigns WHERE status = 'active'",
        ];

        foreach ($endpointQueries as $endpoint => $sql) {
            try {
                $stmt = $pdo->query($sql);
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $checks[] = [
                    'check' => "Endpoint Query: {$endpoint}",
                    'value' => json_encode($result),
                    'required' => 'Must not throw PDOException',
                    'pass' => true,
                ];
            } catch (PDOException $e) {
                $checks[] = [
                    'check' => "Endpoint Query: {$endpoint}",
                    'value' => 'FAILED: ' . $e->getMessage(),
                    'required' => 'Must not throw PDOException',
                    'pass' => false,
                ];
            }
        }
    } catch (PDOException $e) {
        $checks[] = [
            'check' => 'Database Connection',
            'value' => 'FAILED: ' . $e->getMessage(),
            'required' => 'Required',
            'pass' => false,
        ];
        $checks[] = [
            'check' => 'Database Tables',
            'value' => 'Skipped - DB connection failed',
            'required' => 'All tables required',
            'pass' => false,
        ];
    }
} else {
    $checks[] = [
        'check' => 'Database Connection',
        'value' => 'Skipped - no .env file',
        'required' => 'Required',
        'pass' => false,
    ];
}

// 6. Writable uploads
$uploadsPath = dirname(__DIR__) . '/uploads';
$uploadsWritable = is_writable($uploadsPath);
$checks[] = [
    'check' => 'Uploads Directory Writable',
    'value' => $uploadsWritable ? 'Yes' : 'No - chmod 755 uploads/',
    'required' => 'Required for file uploads',
    'pass' => $uploadsWritable,
];

// 7. Required PHP extensions
$requiredExts = ['json', 'mbstring', 'openssl', 'curl'];
foreach ($requiredExts as $ext) {
    $loaded = extension_loaded($ext);
    $checks[] = [
        'check' => "Extension: {$ext}",
        'value' => $loaded ? 'Loaded' : 'Missing',
        'required' => 'Recommended',
        'pass' => $loaded,
    ];
}

foreach ($checks as $c) {
    if (!$c['pass']) $allPass = false;
}

echo json_encode([
    'status' => $allPass ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED',
    'ready' => $allPass,
    'checks' => $checks,
    'next_steps' => !$allPass ? [
        '1. Run: composer install (or upload vendor/ directory)',
        '2. Copy .env.example to .env and fill in real values',
        '3. Import database/campus_fund.sql into MySQL',
        '4. Set permissions: chmod 755 uploads/',
        '5. DELETE this setup.php file after setup!',
    ] : ['System is ready. DELETE this setup.php file now!'],
], JSON_PRETTY_PRINT);
