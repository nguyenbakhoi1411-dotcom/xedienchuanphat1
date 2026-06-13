-- V9: Quản lý thuế suất và khai thuế

CREATE TABLE IF NOT EXISTS tax_rates (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    rate NUMERIC(5,2) NOT NULL,
    account_code VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_declarations (
    id BIGSERIAL PRIMARY KEY,
    declaration_code VARCHAR(30) NOT NULL UNIQUE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    branch_id BIGINT NOT NULL,
    output_tax_base NUMERIC(18,2) NOT NULL DEFAULT 0,
    output_vat_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    input_tax_base NUMERIC(18,2) NOT NULL DEFAULT 0,
    input_vat_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    vat_payable NUMERIC(18,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT',
    submitted_date DATE,
    submitted_by VARCHAR(120),
    note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_tax_decl_status CHECK (status IN ('DRAFT', 'SUBMITTED', 'ACCEPTED'))
);

CREATE INDEX IF NOT EXISTS idx_tax_declarations_branch_year ON tax_declarations(branch_id, year);
CREATE INDEX IF NOT EXISTS idx_tax_declarations_month_year ON tax_declarations(month, year);

-- Seed thuế suất chuẩn Việt Nam
INSERT INTO tax_rates (code, name, rate, account_code)
VALUES
  ('VAT_0',     'VAT 0%',          0.00, '3331'),
  ('VAT_5',     'VAT 5%',          5.00, '3331'),
  ('VAT_8',     'VAT 8%',          8.00, '3331'),
  ('VAT_10',    'VAT 10%',        10.00, '3331'),
  ('EXEMPT',    'Không chịu thuế', 0.00, NULL)
ON CONFLICT (code) DO NOTHING;
