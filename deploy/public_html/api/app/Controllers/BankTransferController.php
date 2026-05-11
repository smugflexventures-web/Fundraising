<?php

namespace App\Controllers;

use App\Models\Donation;
use App\Models\Payment;
use App\Models\PaymentProof;
use App\Models\Campaign;
use App\Models\StudentRequest;
use App\Helpers\Validator;
use App\Helpers\Helpers;
use App\Helpers\Mailer;
use App\Core\Response;

class BankTransferController
{
    private Donation $donationModel;
    private Payment $paymentModel;
    private PaymentProof $proofModel;

    public function __construct()
    {
        $this->donationModel = new Donation();
        $this->paymentModel = new Payment();
        $this->proofModel = new PaymentProof();
    }

    /**
     * Initialize a bank transfer donation — creates pending donation + payment records
     * and returns bank account details for the donor to transfer to.
     */
    public function initialize(array $params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $input = $GLOBALS['request_body'] ?? [];
        $input = Helpers::sanitize($input);

        $validator = new Validator($input);
        $validator->validate([
            'amount' => 'required|numeric|min_value:1000',
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed', 422, $validator->getErrors());
        }

        // Validate request_id if provided
        if (!empty($input['request_id'])) {
            $requestModel = new StudentRequest();
            $studentRequest = $requestModel->findById($input['request_id']);
            if (!$studentRequest) {
                return Response::notFound('Assistance request not found');
            }
            if ($studentRequest['status'] !== 'approved' && $studentRequest['status'] !== 'funded') {
                return Response::error('Only approved requests can receive contributions', 400);
            }
        }

        // Prevent duplicate pending bank transfers for same donor+amount within 10 minutes
        $db = \App\Core\Database::getInstance();
        $recent = $db->fetch(
            "SELECT id FROM donations WHERE donor_id = ? AND payment_method = 'bank_transfer' AND status = 'pending_verification' AND amount = ? AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)",
            [$authUser['user_id'], (float)$input['amount']]
        );
        if ($recent) {
            return Response::error('A similar pending transfer already exists. Please wait or submit proof for the existing one.', 409);
        }

        $reference = Helpers::generateReference('BT');

        $donationData = [
            'donor_id' => $authUser['user_id'],
            'campaign_id' => $input['campaign_id'] ?? null,
            'request_id' => $input['request_id'] ?? null,
            'amount' => (float)$input['amount'],
            'reference' => $reference,
            'message' => $input['message'] ?? null,
            'is_anonymous' => $input['is_anonymous'] ?? false,
            'status' => 'pending_verification',
            'payment_method' => 'bank_transfer',
        ];

        $donationId = $this->donationModel->create($donationData);

        $paymentData = [
            'donation_id' => $donationId,
            'provider' => 'bank_transfer',
            'amount' => (float)$input['amount'],
            'currency' => 'NGN',
            'status' => 'pending_verification',
        ];

        $this->paymentModel->create($paymentData);

        // Return bank account details for the donor (from DB settings table)
        $db = \App\Core\Database::getInstance();
        $bankSettings = $db->fetchAll("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('bank_name', 'bank_account_number', 'bank_account_name', 'bank_sort_code')");
        $settingsMap = [];
        foreach ($bankSettings as $row) {
            $settingsMap[$row['setting_key']] = $row['setting_value'];
        }

        $bankDetails = [
            'bank_name' => $settingsMap['bank_name'] ?? 'First Bank of Nigeria',
            'account_number' => $settingsMap['bank_account_number'] ?? '2031234567',
            'account_name' => $settingsMap['bank_account_name'] ?? 'CampusFund Educational Support',
            'sort_code' => $settingsMap['bank_sort_code'] ?? '011151003',
        ];

        try {
            Helpers::logActivity($authUser['user_id'], 'bank_transfer_initiated', "Bank transfer {$reference} initiated for NGN " . number_format((float)$input['amount'], 2));
        } catch (\Throwable $e) {
            error_log('Activity log error: ' . $e->getMessage());
        }

        return Response::success([
            'donation_id' => $donationId,
            'reference' => $reference,
            'bank_details' => $bankDetails,
            'amount' => (float)$input['amount'],
        ], 'Bank transfer initiated. Please transfer to the account below and upload proof of payment.');
    }

    /**
     * Upload proof of payment for a pending bank transfer donation.
     */
    public function submitProof(array $params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $donationId = $params['id'] ?? null;

        if (!$donationId) {
            return Response::error('Donation ID is required', 400);
        }

        $donation = $this->donationModel->findById($donationId);
        if (!$donation) {
            return Response::notFound('Contribution record not found');
        }

        // Ensure this donation belongs to the authenticated donor
        if ($donation['donor_id'] != $authUser['user_id']) {
            return Response::forbidden('You can only submit proof for your own contributions');
        }

        if ($donation['payment_method'] !== 'bank_transfer') {
            return Response::error('Proof upload is only for bank transfer contributions', 400);
        }

        if ($donation['status'] !== 'pending_verification') {
            return Response::error('Proof can only be submitted for pending contributions', 400);
        }

        // Check if proof already exists
        $existingProof = $this->proofModel->findByDonationId((int)$donationId);
        if ($existingProof) {
            return Response::error('Proof of payment has already been submitted for this contribution', 409);
        }

        // Handle file upload
        $file = $_FILES['proof'] ?? null;
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            return Response::error('Proof document is required', 422);
        }

        // Validate file
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        $maxSize = (int)Config::get('UPLOAD_MAX_SIZE', 5242880);

        if (!in_array($file['type'], $allowedTypes)) {
            return Response::error('Only PDF, JPG, and PNG files are accepted', 422);
        }

        if ($file['size'] > $maxSize) {
            return Response::error('File size must not exceed ' . round($maxSize / 1048576, 1) . 'MB', 422);
        }

        // Validate MIME type matches extension
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];
        if (!in_array($ext, $allowedExts)) {
            return Response::error('Invalid file extension', 422);
        }

        // Save file
        $uploadDir = dirname(__DIR__, 2) . '/uploads/proofs/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = 'proof_' . $donationId . '_' . time() . '.' . $ext;
        $filePath = 'uploads/proofs/' . $fileName;
        $fullPath = dirname(__DIR__, 2) . '/' . $filePath;

        if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
            return Response::error('Failed to save proof document. Please try again.', 500);
        }

        // Get form fields
        $bankName = Helpers::sanitize($_POST['bank_name'] ?? '');
        $accountName = Helpers::sanitize($_POST['account_name'] ?? '');
        $transactionRef = Helpers::sanitize($_POST['transaction_reference'] ?? '');
        $notes = Helpers::sanitize($_POST['notes'] ?? '');

        if (empty($transactionRef)) {
            // Remove uploaded file if validation fails
            @unlink($fullPath);
            return Response::error('Transaction reference from your bank is required', 422);
        }

        $proofData = [
            'donation_id' => $donationId,
            'file_name' => $file['name'],
            'file_path' => $filePath,
            'file_type' => $file['type'],
            'file_size' => $file['size'],
            'bank_name' => $bankName,
            'account_name' => $accountName,
            'transaction_reference' => $transactionRef,
            'notes' => $notes,
        ];

        $this->proofModel->create($proofData);

        // Notify donor
        try {
            Helpers::createNotification(
                $authUser['user_id'],
                'Proof Submitted',
                'Your proof of payment for contribution ' . $donation['reference'] . ' has been submitted and is awaiting admin verification.',
                'info',
                '/donor/donations'
            );
        } catch (\Throwable $e) {
            error_log('Notification error: ' . $e->getMessage());
        }

        try {
            Helpers::logActivity($authUser['user_id'], 'proof_submitted', "Proof submitted for bank transfer {$donation['reference']}");
        } catch (\Throwable $e) {
            error_log('Activity log error: ' . $e->getMessage());
        }

        $updatedDonation = $this->donationModel->findById($donationId);

        return Response::success(['donation' => $updatedDonation], 'Proof of payment submitted successfully. An administrator will verify your transfer shortly.');
    }

    /**
     * Admin: List all pending bank transfer verifications.
     */
    public function pendingVerifications(array $params)
    {
        $page = (int)($_GET['page'] ?? 1);
        $perPage = (int)($_GET['per_page'] ?? 10);

        $db = \App\Core\Database::getInstance();

        $total = $db->fetch(
            "SELECT COUNT(*) as total FROM donations d WHERE d.payment_method = 'bank_transfer' AND d.status = 'pending_verification'"
        )['total'] ?? 0;

        $offset = ($page - 1) * $perPage;
        $data = $db->fetchAll(
            "SELECT d.*, u.first_name as donor_first_name, u.last_name as donor_last_name, u.email as donor_email,
                    c.title as campaign_title,
                    p.file_name, p.file_path, p.bank_name as proof_bank_name, p.account_name as proof_account_name,
                    p.transaction_reference as proof_transaction_ref, p.notes as proof_notes, p.created_at as proof_submitted_at
             FROM donations d
             JOIN users u ON d.donor_id = u.id
             LEFT JOIN campaigns c ON d.campaign_id = c.id
             LEFT JOIN bank_transfer_proofs p ON d.id = p.donation_id
             WHERE d.payment_method = 'bank_transfer' AND d.status = 'pending_verification'
             ORDER BY d.created_at ASC
             LIMIT ? OFFSET ?",
            [$perPage, $offset]
        );

        return Response::paginated($data, (int)$total, $page, $perPage);
    }

    /**
     * Admin: Verify (approve) a bank transfer donation.
     */
    public function verifyTransfer(array $params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $donationId = $params['id'] ?? null;

        if (!$donationId) {
            return Response::error('Donation ID is required', 400);
        }

        $donation = $this->donationModel->findById($donationId);
        if (!$donation) {
            return Response::notFound('Contribution record not found');
        }

        if ($donation['payment_method'] !== 'bank_transfer') {
            return Response::error('Only bank transfer contributions can be verified here', 400);
        }

        if ($donation['status'] !== 'pending_verification') {
            return Response::error('Only pending contributions can be verified', 400);
        }

        // Check proof exists
        $proof = $this->proofModel->findByDonationId((int)$donationId);
        if (!$proof) {
            return Response::error('No proof of payment has been submitted for this contribution', 400);
        }

        // Mark donation as completed
        $this->donationModel->updateStatus($donation['id'], 'completed');

        // Update payment record
        $payment = $this->paymentModel->findByDonationId($donation['id']);
        if ($payment) {
            $this->paymentModel->updateStatusByDonationId(
                $donation['id'],
                'success',
                json_encode(['proof_id' => $proof['id'], 'transaction_reference' => $proof['transaction_reference'], 'verified_by' => $authUser['user_id']]),
                $proof['transaction_reference']
            );
            // Set verification tracking
            $db = \App\Core\Database::getInstance();
            $db->update("UPDATE payments SET verified_by = ?, verified_at = NOW() WHERE donation_id = ?", [$authUser['user_id'], $donation['id']]);
        }

        // Update campaign raised amount
        if ($donation['campaign_id']) {
            $campaignModel = new Campaign();
            $campaignModel->updateRaisedAmount($donation['campaign_id'], $donation['amount']);
        }

        // Update student request funding
        if ($donation['request_id']) {
            $requestModel = new StudentRequest();
            $request = $requestModel->findById($donation['request_id']);
            if ($request) {
                $newFunded = $request['amount_funded'] + $donation['amount'];
                $requestModel->update($donation['request_id'], ['amount_funded' => $newFunded]);

                try {
                    Helpers::createNotification(
                        $request['user_id'],
                        'Funding Received',
                        'Your request "' . $request['title'] . '" has received NGN ' . number_format($donation['amount'], 2) . ' in funding.',
                        'success',
                        '/student/requests'
                    );
                } catch (\Throwable $e) {
                    error_log('Student notification error: ' . $e->getMessage());
                }

                if ($newFunded >= $request['amount_needed']) {
                    $requestModel->updateStatus($donation['request_id'], 'funded', null, 'Fully funded through contributions');
                    try {
                        Helpers::createNotification(
                            $request['user_id'],
                            'Request Fully Funded',
                            'Your assistance request "' . $request['title'] . '" has been fully funded!',
                            'success',
                            '/student/requests'
                        );
                    } catch (\Throwable $e) {
                        error_log('Student notification error: ' . $e->getMessage());
                    }
                    try {
                        Mailer::sendRequestStatusEmail($request['email'], $request['first_name'], 'Funded', $request['title']);
                    } catch (\Throwable $e) {
                        error_log('Student email error: ' . $e->getMessage());
                    }
                }
            }
        }

        // Notify donor
        try {
            Helpers::createNotification(
                $donation['donor_id'],
                'Contribution Verified',
                'Your bank transfer contribution of NGN ' . number_format($donation['amount'], 2) . ' has been verified and recorded.',
                'success',
                '/donor/donations'
            );
        } catch (\Throwable $e) {
            error_log('Notification error: ' . $e->getMessage());
        }

        // Send donor confirmation email
        $userModel = new \App\Models\User();
        $donor = $userModel->findById($donation['donor_id']);
        if ($donor) {
            $campaignTitle = 'General Fund';
            if ($donation['campaign_id']) {
                $campaign = (new Campaign())->findById($donation['campaign_id']);
                $campaignTitle = $campaign['title'] ?? 'General Fund';
            }
            try {
                Mailer::sendDonationConfirmation($donor['email'], $donor['first_name'], $donation['amount'], $campaignTitle);
            } catch (\Throwable $e) {
                error_log('Donation email error: ' . $e->getMessage());
            }
        }

        try {
            Helpers::logActivity($authUser['user_id'], 'bank_transfer_verified', "Bank transfer {$donation['reference']} verified and approved");
        } catch (\Throwable $e) {
            error_log('Activity log error: ' . $e->getMessage());
        }

        $updatedDonation = $this->donationModel->findById($donation['id']);
        return Response::success(['donation' => $updatedDonation], 'Bank transfer verified and contribution recorded');
    }

    /**
     * Admin: Reject a bank transfer donation.
     */
    public function rejectTransfer(array $params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $donationId = $params['id'] ?? null;
        $input = $GLOBALS['request_body'] ?? [];
        $input = Helpers::sanitize($input);

        if (!$donationId) {
            return Response::error('Donation ID is required', 400);
        }

        $donation = $this->donationModel->findById($donationId);
        if (!$donation) {
            return Response::notFound('Contribution record not found');
        }

        if ($donation['payment_method'] !== 'bank_transfer') {
            return Response::error('Only bank transfer contributions can be rejected here', 400);
        }

        if ($donation['status'] !== 'pending_verification') {
            return Response::error('Only pending contributions can be rejected', 400);
        }

        $reason = $input['reason'] ?? 'Verification failed';

        // Mark donation as failed
        $this->donationModel->updateStatus($donation['id'], 'failed');

        // Update payment record
        $payment = $this->paymentModel->findByDonationId($donation['id']);
        if ($payment) {
            $this->paymentModel->updateStatusByDonationId(
                $donation['id'],
                'failed',
                json_encode(['rejected_by' => $authUser['user_id'], 'reason' => $reason])
            );
        }

        // Notify donor
        try {
            Helpers::createNotification(
                $donation['donor_id'],
                'Contribution Rejected',
                'Your bank transfer contribution of NGN ' . number_format($donation['amount'], 2) . ' could not be verified. Reason: ' . $reason,
                'error',
                '/donor/donations'
            );
        } catch (\Throwable $e) {
            error_log('Notification error: ' . $e->getMessage());
        }

        try {
            Helpers::logActivity($authUser['user_id'], 'bank_transfer_rejected', "Bank transfer {$donation['reference']} rejected: {$reason}");
        } catch (\Throwable $e) {
            error_log('Activity log error: ' . $e->getMessage());
        }

        return Response::success([], 'Bank transfer contribution rejected');
    }

    /**
     * Get bank account details for the frontend.
     */
    public function getBankDetails(array $params)
    {
        $db = \App\Core\Database::getInstance();
        $bankSettings = $db->fetchAll("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('bank_name', 'bank_account_number', 'bank_account_name', 'bank_sort_code')");
        $settingsMap = [];
        foreach ($bankSettings as $row) {
            $settingsMap[$row['setting_key']] = $row['setting_value'];
        }

        return Response::success([
            'bank_name' => $settingsMap['bank_name'] ?? 'First Bank of Nigeria',
            'account_number' => $settingsMap['bank_account_number'] ?? '2031234567',
            'account_name' => $settingsMap['bank_account_name'] ?? 'CampusFund Educational Support',
            'sort_code' => $settingsMap['bank_sort_code'] ?? '011151003',
        ]);
    }
}
