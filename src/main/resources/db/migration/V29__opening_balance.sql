CREATE TABLE IF NOT EXISTS opening_balances (
  id BIGSERIAL PRIMARY KEY,
  period_id BIGINT NOT NULL REFERENCES accounting_periods(id),
  account_code VARCHAR(20) NOT NULL,
  customer_id BIGINT REFERENCES customers(id),
  supplier_id BIGINT REFERENCES suppliers(id),
  debit_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  credit_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  note VARCHAR(255),
  branch_id BIGINT NOT NULL REFERENCES branches(id),
  created_by VARCHAR(120),
  locked_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_opening_balances_unique 
ON opening_balances (period_id, account_code, COALESCE(customer_id, 0), COALESCE(supplier_id, 0), branch_id);

INSERT INTO permissions (code, module, action)
VALUES ('OPENING_BALANCE_MANAGE', 'ACCOUNTING', 'MANAGE')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code IN ('SUPER_ADMIN', 'ADMIN') AND p.code = 'OPENING_BALANCE_MANAGE'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = 'OPENING_BALANCE_MANAGE'
WHERE r.code IN ('ACCOUNTANT', 'DIRECTOR')
ON CONFLICT DO NOTHING;
