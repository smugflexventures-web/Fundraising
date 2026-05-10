<?php

namespace App\Models;

use App\Core\Database;

class PasswordReset
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function create(string $email, string $token): string
    {
        $this->db->delete("DELETE FROM password_resets WHERE email = ?", [$email]);
        $hashedToken = hash('sha256', $token);
        return $this->db->insert(
            "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))",
            [$email, $hashedToken]
        );
    }

    public function findByToken(string $token): ?array
    {
        $hashedToken = hash('sha256', $token);
        return $this->db->fetch(
            "SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()",
            [$hashedToken]
        );
    }

    public function deleteByEmail(string $email): int
    {
        return $this->db->delete("DELETE FROM password_resets WHERE email = ?", [$email]);
    }

    public function deleteExpired()
    {
        return $this->db->delete("DELETE FROM password_resets WHERE expires_at < NOW()");
    }
}
