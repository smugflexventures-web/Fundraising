<?php

namespace App\Controllers;

use App\Models\Donation;
use App\Models\Payment;
use App\Models\Campaign;
use App\Models\StudentRequest;
use App\Helpers\Validator;
use App\Helpers\Helpers;
use App\Helpers\Mailer;
use App\Core\Config;
use App\Core\Response;

class DonationController
{
    private Donation $donationModel;
    private Payment $paymentModel;

    public function __construct()
    {
        $this->donationModel = new Donation();
        $this->paymentModel = new Payment();
    }

    public function index(array $params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $page = (int)($_GET['page'] ?? 1);
        $perPage = (int)($_GET['per_page'] ?? 10);
        $status = $_GET['status'] ?? null;

        if (($authUser['role'] ?? '') === 'donor') {
            $result = $this->donationModel->getByDonorId($authUser['user_id'], $page, $perPage);
        } else {
            $result = $this->donationModel->getAll($status, $page, $perPage);
        }

        return Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    public function show(array $params)
    {
        $id = $params['id'] ?? null;
        if (!$id) {
            return Response::error('Contribution ID is required', 400);
        }

        $donation = $this->donationModel->findById($id);
        if (!$donation) {
            return Response::notFound('Contribution record not found');
        }

        return Response::success(['donation' => $donation]);
    }

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

        // Validate request_id if provided — only approved requests accept donations
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

        $reference = Helpers::generateReference('DON');

        $donationData = [
            'donor_id' => $authUser['user_id'],
            'campaign_id' => $input['campaign_id'] ?? null,
            'request_id' => $input['request_id'] ?? null,
            'amount' => (float)$input['amount'],
            'reference' => $reference,
            'message' => $input['message'] ?? null,
            'is_anonymous' => $input['is_anonymous'] ?? false,
            'status' => 'pending',
            'payment_method' => 'paystack',
        ];

        $donationId = $this->donationModel->create($donationData);

        $paymentData = [
            'donation_id' => $donationId,
            'provider' => 'paystack',
            'amount' => (float)$input['amount'],
            'currency' => 'NGN',
            'status' => 'initialized',
        ];

        $this->paymentModel->create($paymentData);

        $paystackPublicKey = Config::get('PAYSTACK_PUBLIC_KEY', '');
        $paystackSecretKey = Config::get('PAYSTACK_SECRET_KEY', '');

        $initializeData = [
            'email' => $authUser['email'],
            'amount' => (float)$input['amount'] * 100,
            'reference' => $reference,
            'callback_url' => Config::get('APP_URL', 'http://localhost:5173') . '/donation/verify',
            'metadata' => json_encode([
                'donation_id' => $donationId,
                'donor_id' => $authUser['user_id'],
                'campaign_id' => $input['campaign_id'] ?? null,
            ]),
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.paystack.co/transaction/initialize');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($initializeData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $paystackSecretKey,
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        // curl_close deprecated in PHP 8.5; handles auto-close on scope exit

        $paystackResponse = json_decode($response, true);

        if ($curlError) {
            return Response::error('Payment service is currently unavailable. Please try again later.', 503);
        }

        if ($httpCode === 200 && ($paystackResponse['status'] ?? false)) {
            return Response::success([
                'authorization_url' => $paystackResponse['data']['authorization_url'],
                'reference' => $reference,
                'donation_id' => $donationId,
                'public_key' => $paystackPublicKey,
            ], 'Payment initialized');
        }

        return Response::error('Payment could not be initialized at this time. Please try again.', 500);
    }

    public function verify(array $params)
    {
        $input = $GLOBALS['request_body'] ?? [];
        $reference = $input['reference'] ?? $_GET['reference'] ?? null;

        if (!$reference) {
            return Response::error('Reference is required', 400);
        }

        $donation = $this->donationModel->findByReference($reference);
        if (!$donation) {
            return Response::notFound('Contribution record not found');
        }

        if ($donation['status'] === 'completed') {
            return Response::success(['donation' => $donation], 'This payment has already been verified');
        }

        $paystackSecretKey = Config::get('PAYSTACK_SECRET_KEY', '');

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.paystack.co/transaction/verify/' . $reference);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $paystackSecretKey,
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        // curl_close deprecated in PHP 8.5; handles auto-close on scope exit

        $paystackResponse = json_decode($response, true);

        if ($curlError) {
            return Response::error('An unexpected error occurred while verifying your payment. Please try again later.', 503);
        }

        if ($paystackResponse['status'] ?? false) {
            $paystackData = $paystackResponse['data'];

            if ($paystackData['status'] === 'success') {
                $this->donationModel->updateStatus($donation['id'], 'completed');

                $payment = $this->paymentModel->findByDonationId($donation['id']);
                if ($payment) {
                    $this->paymentModel->updateStatusByDonationId(
                        $donation['id'],
                        'success',
                        json_encode($paystackData),
                        $paystackData['id'] ?? null
                    );
                }

                if ($donation['campaign_id']) {
                    $campaignModel = new Campaign();
                    $campaignModel->updateRaisedAmount($donation['campaign_id'], $donation['amount']);
                }

                if ($donation['request_id']) {
                    $requestModel = new StudentRequest();
                    $request = $requestModel->findById($donation['request_id']);
                    if ($request) {
                        $newFunded = $request['amount_funded'] + $donation['amount'];
                        $requestModel->update($donation['request_id'], ['amount_funded' => $newFunded]);

                        // Notify student about the funding progress
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

                            // Notify student that request is fully funded
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
                                Mailer::sendRequestStatusEmail(
                                    $request['email'],
                                    $request['first_name'],
                                    'Funded',
                                    $request['title']
                                );
                            } catch (\Throwable $e) {
                                error_log('Student email error: ' . $e->getMessage());
                            }
                        }
                    }
                }

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
                        error_log('Donation confirmation email error: ' . $e->getMessage());
                    }
                }

                try {
                    Helpers::createNotification(
                        $donation['donor_id'],
                        'Contribution Processed',
                        'Your contribution of NGN ' . number_format($donation['amount'], 2) . ' has been processed and recorded.',
                        'success',
                        '/donor/donations'
                    );
                } catch (\Throwable $e) {
                    error_log('Notification error: ' . $e->getMessage());
                }

                try {
                    Helpers::logActivity($donation['donor_id'], 'donation_completed', "Contribution {$reference} completed");
                } catch (\Throwable $e) {
                    error_log('Activity log error: ' . $e->getMessage());
                }

                $updatedDonation = $this->donationModel->findById($donation['id']);
                return Response::success(['donation' => $updatedDonation], 'Payment verified and contribution recorded');
            } else {
                $this->donationModel->updateStatus($donation['id'], 'failed');
                $this->paymentModel->updateStatusByDonationId($donation['id'], 'failed', json_encode($paystackData));

                return Response::error('The payment was not completed successfully', 400);
            }
        }

        return Response::error('Payment verification could not be completed at this time', 500);
    }

    public function history(array $params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $page = (int)($_GET['page'] ?? 1);
        $perPage = (int)($_GET['per_page'] ?? 10);

        $result = $this->donationModel->getByDonorId($authUser['user_id'], $page, $perPage);

        return Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    public function donorStats(array $params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        if (!$authUser || ($authUser['role'] ?? '') !== 'donor') {
            return Response::forbidden('Only donors can access this endpoint');
        }

        $donorId = $authUser['user_id'];
        $db = \App\Core\Database::getInstance();

        $totalDonated = $db->fetch(
            "SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE donor_id = ? AND status = 'completed'",
            [$donorId]
        )['total'] ?? 0;

        $donationCount = $db->fetch(
            "SELECT COUNT(*) as count FROM donations WHERE donor_id = ? AND status = 'completed'",
            [$donorId]
        )['count'] ?? 0;

        $campaignsSupported = $db->fetch(
            "SELECT COUNT(DISTINCT campaign_id) as count FROM donations WHERE donor_id = ? AND campaign_id IS NOT NULL AND status = 'completed'",
            [$donorId]
        )['count'] ?? 0;

        $pendingAmount = $db->fetch(
            "SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE donor_id = ? AND status IN ('pending', 'pending_verification')",
            [$donorId]
        )['total'] ?? 0;

        return Response::success([
            'total_donated' => (float)$totalDonated,
            'donation_count' => (int)$donationCount,
            'campaigns_supported' => (int)$campaignsSupported,
            'pending_amount' => (float)$pendingAmount,
        ]);
    }
}
