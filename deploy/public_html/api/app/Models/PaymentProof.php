<?php

namespace App\Models;

use App\Core\Database;

class PaymentProof
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function create(array $data): string
    {
        return $this->db->insert(
            "INSERT INTO bank_transfer_proofs (donation_id, file_name, file_path, file_type, file_size, bank_name, account_name, transaction_reference, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $data['donation_id'],
                $data['file_name'],
                $data['file_path'],
                $data['file_type'],
                $data['file_size'],
                $data['bank_name'] ?? null,
                $data['account_name'] ?? null,
                $data['transaction_reference'] ?? null,
                $data['notes'] ?? null,
            ]
        );
    }

    public function findByDonationId(int $donationId): ?array
    {
        return $this->db->fetch(
            "SELECT * FROM bank_transfer_proofs WHERE donation_id = ?",
            [$donationId]
        );
    }

    public function findById(int $id): ?array
    {
        return $this->db->fetch(
            "SELECT * FROM bank_transfer_proofs WHERE id = ?",
            [$id]
        );
    }

    public function deleteByDonationId(int $donationId): int
    {
        return $this->db->delete(
            "DELETE FROM bank_transfer_proofs WHERE donation_id = ?",
            [$donationId]
        );
    }
}
