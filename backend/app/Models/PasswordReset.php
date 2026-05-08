<?php

namespace App\Models;

use App\Core\Database;

class PasswordReset
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function create($email, $token)
    {
        $this->db->delete("DELETE FROM password_resets WHERE email = ?", [$email]);
        return $this->db->insert(
            "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))",
            [$email, $token]
        );
    }

    public function findByToken($token)
    {
        return $this->db->fetch(
            "SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()",
            [$token]
        );
    }

    public function deleteByEmail($email)
    {
        return $this->db->delete("DELETE FROM password_resets WHERE email = ?", [$email]);
    }

    public function deleteExpired()
    {
        return $this->db->delete("DELETE FROM password_resets WHERE expires_at < NOW()");
    }
}
