<?php
header('Content-Type: application/json; charset=utf-8');

$results = [];

// 1. Load the app's autoloader and config
try {
    require_once __DIR__ . '/../vendor/autoload.php';
    $results['autoload'] = 'OK';
} catch (\Throwable $e) {
    $results['autoload'] = 'FAIL: ' . $e->getMessage();
    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// 2. Load config manually
try {
    $envPath = dirname(__DIR__) . '/.env';
    if (!file_exists($envPath)) {
        throw new \RuntimeException('.env not found at ' . $envPath);
    }
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        if (str_contains($line, '=')) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, " \"");
            putenv("$key=$value");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
    $results['config'] = 'OK - DB=' . ($_ENV['DB_DATABASE'] ?? 'NOT SET') . ' User=' . ($_ENV['DB_USERNAME'] ?? 'NOT SET');
} catch (\Throwable $e) {
    $results['config'] = 'FAIL: ' . $e->getMessage();
    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// 3. Test Database connection
try {
    $db = \App\Core\Database::getInstance();
    $conn = $db->getConnection();
    $results['database_connection'] = 'OK';
} catch (\Throwable $e) {
    $results['database_connection'] = 'FAIL: ' . $e->getMessage();
    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// 4. Test User model - findByEmail
$userModel = null;
try {
    $userModel = new \App\Models\User();
    $admin = $userModel->findByEmail('admin@campusfund.edu');
    if ($admin) {
        $results['find_admin'] = 'OK - Found user ID=' . $admin['id'] . ' role=' . $admin['role'];
        $results['admin_password_hash'] = substr($admin['password'], 0, 30) . '...';
        $results['admin_is_active'] = $admin['is_active'];
        $results['admin_is_verified'] = $admin['is_verified'];
    } else {
        $results['find_admin'] = 'FAIL - admin@campusfund.edu not found';
    }
} catch (\Throwable $e) {
    $results['find_admin'] = 'FAIL: ' . $e->getMessage();
}

// 5. Test password_verify with both passwords
try {
    $admin = $userModel?->findByEmail('admin@campusfund.edu');
    if ($admin) {
        $results['verify_password_lowercase'] = password_verify('password', $admin['password']) ? 'MATCH' : 'NO MATCH';
        $results['verify_Password@123'] = password_verify('Password@123', $admin['password']) ? 'MATCH' : 'NO MATCH';
    }
} catch (\Throwable $e) {
    $results['password_verify'] = 'FAIL: ' . $e->getMessage();
}

// 6. Test verifyPassword method (what login uses)
try {
    if (!$userModel) throw new \RuntimeException('User model not initialized');
    $result1 = $userModel->verifyPassword('admin@campusfund.edu', 'password');
    $results['verifyPassword_lowercase'] = $result1 ? 'OK - returns user' : 'FAIL - returns null';
    
    $result2 = $userModel->verifyPassword('admin@campusfund.edu', 'Password@123');
    $results['verifyPassword_Password@123'] = $result2 ? 'OK - returns user' : 'FAIL - returns null';
} catch (\Throwable $e) {
    $results['verifyPassword_method'] = 'FAIL: ' . $e->getMessage();
}

// 7. Test JWT generation
try {
    $token = \App\Helpers\JWT::generate(['user_id' => 1, 'email' => 'admin@campusfund.edu', 'role' => 'admin']);
    $results['jwt_generate'] = 'OK - token length=' . strlen($token);
} catch (\Throwable $e) {
    $results['jwt_generate'] = 'FAIL: ' . $e->getMessage();
}

// 8. Test Helpers::createNotification
try {
    \App\Helpers\Helpers::createNotification(1, 'Debug Test', 'Testing notification', 'info');
    $results['create_notification'] = 'OK';
} catch (\Throwable $e) {
    $results['create_notification'] = 'FAIL: ' . $e->getMessage();
}

// 9. Test Helpers::logActivity
try {
    \App\Helpers\Helpers::logActivity(1, 'debug_test', 'Testing activity log');
    $results['log_activity'] = 'OK';
} catch (\Throwable $e) {
    $results['log_activity'] = 'FAIL: ' . $e->getMessage();
}

// 10. Test Mailer (this is likely the 500 cause for register)
try {
    \App\Helpers\Mailer::sendWelcomeEmail('test@example.com', 'Test');
    $results['mailer'] = 'OK (email sent or silently failed)';
} catch (\Throwable $e) {
    $results['mailer'] = 'FAIL: ' . $e->getMessage() . ' in ' . basename($e->getFile()) . ':' . $e->getLine();
}

// 11. Test User::create (what register uses)
try {
    $testData = [
        'email' => 'debug_test_' . time() . '@test.com',
        'password' => 'TestPass@123',
        'first_name' => 'Debug',
        'last_name' => 'Test',
        'phone' => null,
        'role' => 'student',
        'student_id' => 'DBG/' . time(),
        'department' => null,
        'level' => null,
    ];
    if (!$userModel) throw new \RuntimeException('User model not initialized');
    $userId = $userModel->create($testData);
    $results['user_create'] = $userId ? 'OK - created user ID=' . $userId : 'FAIL - returned false/empty';
    
    // Clean up test user
    if ($userId) {
        $db->delete("DELETE FROM users WHERE id = ?", [$userId]);
        $results['cleanup'] = 'OK - deleted test user';
    }
} catch (\Throwable $e) {
    $results['user_create'] = 'FAIL: ' . $e->getMessage() . ' in ' . basename($e->getFile()) . ':' . $e->getLine();
}

// 12. Test the full AuthController login flow with correct password
try {
    if (!$userModel) throw new \RuntimeException('User model not initialized');
    $user = $userModel->verifyPassword('admin@campusfund.edu', 'Password@123');
    if ($user) {
        if (!$user['is_active']) {
            $results['full_login_flow'] = 'FAIL - user is not active';
        } else {
            $token = \App\Helpers\JWT::generate([
                'user_id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'],
            ]);
            $results['full_login_flow'] = 'OK - would return token (length=' . strlen($token) . ')';
        }
    } else {
        $results['full_login_flow'] = 'FAIL - verifyPassword returned null';
    }
} catch (\Throwable $e) {
    $results['full_login_flow'] = 'FAIL: ' . $e->getMessage() . ' in ' . basename($e->getFile()) . ':' . $e->getLine();
}

// 13. Check if updated AuthController with try/catch is deployed
$authControllerSource = file_get_contents(dirname(__DIR__) . '/app/Controllers/AuthController.php');
$results['authcontroller_has_try_catch'] = str_contains($authControllerSource, 'try {') ? 'YES' : 'NO - old version still deployed!';
$results['authcontroller_has_throwable'] = str_contains($authControllerSource, 'Throwable') ? 'YES' : 'NO';

// 14. Test actual API endpoint via curl - LOGIN
$baseUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/auth/login');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => 'admin@campusfund.edu', 'password' => 'Password@123']));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$loginResponse = curl_exec($ch);
$loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$loginError = curl_error($ch);
$results['endpoint_login_http_code'] = $loginHttpCode;
$results['endpoint_login_error'] = $loginError ?: 'none';
$results['endpoint_login_body'] = $loginResponse ?: 'empty';

// 15. Test actual API endpoint via curl - REGISTER
$regData = [
    'first_name' => 'Debug',
    'last_name' => 'Test',
    'email' => 'debug_test_' . time() . '@test.com',
    'password' => 'TestPass@123',
    'confirm_password' => 'TestPass@123',
    'role' => 'donor',
];
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/auth/register');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($regData));
$regResponse = curl_exec($ch);
$regHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$regError = curl_error($ch);
$results['endpoint_register_http_code'] = $regHttpCode;
$results['endpoint_register_error'] = $regError ?: 'none';
$results['endpoint_register_body'] = $regResponse ?: 'empty';

// 16. Test actual API endpoint via curl - REGISTER (student with student_id)
$regData2 = [
    'first_name' => 'Debug',
    'last_name' => 'Student',
    'email' => 'debug_student_' . time() . '@test.com',
    'password' => 'TestPass@123',
    'confirm_password' => 'TestPass@123',
    'role' => 'student',
    'student_id' => 'DBG/' . time(),
];
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/auth/register');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($regData2));
$reg2Response = curl_exec($ch);
$reg2HttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$reg2Error = curl_error($ch);
$results['endpoint_register_student_http_code'] = $reg2HttpCode;
$results['endpoint_register_student_error'] = $reg2Error ?: 'none';
$results['endpoint_register_student_body'] = $reg2Response ?: 'empty';

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
