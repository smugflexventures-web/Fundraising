<?php

namespace App\Controllers;

use App\Models\StudentRequest;
use App\Helpers\Validator;
use App\Helpers\FileUpload;
use App\Helpers\Helpers;
use App\Helpers\Mailer;
use App\Core\Response;

class StudentRequestController
{
    private StudentRequest $requestModel;

    public function __construct()
    {
        $this->requestModel = new StudentRequest();
    }

    public function studentStats($params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        if (!$authUser || ($authUser['role'] ?? '') !== 'student') {
            return Response::forbidden('Only students can access this endpoint');
        }

        $userId = $authUser['user_id'];
        $db = \App\Core\Database::getInstance();

        $total = $db->fetch(
            "SELECT COUNT(*) as count FROM student_requests WHERE user_id = ?",
            [$userId]
        )['count'] ?? 0;

        $pending = $db->fetch(
            "SELECT COUNT(*) as count FROM student_requests WHERE user_id = ? AND status = ?",
            [$userId, 'pending']
        )['count'] ?? 0;

        $approved = $db->fetch(
            "SELECT COUNT(*) as count FROM student_requests WHERE user_id = ? AND status = ?",
            [$userId, 'approved']
        )['count'] ?? 0;

        $funded = $db->fetch(
            "SELECT COUNT(*) as count FROM student_requests WHERE user_id = ? AND status = ?",
            [$userId, 'funded']
        )['count'] ?? 0;

        $totalRequested = $db->fetch(
            "SELECT COALESCE(SUM(amount_needed), 0) as total FROM student_requests WHERE user_id = ?",
            [$userId]
        )['total'] ?? 0;

        $totalFunded = $db->fetch(
            "SELECT COALESCE(SUM(amount_funded), 0) as total FROM student_requests WHERE user_id = ?",
            [$userId]
        )['total'] ?? 0;

        return Response::success([
            'total' => (int)$total,
            'pending' => (int)$pending,
            'approved' => (int)$approved,
            'funded' => (int)$funded,
            'total_requested' => (float)$totalRequested,
            'total_funded' => (float)$totalFunded,
        ]);
    }

    public function index($params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $page = (int)($_GET['page'] ?? 1);
        $perPage = (int)($_GET['per_page'] ?? 10);
        $status = $_GET['status'] ?? null;
        $category = $_GET['category'] ?? null;

        if (($authUser['role'] ?? '') === 'student') {
            $result = $this->requestModel->getByUserId($authUser['user_id'], $page, $perPage);
        } else {
            $result = $this->requestModel->getAll($status, $page, $perPage, $category);
        }

        return Response::paginated(
            $result['data'],
            $result['total'],
            $page,
            $perPage
        );
    }

    public function show(array $params)
    {
        $id = $params['id'] ?? null;
        if (!$id) {
            return Response::error('Assistance request ID is required', 400);
        }

        $request = $this->requestModel->findById($id);
        if (!$request) {
            return Response::notFound('Assistance request not found');
        }

        $request['documents'] = $this->requestModel->getDocuments($id);

        return Response::success(['request' => $request]);
    }

    public function store($params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $input = array_map(function ($val) {
            return is_string($val) ? Helpers::sanitize($val) : $val;
        }, $_POST);

        $validator = new Validator($input);
        $validator->validate([
            'title' => 'required|min:5|max:255',
            'description' => 'required|min:20',
            'amount_needed' => 'required|numeric|min_value:1000',
            'category' => 'required|in:tuition,housing,medical,feeding,books,emergency,other',
            'priority' => 'in:low,medium,high,critical',
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed', 422, $validator->getErrors());
        }

        $requestData = [
            'user_id' => $authUser['user_id'],
            'title' => $input['title'],
            'description' => $input['description'],
            'amount_needed' => (float)$input['amount_needed'],
            'category' => $input['category'],
            'priority' => $input['priority'] ?? 'medium',
        ];

        $requestId = $this->requestModel->create($requestData);

        if (!$requestId) {
            return Response::error('The request could not be created at this time', 500);
        }

        if (!empty($_FILES['documents'])) {
            $uploader = new FileUpload();
            $result = $uploader->uploadMultiple($_FILES['documents'], "requests/{$requestId}/");

            if ($result['success'] && !empty($result['files'])) {
                foreach ($result['files'] as $file) {
                    $this->requestModel->addDocument($requestId, $file);
                }
            }
        }

        $request = $this->requestModel->findById($requestId);

        try {
            Helpers::createNotification(
                $authUser['user_id'],
                'Request Submitted',
                'Your assistance request "' . $input['title'] . '" has been submitted and is pending administrative review.',
                'info',
                '/student/requests'
            );
        } catch (\Throwable $e) {
            error_log('Notification error: ' . $e->getMessage());
        }

        try {
            Helpers::logActivity($authUser['user_id'], 'create_request', 'Created request: ' . $input['title']);
        } catch (\Throwable $e) {
            error_log('Activity log error: ' . $e->getMessage());
        }

        return Response::success(['request' => $request], 'Assistance request submitted', 201);
    }

    public function update(array $params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;
        $input = $GLOBALS['request_body'] ?? [];
        $input = Helpers::sanitize($input);

        if (!$id) {
            return Response::error('Assistance request ID is required', 400);
        }

        $request = $this->requestModel->findById($id);
        if (!$request) {
            return Response::notFound('Assistance request not found');
        }

        if (($authUser['role'] ?? '') === 'student' && $request['user_id'] !== $authUser['user_id']) {
            return Response::forbidden('You may only update your own requests');
        }

        if (($authUser['role'] ?? '') === 'student' && $request['status'] !== 'pending') {
            return Response::error('Only pending requests can be modified', 400);
        }

        $this->requestModel->update($id, $input);
        $request = $this->requestModel->findById($id);

        try {
            Helpers::logActivity($authUser['user_id'], 'update_request', 'Updated request ID: ' . $id);
        } catch (\Throwable $e) {
            error_log('Activity log error: ' . $e->getMessage());
        }

        return Response::success(['request' => $request], 'Request updated');
    }

    public function updateStatus(array $params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;
        $input = $GLOBALS['request_body'] ?? [];
        $input = Helpers::sanitize($input);

        $validator = new Validator($input);
        $validator->validate([
            'status' => 'required|in:approved,rejected,funded',
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed', 422, $validator->getErrors());
        }

        $request = $this->requestModel->findById($id);
        if (!$request) {
            return Response::notFound('Assistance request not found');
        }

        $this->requestModel->updateStatus($id, $input['status'], $authUser['user_id'], $input['notes'] ?? null);

        if ($input['status'] === 'funded') {
            $this->requestModel->update($id, ['amount_funded' => $request['amount_needed']]);
        }

        $updatedRequest = $this->requestModel->findById($id);

        try {
            Mailer::sendRequestStatusEmail(
                $request['email'],
                $request['first_name'],
                ucfirst($input['status']),
                $request['title']
            );
        } catch (\Throwable $e) {
            error_log('Status email error: ' . $e->getMessage());
        }

        try {
            Helpers::createNotification(
                $request['user_id'],
                'Request ' . ucfirst($input['status']),
                'Your assistance request "' . $request['title'] . '" has been ' . $input['status'] . '.',
                $input['status'] === 'approved' || $input['status'] === 'funded' ? 'success' : 'warning',
                '/student/requests'
            );
        } catch (\Throwable $e) {
            error_log('Notification error: ' . $e->getMessage());
        }

        try {
            Helpers::logActivity($authUser['user_id'], 'update_request_status', "Request {$id} status changed to {$input['status']}");
        } catch (\Throwable $e) {
            error_log('Activity log error: ' . $e->getMessage());
        }

        return Response::success(['request' => $updatedRequest], 'Request status updated');
    }

    public function destroy(array $params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;

        if (!$id) {
            return Response::error('Assistance request ID is required', 400);
        }

        $request = $this->requestModel->findById($id);
        if (!$request) {
            return Response::notFound('Assistance request not found');
        }

        if (($authUser['role'] ?? '') === 'student' && $request['user_id'] !== $authUser['user_id']) {
            return Response::forbidden('You may only delete your own requests');
        }

        $this->requestModel->delete($id);

        try {
            Helpers::logActivity($authUser['user_id'], 'delete_request', 'Deleted request ID: ' . $id);
        } catch (\Throwable $e) {
            error_log('Activity log error: ' . $e->getMessage());
        }

        return Response::success([], 'Request deleted successfully');
    }

    public function uploadDocuments(array $params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;

        if (!$id) {
            return Response::error('Assistance request ID is required', 400);
        }

        $request = $this->requestModel->findById($id);
        if (!$request) {
            return Response::notFound('Assistance request not found');
        }

        if (empty($_FILES['documents'])) {
            return Response::error('No files uploaded', 400);
        }

        $uploader = new FileUpload();
        $result = $uploader->uploadMultiple($_FILES['documents'], "requests/{$id}/");

        $uploadedDocs = [];
        if ($result['success'] && !empty($result['files'])) {
            foreach ($result['files'] as $file) {
                $docId = $this->requestModel->addDocument($id, $file);
                $uploadedDocs[] = $file;
            }
        }

        try {
            Helpers::logActivity($authUser['user_id'], 'upload_documents', "Uploaded documents for request {$id}");
        } catch (\Throwable $e) {
            error_log('Activity log error: ' . $e->getMessage());
        }

        return Response::success(['documents' => $uploadedDocs], 'Documents uploaded successfully');
    }
}
