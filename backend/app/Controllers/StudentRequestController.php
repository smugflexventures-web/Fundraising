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
    private $requestModel;

    public function __construct()
    {
        $this->requestModel = new StudentRequest();
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

    public function show($params)
    {
        $id = $params['id'] ?? null;
        if (!$id) {
            return Response::error('Request ID is required', 400);
        }

        $request = $this->requestModel->findById($id);
        if (!$request) {
            return Response::notFound('Request not found');
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
            return Response::error('Failed to create request', 500);
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

        Helpers::createNotification(
            $authUser['user_id'],
            'Request Submitted',
            'Your assistance request "' . $input['title'] . '" has been submitted and is pending review.',
            'info',
            '/student/requests'
        );

        Helpers::logActivity($authUser['user_id'], 'create_request', 'Created request: ' . $input['title']);

        return Response::success(['request' => $request], 'Request submitted successfully', 201);
    }

    public function update($params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $input = Helpers::sanitize($input);

        if (!$id) {
            return Response::error('Request ID is required', 400);
        }

        $request = $this->requestModel->findById($id);
        if (!$request) {
            return Response::notFound('Request not found');
        }

        if (($authUser['role'] ?? '') === 'student' && $request['user_id'] !== $authUser['user_id']) {
            return Response::forbidden('You can only update your own requests');
        }

        if (($authUser['role'] ?? '') === 'student' && $request['status'] !== 'pending') {
            return Response::error('Cannot update a request that is not pending', 400);
        }

        $this->requestModel->update($id, $input);
        $request = $this->requestModel->findById($id);

        Helpers::logActivity($authUser['user_id'], 'update_request', 'Updated request ID: ' . $id);

        return Response::success(['request' => $request], 'Request updated successfully');
    }

    public function updateStatus($params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
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
            return Response::notFound('Request not found');
        }

        $this->requestModel->updateStatus($id, $input['status'], $authUser['user_id'], $input['notes'] ?? null);

        if ($input['status'] === 'funded') {
            $this->requestModel->update($id, ['amount_funded' => $request['amount_needed']]);
        }

        $updatedRequest = $this->requestModel->findById($id);

        Mailer::sendRequestStatusEmail(
            $request['email'],
            $request['first_name'],
            ucfirst($input['status']),
            $request['title']
        );

        Helpers::createNotification(
            $request['user_id'],
            'Request ' . ucfirst($input['status']),
            'Your request "' . $request['title'] . '" has been ' . $input['status'] . '.',
            $input['status'] === 'approved' || $input['status'] === 'funded' ? 'success' : 'warning',
            '/student/requests'
        );

        Helpers::logActivity($authUser['user_id'], 'update_request_status', "Request {$id} status changed to {$input['status']}");

        return Response::success(['request' => $updatedRequest], 'Request status updated successfully');
    }

    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;

        if (!$id) {
            return Response::error('Request ID is required', 400);
        }

        $request = $this->requestModel->findById($id);
        if (!$request) {
            return Response::notFound('Request not found');
        }

        if (($authUser['role'] ?? '') === 'student' && $request['user_id'] !== $authUser['user_id']) {
            return Response::forbidden('You can only delete your own requests');
        }

        $this->requestModel->delete($id);

        Helpers::logActivity($authUser['user_id'], 'delete_request', 'Deleted request ID: ' . $id);

        return Response::success([], 'Request deleted successfully');
    }

    public function uploadDocuments($params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;

        if (!$id) {
            return Response::error('Request ID is required', 400);
        }

        $request = $this->requestModel->findById($id);
        if (!$request) {
            return Response::notFound('Request not found');
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

        Helpers::logActivity($authUser['user_id'], 'upload_documents', "Uploaded documents for request {$id}");

        return Response::success(['documents' => $uploadedDocs], 'Documents uploaded successfully');
    }
}
