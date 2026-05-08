<?php

namespace App\Controllers;

use App\Models\Campaign;
use App\Helpers\Validator;
use App\Helpers\FileUpload;
use App\Helpers\Helpers;
use App\Core\Response;

class CampaignController
{
    private $campaignModel;

    public function __construct()
    {
        $this->campaignModel = new Campaign();
    }

    public function index($params)
    {
        $page = (int)($_GET['page'] ?? 1);
        $perPage = (int)($_GET['per_page'] ?? 10);
        $category = $_GET['category'] ?? null;
        $status = $_GET['status'] ?? null;

        if ($status) {
            $result = $this->campaignModel->getAll($status, $page, $perPage);
        } else {
            $result = $this->campaignModel->getActive($page, $perPage, $category);
        }

        $campaigns = array_map(function ($campaign) {
            $campaign['progress'] = $campaign['target_amount'] > 0
                ? round(($campaign['raised_amount'] / $campaign['target_amount']) * 100, 1)
                : 0;
            return $campaign;
        }, $result['data']);

        return Response::paginated($campaigns, $result['total'], $page, $perPage);
    }

    public function show($params)
    {
        $id = $params['id'] ?? null;
        if (!$id) {
            return Response::error('Campaign ID is required', 400);
        }

        $campaign = $this->campaignModel->findById($id);
        if (!$campaign) {
            return Response::notFound('Campaign not found');
        }

        $campaign['progress'] = $campaign['target_amount'] > 0
            ? round(($campaign['raised_amount'] / $campaign['target_amount']) * 100, 1)
            : 0;

        $donationModel = new \App\Models\Donation();
        $campaign['donations'] = $donationModel->getByCampaign($id);
        $campaign['donors_count'] = count($campaign['donations']);

        return Response::success(['campaign' => $campaign]);
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
            'target_amount' => 'required|numeric|min_value:1000',
            'category' => 'required|in:tuition,housing,medical,feeding,books,emergency,general',
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed', 422, $validator->getErrors());
        }

        $campaignData = [
            'title' => $input['title'],
            'description' => $input['description'],
            'short_description' => $input['short_description'] ?? null,
            'target_amount' => (float)$input['target_amount'],
            'category' => $input['category'],
            'status' => $input['status'] ?? 'active',
            'start_date' => $input['start_date'] ?? null,
            'end_date' => $input['end_date'] ?? null,
            'created_by' => $authUser['user_id'],
            'is_featured' => isset($input['is_featured']) ? (bool)$input['is_featured'] : false,
        ];

        if (!empty($_FILES['image'])) {
            $uploader = new FileUpload();
            $result = $uploader->upload($_FILES['image'], 'campaigns/');
            if ($result['success']) {
                $campaignData['image'] = $result['file_path'];
            }
        }

        $campaignId = $this->campaignModel->create($campaignData);

        if (!$campaignId) {
            return Response::error('The campaign could not be created at this time', 500);
        }

        $campaign = $this->campaignModel->findById($campaignId);

        Helpers::logActivity($authUser['user_id'], 'create_campaign', 'Created campaign: ' . $input['title']);

        return Response::success(['campaign' => $campaign], 'Campaign created', 201);
    }

    public function update($params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $input = Helpers::sanitize($input);

        if (!$id) {
            return Response::error('Campaign ID is required', 400);
        }

        $campaign = $this->campaignModel->findById($id);
        if (!$campaign) {
            return Response::notFound('Campaign not found');
        }

        $this->campaignModel->update($id, $input);
        $campaign = $this->campaignModel->findById($id);

        Helpers::logActivity($authUser['user_id'], 'update_campaign', "Updated campaign {$id}");

        return Response::success(['campaign' => $campaign], 'Campaign updated');
    }

    public function updateWithImage($params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;
        $input = array_map(function ($val) {
            return is_string($val) ? Helpers::sanitize($val) : $val;
        }, $_POST);

        if (!$id) {
            return Response::error('Campaign ID is required', 400);
        }

        $campaign = $this->campaignModel->findById($id);
        if (!$campaign) {
            return Response::notFound('Campaign not found');
        }

        $updateData = [];
        $allowedFields = ['title', 'description', 'short_description', 'target_amount', 'category', 'status', 'start_date', 'end_date', 'is_featured'];

        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updateData[$field] = $input[$field];
            }
        }

        if (!empty($_FILES['image'])) {
            $uploader = new FileUpload();
            $result = $uploader->upload($_FILES['image'], 'campaigns/');
            if ($result['success']) {
                $updateData['image'] = $result['file_path'];
                if ($campaign['image']) {
                    $uploader->delete($campaign['image']);
                }
            }
        }

        $this->campaignModel->update($id, $updateData);
        $campaign = $this->campaignModel->findById($id);

        Helpers::logActivity($authUser['user_id'], 'update_campaign', "Updated campaign {$id}");

        return Response::success(['campaign' => $campaign], 'Campaign updated');
    }

    public function destroy($params)
    {
        $id = $params['id'] ?? null;
        $authUser = $GLOBALS['auth_user'] ?? null;

        if (!$id) {
            return Response::error('Campaign ID is required', 400);
        }

        $campaign = $this->campaignModel->findById($id);
        if (!$campaign) {
            return Response::notFound('Campaign not found');
        }

        if ($campaign['image']) {
            $uploader = new FileUpload();
            $uploader->delete($campaign['image']);
        }

        $this->campaignModel->delete($id);

        Helpers::logActivity($authUser['user_id'], 'delete_campaign', "Removed campaign {$id}");

        return Response::success([], 'Campaign removed');
    }

    public function featured($params)
    {
        $campaigns = $this->campaignModel->getFeatured();
        $campaigns = array_map(function ($campaign) {
            $campaign['progress'] = $campaign['target_amount'] > 0
                ? round(($campaign['raised_amount'] / $campaign['target_amount']) * 100, 1)
                : 0;
            return $campaign;
        }, $campaigns);

        return Response::success(['campaigns' => $campaigns]);
    }
}
