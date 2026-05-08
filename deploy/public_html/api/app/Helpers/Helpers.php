<?php

namespace App\Helpers;

class Helpers
{
    public static function sanitize($data)
    {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
    }

    public static function generateReference($prefix = 'REF')
    {
        return $prefix . '_' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 12));
    }

    public static function formatCurrency($amount, $symbol = 'NGN ')
    {
        return $symbol . number_format((float)$amount, 2);
    }

    public static function formatDate($date, $format = 'M d, Y')
    {
        return date($format, strtotime($date));
    }

    public static function timeAgo($datetime)
    {
        $now = new \DateTime();
        $ago = new \DateTime($datetime);
        $diff = $now->diff($ago);

        if ($diff->y > 0) return $diff->y . ' year' . ($diff->y > 1 ? 's' : '') . ' ago';
        if ($diff->m > 0) return $diff->m . ' month' . ($diff->m > 1 ? 's' : '') . ' ago';
        if ($diff->d > 0) return $diff->d . ' day' . ($diff->d > 1 ? 's' : '') . ' ago';
        if ($diff->h > 0) return $diff->h . ' hour' . ($diff->h > 1 ? 's' : '') . ' ago';
        if ($diff->i > 0) return $diff->i . ' minute' . ($diff->i > 1 ? 's' : '') . ' ago';
        return 'Just now';
    }

    public static function slugify($text)
    {
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        return strtolower($text);
    }

    public static function logActivity($userId, $action, $description = null, $ip = null, $userAgent = null)
    {
        $db = \App\Core\Database::getInstance();
        $db->insert(
            "INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
            [$userId, $action, $description, $ip, $userAgent]
        );
    }

    public static function createNotification($userId, $title, $message, $type = 'info', $link = null)
    {
        $db = \App\Core\Database::getInstance();
        $db->insert(
            "INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)",
            [$userId, $title, $message, $type, $link]
        );
    }

    public static function paginate($query, $countQuery, $params, $page = 1, $perPage = 10)
    {
        $db = \App\Core\Database::getInstance();
        $page = max(1, (int)$page);
        $perPage = max(1, min(100, (int)$perPage));
        $offset = ($page - 1) * $perPage;
        $total = $db->fetch($countQuery, $params)['total'] ?? 0;
        $data = $db->fetchAll($query . " LIMIT ? OFFSET ?", array_merge($params, [$perPage, $offset]));

        return [
            'data' => $data,
            'total' => (int)$total,
            'page' => (int)$page,
            'per_page' => (int)$perPage,
        ];
    }
}
