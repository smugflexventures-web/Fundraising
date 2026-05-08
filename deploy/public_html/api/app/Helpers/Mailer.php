<?php

namespace App\Helpers;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
use App\Core\Config;

class Mailer
{
    private $mail;

    public function __construct()
    {
        $this->mail = new PHPMailer(true);
        $this->configure();
    }

    private function configure()
    {
        $this->mail->isSMTP();
        $this->mail->Host = Config::get('MAIL_HOST', 'smtp.gmail.com');
        $this->mail->Port = (int) Config::get('MAIL_PORT', 587);
        $this->mail->SMTPAuth = true;
        $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mail->Username = Config::get('MAIL_USERNAME', '');
        $this->mail->Password = Config::get('MAIL_PASSWORD', '');
        $this->mail->setFrom(
            Config::get('MAIL_FROM_EMAIL', 'noreply@campusfund.edu'),
            Config::get('MAIL_FROM_NAME', 'CampusFund')
        );
        $this->mail->isHTML(true);
        $this->mail->CharSet = 'UTF-8';
    }

    public function send($to, $subject, $body)
    {
        try {
            if (Config::get('APP_ENV') === 'development') {
                $this->mail->SMTPDebug = 0;
            }

            $this->mail->addAddress($to);
            $this->mail->Subject = $subject;
            $this->mail->Body = $body;
            $this->mail->AltBody = strip_tags($body);

            return $this->mail->send();
        } catch (Exception $e) {
            error_log('Mail error: ' . $this->mail->ErrorInfo);
            return false;
        }
    }

    public static function sendWelcomeEmail($to, $name)
    {
        $mailer = new self();
        $subject = 'Welcome to CampusFund';
        $body = self::getEmailTemplate('welcome', [
            'name' => $name,
            'app_name' => Config::get('APP_NAME', 'CampusFund'),
        ]);
        return $mailer->send($to, $subject, $body);
    }

    public static function sendPasswordResetEmail($to, $name, $resetLink)
    {
        $mailer = new self();
        $subject = 'Password Reset Request - CampusFund';
        $body = self::getEmailTemplate('password_reset', [
            'name' => $name,
            'reset_link' => $resetLink,
            'app_name' => Config::get('APP_NAME', 'CampusFund'),
        ]);
        return $mailer->send($to, $subject, $body);
    }

    public static function sendDonationConfirmation($to, $name, $amount, $campaign)
    {
        $mailer = new self();
        $currency = Config::get('CURRENCY_SYMBOL', '₦');
        $subject = 'Donation Confirmation - CampusFund';
        $body = self::getEmailTemplate('donation_confirmation', [
            'name' => $name,
            'amount' => $currency . number_format($amount, 2),
            'campaign' => $campaign,
            'app_name' => Config::get('APP_NAME', 'CampusFund'),
        ]);
        return $mailer->send($to, $subject, $body);
    }

    public static function sendRequestStatusEmail($to, $name, $status, $requestTitle)
    {
        $mailer = new self();
        $subject = "Request {$status} - CampusFund";
        $body = self::getEmailTemplate('request_status', [
            'name' => $name,
            'status' => $status,
            'request_title' => $requestTitle,
            'app_name' => Config::get('APP_NAME', 'CampusFund'),
        ]);
        return $mailer->send($to, $subject, $body);
    }

    private static function getEmailTemplate($type, $data)
    {
        $appName = $data['app_name'] ?? 'CampusFund';
        $name = $data['name'] ?? 'User';

        $header = "
        <div style='max-width:600px;margin:0 auto;font-family:Arial,sans-serif;'>
            <div style='background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:30px;text-align:center;border-radius:12px 12px 0 0;'>
                <h1 style='color:#fff;margin:0;font-size:24px;'>{$appName}</h1>
            </div>
            <div style='padding:30px;background:#ffffff;border:1px solid #e5e7eb;'>";

        $footer = "
            </div>
            <div style='padding:20px;text-align:center;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb;'>
                <p>&copy; " . date('Y') . " {$appName}. All rights reserved.</p>
                <p>This email was sent from a notification-only address.</p>
            </div>
        </div>";

        $content = '';

        switch ($type) {
            case 'welcome':
                $content = "<h2 style='color:#1e293b;'>Welcome, {$name}!</h2>
                    <p style='color:#475569;line-height:1.6;'>Thank you for joining {$appName}. Your account has been created successfully.</p>
                    <p style='color:#475569;line-height:1.6;'>You can now log in and start using the platform to make a difference in students' lives.</p>
                    <a href='" . Config::get('APP_URL', 'http://localhost:5173') . "' style='display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;margin-top:16px;'>Get Started</a>";
                break;

            case 'password_reset':
                $resetLink = $data['reset_link'] ?? '#';
                $content = "<h2 style='color:#1e293b;'>Hello, {$name}</h2>
                    <p style='color:#475569;line-height:1.6;'>We received a request to reset your password. Click the button below to reset it:</p>
                    <a href='{$resetLink}' style='display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;margin-top:16px;'>Reset Password</a>
                    <p style='color:#94a3b8;font-size:13px;margin-top:16px;'>This link expires in 1 hour. If you didn't request this, ignore this email.</p>";
                break;

            case 'donation_confirmation':
                $amount = $data['amount'] ?? '0.00';
                $campaign = $data['campaign'] ?? 'General Fund';
                $content = "<h2 style='color:#1e293b;'>Thank You, {$name}!</h2>
                    <p style='color:#475569;line-height:1.6;'>Your donation has been processed successfully.</p>
                    <div style='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;'>
                        <p style='margin:0;color:#166534;font-size:18px;font-weight:bold;'>{$amount}</p>
                        <p style='margin:4px 0 0;color:#15803d;'>to {$campaign}</p>
                    </div>
                    <p style='color:#475569;line-height:1.6;'>Your generosity makes a real difference. Thank you for supporting students in need.</p>";
                break;

            case 'request_status':
                $status = ucfirst($data['status'] ?? 'updated');
                $requestTitle = $data['request_title'] ?? 'your request';
                $statusColors = [
                    'Approved' => '#166534',
                    'Rejected' => '#991b1b',
                    'Funded' => '#1e40af',
                ];
                $color = $statusColors[$status] ?? '#475569';
                $content = "<h2 style='color:#1e293b;'>Hello, {$name}</h2>
                    <p style='color:#475569;line-height:1.6;'>Your request has been updated:</p>
                    <div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;'>
                        <p style='margin:0;color:#64748b;font-size:14px;'>Request: <strong>{$requestTitle}</strong></p>
                        <p style='margin:4px 0 0;color:{$color};font-weight:bold;font-size:16px;'>Status: {$status}</p>
                    </div>
                    <a href='" . Config::get('APP_URL', 'http://localhost:5173') . "/student/dashboard' style='display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;margin-top:16px;'>View Request</a>";
                break;
        }

        return $header . $content . $footer;
    }
}
