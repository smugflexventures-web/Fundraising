<?php

namespace App\Controllers;

use App\Models\User;
use App\Models\PasswordReset;
use App\Helpers\JWT;
use App\Helpers\Validator;
use App\Helpers\Mailer;
use App\Helpers\Helpers;
use App\Core\Response;
use App\Core\Database;

class AuthController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function register($params)
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        // Don't sanitize password - special chars must be preserved for hashing
        $rawPassword = $input['password'] ?? '';
        $confirmPassword = $input['confirm_password'] ?? '';
        $input = Helpers::sanitize($input);
        // Restore unsanitized passwords
        $input['password'] = $rawPassword;
        $input['confirm_password'] = $confirmPassword;

        $validator = new Validator($input);
        $validator->validate([
            'first_name' => 'required|alpha_spaces|min:2|max:50',
            'last_name' => 'required|alpha_spaces|min:2|max:50',
            'email' => 'required|email',
            'password' => 'required|password',
            'confirm_password' => 'required|same:password',
            'role' => 'required|in:student,donor',
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed', 422, $validator->getErrors());
        }

        $existingUser = $this->userModel->findByEmail($input['email']);
        if ($existingUser) {
            return Response::error('This email address is already registered', 409);
        }

        if ($input['role'] === 'student') {
            if (empty($input['student_id'])) {
                return Response::error('Student ID is required for student accounts', 422);
            }
            $existingStudent = $this->userModel->findByStudentId($input['student_id']);
            if ($existingStudent) {
                return Response::error('This Student ID is already registered', 409);
            }
        }

        $userData = [
            'email' => $input['email'],
            'password' => $input['password'],
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'phone' => $input['phone'] ?? null,
            'role' => $input['role'],
            'student_id' => $input['student_id'] ?? null,
            'department' => $input['department'] ?? null,
            'level' => $input['level'] ?? null,
        ];

        $userId = $this->userModel->create($userData);

        if (!$userId) {
            return Response::error('Account could not be created at this time', 500);
        }

        $user = $this->userModel->findById($userId);
        $token = JWT::generate([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
        ]);

        Helpers::createNotification($userId, 'Account Created', 'Your account has been registered and is now active.', 'success');
        Helpers::logActivity($userId, 'register', 'User registered', $_SERVER['REMOTE_ADDR'] ?? null, $_SERVER['HTTP_USER_AGENT'] ?? null);

        Mailer::sendWelcomeEmail($user['email'], $user['first_name']);

        unset($user['password']);

        return Response::success([
            'user' => $user,
            'token' => $token,
        ], 'Account registered', 201);
    }

    public function login($params)
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        // Don't sanitize password - special chars must be preserved for verification
        $rawPassword = $input['password'] ?? '';
        $input = Helpers::sanitize($input);
        $input['password'] = $rawPassword;

        $validator = new Validator($input);
        $validator->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed', 422, $validator->getErrors());
        }

        $user = $this->userModel->verifyPassword($input['email'], $input['password']);

        if (!$user) {
            return Response::error('The credentials provided could not be verified', 401);
        }

        if (!$user['is_active']) {
            return Response::error('This account has been deactivated. Contact the administrator for assistance.', 403);
        }

        $this->userModel->updateLastLogin($user['id']);

        $token = JWT::generate([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
        ]);

        unset($user['password']);

        Helpers::logActivity($user['id'], 'login', 'User logged in', $_SERVER['REMOTE_ADDR'] ?? null, $_SERVER['HTTP_USER_AGENT'] ?? null);

        return Response::success([
            'user' => $user,
            'token' => $token,
        ], 'Signed in');
    }

    public function logout($params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        if ($authUser) {
            Helpers::logActivity($authUser['user_id'], 'logout', 'User logged out');
        }
        return Response::success([], 'Signed out');
    }

    public function forgotPassword($params)
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $input = Helpers::sanitize($input);

        $validator = new Validator($input);
        $validator->validate([
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed', 422, $validator->getErrors());
        }

        $user = $this->userModel->findByEmail($input['email']);
        if (!$user) {
            return Response::success([], 'If the email is registered, a reset link has been dispatched');
        }

        $token = bin2hex(random_bytes(32));
        $passwordReset = new PasswordReset();
        $passwordReset->create($input['email'], $token);

        $resetLink = (\App\Core\Config::get('APP_URL', 'http://localhost:5173')) . '/reset-password?token=' . $token;

        Mailer::sendPasswordResetEmail($user['email'], $user['first_name'], $resetLink);

        Helpers::logActivity($user['id'], 'forgot_password', 'Password reset requested');

        return Response::success([], 'If the email exists, a reset link has been sent');
    }

    public function resetPassword($params)
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        // Don't sanitize passwords - special chars must be preserved for hashing
        $rawPassword = $input['password'] ?? '';
        $confirmPassword = $input['confirm_password'] ?? '';

        $validator = new Validator($input);
        $validator->validate([
            'token' => 'required',
            'password' => 'required|password',
            'confirm_password' => 'required|same:password',
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed', 422, $validator->getErrors());
        }

        // Use raw passwords for hashing
        $input['password'] = $rawPassword;
        $input['confirm_password'] = $confirmPassword;

        $passwordReset = new PasswordReset();
        $reset = $passwordReset->findByToken($input['token']);

        if (!$reset) {
            return Response::error('This reset link is invalid or has expired', 400);
        }

        $user = $this->userModel->findByEmail($reset['email']);
        if (!$user) {
            return Response::error('No account found with this email', 404);
        }

        $this->userModel->updatePassword($user['id'], $input['password']);
        $passwordReset->deleteByEmail($reset['email']);

        Helpers::logActivity($user['id'], 'reset_password', 'Password reset successful');
        Helpers::createNotification($user['id'], 'Password Updated', 'Your account password has been changed.', 'success');

        return Response::success([], 'Password has been updated');
    }

    public function me($params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        if (!$authUser) {
            return Response::unauthorized();
        }

        $user = $this->userModel->findById($authUser['user_id']);
        if (!$user) {
            return Response::notFound('Account not found');
        }

        return Response::success(['user' => $user]);
    }

    public function updateProfile($params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $input = Helpers::sanitize($input);

        $validator = new Validator($input);
        $validator->validate([
            'first_name' => 'required|alpha_spaces|min:2',
            'last_name' => 'required|alpha_spaces|min:2',
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed', 422, $validator->getErrors());
        }

        $this->userModel->update($authUser['user_id'], $input);
        $user = $this->userModel->findById($authUser['user_id']);

        Helpers::logActivity($authUser['user_id'], 'update_profile', 'Profile updated');

        return Response::success(['user' => $user], 'Profile updated');
    }

    public function changePassword($params)
    {
        $authUser = $GLOBALS['auth_user'] ?? null;
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        // Don't sanitize passwords - special chars must be preserved
        $rawCurrentPassword = $input['current_password'] ?? '';
        $rawNewPassword = $input['new_password'] ?? '';
        $rawConfirmPassword = $input['confirm_password'] ?? '';

        $validator = new Validator($input);
        $validator->validate([
            'current_password' => 'required',
            'new_password' => 'required|password',
            'confirm_password' => 'required|same:new_password',
        ]);

        if ($validator->fails()) {
            return Response::error('Validation failed', 422, $validator->getErrors());
        }

        $user = $this->userModel->findByEmail($authUser['email']);
        if (!password_verify($rawCurrentPassword, $user['password'])) {
            return Response::error('The current password you entered is incorrect', 400);
        }

        $this->userModel->updatePassword($authUser['user_id'], $rawNewPassword);
        Helpers::logActivity($authUser['user_id'], 'change_password', 'Password changed');

        return Response::success([], 'Password has been changed');
    }
}
