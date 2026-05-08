<?php

namespace App\Models;

use App\Core\Database;

class User
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById($id)
    {
        return $this->db->fetch(
            "SELECT id, email, first_name, last_name, phone, role, avatar, student_id, department, level, is_verified, is_active, email_verified_at, last_login, created_at, updated_at FROM users WHERE id = ?",
            [$id]
        );
    }

    public function findByEmail($email)
    {
        return $this->db->fetch("SELECT * FROM users WHERE email = ?", [$email]);
    }

    public function findByStudentId($studentId)
    {
        return $this->db->fetch("SELECT * FROM users WHERE student_id = ?", [$studentId]);
    }

    public function create($data)
    {
        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
        return $this->db->insert(
            "INSERT INTO users (email, password, first_name, last_name, phone, role, student_id, department, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $data['email'],
                $hashedPassword,
                $data['first_name'],
                $data['last_name'],
                $data['phone'] ?? null,
                $data['role'] ?? 'student',
                $data['student_id'] ?? null,
                $data['department'] ?? null,
                $data['level'] ?? null,
            ]
        );
    }

    public function update($id, $data)
    {
        $fields = [];
        $values = [];

        $allowed = ['first_name', 'last_name', 'phone', 'avatar', 'student_id', 'department', 'level', 'is_verified', 'is_active'];

        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $fields[] = "{$field} = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) {
            return 0;
        }

        $values[] = $id;
        return $this->db->update(
            "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?",
            $values
        );
    }

    public function updatePassword($id, $password)
    {
        $hashed = password_hash($password, PASSWORD_BCRYPT);
        return $this->db->update("UPDATE users SET password = ? WHERE id = ?", [$hashed, $id]);
    }

    public function updateLastLogin($id)
    {
        return $this->db->update("UPDATE users SET last_login = NOW() WHERE id = ?", [$id]);
    }

    public function verifyEmail($id)
    {
        return $this->db->update("UPDATE users SET email_verified_at = NOW(), is_verified = TRUE WHERE id = ?", [$id]);
    }

    public function delete($id)
    {
        return $this->db->delete("DELETE FROM users WHERE id = ?", [$id]);
    }

    public function getAll($role = null, $page = 1, $perPage = 10, $search = null)
    {
        $where = [];
        $params = [];

        if ($role) {
            $where[] = "role = ?";
            $params[] = $role;
        }

        if ($search) {
            $where[] = "(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR student_id LIKE ?)";
            $searchTerm = "%{$search}%";
            $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $countSql = "SELECT COUNT(*) as total FROM users {$whereClause}";
        $total = $this->db->fetch($countSql, $params)['total'] ?? 0;

        $offset = ($page - 1) * $perPage;
        $data = $this->db->fetchAll(
            "SELECT id, email, first_name, last_name, phone, role, student_id, department, level, is_verified, is_active, created_at FROM users {$whereClause} ORDER BY created_at DESC LIMIT {$perPage} OFFSET {$offset}",
            $params
        );

        return ['data' => $data, 'total' => (int)$total];
    }

    public function countByRole($role)
    {
        return $this->db->fetch("SELECT COUNT(*) as count FROM users WHERE role = ?", [$role])['count'] ?? 0;
    }

    public function countAll()
    {
        return $this->db->fetch("SELECT COUNT(*) as count FROM users")['count'] ?? 0;
    }

    public function verifyPassword($email, $password)
    {
        $user = $this->findByEmail($email);
        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }
        return null;
    }
}
