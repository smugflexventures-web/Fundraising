<?php

use App\Core\Router;

$router = new Router();

// ============================================
// Public Routes
// ============================================
$router->post('/auth/register', 'AuthController@register', ['RateLimitMiddleware']);
$router->post('/auth/login', 'AuthController@login', ['RateLimitMiddleware']);
$router->post('/auth/forgot-password', 'AuthController@forgotPassword', ['RateLimitMiddleware']);
$router->post('/auth/reset-password', 'AuthController@resetPassword', ['RateLimitMiddleware']);
$router->get('/stats/public', 'AdminController@publicStats');

// ============================================
// Protected Routes (Auth Required)
// ============================================
$router->post('/auth/logout', 'AuthController@logout', ['AuthMiddleware']);
$router->get('/auth/me', 'AuthController@me', ['AuthMiddleware']);
$router->put('/auth/profile', 'AuthController@updateProfile', ['AuthMiddleware']);
$router->put('/auth/change-password', 'AuthController@changePassword', ['AuthMiddleware']);

// ============================================
// Campaign Routes
// ============================================
$router->get('/campaigns', 'CampaignController@index');
$router->get('/campaigns/featured', 'CampaignController@featured');
$router->get('/campaigns/{id}', 'CampaignController@show');
$router->post('/campaigns', 'CampaignController@store', ['AuthMiddleware', 'AdminMiddleware']);
$router->put('/campaigns/{id}', 'CampaignController@update', ['AuthMiddleware', 'AdminMiddleware']);
$router->post('/campaigns/{id}/update', 'CampaignController@updateWithImage', ['AuthMiddleware', 'AdminMiddleware']);
$router->delete('/campaigns/{id}', 'CampaignController@destroy', ['AuthMiddleware', 'AdminMiddleware']);

// ============================================
// Student Request Routes
// ============================================
$router->get('/requests', 'StudentRequestController@index', ['AuthMiddleware']);
$router->get('/requests/stats', 'StudentRequestController@studentStats', ['AuthMiddleware']);
$router->get('/requests/{id}', 'StudentRequestController@show', ['AuthMiddleware']);
$router->post('/requests', 'StudentRequestController@store', ['AuthMiddleware']);
$router->put('/requests/{id}', 'StudentRequestController@update', ['AuthMiddleware']);
$router->put('/requests/{id}/status', 'StudentRequestController@updateStatus', ['AuthMiddleware', 'AdminMiddleware']);
$router->delete('/requests/{id}', 'StudentRequestController@destroy', ['AuthMiddleware']);
$router->post('/requests/{id}/documents', 'StudentRequestController@uploadDocuments', ['AuthMiddleware']);

// ============================================
// Donation Routes
// ============================================
$router->get('/donations', 'DonationController@index', ['AuthMiddleware']);
$router->get('/donations/stats', 'DonationController@donorStats', ['AuthMiddleware']);
$router->get('/donations/history', 'DonationController@history', ['AuthMiddleware']);
$router->get('/donations/{id}', 'DonationController@show', ['AuthMiddleware']);
$router->post('/donations/initialize', 'DonationController@initialize', ['AuthMiddleware']);
$router->post('/donations/verify', 'DonationController@verify', ['AuthMiddleware']);

// ============================================
// Bank Transfer Routes
// ============================================
$router->get('/bank-transfer/details', 'BankTransferController@getBankDetails');
$router->post('/bank-transfer/initialize', 'BankTransferController@initialize', ['AuthMiddleware']);
$router->post('/bank-transfer/{id}/submit-proof', 'BankTransferController@submitProof', ['AuthMiddleware']);
$router->get('/bank-transfer/pending', 'BankTransferController@pendingVerifications', ['AuthMiddleware', 'AdminMiddleware']);
$router->post('/bank-transfer/{id}/verify', 'BankTransferController@verifyTransfer', ['AuthMiddleware', 'AdminMiddleware']);
$router->post('/bank-transfer/{id}/reject', 'BankTransferController@rejectTransfer', ['AuthMiddleware', 'AdminMiddleware']);

// ============================================
// Notification Routes
// ============================================
$router->get('/notifications', 'NotificationController@index', ['AuthMiddleware']);
$router->get('/notifications/unread-count', 'NotificationController@unreadCount', ['AuthMiddleware']);
$router->put('/notifications/{id}/read', 'NotificationController@markRead', ['AuthMiddleware']);
$router->put('/notifications/read-all', 'NotificationController@markAllRead', ['AuthMiddleware']);
$router->delete('/notifications/{id}', 'NotificationController@destroy', ['AuthMiddleware']);

// ============================================
// Admin Routes
// ============================================
$router->get('/admin/stats', 'AdminController@stats', ['AuthMiddleware', 'AdminMiddleware']);
$router->get('/admin/users', 'AdminController@users', ['AuthMiddleware', 'AdminMiddleware']);
$router->put('/admin/users/{id}/verify', 'AdminController@verifyUser', ['AuthMiddleware', 'AdminMiddleware']);
$router->put('/admin/users/{id}/toggle-status', 'AdminController@toggleUserStatus', ['AuthMiddleware', 'AdminMiddleware']);
$router->delete('/admin/users/{id}', 'AdminController@deleteUser', ['AuthMiddleware', 'AdminMiddleware']);
$router->get('/admin/activity-logs', 'AdminController@activityLogs', ['AuthMiddleware', 'AdminMiddleware']);
$router->get('/admin/reports', 'AdminController@reports', ['AuthMiddleware', 'AdminMiddleware']);
$router->get('/admin/settings', 'AdminController@getSettings', ['AuthMiddleware', 'AdminMiddleware']);
$router->put('/admin/settings', 'AdminController@updateSettings', ['AuthMiddleware', 'AdminMiddleware']);

// ============================================
// POST Fallback Routes (for cPanel/Apache that block PUT/DELETE)
// These use X-HTTP-Method-Override header to map to the real method
// ============================================
$router->post('/auth/profile', 'AuthController@updateProfile', ['AuthMiddleware']);
$router->post('/auth/change-password', 'AuthController@changePassword', ['AuthMiddleware']);
$router->post('/campaigns/{id}/delete', 'CampaignController@destroy', ['AuthMiddleware', 'AdminMiddleware']);
$router->post('/campaigns/{id}/edit', 'CampaignController@update', ['AuthMiddleware', 'AdminMiddleware']);
$router->post('/requests/{id}/update', 'StudentRequestController@update', ['AuthMiddleware']);
$router->post('/requests/{id}/status', 'StudentRequestController@updateStatus', ['AuthMiddleware', 'AdminMiddleware']);
$router->post('/requests/{id}/delete', 'StudentRequestController@destroy', ['AuthMiddleware']);
$router->post('/notifications/{id}/read', 'NotificationController@markRead', ['AuthMiddleware']);
$router->post('/notifications/read-all', 'NotificationController@markAllRead', ['AuthMiddleware']);
$router->post('/notifications/{id}/delete', 'NotificationController@destroy', ['AuthMiddleware']);
$router->post('/admin/users/{id}/verify', 'AdminController@verifyUser', ['AuthMiddleware', 'AdminMiddleware']);
$router->post('/admin/users/{id}/toggle-status', 'AdminController@toggleUserStatus', ['AuthMiddleware', 'AdminMiddleware']);
$router->post('/admin/users/{id}/delete', 'AdminController@deleteUser', ['AuthMiddleware', 'AdminMiddleware']);
$router->post('/admin/settings', 'AdminController@updateSettings', ['AuthMiddleware', 'AdminMiddleware']);

return $router;
