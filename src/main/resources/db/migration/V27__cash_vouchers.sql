CREATE TABLE IF NOT EXISTS cash_vouchers (
  id BIGSERIAL PRIMARY KEY,
  voucher_no VARCHAR(30) NOT NULL UNIQUE,
  voucher_type VARCHAR(10) NOT NULL CHECK (voucher_type IN ('RECEIPT','PAYMENT')),
  voucher_date DATE NOT NULL,
  reference_no VARCHAR(80),
  object_type VARCHAR(20) CHECK (object_type IN ('CUSTOMER','SUPPLIER','EMPLOYEE','OTHER')),
  customer_id BIGINT REFERENCES customers(id),
  supplier_id BIGINT REFERENCES suppliers(id),
  description VARCHAR(500),
  total_amount NUMERIC(18,2) NOT NULL,
  cash_account_code VARCHAR(20) NOT NULL DEFAULT '111',
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','POSTED','CANCELLED')),
  branch_id BIGINT NOT NULL REFERENCES branches(id),
  journal_entry_id BIGINT REFERENCES journal_entries(id),
  created_by VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cash_voucher_lines (
  id BIGSERIAL PRIMARY KEY,
  voucher_id BIGINT NOT NULL REFERENCES cash_vouchers(id) ON DELETE CASCADE,
  line_no INTEGER NOT NULL,
  account_code VARCHAR(20) NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  description VARCHAR(255),
  cost_center_id BIGINT
);

CREATE INDEX IF NOT EXISTS idx_cash_vouchers_branch ON cash_vouchers(branch_id);
CREATE INDEX IF NOT EXISTS idx_cash_vouchers_date ON cash_vouchers(voucher_date);
CREATE INDEX IF NOT EXISTS idx_cash_vouchers_status ON cash_vouchers(status);
