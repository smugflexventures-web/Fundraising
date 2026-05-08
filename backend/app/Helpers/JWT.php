<?php

namespace App\Helpers;

use Firebase\JWT\JWT as FirebaseJWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use App\Core\Config;

class JWT
{
    private static function getSecret()
    {
        return Config::get('JWT_SECRET', 'your_super_secret_jwt_key_change_in_production_2024');
    }

    public static function generate($payload)
    {
        $issuedAt = time();
        $expiration = $issuedAt + (int) Config::get('JWT_EXPIRATION', 86400);

        $payload = array_merge($payload, [
            'iat' => $issuedAt,
            'exp' => $expiration,
        ]);

        return FirebaseJWT::encode($payload, self::getSecret(), 'HS256');
    }

    public static function verify($token)
    {
        try {
            $decoded = FirebaseJWT::decode($token, new Key(self::getSecret(), 'HS256'));
            return (array) $decoded;
        } catch (ExpiredException $e) {
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function getPayload($token)
    {
        return self::verify($token);
    }
}
