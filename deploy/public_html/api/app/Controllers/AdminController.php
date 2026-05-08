<?php

namespace App\Controllers;

use App\Models\User;
use App\Models\StudentRequest;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\ActivityLog;
use App\Helpers\Helpers;
use App\Core\Response;

class AdminController
{
    private $userModel;
    private $requestModel;
    private $campaignModel;
    private $donationModel;

    public function __construct()
    {
        $this->userModel = new User();
        $this->requestModel = new StudentRequest();
        $this->campaignModel = new Campaign();
        $this->donationModel = new Donation();
    }

    public function stats($params)
    {
        $totalStudents = $this->userModel->countByRole('student');
        $totalDonors = $this->userModel->countByRole('donor');
        $totalDonations = $this->donationModel->getTotalDonations();
        $totalDonationCount = $this->donationModel->countByStatus('completed');
        $totalRequests = $this->requestModel->countAll();
        $pendingRequests = $this->requestModel->countByStatus('pending');
        $approvedRequests = $this->requestModel->countByStatus('approved');
        $fundedRequests = $this->requestModel->countByStatus('funded');
        $totalRequested = $this->requestModel->getTotalRequested();
        $totalFunded = $this->requestModel->getTotalFunded();
        $totalCampaigns = $this->campaignModel->countAll();
        $activeCampaigns = $this->campaignModel->countByStatus('active');
        $totalTarget = $this->campaignModel->getTotalTarget();
        $totalRaised = $this->campaignModel->getTotalRaised();
        $monthlyDonations = $this->donationModel->getMonthlyDonations();
        $recentDonations = $this->donationModel->getRecentDonations(5);
        $requestsByCategory = $this->requestModel->getByCategory();

        return Response::success([
            'users' => [
                'total_students' => $totalStudents,
                'total_donors' => $totalDonors,
            ],
            'donations' => [
                'total_amount' => (float)$totalDonations,
                'total_count' => $totalDonationCount,
                'monthly' => $monthlyDonations,
            ],
            'requests' => [
                'total' => $totalRequests,
                'pending' => $pendingRequests,
                'approved' => $approvedRequests,
                'funded' => $fundedRequests,
                'total_requested' => (float)$totalRequested,
                'total_funded' => (float)$totalFunded,
                'by_category' => $requestsByCategory,
            ],
            'campaigns' => [
                'total' => $totalCampaigns,
                'active' => $activeCampaigns,
                'total_target' => (float)$totalTarget,
                'total_raised' => (float)$totalRaised,
            ],
            'recent_donations' => $recentDonations,
        ]);
    }

    public function users($params)
    {
        $page = (int)($_GET['page'] ?? 1);
        $perPage = (int)($_GET['per_page'] ?? 10);
        $role = $_GET['role'] ?? null;
        $search = $_GET['search'] ?? null;

        $result = $this->userModel->getAll($role, $page, $perPage, $search);

        return Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    public function verifyUser($params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;

        if (!$id) {
            return Response::error('User ID is required', 400);
        }

        $user = $this->userModel->findById($id);
        if (!$user) {
            return Response::notFound('User not found');
        }

        $this->userModel->verifyEmail($id);

        Helpers::createNotification($id, 'Account Verified', 'Your account has been verified by the administrator.', 'success');
        Helpers::logActivity($authUser['user_id'], 'verify_user', "Verified user {$id}");

        return Response::success([], 'User verified successfully');
    }

    public function toggleUserStatus($params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;

        if (!$id) {
            return Response::error('User ID is required', 400);
        }

        $user = $this->userModel->findById($id);
        if (!$user) {
            return Response::notFound('User not found');
        }

        $newStatus = !$user['is_active'];
        $this->userModel->update($id, ['is_active' => $newStatus]);

        Helpers::logActivity($authUser['user_id'], 'toggle_user_status', "User {$id} status changed to " . ($newStatus ? 'active' : 'inactive'));

        return Response::success([], 'User status updated successfully');
    }

    public function deleteUser($params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;

        if (!$id) {
            return Response::error('User ID is required', 400);
        }

        if ($id == $authUser['user_id']) {
            return Response::error('Cannot delete your own account', 400);
        }

        $this->userModel->delete($id);
        Helpers::logActivity($authUser['user_id'], 'delete_user', "Deleted user {$id}");

        return Response::success([], 'User deleted successfully');
    }

    public function activityLogs($params)
    {
        $page = (int)($_GET['page'] ?? 1);
        $perPage = (int)($_GET['per_page'] ?? 20);

        $activityLog = new ActivityLog();
        $result = $activityLog->getAll($page, $perPage);

        return Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    public function reports($params)
    {
        $type = $_GET['type'] ?? 'donations';
        $format = $_GET['format'] ?? 'json';
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;

        $data = [];

        switch ($type) {
            case 'donations':
                $data = $this->getDonationsReport($startDate, $endDate);
                break;
            case 'students':
                $data = $this->getStudentsReport($startDate, $endDate);
                break;
            case 'campaigns':
                $data = $this->getCampaignsReport();
                break;
            default:
                return Response::error('Invalid report type', 400);
        }

        if ($format === 'csv') {
            return $this->exportCsv($data, $type);
        }

        return Response::success(['report' => $data]);
    }

    private function getDonationsReport($startDate, $endDate)
    {
        $where = ["d.status = 'completed'"];
        $params = [];

        if ($startDate) {
            $where[] = "d.created_at >= ?";
            $params[] = $startDate;
        }
        if ($endDate) {
            $where[] = "d.created_at <= ?";
            $params[] = $endDate . ' 23:59:59';
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);

        $db = \App\Core\Database::getInstance();
        return $db->fetchAll(
            "SELECT d.id, d.amount, d.created_at, d.is_anonymous,
                    u.first_name as donor_first_name, u.last_name as donor_last_name, u.email as donor_email,
                    c.title as campaign_title
             FROM donations d
             JOIN users u ON d.donor_id = u.id
             LEFT JOIN campaigns c ON d.campaign_id = c.id
             {$whereClause}
             ORDER BY d.created_at DESC",
            $params
        );
    }

    private function getStudentsReport($startDate, $endDate)
    {
        $where = [];
        $params = [];

        if ($startDate) {
            $where[] = "sr.created_at >= ?";
            $params[] = $startDate;
        }
        if ($endDate) {
            $where[] = "sr.created_at <= ?";
            $params[] = $endDate . ' 23:59:59';
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $db = \App\Core\Database::getInstance();
        return $db->fetchAll(
            "SELECT sr.id, sr.title, sr.amount_needed, sr.amount_funded, sr.category, sr.status, sr.priority, sr.created_at,
                    u.first_name, u.last_name, u.email, u.student_id, u.department
             FROM student_requests sr
             JOIN users u ON sr.user_id = u.id
             {$whereClause}
             ORDER BY sr.created_at DESC",
            $params
        );
    }

    private function getCampaignsReport()
    {
        $db = \App\Core\Database::getInstance();
        return $db->fetchAll(
            "SELECT c.id, c.title, c.target_amount, c.raised_amount, c.category, c.status, c.start_date, c.end_date,
                    u.first_name as creator_first_name, u.last_name as creator_last_name,
                    (SELECT COUNT(*) FROM donations WHERE campaign_id = c.id AND status = 'completed') as donation_count
             FROM campaigns c
             JOIN users u ON c.created_by = u.id
             ORDER BY c.created_at DESC"
        );
    }

    private function exportCsv($data, $type)
    {
        if (empty($data)) {
            return Response::error('No data to export', 404);
        }

        $filename = $type . '_report_' . date('Y-m-d') . '.csv';

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $output = fopen('php://output', 'w');

        fputcsv($output, array_keys($data[0]));

        foreach ($data as $row) {
            fputcsv($output, $row);
        }

        fclose($output);
        exit;
    }
}
