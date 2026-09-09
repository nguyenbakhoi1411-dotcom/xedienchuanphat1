-- V20: Nang cap module Mua Hang / Nha Cung Cap / Cong No Phai Tra
-- =================================================================

-- ── 1. Nhom nha cung cap ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS supplier_groups (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(30)  NOT NULL UNIQUE,
    name        VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO supplier_groups (code, name, description) VALUES
('VEHICLE',   'Nhà cung cấp xe',       'Nhà phân phối/nhà sản xuất xe điện'),
('BATTERY',   'Nhà cung cấp pin',      'Nhà cung cấp pin xe điện'),
('SPARE_PART','Nhà cung cấp phụ tùng', 'Phụ tùng thay thế'),
('SERVICE',   'Đơn vị dịch vụ',        'Dịch vụ bảo hành/sửa chữa thuê ngoài'),
('OTHER',     'Khác',                  NULL)
ON CONFLICT (code) DO NOTHING;

-- ── 2. Nang cap suppliers ────────────────────────────────────────
ALTER TABLE suppliers
    ADD COLUMN IF NOT EXISTS group_id         BIGINT REFERENCES supplier_groups(id),
    ADD COLUMN IF NOT EXISTS email            VARCHAR(120),
    ADD COLUMN IF NOT EXISTS website          VARCHAR(200),
    ADD COLUMN IF NOT EXISTS current_debt     NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS credit_limit     NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_terms_days INT NOT NULL DEFAULT 30,
    ADD COLUMN IF NOT EXISTS rating           SMALLINT CHECK (rating BETWEEN 1 AND 5),
    ADD COLUMN IF NOT EXISTS notes            VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── 3. Nang cap purchase_orders ──────────────────────────────────
ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS order_no            VARCHAR(50),
    ADD COLUMN IF NOT EXISTS status              VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS expected_delivery   DATE,
    ADD COLUMN IF NOT EXISTS approval_threshold  NUMERIC(14,2) NOT NULL DEFAULT 50000000,
    ADD COLUMN IF NOT EXISTS created_by          VARCHAR(120),
    ADD COLUMN IF NOT EXISTS submitted_at        TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS submitted_by        VARCHAR(120),
    ADD COLUMN IF NOT EXISTS approved_at         TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS approved_by         VARCHAR(120),
    ADD COLUMN IF NOT EXISTS rejected_at         TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejected_by         VARCHAR(120),
    ADD COLUMN IF NOT EXISTS reject_reason       VARCHAR(500),
    ADD COLUMN IF NOT EXISTS cancelled_at        TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancelled_by        VARCHAR(120),
    ADD COLUMN IF NOT EXISTS cancel_reason       VARCHAR(500),
    ADD COLUMN IF NOT EXISTS note                VARCHAR(500);

-- Backfill order_no = purchaseOrderNo neu chua co
UPDATE purchase_orders SET order_no = purchase_order_no WHERE order_no IS NULL;
UPDATE purchase_orders SET status   = 'APPROVED'          WHERE status  = 'DRAFT';

-- ── 4. Hoa don VAT tu nha cung cap ──────────────────────────────
CREATE TABLE IF NOT EXISTS supplier_invoices (
    id              BIGSERIAL PRIMARY KEY,
    invoice_no      VARCHAR(80) NOT NULL UNIQUE,       -- So hoa don tu NCC
    supplier_id     BIGINT NOT NULL REFERENCES suppliers(id),
    branch_id       BIGINT NOT NULL REFERENCES branches(id),
    receipt_id      BIGINT REFERENCES purchase_receipts(id),
    invoice_date    DATE NOT NULL,
    due_date        DATE,
    subtotal        NUMERIC(14,2) NOT NULL DEFAULT 0,
    vat_rate        NUMERIC(5,2)  NOT NULL DEFAULT 10,
    vat_amount      NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_amount    NUMERIC(14,2) NOT NULL DEFAULT 0,
    status          VARCHAR(30)   NOT NULL DEFAULT 'RECEIVED',
    note            VARCHAR(500),
    created_by      VARCHAR(120),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_supplier_invoice_status CHECK (status IN ('RECEIVED','VERIFIED','CANCELLED'))
);

-- ── 5. Cong no phai tra (Payable) ────────────────────────────────
CREATE TABLE IF NOT EXISTS payables (
    id              BIGSERIAL PRIMARY KEY,
    payable_code    VARCHAR(30)   NOT NULL UNIQUE,      -- CN-00001
    supplier_id     BIGINT NOT NULL REFERENCES suppliers(id),
    branch_id       BIGINT NOT NULL REFERENCES branches(id),
    -- Nguon phat sinh
    source_type     VARCHAR(40)   NOT NULL,             -- PURCHASE_RECEIPT | MANUAL | PURCHASE_RETURN_REFUND
    source_id       BIGINT,                             -- receipt_id / return_id
    source_no       VARCHAR(80),                        -- Ma chung tu goc
    -- So tien
    original_amount NUMERIC(14,2) NOT NULL,
    paid_amount     NUMERIC(14,2) NOT NULL DEFAULT 0,
    remaining_amount NUMERIC(14,2) NOT NULL,
    -- Thoi han
    invoice_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE,                               -- Han thanh toan
    -- Trang thai
    status          VARCHAR(20)   NOT NULL DEFAULT 'OPEN',
    -- Audit
    note            VARCHAR(500),
    created_by      VARCHAR(120),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_payable_status CHECK (status IN ('OPEN','PARTIAL','PAID','OVERDUE','CANCELLED'))
);

ALTER TABLE payables
    ADD COLUMN IF NOT EXISTS payable_code VARCHAR(30),
    ADD COLUMN IF NOT EXISTS branch_id BIGINT,
    ADD COLUMN IF NOT EXISTS source_id BIGINT,
    ADD COLUMN IF NOT EXISTS original_amount NUMERIC(14,2),
    ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC(14,2),
    ADD COLUMN IF NOT EXISTS invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS note VARCHAR(500),
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(120),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE payables
SET original_amount = COALESCE(original_amount, debit_amount, 0),
    remaining_amount = COALESCE(remaining_amount, debit_amount, 0),
    invoice_date = COALESCE(invoice_date, transaction_date, CURRENT_DATE),
    note = COALESCE(note, description)
WHERE original_amount IS NULL
   OR remaining_amount IS NULL
   OR note IS NULL;

-- ── 6. Chi tiet tung lan thanh toan cong no ─────────────────────
CREATE TABLE IF NOT EXISTS payable_payments (
    id              BIGSERIAL PRIMARY KEY,
    payable_id      BIGINT NOT NULL REFERENCES payables(id),
    supplier_payment_id BIGINT REFERENCES supplier_payments(id),
    amount          NUMERIC(14,2) NOT NULL,
    payment_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method  VARCHAR(30),                        -- CASH | BANK_TRANSFER | OFFSET
    bank_ref        VARCHAR(100),
    note            VARCHAR(500),
    created_by      VARCHAR(120),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. Nang cap supplier_payments ────────────────────────────────
ALTER TABLE supplier_payments
    ADD COLUMN IF NOT EXISTS payable_id      BIGINT REFERENCES payables(id),
    ADD COLUMN IF NOT EXISTS payment_method  VARCHAR(30),
    ADD COLUMN IF NOT EXISTS reference_no    VARCHAR(80);

-- ── 8. Nang cap purchase_returns ─────────────────────────────────
ALTER TABLE purchase_returns
    ADD COLUMN IF NOT EXISTS accounting_recorded BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS stock_returned       BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS payable_adjusted     BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS payable_id           BIGINT REFERENCES payables(id),
    ADD COLUMN IF NOT EXISTS approved_by          VARCHAR(120),
    ADD COLUMN IF NOT EXISTS approved_at          TIMESTAMPTZ;

-- ── 9. Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_suppliers_group ON suppliers(group_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_supplier ON supplier_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_receipt ON supplier_invoices(receipt_id);
CREATE INDEX IF NOT EXISTS idx_payables_supplier ON payables(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_payables_due_date ON payables(due_date);
CREATE INDEX IF NOT EXISTS idx_payables_source ON payables(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_payable_payments_payable ON payable_payments(payable_id);
CREATE INDEX IF NOT EXISTS idx_purchase_returns_payable ON purchase_returns(payable_id);

-- ── 10. Seed permissions ─────────────────────────────────────────
INSERT INTO permissions (code, module, action) VALUES
('SUPPLIER_VIEW',       'SUPPLIER','VIEW'),
('SUPPLIER_CREATE',     'SUPPLIER','CREATE'),
('SUPPLIER_UPDATE',     'SUPPLIER','UPDATE'),
('PURCHASE_VIEW',       'PURCHASE','VIEW'),
('PURCHASE_CREATE',     'PURCHASE','CREATE'),
('PURCHASE_UPDATE',     'PURCHASE','UPDATE'),
('PURCHASE_APPROVE',    'PURCHASE','APPROVE'),
('PURCHASE_CANCEL',     'PURCHASE','CANCEL'),
('PAYABLE_VIEW',        'PAYABLE','VIEW'),
('PAYABLE_PAY',         'PAYABLE','PAY'),
('PAYABLE_REPORT',      'PAYABLE','REPORT'),
('PURCHASE_RETURN',     'PURCHASE','RETURN')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'ADMIN'
  AND p.code IN ('SUPPLIER_VIEW','SUPPLIER_CREATE','SUPPLIER_UPDATE',
                 'PURCHASE_VIEW','PURCHASE_CREATE','PURCHASE_UPDATE','PURCHASE_APPROVE',
                 'PURCHASE_CANCEL','PAYABLE_VIEW','PAYABLE_PAY','PAYABLE_REPORT','PURCHASE_RETURN')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'BRANCH_MANAGER'
  AND p.code IN ('SUPPLIER_VIEW','SUPPLIER_CREATE','SUPPLIER_UPDATE',
                 'PURCHASE_VIEW','PURCHASE_CREATE','PURCHASE_APPROVE',
                 'PAYABLE_VIEW','PAYABLE_PAY','PAYABLE_REPORT','PURCHASE_RETURN')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'WAREHOUSE_STAFF'
  AND p.code IN ('SUPPLIER_VIEW','PURCHASE_VIEW','PURCHASE_CREATE')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'ACCOUNTANT'
  AND p.code IN ('SUPPLIER_VIEW','PURCHASE_VIEW','PAYABLE_VIEW','PAYABLE_PAY','PAYABLE_REPORT')
ON CONFLICT DO NOTHING;

-- ── 11. Comments ─────────────────────────────────────────────────
COMMENT ON TABLE supplier_groups    IS 'Nhom nha cung cap (A/B/C tier)';
COMMENT ON TABLE supplier_invoices  IS 'Hoa don VAT tu nha cung cap';
COMMENT ON TABLE payables           IS 'Cong no phai tra trung tam';
COMMENT ON TABLE payable_payments   IS 'Chi tiet tung lan thanh toan cong no';
