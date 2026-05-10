<?php

namespace App\Models;

use App\Core\Database;

class Donation
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById($id)
    {
        return $this->db->fetch(
            "SELECT d.*, u.first_name as donor_first_name, u.last_name as donor_last_name, u.email as donor_email,
                    c.title as campaign_title
             FROM donations d 
             JOIN users u ON d.donor_id = u.id 
             LEFT JOIN campaigns c ON d.campaign_id = c.id 
             WHERE d.id = ?",
            [$id]
        );
    }

    public function findByReference($reference)
    {
        return $this->db->fetch("SELECT * FROM donations WHERE reference = ?", [$reference]);
    }

    public function create($data)
    {
        return $this->db->insert(
            "INSERT INTO donations (donor_id, campaign_id, request_id, amount, reference, message, is_anonymous, status, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $data['donor_id'],
                $data['campaign_id'] ?? null,
                $data['request_id'] ?? null,
                $data['amount'],
                $data['reference'],
                $data['message'] ?? null,
                $data['is_anonymous'] ?? false,
                $data['status'] ?? 'pending',
                $data['payment_method'] ?? 'paystack',
            ]
        );
    }

    public function getByDonorId($donorId, $page = 1, $perPage = 10)
    {
        $total = $this->db->fetch(
            "SELECT COUNT(*) as total FROM donations WHERE donor_id = ?",
            [$donorId]
        )['total'] ?? 0;

        $offset = ($page - 1) * $perPage;
        $data = $this->db->fetchAll(
            "SELECT d.*, c.title as campaign_title,
                    p.file_name as proof_file_name, p.file_path as proof_file_path, p.transaction_reference as proof_transaction_ref
             FROM donations d
             LEFT JOIN campaigns c ON d.campaign_id = c.id
             LEFT JOIN bank_transfer_proofs p ON d.id = p.donation_id
             WHERE d.donor_id = ?
             ORDER BY d.created_at DESC
             LIMIT {$perPage} OFFSET {$offset}",
            [$donorId]
        );

        return ['data' => $data, 'total' => (int)$total];
    }

    public function updateStatus($id, $status)
    {
        return $this->db->update("UPDATE donations SET status = ? WHERE id = ?", [$status, $id]);
    }

    public function updateStatusByReference($reference, $status)
    {
        return $this->db->update("UPDATE donations SET status = ? WHERE reference = ?", [$status, $reference]);
    }

    public function getAll($status = null, $page = 1, $perPage = 10)
    {
        $where = [];
        $params = [];

        if ($status) {
            $where[] = "d.status = ?";
            $params[] = $status;
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $total = $this->db->fetch(
            "SELECT COUNT(*) as total FROM donations d {$whereClause}",
            $params
        )['total'] ?? 0;

        $offset = ($page - 1) * $perPage;
        $data = $this->db->fetchAll(
            "SELECT d.*, u.first_name as donor_first_name, u.last_name as donor_last_name, u.email as donor_email,
                    c.title as campaign_title,
                    p.file_name as proof_file_name, p.file_path as proof_file_path, p.transaction_reference as proof_transaction_ref,
                    p.bank_name as proof_bank_name, p.notes as proof_notes
             FROM donations d 
             JOIN users u ON d.donor_id = u.id 
             LEFT JOIN campaigns c ON d.campaign_id = c.id 
             LEFT JOIN bank_transfer_proofs p ON d.id = p.donation_id
             {$whereClause} 
             ORDER BY d.created_at DESC 
             LIMIT {$perPage} OFFSET {$offset}",
            $params
        );

        return ['data' => $data, 'total' => (int)$total];
    }

    public function getTotalDonations()
    {
        return $this->db->fetch(
            "SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE status = 'completed'"
        )['total'] ?? 0;
    }

    public function countByStatus($status)
    {
        return $this->db->fetch("SELECT COUNT(*) as count FROM donations WHERE status = ?", [$status])['count'] ?? 0;
    }

    public function countAll()
    {
        return $this->db->fetch("SELECT COUNT(*) as count FROM donations")['count'] ?? 0;
    }

    public function getMonthlyDonations($year = null)
    {
        $year = $year ?? date('Y');
        return $this->db->fetchAll(
            "SELECT MONTH(created_at) as month, COALESCE(SUM(amount), 0) as total, COUNT(*) as count 
             FROM donations 
             WHERE status = 'completed' AND YEAR(created_at) = ? 
             GROUP BY MONTH(created_at) 
             ORDER BY month",
            [$year]
        );
    }

    public function getRecentDonations($limit = 5)
    {
        return $this->db->fetchAll(
            "SELECT d.*, u.first_name as donor_first_name, u.last_name as donor_last_name 
             FROM donations d 
             JOIN users u ON d.donor_id = u.id 
             WHERE d.status = 'completed' 
             ORDER BY d.created_at DESC 
             LIMIT {$limit}"
        );
    }

    public function getByCampaign($campaignId)
    {
        return $this->db->fetchAll(
            "SELECT d.*, u.first_name as donor_first_name, u.last_name as donor_last_name 
             FROM donations d 
             JOIN users u ON d.donor_id = u.id 
             WHERE d.campaign_id = ? AND d.status = 'completed' 
             ORDER BY d.created_at DESC",
            [$campaignId]
        );
    }
}
