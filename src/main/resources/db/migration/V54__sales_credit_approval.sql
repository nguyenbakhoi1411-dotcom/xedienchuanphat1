ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(14,2) NOT NULL DEFAULT 0;

ALTER TABLE sales_orders
    ALTER COLUMN status TYPE VARCHAR(40);

ALTER TABLE sales_orders
    ADD COLUMN IF NOT EXISTS credit_approval_status VARCHAR(30) NOT NULL DEFAULT 'NONE',
    ADD COLUMN IF NOT EXISTS credit_approved_by VARCHAR(120),
    ADD COLUMN IF NOT EXISTS credit_approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS credit_approval_note VARCHAR(500);

INSERT INTO permissions (code, module, action) VALUES
    ('SALES_CREDIT_APPROVE', 'SALES', 'CREDIT_APPROVE')
ON CONFLICT (code) DO UPDATE SET module = EXCLUDED.module, action = EXCLUDED.action;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = 'SALES_CREDIT_APPROVE'
WHERE r.code IN ('ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT')
ON CONFLICT DO NOTHING;
