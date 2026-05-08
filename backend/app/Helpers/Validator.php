<?php

namespace App\Helpers;

class Validator
{
    private $errors = [];
    private $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function validate($rules)
    {
        foreach ($rules as $field => $fieldRules) {
            $fieldRules = explode('|', $fieldRules);
            foreach ($fieldRules as $rule) {
                $this->applyRule($field, $rule);
            }
        }
        return $this;
    }

    private function applyRule($field, $rule)
    {
        $value = $this->data[$field] ?? null;
        $params = [];

        if (str_contains($rule, ':')) {
            [$rule, $paramStr] = explode(':', $rule, 2);
            $params = explode(',', $paramStr);
        }

        switch ($rule) {
            case 'required':
                if ($value === null || $value === '') {
                    $this->errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
                }
                break;

            case 'email':
                if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->errors[$field][] = 'Invalid email format';
                }
                break;

            case 'min':
                if ($value && strlen((string)$value) < (int)$params[0]) {
                    $this->errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " must be at least {$params[0]} characters";
                }
                break;

            case 'max':
                if ($value && strlen((string)$value) > (int)$params[0]) {
                    $this->errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " must not exceed {$params[0]} characters";
                }
                break;

            case 'numeric':
                if ($value && !is_numeric($value)) {
                    $this->errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . ' must be a number';
                }
                break;

            case 'min_value':
                if ($value && (float)$value < (float)$params[0]) {
                    $this->errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " must be at least {$params[0]}";
                }
                break;

            case 'in':
                if ($value && !in_array($value, $params)) {
                    $allowed = implode(', ', $params);
                    $this->errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " must be one of: {$allowed}";
                }
                break;

            case 'same':
                if ($value !== ($this->data[$params[0]] ?? null)) {
                    $this->errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . " must match " . str_replace('_', ' ', $params[0]);
                }
                break;

            case 'alpha_spaces':
                if ($value && !preg_match('/^[a-zA-Z\s]+$/', $value)) {
                    $this->errors[$field][] = ucfirst(str_replace('_', ' ', $field)) . ' must contain only letters and spaces';
                }
                break;

            case 'password':
                if ($value && !preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/', $value)) {
                    $this->errors[$field][] = 'Password must be at least 8 characters with uppercase, lowercase, number and special character';
                }
                break;
        }
    }

    public function fails()
    {
        return !empty($this->errors);
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function validated()
    {
        return $this->data;
    }
}
