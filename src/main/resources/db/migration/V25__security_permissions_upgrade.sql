INSERT INTO permissions (code, module, action)
VALUES
    ('VIEW_COST_PRICE', 'SECURITY', 'VIEW'),
    ('EDIT_COST_PRICE', 'SECURITY', 'EDIT'),
    ('VIEW_PROFIT', 'SECURITY', 'VIEW'),
    ('APPROVE_DISCOUNT', 'SECURITY', 'APPROVE'),
    ('CANCEL_INVOICE', 'SECURITY', 'CANCEL'),
    ('DELETE_DOCUMENT', 'SECURITY', 'DELETE'),
    ('LOCK_ACCOUNTING_PERIOD', 'ACCOUNTING', 'LOCK'),
    ('UNLOCK_ACCOUNTING_PERIOD', 'ACCOUNTING', 'UNLOCK'),
    ('EXPORT_REPORT', 'REPORT', 'EXPORT'),
    ('VIEW_ALL_BRANCHES', 'BRANCH', 'VIEW_ALL'),
    ('MANAGE_PERMISSIONS', 'AUTH', 'MANAGE'),
    ('VIEW_ACCOUNTING', 'ACCOUNTING', 'VIEW'),
    ('EDIT_ACCOUNTING', 'ACCOUNTING', 'EDIT'),
    ('VIEW_CUSTOMER_DEBT', 'CUSTOMER', 'VIEW_DEBT'),
    ('EDIT_INVENTORY', 'INVENTORY', 'EDIT'),
    ('APPROVE_STOCK_ADJUSTMENT', 'INVENTORY', 'APPROVE_ADJUSTMENT'),
    ('APPROVE_PURCHASE_ORDER', 'PURCHASE', 'APPROVE'),
    ('APPROVE_STOCK_TRANSFER', 'INVENTORY', 'APPROVE_TRANSFER'),
    ('VIEW_AUDIT_LOG', 'AUDIT', 'VIEW'),
    ('IMPORT_DATA', 'DATA_IO', 'IMPORT'),
    ('UPLOAD_FILE', 'DATA_IO', 'UPLOAD'),
    ('AI_ASSISTANT_USE', 'AI', 'USE')
ON CONFLICT (code) DO NOTHING;

INSERT INTO roles (code, name, description, system_role)
VALUES
    ('SUPER_ADMIN', 'Super admin', 'Toan quyen he thong', TRUE),
    ('DIRECTOR', 'Giam doc', 'Xem va phe duyet toan he thong', TRUE),
    ('HR_MANAGER', 'Quan ly nhan su', 'Quan ly nhan su, tai khoan va ho so', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'DASHBOARD_VIEW', 'BRANCH_VIEW', 'USER_VIEW', 'ROLE_VIEW', 'PRODUCT_VIEW', 'INVENTORY_VIEW',
    'SALES_VIEW', 'CUSTOMER_VIEW', 'WARRANTY_VIEW', 'SUPPLIER_VIEW', 'ACCOUNTING_VIEW',
    'ACCOUNTING_REPORT', 'ACCOUNTING_EXPORT', 'REPORT_VIEW', 'REPORT_EXPORT', 'EXPORT_REPORT',
    'AUDIT_VIEW', 'VIEW_AUDIT_LOG', 'VIEW_ALL_BRANCHES', 'VIEW_COST_PRICE', 'VIEW_PROFIT',
    'VIEW_CUSTOMER_DEBT', 'VIEW_ACCOUNTING', 'APPROVE_DISCOUNT', 'APPROVE_PRICE_POLICY',
    'CANCEL_PRICE_POLICY', 'LOCK_ACCOUNTING_PERIOD', 'UNLOCK_ACCOUNTING_PERIOD', 'IMPORT_DATA', 'UPLOAD_FILE', 'AI_ASSISTANT_USE'
)
WHERE r.code = 'DIRECTOR'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'EXPORT_REPORT', 'IMPORT_DATA', 'UPLOAD_FILE', 'AI_ASSISTANT_USE'
)
WHERE r.code = 'BRANCH_MANAGER'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'EXPORT_REPORT', 'IMPORT_DATA', 'UPLOAD_FILE', 'AI_ASSISTANT_USE'
)
WHERE r.code = 'ACCOUNTANT'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'IMPORT_DATA', 'UPLOAD_FILE', 'AI_ASSISTANT_USE'
)
WHERE r.code = 'WAREHOUSE_STAFF'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'UPLOAD_FILE', 'AI_ASSISTANT_USE'
)
WHERE r.code = 'TECHNICIAN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'DASHBOARD_VIEW', 'HR_VIEW', 'HR_MANAGE', 'USER_VIEW', 'USER_CREATE', 'USER_UPDATE',
    'ROLE_VIEW', 'VIEW_AUDIT_LOG', 'IMPORT_DATA', 'UPLOAD_FILE', 'AI_ASSISTANT_USE'
)
WHERE r.code = 'HR_MANAGER'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('VIEW_AUDIT_LOG', 'EXPORT_REPORT', 'AI_ASSISTANT_USE')
WHERE r.code = 'AUDITOR'
ON CONFLICT DO NOTHING;
