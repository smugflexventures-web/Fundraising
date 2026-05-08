<?php

namespace App\Models;

use App\Core\Database;

class ActivityLog
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function create($data)
    {
        return $this->db->insert(
            "INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
            [
                $data['user_id'] ?? null,
                $data['action'],
                $data['description'] ?? null,
                $data['ip_address'] ?? null,
                $data['user_agent'] ?? null,
            ]
        );
    }

    public function getAll($page = 1, $perPage = 20)
    {
        $total = $this->db->fetch("SELECT COUNT(*) as total FROM activity_logs")['total'] ?? 0;
        $offset = ($page - 1) * $perPage;
        $data = $this->db->fetchAll(
            "SELECT al.*, u.first_name, u.last_name, u.email 
             FROM activity_logs al 
             LEFT JOIN users u ON al.user_id = u.id 
             ORDER BY al.created_at DESC 
             LIMIT {$perPage} OFFSET {$offset}"
        );
        return ['data' => $data, 'total' => (int)$total];
    }

    public function getByUserId($userId, $limit = 10)
    {
        return $this->db->fetchAll(
            "SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT {$limit}",
            [$userId]
        );
    }

    public function getRecent($limit = 10)
    {
        return $this->db->fetchAll(
            "SELECT al.*, u.first_name, u.last_name 
             FROM activity_logs al 
             LEFT JOIN users u ON al.user_id = u.id 
             ORDER BY al.created_at DESC 
             LIMIT {$limit}"
        );
    }
}
