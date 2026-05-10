-- ============================================
-- Migration: Add Manual Bank Transfer Support
-- ============================================

-- 1. Add 'pending_verification' to donations status ENUM
ALTER TABLE donations MODIFY COLUMN status ENUM('pending', 'pending_verification', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending';

-- 2. Add 'pending_verification' to payments status ENUM
ALTER TABLE payments MODIFY COLUMN status ENUM('initialized', 'processing', 'pending_verification', 'success', 'failed') NOT NULL DEFAULT 'initialized';

-- 3. Add admin verification tracking to payments
ALTER TABLE payments ADD COLUMN verified_by INT DEFAULT NULL AFTER paid_at;
ALTER TABLE payments ADD COLUMN verified_at TIMESTAMP NULL DEFAULT NULL AFTER verified_by;
ALTER TABLE payments ADD FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL;

-- 4. Create bank transfer proofs table
CREATE TABLE bank_transfer_proofs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donation_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  bank_name VARCHAR(100) DEFAULT NULL,
  account_name VARCHAR(200) DEFAULT NULL,
  transaction_reference VARCHAR(100) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
  INDEX idx_donation_id (donation_id),
  INDEX idx_transaction_reference (transaction_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bank account settings will be configured by admin via Settings UI
