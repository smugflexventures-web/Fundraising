<?php

namespace App\Models;

use App\Core\Database;

class Notification
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById($id)
    {
        return $this->db->fetch("SELECT * FROM notifications WHERE id = ?", [$id]);
    }

    public function getByUserId($userId, $page = 1, $perPage = 10)
    {
        $total = $this->db->fetch(
            "SELECT COUNT(*) as total FROM notifications WHERE user_id = ?",
            [$userId]
        )['total'] ?? 0;

        $offset = ($page - 1) * $perPage;
        $data = $this->db->fetchAll(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT {$perPage} OFFSET {$offset}",
            [$userId]
        );

        return ['data' => $data, 'total' => (int)$total];
    }

    public function getUnreadCount($userId)
    {
        return $this->db->fetch(
            "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
            [$userId]
        )['count'] ?? 0;
    }

    public function create($data)
    {
        return $this->db->insert(
            "INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)",
            [
                $data['user_id'],
                $data['title'],
                $data['message'],
                $data['type'] ?? 'info',
                $data['link'] ?? null,
            ]
        );
    }

    public function markAsRead($id)
    {
        return $this->db->update("UPDATE notifications SET is_read = TRUE WHERE id = ?", [$id]);
    }

    public function markAllAsRead($userId)
    {
        return $this->db->update("UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE", [$userId]);
    }

    public function delete($id)
    {
        return $this->db->delete("DELETE FROM notifications WHERE id = ?", [$id]);
    }

    public function deleteOldNotifications($days = 90)
    {
        return $this->db->delete(
            "DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)",
            [$days]
        );
    }
}
