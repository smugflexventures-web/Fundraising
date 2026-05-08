<?php

namespace App\Models;

use App\Core\Database;

class StudentRequest
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById($id)
    {
        return $this->db->fetch(
            "SELECT sr.*, u.first_name, u.last_name, u.email, u.student_id, u.department, u.level 
             FROM student_requests sr 
             JOIN users u ON sr.user_id = u.id 
             WHERE sr.id = ?",
            [$id]
        );
    }

    public function create($data)
    {
        return $this->db->insert(
            "INSERT INTO student_requests (user_id, title, description, amount_needed, category, priority) VALUES (?, ?, ?, ?, ?, ?)",
            [
                $data['user_id'],
                $data['title'],
                $data['description'],
                $data['amount_needed'],
                $data['category'] ?? 'other',
                $data['priority'] ?? 'medium',
            ]
        );
    }

    public function update($id, $data)
    {
        $fields = [];
        $values = [];

        $allowed = ['title', 'description', 'amount_needed', 'category', 'priority', 'status', 'amount_funded', 'admin_notes', 'reviewed_by', 'reviewed_at'];

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
            "UPDATE student_requests SET " . implode(', ', $fields) . " WHERE id = ?",
            $values
        );
    }

    public function updateStatus($id, $status, $reviewedBy, $notes = null)
    {
        return $this->db->update(
            "UPDATE student_requests SET status = ?, reviewed_by = ?, reviewed_at = NOW(), admin_notes = ? WHERE id = ?",
            [$status, $reviewedBy, $notes, $id]
        );
    }

    public function delete($id)
    {
        return $this->db->delete("DELETE FROM student_requests WHERE id = ?", [$id]);
    }

    public function getByUserId($userId, $page = 1, $perPage = 10)
    {
        $total = $this->db->fetch(
            "SELECT COUNT(*) as total FROM student_requests WHERE user_id = ?",
            [$userId]
        )['total'] ?? 0;

        $offset = ($page - 1) * $perPage;
        $data = $this->db->fetchAll(
            "SELECT * FROM student_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT {$perPage} OFFSET {$offset}",
            [$userId]
        );

        return ['data' => $data, 'total' => (int)$total];
    }

    public function getAll($status = null, $page = 1, $perPage = 10, $category = null)
    {
        $where = [];
        $params = [];

        if ($status) {
            $where[] = "sr.status = ?";
            $params[] = $status;
        }

        if ($category) {
            $where[] = "sr.category = ?";
            $params[] = $category;
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $total = $this->db->fetch(
            "SELECT COUNT(*) as total FROM student_requests sr {$whereClause}",
            $params
        )['total'] ?? 0;

        $offset = ($page - 1) * $perPage;
        $data = $this->db->fetchAll(
            "SELECT sr.*, u.first_name, u.last_name, u.email, u.student_id, u.department 
             FROM student_requests sr 
             JOIN users u ON sr.user_id = u.id 
             {$whereClause} 
             ORDER BY sr.created_at DESC 
             LIMIT {$perPage} OFFSET {$offset}",
            $params
        );

        return ['data' => $data, 'total' => (int)$total];
    }

    public function countByStatus($status)
    {
        return $this->db->fetch("SELECT COUNT(*) as count FROM student_requests WHERE status = ?", [$status])['count'] ?? 0;
    }

    public function countAll()
    {
        return $this->db->fetch("SELECT COUNT(*) as count FROM student_requests")['count'] ?? 0;
    }

    public function getTotalRequested()
    {
        return $this->db->fetch("SELECT COALESCE(SUM(amount_needed), 0) as total FROM student_requests")['total'] ?? 0;
    }

    public function getTotalFunded()
    {
        return $this->db->fetch("SELECT COALESCE(SUM(amount_funded), 0) as total FROM student_requests")['total'] ?? 0;
    }

    public function getByCategory()
    {
        return $this->db->fetchAll(
            "SELECT category, COUNT(*) as count, COALESCE(SUM(amount_needed), 0) as total_needed, COALESCE(SUM(amount_funded), 0) as total_funded FROM student_requests GROUP BY category"
        );
    }

    public function addDocument($requestId, $fileData)
    {
        return $this->db->insert(
            "INSERT INTO request_documents (request_id, file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)",
            [
                $requestId,
                $fileData['file_name'],
                $fileData['file_path'],
                $fileData['file_type'],
                $fileData['file_size'],
            ]
        );
    }

    public function getDocuments($requestId)
    {
        return $this->db->fetchAll(
            "SELECT * FROM request_documents WHERE request_id = ? ORDER BY created_at DESC",
            [$requestId]
        );
    }

    public function deleteDocument($id)
    {
        return $this->db->delete("DELETE FROM request_documents WHERE id = ?", [$id]);
    }
}
