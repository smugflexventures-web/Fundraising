<?php

namespace App\Helpers;

use App\Core\Config;

class FileUpload
{
    private $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    private $maxSize;
    private $uploadPath;

    public function __construct()
    {
        $this->maxSize = (int) Config::get('UPLOAD_MAX_SIZE', 5242880);
        $this->uploadPath = dirname(__DIR__, 2) . '/' . Config::get('UPLOAD_PATH', 'uploads/');
    }

    public function upload($file, $subDir = '')
    {
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return ['success' => false, 'message' => 'No file uploaded'];
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'Upload error: ' . $this->getErrorMessage($file['error'])];
        }

        if ($file['size'] > $this->maxSize) {
            return ['success' => false, 'message' => 'File size exceeds maximum allowed size'];
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $this->allowedTypes)) {
            return ['success' => false, 'message' => 'File type not allowed. Allowed types: JPG, PNG, PDF'];
        }

        $uploadDir = $this->uploadPath . $subDir;
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '_' . time() . '.' . $extension;
        $filePath = $uploadDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            $relativePath = Config::get('UPLOAD_PATH', 'uploads/') . $subDir . $fileName;
            return [
                'success' => true,
                'file_name' => $file['name'],
                'file_path' => $relativePath,
                'file_type' => $mimeType,
                'file_size' => $file['size'],
            ];
        }

        return ['success' => false, 'message' => 'Failed to move uploaded file'];
    }

    public function uploadMultiple($files, $subDir = '')
    {
        $results = [];
        $fileList = [];

        $fileCount = is_array($files['name']) ? count($files['name']) : 0;

        for ($i = 0; $i < $fileCount; $i++) {
            $file = [
                'name' => $files['name'][$i],
                'type' => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error' => $files['error'][$i],
                'size' => $files['size'][$i],
            ];

            $result = $this->upload($file, $subDir);
            if ($result['success']) {
                $fileList[] = $result;
            } else {
                $results[] = $result;
            }
        }

        return ['success' => true, 'files' => $fileList, 'errors' => $results];
    }

    private function getErrorMessage($errorCode)
    {
        $messages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds form MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'Upload stopped by extension',
        ];
        return $messages[$errorCode] ?? 'Unknown upload error';
    }

    public function delete($filePath)
    {
        $fullPath = dirname(__DIR__, 2) . '/' . $filePath;
        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }
        return false;
    }
}
