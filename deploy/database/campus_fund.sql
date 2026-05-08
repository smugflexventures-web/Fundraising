-- ============================================
-- Campus Fundraising and Donation Management System
-- Database Schema
-- ============================================
-- Import this file into your existing cPanel database
-- (e.g., mdpjhtua_fund) via phpMyAdmin
-- ============================================

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  role ENUM('student', 'donor', 'admin') NOT NULL DEFAULT 'student',
  avatar VARCHAR(500) DEFAULT NULL,
  student_id VARCHAR(50) DEFAULT NULL,
  department VARCHAR(100) DEFAULT NULL,
  level VARCHAR(20) DEFAULT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified_at TIMESTAMP NULL DEFAULT NULL,
  last_login TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_student_id (student_id),
  INDEX idx_is_verified (is_verified)
) ENGINE=InnoDB;

-- ============================================
-- Student Requests Table
-- ============================================
CREATE TABLE student_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  amount_needed DECIMAL(12,2) NOT NULL,
  amount_funded DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  category ENUM('tuition', 'housing', 'medical', 'feeding', 'books', 'emergency', 'other') NOT NULL DEFAULT 'other',
  status ENUM('pending', 'approved', 'rejected', 'funded') NOT NULL DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  admin_notes TEXT DEFAULT NULL,
  reviewed_by INT DEFAULT NULL,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================
-- Request Documents Table
-- ============================================
CREATE TABLE request_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (request_id) REFERENCES student_requests(id) ON DELETE CASCADE,
  INDEX idx_request_id (request_id)
) ENGINE=InnoDB;

-- ============================================
-- Campaigns Table
-- ============================================
CREATE TABLE campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(500) DEFAULT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  raised_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  image VARCHAR(500) DEFAULT NULL,
  category ENUM('tuition', 'housing', 'medical', 'feeding', 'books', 'emergency', 'general') NOT NULL DEFAULT 'general',
  status ENUM('draft', 'active', 'paused', 'completed', 'closed') NOT NULL DEFAULT 'active',
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  created_by INT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_created_by (created_by),
  INDEX idx_is_featured (is_featured),
  INDEX idx_start_date (start_date)
) ENGINE=InnoDB;

-- ============================================
-- Donations Table
-- ============================================
CREATE TABLE donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT NOT NULL,
  campaign_id INT DEFAULT NULL,
  request_id INT DEFAULT NULL,
  amount DECIMAL(12,2) NOT NULL,
  reference VARCHAR(100) UNIQUE DEFAULT NULL,
  message TEXT DEFAULT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
  FOREIGN KEY (request_id) REFERENCES student_requests(id) ON DELETE SET NULL,
  INDEX idx_donor_id (donor_id),
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_request_id (request_id),
  INDEX idx_status (status),
  INDEX idx_reference (reference),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================
-- Payments Table
-- ============================================
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donation_id INT NOT NULL,
  transaction_id VARCHAR(255) DEFAULT NULL,
  provider VARCHAR(50) NOT NULL DEFAULT 'paystack',
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
  status ENUM('initialized', 'processing', 'success', 'failed') NOT NULL DEFAULT 'initialized',
  gateway_response TEXT DEFAULT NULL,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
  INDEX idx_donation_id (donation_id),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_status (status),
  INDEX idx_paid_at (paid_at)
) ENGINE=InnoDB;

-- ============================================
-- Notifications Table
-- ============================================
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================
-- Password Resets Table
-- ============================================
CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,

  INDEX idx_email (email),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

-- ============================================
-- Activity Logs Table
-- ============================================
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================
-- Admin Settings Table
-- ============================================
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB;

-- ============================================
-- Seed Data
-- ============================================

-- Admin user (password: Admin@123)
INSERT INTO users (email, password, first_name, last_name, role, is_verified, is_active) VALUES
('admin@campusfund.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 'admin', TRUE, TRUE);

-- Sample student users (password: Student@123)
INSERT INTO users (email, password, first_name, last_name, role, student_id, department, level, is_verified, is_active) VALUES
('john@student.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'student', 'STU/2024/001', 'Computer Science', '300', TRUE, TRUE),
('jane@student.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', 'student', 'STU/2024/002', 'Electrical Engineering', '200', TRUE, TRUE),
('ade@student.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ade', 'Okafor', 'student', 'STU/2024/003', 'Medicine', '400', TRUE, TRUE);

-- Sample donor users (password: Donor@123)
INSERT INTO users (email, password, first_name, last_name, role, is_verified, is_active) VALUES
('donor1@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael', 'Johnson', 'donor', TRUE, TRUE),
('donor2@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Williams', 'donor', TRUE, TRUE);

-- Sample campaigns
INSERT INTO campaigns (title, description, short_description, target_amount, raised_amount, category, status, start_date, end_date, created_by, is_featured) VALUES
('Tuition Support Drive 2024', 'Help students who cannot afford tuition fees continue their education. Every contribution counts towards building a brighter future for our students.', 'Supporting students with tuition fees', 500000.00, 150000.00, 'tuition', 'active', '2024-01-01', '2024-12-31', 1, TRUE),
('Emergency Medical Fund', 'Providing emergency medical assistance to students facing health crises. No student should have to choose between their health and education.', 'Emergency medical aid for students', 300000.00, 85000.00, 'medical', 'active', '2024-02-01', '2024-12-31', 1, TRUE),
('Campus Housing Initiative', 'Ensuring every student has a safe place to stay. Help us provide affordable housing solutions for students in need.', 'Affordable housing for students', 750000.00, 200000.00, 'housing', 'active', '2024-03-01', '2025-03-01', 1, FALSE),
('Textbook and Materials Fund', 'Help students access required textbooks and learning materials. Knowledge should be accessible to all.', 'Learning materials for students', 200000.00, 60000.00, 'books', 'active', '2024-01-15', '2024-12-15', 1, FALSE);

-- Sample student requests
INSERT INTO student_requests (user_id, title, description, amount_needed, amount_funded, category, status, priority) VALUES
(2, 'Tuition Fee Assistance', 'I am a 300-level Computer Science student struggling to pay my tuition fees for the current semester. My family faced financial difficulties after my father lost his job. I need help to continue my education.', 150000.00, 50000.00, 'tuition', 'approved', 'high'),
(3, 'Medical Emergency Support', 'I was recently diagnosed with a medical condition that requires immediate treatment. The cost is beyond what I can afford as a student. Any assistance would be greatly appreciated.', 80000.00, 0.00, 'medical', 'pending', 'critical'),
(4, 'Housing Assistance', 'I lost my accommodation and currently have nowhere to stay. I need help with rent deposit and first month payment to secure new housing near campus.', 60000.00, 60000.00, 'housing', 'funded', 'high');

-- Sample donations
INSERT INTO donations (donor_id, campaign_id, amount, reference, message, is_anonymous, status, payment_method) VALUES
(5, 1, 50000.00, 'REF_001_ABC', 'Happy to support students!', FALSE, 'completed', 'paystack'),
(6, 2, 35000.00, 'REF_002_DEF', 'Keep up the good work', FALSE, 'completed', 'paystack'),
(5, 3, 100000.00, 'REF_003_GHI', NULL, TRUE, 'completed', 'paystack'),
(6, 4, 25000.00, 'REF_004_JKL', 'For the books!', FALSE, 'completed', 'paystack');

-- Sample payments
INSERT INTO payments (donation_id, transaction_id, provider, amount, currency, status, gateway_response, paid_at) VALUES
(1, 'TXN_001_PAYSTACK', 'paystack', 50000.00, 'NGN', 'success', 'Approved', NOW()),
(2, 'TXN_002_PAYSTACK', 'paystack', 35000.00, 'NGN', 'success', 'Approved', NOW()),
(3, 'TXN_003_PAYSTACK', 'paystack', 100000.00, 'NGN', 'success', 'Approved', NOW()),
(4, 'TXN_004_PAYSTACK', 'paystack', 25000.00, 'NGN', 'success', 'Approved', NOW());

-- Sample notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(2, 'Request Approved', 'Your tuition fee assistance request has been approved. You will be contacted shortly.', 'success', FALSE),
(2, 'Donation Received', 'A donation of ₦50,000 has been made towards your tuition fee request.', 'info', TRUE),
(3, 'Welcome to CampusFund', 'Your account has been created. Please verify your email to get started.', 'info', FALSE),
(5, 'Donation Successful', 'Your donation of ₦50,000 to the Tuition Support Drive was successful. Thank you!', 'success', TRUE);

-- Default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'CampusFund'),
('site_description', 'Campus Fundraising and Donation Management System'),
('currency', 'NGN'),
('currency_symbol', '₦'),
('min_donation_amount', '1000'),
('max_donation_amount', '10000000'),
('enable_registration', 'true'),
('enable_email_verification', 'true'),
('maintenance_mode', 'false');
