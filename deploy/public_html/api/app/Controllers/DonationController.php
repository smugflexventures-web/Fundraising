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
    private $donationModel;
    private $paymentModel;

    public function __construct()
    {
        $this->donationModel = new Donation();
        $this->paymentModel = new Payment();
    }

    public function index($params)
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

    public function show($params)
    {
        $id = $params['id'] ?? null;
        if (!$id) {
            return Response::error('Donation ID is required', 400);
        }

        $donation = $this->donationModel->findById($id);
        if (!$donation) {
            return Response::notFound('Donation not found');
        }

        return Response::success(['donation' => $donation]);
    }

    public function initialize($params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $input = Helpers::sanitize($input);

        $validator = new Validator($input);
        $validator->validate([
            'amount' => 'required|numeric|min_value:1000',
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed', 422, $validator->getErrors());
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
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $paystackResponse = json_decode($response, true);

        if ($httpCode === 200 && ($paystackResponse['status'] ?? false)) {
            return Response::success([
                'authorization_url' => $paystackResponse['data']['authorization_url'],
                'reference' => $reference,
                'donation_id' => $donationId,
                'public_key' => $paystackPublicKey,
            ], 'Payment initialized');
        }

        return Response::error('Failed to initialize payment. Please try again.', 500);
    }

    public function verify($params)
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $reference = $input['reference'] ?? $_GET['reference'] ?? null;

        if (!$reference) {
            return Response::error('Reference is required', 400);
        }

        $donation = $this->donationModel->findByReference($reference);
        if (!$donation) {
            return Response::notFound('Donation not found');
        }

        $paystackSecretKey = Config::get('PAYSTACK_SECRET_KEY', '');

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.paystack.co/transaction/verify/' . $reference);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $paystackSecretKey,
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        curl_close($ch);

        $paystackResponse = json_decode($response, true);

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
                        if ($newFunded >= $request['amount_needed']) {
                            $requestModel->updateStatus($donation['request_id'], 'funded', null, 'Fully funded through donations');
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
                    Mailer::sendDonationConfirmation($donor['email'], $donor['first_name'], $donation['amount'], $campaignTitle);
                }

                Helpers::createNotification(
                    $donation['donor_id'],
                    'Donation Successful',
                    'Your donation of ₦' . number_format($donation['amount'], 2) . ' was successful. Thank you!',
                    'success',
                    '/donor/donations'
                );

                Helpers::logActivity($donation['donor_id'], 'donation_completed', "Donation {$reference} completed");

                $updatedDonation = $this->donationModel->findById($donation['id']);
                return Response::success(['donation' => $updatedDonation], 'Payment verified and donation completed');
            } else {
                $this->donationModel->updateStatus($donation['id'], 'failed');
                $this->paymentModel->updateStatusByDonationId($donation['id'], 'failed', json_encode($paystackData));

                return Response::error('Payment was not successful', 400);
            }
        }

        return Response::error('Unable to verify payment', 500);
    }

    public function history($params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $page = (int)($_GET['page'] ?? 1);
        $perPage = (int)($_GET['per_page'] ?? 10);

        $result = $this->donationModel->getByDonorId($authUser['user_id'], $page, $perPage);

        return Response::paginated($result['data'], $result['total'], $page, $perPage);
    }
}
