<?php

namespace App\Controllers;

use App\Models\Notification;
use App\Core\Response;

class NotificationController
{
    private Notification $notificationModel;

    public function __construct()
    {
        $this->notificationModel = new Notification();
    }

    public function index($params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $page = (int)($_GET['page'] ?? 1);
        $perPage = (int)($_GET['per_page'] ?? 10);

        $result = $this->notificationModel->getByUserId($authUser['user_id'], $page, $perPage);

        return Response::paginated($result['data'], $result['total'], $page, $perPage);
    }

    public function unreadCount($params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $count = $this->notificationModel->getUnreadCount($authUser['user_id']);

        return Response::success(['unread_count' => $count]);
    }

    public function markRead(array $params)
    {
        $id = $params['id'] ?? null;
        if (!$id) {
            return Response::error('Notification ID is required', 400);
        }

        $this->notificationModel->markAsRead($id);
        return Response::success([], 'Notification marked as read');
    }

    public function markAllRead($params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $this->notificationModel->markAllAsRead($authUser['user_id']);
        return Response::success([], 'All notifications marked as read');
    }

    public function destroy(array $params)
    {
        $id = $params['id'] ?? null;
        if (!$id) {
            return Response::error('Notification ID is required', 400);
        }

        $this->notificationModel->delete($id);
        return Response::success([], 'Notification removed');
    }
}
