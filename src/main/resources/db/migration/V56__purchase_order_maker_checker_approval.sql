INSERT INTO permissions (code, module, action) VALUES
    ('PURCHASE_VIEW',    'PURCHASE', 'VIEW'),
    ('PURCHASE_UPDATE',  'PURCHASE', 'UPDATE'),
    ('PURCHASE_APPROVE', 'PURCHASE', 'APPROVE'),
    ('PURCHASE_CANCEL',  'PURCHASE', 'CANCEL')
ON CONFLICT (code) DO UPDATE
    SET module = EXCLUDED.module, action = EXCLUDED.action;

INSERT INTO roles (code, name, description, system_role, status) VALUES
('PURCHASE_MANAGER', 'Quan ly mua hang', 'Duyet don mua hang duoi 20 trieu', true, 'ACTIVE'),
('CHIEF_ACCOUNTANT', 'Ke toan truong', 'Duyet don mua hang tu 20 den 100 trieu', true, 'ACTIVE')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    system_role = EXCLUDED.system_role,
    status = EXCLUDED.status;

INSERT INTO role_permissions (role_id, permission_id)
SELECT rp.role_id, p.id
FROM role_permissions rp
JOIN permissions create_perm ON create_perm.id = rp.permission_id AND create_perm.code = 'PURCHASE_CREATE'
CROSS JOIN permissions p
WHERE p.code IN ('PURCHASE_VIEW', 'PURCHASE_UPDATE', 'PURCHASE_CANCEL')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code IN ('PURCHASE_MANAGER', 'CHIEF_ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN', 'DIRECTOR')
  AND p.code = 'PURCHASE_APPROVE'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code IN ('PURCHASE_MANAGER', 'CHIEF_ACCOUNTANT', 'DIRECTOR', 'BRANCH_MANAGER')
  AND p.code IN ('PURCHASE_VIEW', 'PURCHASE_UPDATE', 'PURCHASE_CANCEL')
ON CONFLICT DO NOTHING;

UPDATE purchase_orders
SET status = 'SUBMITTED'
WHERE status = 'PENDING_APPROVAL';
