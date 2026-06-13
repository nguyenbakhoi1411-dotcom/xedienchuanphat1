ALTER TABLE roles ADD COLUMN IF NOT EXISTS description VARCHAR(500);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS system_role BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

INSERT INTO permissions (code, module, action) VALUES
('INVENTORY_TRANSFER_APPROVE','INVENTORY','TRANSFER_APPROVE'),
('ACCOUNTING_EXPORT','ACCOUNTING','EXPORT'),
('HR_VIEW','HR','VIEW')
ON CONFLICT (code) DO UPDATE SET module = EXCLUDED.module, action = EXCLUDED.action;

INSERT INTO roles (code, name, description, system_role, status) VALUES
('SALES_STAFF','Nhan vien ban hang','Ban hang va cham soc khach hang',true,'ACTIVE'),
('WAREHOUSE_STAFF','Nhan vien kho','Nhap xuat ton va kiem kho',true,'ACTIVE'),
('MARKETING_STAFF','Marketing','Marketing va cham soc khach hang',true,'ACTIVE'),
('AUDITOR','Kiem toan noi bo','Xem bao cao va nhat ky he thong',true,'ACTIVE')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    system_role = EXCLUDED.system_role,
    status = EXCLUDED.status;

INSERT INTO role_permissions (role_id, permission_id)
SELECT new_role.id, rp.permission_id
FROM roles old_role
JOIN role_permissions rp ON rp.role_id = old_role.id
JOIN roles new_role ON new_role.code = CASE old_role.code
    WHEN 'SALES' THEN 'SALES_STAFF'
    WHEN 'WAREHOUSE' THEN 'WAREHOUSE_STAFF'
    WHEN 'MARKETING' THEN 'MARKETING_STAFF'
END
WHERE old_role.code IN ('SALES','WAREHOUSE','MARKETING')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('DASHBOARD_VIEW','REPORT_VIEW','REPORT_EXPORT','AUDIT_VIEW')
WHERE r.code = 'AUDITOR'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT ur.user_id, new_role.id
FROM user_roles ur
JOIN roles old_role ON old_role.id = ur.role_id
JOIN roles new_role ON new_role.code = CASE old_role.code
    WHEN 'SALES' THEN 'SALES_STAFF'
    WHEN 'WAREHOUSE' THEN 'WAREHOUSE_STAFF'
    WHEN 'MARKETING' THEN 'MARKETING_STAFF'
END
WHERE old_role.code IN ('SALES','WAREHOUSE','MARKETING')
ON CONFLICT DO NOTHING;
