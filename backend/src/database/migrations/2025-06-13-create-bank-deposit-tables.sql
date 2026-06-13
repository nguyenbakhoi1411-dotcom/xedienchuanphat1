-- ============================================================
-- Migration: Create Bank Deposit Module Tables
-- Date: 2025-06-13
-- ============================================================

-- Bảng tài khoản ngân hàng
CREATE TABLE IF NOT EXISTS bank_accounts (
  id              CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
  branch_id       CHAR(36)        NOT NULL,
  account_no      VARCHAR(30)     NOT NULL,
  account_name    VARCHAR(200)    NOT NULL,
  bank_name       VARCHAR(100)    NOT NULL,
  bank_branch     VARCHAR(200),
  currency        CHAR(3)         NOT NULL DEFAULT 'VND',
  accounting_code VARCHAR(20)     NOT NULL,
  opening_balance DECIMAL(18,2)   NOT NULL DEFAULT 0,
  current_balance DECIMAL(18,2)   NOT NULL DEFAULT 0,
  is_active       TINYINT(1)      NOT NULL DEFAULT 1,
  notes           TEXT,
  created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by      CHAR(36),
  updated_by      CHAR(36),
  INDEX idx_branch (branch_id),
  INDEX idx_status (is_active),
  UNIQUE INDEX idx_account_no (branch_id, account_no),
  CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB;

-- Bảng chứng từ tiền gửi (Thu + Chi)
CREATE TABLE IF NOT EXISTS bank_transactions (
  id               CHAR(36)       PRIMARY KEY DEFAULT (UUID()),
  branch_id        CHAR(36)       NOT NULL,
  type             ENUM('RECEIPT','PAYMENT') NOT NULL,
  sub_type         VARCHAR(50)    NOT NULL,
  doc_no           VARCHAR(30)    NOT NULL,
  doc_date         DATE           NOT NULL,
  bank_account_id  CHAR(36)       NOT NULL,
  amount           DECIMAL(18,2)  NOT NULL,
  currency         CHAR(3)        NOT NULL DEFAULT 'VND',
  exchange_rate    DECIMAL(10,4)  NOT NULL DEFAULT 1,
  amount_vnd       DECIMAL(18,2)  NOT NULL,
  description      TEXT,
  partner_type     ENUM('CUSTOMER','SUPPLIER','EMPLOYEE') NULL,
  partner_id       CHAR(36)       NULL,
  debit_account    VARCHAR(20)    NOT NULL,
  credit_account   VARCHAR(20)    NOT NULL,
  status           ENUM('DRAFT','POSTED','CANCELLED') DEFAULT 'DRAFT',
  posted_at        DATETIME       NULL,
  posted_by        CHAR(36)       NULL,
  ref_doc_id       CHAR(36)       NULL,
  created_at       DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by       CHAR(36),
  updated_by       CHAR(36),
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  INDEX idx_branch_date (branch_id, doc_date),
  INDEX idx_status (status),
  INDEX idx_type (type, sub_type),
  INDEX idx_account (bank_account_id),
  INDEX idx_doc_no (doc_no),
  UNIQUE INDEX idx_doc_no_unique (branch_id, doc_no),
  CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB;

-- Bảng đối chiếu ngân hàng
CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id                 CHAR(36)       PRIMARY KEY DEFAULT (UUID()),
  bank_account_id    CHAR(36)       NOT NULL,
  period             CHAR(7)        NOT NULL,
  statement_balance  DECIMAL(18,2)  NOT NULL DEFAULT 0,
  book_balance       DECIMAL(18,2)  NOT NULL DEFAULT 0,
  difference         DECIMAL(18,2)  GENERATED ALWAYS AS (statement_balance - book_balance) STORED,
  status             ENUM('OPEN','MATCHED','CLOSED') DEFAULT 'OPEN',
  reconciled_at      DATETIME       NULL,
  reconciled_by      CHAR(36)       NULL,
  notes              TEXT,
  created_at         DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
  UNIQUE INDEX idx_account_period (bank_account_id, period),
  INDEX idx_status (status),
  CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB;

-- Bảng audit log (tracking changes)
CREATE TABLE IF NOT EXISTS bank_transaction_audit_logs (
  id            CHAR(36)       PRIMARY KEY DEFAULT (UUID()),
  transaction_id CHAR(36)      NOT NULL,
  action        ENUM('CREATE','UPDATE','DELETE','POST','CANCEL') NOT NULL,
  old_values    JSON           NULL,
  new_values    JSON           NULL,
  user_id       CHAR(36)       NOT NULL,
  created_at    DATETIME       DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES bank_transactions(id) ON DELETE CASCADE,
  INDEX idx_transaction (transaction_id),
  INDEX idx_created_at (created_at),
  CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB;
