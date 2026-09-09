-- V16: Accounting Module Upgrade — MISA AMIS Level
-- Nâng cấp module kế toán: Expense, TaxInvoice, FixedAsset, Journal nâng cao

-- ========================
-- 1. JournalEntry — thêm trường
-- ========================
ALTER TABLE journal_entries
    ADD COLUMN IF NOT EXISTS entry_code VARCHAR(30),
    ADD COLUMN IF NOT EXISTS branch_id  BIGINT,
    ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(120),
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS uq_journal_entries_entry_code
    ON journal_entries(entry_code) WHERE entry_code IS NOT NULL;

-- ========================
-- 2. JournalEntryLine — thêm trường
-- ========================
ALTER TABLE journal_entry_lines
    ADD COLUMN IF NOT EXISTS journal_entry_id BIGINT,
    ADD COLUMN IF NOT EXISTS account_id BIGINT,
    ADD COLUMN IF NOT EXISTS customer_id   BIGINT,
    ADD COLUMN IF NOT EXISTS supplier_id   BIGINT,
    ADD COLUMN IF NOT EXISTS product_id    BIGINT,
    ADD COLUMN IF NOT EXISTS branch_id     BIGINT,
    ADD COLUMN IF NOT EXISTS cost_center_id BIGINT,
    ADD COLUMN IF NOT EXISTS tax_amount    NUMERIC(18,2) DEFAULT 0;

UPDATE journal_entry_lines
SET journal_entry_id = entry_id
WHERE journal_entry_id IS NULL
  AND entry_id IS NOT NULL;

UPDATE journal_entry_lines line
SET account_id = account.id
FROM chart_of_accounts account
WHERE line.account_id IS NULL
  AND line.account_code = account.account_code;

-- ========================
-- 3. TaxInvoice — hóa đơn VAT (đầu vào / đầu ra)
-- ========================
CREATE TABLE IF NOT EXISTS tax_invoices (
    id                  BIGSERIAL PRIMARY KEY,
    invoice_code        VARCHAR(30)  NOT NULL,
    invoice_serial      VARCHAR(10),
    invoice_date        DATE         NOT NULL,
    invoice_type        VARCHAR(10)  NOT NULL CHECK (invoice_type IN ('OUTPUT','INPUT')),
    status              VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT','ISSUED','ADJUSTED','REPLACED','CANCELLED')),
    customer_id         BIGINT REFERENCES customers(id),
    supplier_id         BIGINT REFERENCES suppliers(id),
    -- E-invoice extensibility fields
    e_invoice_provider  VARCHAR(30),                -- MISA, VIETTEL, VNPT, null
    e_invoice_no        VARCHAR(50),                -- Số hóa đơn điện tử từ provider
    e_invoice_status    VARCHAR(20),                -- PENDING, ISSUED, FAILED
    e_invoice_issued_at TIMESTAMPTZ,
    -- Giá trị
    tax_base_amount     NUMERIC(18,2) NOT NULL DEFAULT 0,
    vat_rate            NUMERIC(5,2)  NOT NULL DEFAULT 0,
    vat_amount          NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(18,2) NOT NULL DEFAULT 0,
    -- Liên kết
    related_order_no    VARCHAR(80),
    related_return_no   VARCHAR(80),
    tax_declaration_id  BIGINT REFERENCES tax_declarations(id),
    adjusted_invoice_id BIGINT REFERENCES tax_invoices(id),  -- hóa đơn thay thế/điều chỉnh
    branch_id           BIGINT NOT NULL,
    -- Audit
    created_by          VARCHAR(120) NOT NULL,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    issued_at           TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    cancelled_by        VARCHAR(120),
    note                VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_tax_invoices_date_branch ON tax_invoices(invoice_date, branch_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_type_status ON tax_invoices(invoice_type, status);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_customer ON tax_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_supplier ON tax_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_declaration ON tax_invoices(tax_declaration_id);

-- ========================
-- 4. Expense — chi phí vận hành
-- ========================
CREATE TABLE IF NOT EXISTS expenses (
    id              BIGSERIAL    PRIMARY KEY,
    expense_code    VARCHAR(30)  UNIQUE NOT NULL,
    expense_date    DATE         NOT NULL,
    category        VARCHAR(30)  NOT NULL
                        CHECK (category IN ('SALARY','RENT','UTILITIES','MARKETING','MAINTENANCE','DEPRECIATION','OTHER')),
    amount          NUMERIC(18,2) NOT NULL,
    description     VARCHAR(500),
    branch_id       BIGINT       NOT NULL,
    account_code    VARCHAR(20)  NOT NULL,          -- TK nợ (641, 642, 811...)
    contra_account  VARCHAR(20),                   -- TK có (111, 112, 334...)
    journal_entry_id BIGINT REFERENCES journal_entries(id),
    status          VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','POSTED','CANCELLED')),
    created_by      VARCHAR(120) NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    posted_by       VARCHAR(120),
    posted_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_expenses_date_branch ON expenses(expense_date, branch_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

-- ========================
-- 5. FixedAsset — tài sản cố định
-- ========================
CREATE TABLE IF NOT EXISTS fixed_assets (
    id                  BIGSERIAL   PRIMARY KEY,
    asset_code          VARCHAR(30) UNIQUE NOT NULL,
    asset_name          VARCHAR(200) NOT NULL,
    category            VARCHAR(40) NOT NULL,           -- VEHICLE, MACHINE, EQUIPMENT, BUILDING, OTHER
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('ACTIVE','DISPOSED','FULLY_DEPRECIATED')),
    purchase_date       DATE        NOT NULL,
    cost_amount         NUMERIC(18,2) NOT NULL,         -- Nguyên giá
    residual_value      NUMERIC(18,2) NOT NULL DEFAULT 0, -- Giá trị thanh lý ước tính
    useful_life_months  INTEGER     NOT NULL,            -- Thời gian khấu hao (tháng)
    depreciation_method VARCHAR(20) NOT NULL DEFAULT 'STRAIGHT_LINE', -- STRAIGHT_LINE, DECLINING_BALANCE
    accumulated_depr    NUMERIC(18,2) NOT NULL DEFAULT 0, -- Khấu hao lũy kế
    book_value          NUMERIC(18,2) GENERATED ALWAYS AS (cost_amount - accumulated_depr) STORED,
    branch_id           BIGINT      NOT NULL,
    account_code        VARCHAR(20) DEFAULT '211',      -- TK TSCĐ
    depr_account_code   VARCHAR(20) DEFAULT '214',      -- TK khấu hao
    expense_account     VARCHAR(20) DEFAULT '642',      -- TK chi phí khấu hao
    purchase_order_no   VARCHAR(80),
    supplier_name       VARCHAR(200),
    note                VARCHAR(500),
    disposed_at         DATE,
    disposed_by         VARCHAR(120),
    disposal_amount     NUMERIC(18,2),                  -- Giá thanh lý thực tế
    created_by          VARCHAR(120) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fixed_assets_branch ON fixed_assets(branch_id);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_status ON fixed_assets(status);

-- ========================
-- 6. FixedAssetDepreciation — khấu hao hàng tháng
-- ========================
CREATE TABLE IF NOT EXISTS fixed_asset_depreciation (
    id              BIGSERIAL   PRIMARY KEY,
    asset_id        BIGINT      NOT NULL REFERENCES fixed_assets(id),
    depreciation_month  INTEGER NOT NULL,   -- 1-12
    depreciation_year   INTEGER NOT NULL,
    amount          NUMERIC(18,2) NOT NULL,
    journal_entry_id BIGINT REFERENCES journal_entries(id),
    created_by      VARCHAR(120) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id, depreciation_year, depreciation_month)
);

CREATE INDEX IF NOT EXISTS idx_fixed_asset_depr_asset ON fixed_asset_depreciation(asset_id);
CREATE INDEX IF NOT EXISTS idx_fixed_asset_depr_period ON fixed_asset_depreciation(depreciation_year, depreciation_month);

-- ========================
-- 7. Performance indexes
-- ========================
CREATE INDEX IF NOT EXISTS idx_journal_entries_branch ON journal_entries(branch_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_customer ON journal_entry_lines(customer_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_supplier ON journal_entry_lines(supplier_id);
