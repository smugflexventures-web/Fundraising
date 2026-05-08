<?php

namespace App\Models;

use App\Core\Database;

class Payment
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById($id)
    {
        return $this->db->fetch("SELECT * FROM payments WHERE id = ?", [$id]);
    }

    public function findByTransactionId($transactionId)
    {
        return $this->db->fetch("SELECT * FROM payments WHERE transaction_id = ?", [$transactionId]);
    }

    public function findByDonationId($donationId)
    {
        return $this->db->fetch("SELECT * FROM payments WHERE donation_id = ?", [$donationId]);
    }

    public function create($data)
    {
        return $this->db->insert(
            "INSERT INTO payments (donation_id, transaction_id, provider, amount, currency, status, gateway_response) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                $data['donation_id'],
                $data['transaction_id'] ?? null,
                $data['provider'] ?? 'paystack',
                $data['amount'],
                $data['currency'] ?? 'NGN',
                $data['status'] ?? 'initialized',
                $data['gateway_response'] ?? null,
            ]
        );
    }

    public function updateStatus($id, $status, $gatewayResponse = null, $transactionId = null)
    {
        $paidAt = $status === 'success' ? 'NOW()' : 'NULL';
        return $this->db->update(
            "UPDATE payments SET status = ?, gateway_response = ?, transaction_id = ?, paid_at = IF(? = 'success', NOW(), NULL) WHERE id = ?",
            [$status, $gatewayResponse, $transactionId, $status, $id]
        );
    }

    public function updateStatusByDonationId($donationId, $status, $gatewayResponse = null, $transactionId = null)
    {
        return $this->db->update(
            "UPDATE payments SET status = ?, gateway_response = ?, transaction_id = ?, paid_at = IF(? = 'success', NOW(), NULL) WHERE donation_id = ?",
            [$status, $gatewayResponse, $transactionId, $status, $donationId]
        );
    }
}
