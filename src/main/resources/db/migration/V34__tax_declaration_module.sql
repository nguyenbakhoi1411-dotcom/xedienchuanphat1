-- V34__tax_declaration_module.sql

-- 1. Chi tiết bảng kê thuế
CREATE TABLE IF NOT EXISTS tax_declaration_lines (
    id                  BIGSERIAL PRIMARY KEY,
    tax_declaration_id  BIGINT NOT NULL REFERENCES tax_declarations(id) ON DELETE CASCADE,
    tax_invoice_id      BIGINT NOT NULL REFERENCES tax_invoices(id),
    line_type           VARCHAR(10) NOT NULL CHECK (line_type IN ('OUTPUT','INPUT')),
    tax_base_amount     NUMERIC(18,2) NOT NULL DEFAULT 0,
    vat_amount          NUMERIC(18,2) NOT NULL DEFAULT 0,
    note                VARCHAR(255),
    UNIQUE(tax_declaration_id, tax_invoice_id)
);

CREATE INDEX IF NOT EXISTS idx_tax_decl_lines_declaration
    ON tax_declaration_lines(tax_declaration_id);

-- 2. Lịch sử khấu trừ thuế GTGT cuối kỳ
CREATE TABLE IF NOT EXISTS vat_offset_runs (
    id                  BIGSERIAL PRIMARY KEY,
    run_code            VARCHAR(30) NOT NULL UNIQUE,
    period_month        INTEGER NOT NULL,
    period_year         INTEGER NOT NULL,
    branch_id           BIGINT NOT NULL,
    input_vat_amount    NUMERIC(18,2) NOT NULL DEFAULT 0,
    output_vat_amount   NUMERIC(18,2) NOT NULL DEFAULT 0,
    offset_amount       NUMERIC(18,2) NOT NULL DEFAULT 0,  -- phần được bù trừ
    payable_amount      NUMERIC(18,2) NOT NULL DEFAULT 0,  -- còn phải nộp (nếu > 0)
    carried_forward     NUMERIC(18,2) NOT NULL DEFAULT 0,  -- chuyển kỳ sau (nếu đầu vào > đầu ra)
    journal_entry_id    BIGINT REFERENCES journal_entries(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT','POSTED','CANCELLED')),
    created_by          VARCHAR(120) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    posted_at           TIMESTAMPTZ,
    UNIQUE(period_month, period_year, branch_id)
);

-- 3. Cache kiểm tra MST nhà cung cấp
CREATE TABLE IF NOT EXISTS tax_code_lookup_cache (
    id              BIGSERIAL PRIMARY KEY,
    tax_code        VARCHAR(20) NOT NULL UNIQUE,
    company_name    VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN'
                        CHECK (status IN ('ACTIVE','INACTIVE','UNKNOWN')),
    address         VARCHAR(500),
    checked_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Bổ sung cột cho tax_declarations đã có
ALTER TABLE tax_declarations
    ADD COLUMN IF NOT EXISTS declaration_type VARCHAR(20) DEFAULT 'MONTHLY'
        CHECK (declaration_type IN ('MONTHLY','QUARTERLY')),
    ADD COLUMN IF NOT EXISTS due_date DATE,
    ADD COLUMN IF NOT EXISTS quarter INTEGER;

CREATE INDEX IF NOT EXISTS idx_tax_declarations_branch_period
    ON tax_declarations(branch_id, year, month);

-- 5. Seed Permissions (TAX_VIEW, TAX_MANAGE)
INSERT INTO permissions (code, name, group_name, description)
SELECT 'TAX_VIEW', 'Xem phân hệ Thuế', 'Thuế', 'Xem tờ khai, hóa đơn, bảng kê VAT'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'TAX_VIEW');

INSERT INTO permissions (code, name, group_name, description)
SELECT 'TAX_MANAGE', 'Quản lý Thuế', 'Thuế', 'Tạo/sửa/nộp tờ khai, chạy khấu trừ thuế'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE code = 'TAX_MANAGE');

-- Gán quyền cho các roles
INSERT INTO role_permissions (role_code, permission_code)
SELECT r.code, p.code
FROM roles r
CROSS JOIN permissions p
WHERE r.code IN ('ADMIN', 'ACCOUNTANT') 
  AND p.code IN ('TAX_VIEW', 'TAX_MANAGE')
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp 
      WHERE rp.role_code = r.code AND rp.permission_code = p.code
  );

-- 6. Seed Accounts 1331, 3331, 33311 cho tất cả các chi nhánh
DO $$
DECLARE
    br RECORD;
BEGIN
    FOR br IN SELECT id FROM branches
    LOOP
        -- 1331 Thuế GTGT được khấu trừ
        IF NOT EXISTS (SELECT 1 FROM chart_of_accounts WHERE account_code = '1331' AND branch_id = br.id) THEN
            INSERT INTO chart_of_accounts (
                account_code, account_name, parent_code, account_type, account_nature, 
                level, has_children, is_active, branch_id
            ) VALUES (
                '1331', 'Thuế GTGT được khấu trừ', '133', 'ASSET', 'DEBIT', 
                2, false, true, br.id
            );
        END IF;

        -- 3331 Thuế GTGT phải nộp
        IF NOT EXISTS (SELECT 1 FROM chart_of_accounts WHERE account_code = '3331' AND branch_id = br.id) THEN
            INSERT INTO chart_of_accounts (
                account_code, account_name, parent_code, account_type, account_nature, 
                level, has_children, is_active, branch_id
            ) VALUES (
                '3331', 'Thuế GTGT phải nộp', '333', 'LIABILITY', 'CREDIT', 
                2, true, true, br.id
            );
        END IF;

        -- 33311 Thuế GTGT đầu ra
        IF NOT EXISTS (SELECT 1 FROM chart_of_accounts WHERE account_code = '33311' AND branch_id = br.id) THEN
            INSERT INTO chart_of_accounts (
                account_code, account_name, parent_code, account_type, account_nature, 
                level, has_children, is_active, branch_id
            ) VALUES (
                '33311', 'Thuế GTGT đầu ra', '3331', 'LIABILITY', 'CREDIT', 
                3, false, true, br.id
            );
        END IF;
    END LOOP;
END $$;
