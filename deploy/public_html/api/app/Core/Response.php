<?php

namespace App\Core;

class Response
{
    public static function json(array $data, int $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(array $data = [], string $message = 'Success', int $statusCode = 200)
    {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public static function error(string $message = 'Error', int $statusCode = 400, array $errors = [])
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        self::json($response, $statusCode);
    }

    public static function unauthorized($message = 'Authentication is required')
    {
        self::error($message, 401);
    }

    public static function forbidden($message = 'Access denied')
    {
        self::error($message, 403);
    }

    public static function notFound($message = 'The requested resource was not found')
    {
        self::error($message, 404);
    }

    public static function serverError($message = 'An internal error occurred. Please try again later.')
    {
        self::error($message, 500);
    }

    public static function paginated(array $data, int $total, int $page, int $perPage, string $message = 'Retrieved successfully')
    {
        $totalPages = ceil($total / $perPage);
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'total_pages' => $totalPages,
                'has_next' => $page < $totalPages,
                'has_prev' => $page > 1,
            ],
        ], 200);
    }
}
