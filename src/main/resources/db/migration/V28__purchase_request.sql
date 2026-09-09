CREATE TABLE IF NOT EXISTS purchase_requests (
  id BIGSERIAL PRIMARY KEY,
  pr_no VARCHAR(30) NOT NULL UNIQUE,
  pr_date DATE NOT NULL,
  requested_by BIGINT REFERENCES app_users(id),
  department VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
  reason TEXT,
  expected_date DATE,
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PENDING','APPROVED','REJECTED','CONVERTED')),
  approved_by BIGINT REFERENCES app_users(id),
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  branch_id BIGINT NOT NULL REFERENCES branches(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_request_items (
  id BIGSERIAL PRIMARY KEY,
  pr_id BIGINT NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  product_name VARCHAR(200) NOT NULL,
  quantity NUMERIC(18,3) NOT NULL,
  unit VARCHAR(30),
  estimated_price NUMERIC(18,2),
  note VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_branch ON purchase_requests(branch_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
