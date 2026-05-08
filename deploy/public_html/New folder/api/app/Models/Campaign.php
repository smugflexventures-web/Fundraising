<?php

namespace App\Models;

use App\Core\Database;

class Campaign
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById($id)
    {
        return $this->db->fetch(
            "SELECT c.*, u.first_name as creator_first_name, u.last_name as creator_last_name 
             FROM campaigns c 
             JOIN users u ON c.created_by = u.id 
             WHERE c.id = ?",
            [$id]
        );
    }

    public function create($data)
    {
        return $this->db->insert(
            "INSERT INTO campaigns (title, description, short_description, target_amount, image, category, status, start_date, end_date, created_by, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $data['title'],
                $data['description'],
                $data['short_description'] ?? null,
                $data['target_amount'],
                $data['image'] ?? null,
                $data['category'] ?? 'general',
                $data['status'] ?? 'active',
                $data['start_date'] ?? null,
                $data['end_date'] ?? null,
                $data['created_by'],
                $data['is_featured'] ?? false,
            ]
        );
    }

    public function update($id, $data)
    {
        $fields = [];
        $values = [];

        $allowed = ['title', 'description', 'short_description', 'target_amount', 'image', 'category', 'status', 'start_date', 'end_date', 'is_featured', 'raised_amount'];

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
            "UPDATE campaigns SET " . implode(', ', $fields) . " WHERE id = ?",
            $values
        );
    }

    public function delete($id)
    {
        return $this->db->delete("DELETE FROM campaigns WHERE id = ?", [$id]);
    }

    public function getActive($page = 1, $perPage = 10, $category = null)
    {
        $where = ["c.status = 'active'"];
        $params = [];

        if ($category) {
            $where[] = "c.category = ?";
            $params[] = $category;
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);

        $total = $this->db->fetch(
            "SELECT COUNT(*) as total FROM campaigns c {$whereClause}",
            $params
        )['total'] ?? 0;

        $offset = ($page - 1) * $perPage;
        $data = $this->db->fetchAll(
            "SELECT c.*, u.first_name as creator_first_name, u.last_name as creator_last_name 
             FROM campaigns c 
             JOIN users u ON c.created_by = u.id 
             {$whereClause} 
             ORDER BY c.is_featured DESC, c.created_at DESC 
             LIMIT {$perPage} OFFSET {$offset}",
            $params
        );

        return ['data' => $data, 'total' => (int)$total];
    }

    public function getAll($status = null, $page = 1, $perPage = 10)
    {
        $where = [];
        $params = [];

        if ($status) {
            $where[] = "c.status = ?";
            $params[] = $status;
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $total = $this->db->fetch(
            "SELECT COUNT(*) as total FROM campaigns c {$whereClause}",
            $params
        )['total'] ?? 0;

        $offset = ($page - 1) * $perPage;
        $data = $this->db->fetchAll(
            "SELECT c.*, u.first_name as creator_first_name, u.last_name as creator_last_name 
             FROM campaigns c 
             JOIN users u ON c.created_by = u.id 
             {$whereClause} 
             ORDER BY c.created_at DESC 
             LIMIT {$perPage} OFFSET {$offset}",
            $params
        );

        return ['data' => $data, 'total' => (int)$total];
    }

    public function updateRaisedAmount($id, $amount)
    {
        return $this->db->update(
            "UPDATE campaigns SET raised_amount = raised_amount + ? WHERE id = ?",
            [$amount, $id]
        );
    }

    public function getFeatured()
    {
        return $this->db->fetchAll(
            "SELECT * FROM campaigns WHERE is_featured = TRUE AND status = 'active' ORDER BY created_at DESC LIMIT 3"
        );
    }

    public function countByStatus($status)
    {
        return $this->db->fetch("SELECT COUNT(*) as count FROM campaigns WHERE status = ?", [$status])['count'] ?? 0;
    }

    public function countAll()
    {
        return $this->db->fetch("SELECT COUNT(*) as count FROM campaigns")['count'] ?? 0;
    }

    public function getTotalTarget()
    {
        return $this->db->fetch("SELECT COALESCE(SUM(target_amount), 0) as total FROM campaigns WHERE status = 'active'")['total'] ?? 0;
    }

    public function getTotalRaised()
    {
        return $this->db->fetch("SELECT COALESCE(SUM(raised_amount), 0) as total FROM campaigns")['total'] ?? 0;
    }
}
