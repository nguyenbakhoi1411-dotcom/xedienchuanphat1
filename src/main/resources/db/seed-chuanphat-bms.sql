-- Chuan Phat BMS seed data for the current JPA schema.
-- Target: H2 with MODE=PostgreSQL. Run after Hibernate has created/updated tables.

MERGE INTO permissions (id, code, module, action) KEY(id)
SELECT X,
       CASE X
           WHEN 1 THEN 'DASHBOARD_VIEW'
           WHEN 2 THEN 'BRANCH_VIEW'
           WHEN 3 THEN 'BRANCH_CREATE'
           WHEN 4 THEN 'BRANCH_UPDATE'
           WHEN 5 THEN 'BRANCH_DELETE'
           WHEN 6 THEN 'PRODUCT_VIEW'
           WHEN 7 THEN 'PRODUCT_CREATE'
           WHEN 8 THEN 'PRODUCT_UPDATE'
           WHEN 9 THEN 'PRODUCT_DELETE'
           WHEN 10 THEN 'INVENTORY_VIEW'
           WHEN 11 THEN 'INVENTORY_IMPORT'
           WHEN 12 THEN 'INVENTORY_EXPORT'
           WHEN 13 THEN 'INVENTORY_TRANSFER'
           WHEN 14 THEN 'INVENTORY_STOCKTAKE'
           WHEN 15 THEN 'SALES_VIEW'
           WHEN 16 THEN 'SALES_CREATE'
           WHEN 17 THEN 'CUSTOMER_VIEW'
           WHEN 18 THEN 'CUSTOMER_CREATE'
           WHEN 19 THEN 'CUSTOMER_UPDATE'
           WHEN 20 THEN 'SUPPLIER_VIEW'
           WHEN 21 THEN 'SUPPLIER_CREATE'
           WHEN 22 THEN 'SUPPLIER_UPDATE'
           WHEN 23 THEN 'PURCHASE_CREATE'
           WHEN 24 THEN 'WARRANTY_VIEW'
           WHEN 25 THEN 'WARRANTY_MANAGE'
           WHEN 26 THEN 'ACCOUNTING_VIEW'
           WHEN 27 THEN 'RECEIPT_CREATE'
           WHEN 28 THEN 'PAYMENT_CREATE'
           WHEN 29 THEN 'REPORT_VIEW'
           WHEN 30 THEN 'REPORT_EXPORT'
           WHEN 31 THEN 'AUDIT_VIEW'
           ELSE 'SETTING_MANAGE'
       END,
       CASE
           WHEN X BETWEEN 2 AND 5 THEN 'BRANCH'
           WHEN X BETWEEN 6 AND 9 THEN 'PRODUCT'
           WHEN X BETWEEN 10 AND 14 THEN 'INVENTORY'
           WHEN X BETWEEN 15 AND 16 THEN 'SALES'
           WHEN X BETWEEN 17 AND 19 THEN 'CUSTOMER'
           WHEN X BETWEEN 20 AND 23 THEN 'SUPPLIER'
           WHEN X BETWEEN 24 AND 25 THEN 'WARRANTY'
           WHEN X BETWEEN 26 AND 28 THEN 'ACCOUNTING'
           WHEN X BETWEEN 29 AND 30 THEN 'REPORT'
           WHEN X = 31 THEN 'AUDIT'
           ELSE 'SYSTEM'
       END,
       CASE
           WHEN X IN (1,2,6,10,15,17,20,24,26,29,31) THEN 'VIEW'
           WHEN X IN (3,7,11,16,18,21,23,27,28) THEN 'CREATE'
           WHEN X IN (4,8,12,13,14,19,22,25,32) THEN 'UPDATE'
           ELSE 'DELETE'
       END
FROM SYSTEM_RANGE(1, 32);

MERGE INTO permissions (id, code, module, action) KEY(id) VALUES
(33, 'USER_VIEW', 'USER', 'VIEW'),
(34, 'USER_CREATE', 'USER', 'CREATE'),
(35, 'USER_UPDATE', 'USER', 'UPDATE'),
(36, 'ROLE_VIEW', 'ROLE', 'VIEW'),
(37, 'ROLE_UPDATE', 'ROLE', 'UPDATE'),
(38, 'MARKETING_VIEW', 'MARKETING', 'VIEW'),
(39, 'MARKETING_CREATE', 'MARKETING', 'CREATE'),
(40, 'MARKETING_UPDATE', 'MARKETING', 'UPDATE');

MERGE INTO permissions (id, code, module, action) KEY(id) VALUES
(41, 'SALES_UPDATE', 'SALES', 'UPDATE'),
(42, 'SALES_CANCEL', 'SALES', 'CANCEL'),
(43, 'SALES_DISCOUNT_APPROVE', 'SALES', 'APPROVE'),
(44, 'SALES_RETURN', 'SALES', 'RETURN'),
(45, 'INVOICE_ISSUE', 'INVOICE', 'ISSUE');

MERGE INTO roles (id, code, name) KEY(id) VALUES
(1, 'ADMIN', 'Quan tri he thong'),
(2, 'BRANCH_MANAGER', 'Quan ly chi nhanh'),
(3, 'SALES', 'Nhan vien ban hang'),
(4, 'WAREHOUSE', 'Thu kho'),
(5, 'ACCOUNTANT', 'Ke toan'),
(6, 'TECHNICIAN', 'Ky thuat vien'),
(7, 'USER', 'Nguoi dung');

MERGE INTO role_permissions (role_id, permission_id) KEY(role_id, permission_id)
SELECT 1, id FROM permissions;

MERGE INTO role_permissions (role_id, permission_id) KEY(role_id, permission_id)
SELECT role_id, permission_id FROM (
    SELECT 2 role_id, X permission_id FROM SYSTEM_RANGE(1, 31)
    UNION ALL SELECT 3, X FROM SYSTEM_RANGE(1, 1)
    UNION ALL SELECT 3, X FROM SYSTEM_RANGE(6, 6)
    UNION ALL SELECT 3, X FROM SYSTEM_RANGE(10, 10)
    UNION ALL SELECT 3, X FROM SYSTEM_RANGE(15, 19)
    UNION ALL SELECT 4, X FROM SYSTEM_RANGE(6, 6)
    UNION ALL SELECT 4, X FROM SYSTEM_RANGE(10, 14)
    UNION ALL SELECT 4, X FROM SYSTEM_RANGE(20, 23)
    UNION ALL SELECT 5, X FROM SYSTEM_RANGE(26, 30)
    UNION ALL SELECT 6, X FROM SYSTEM_RANGE(17, 17)
    UNION ALL SELECT 6, X FROM SYSTEM_RANGE(24, 25)
);

MERGE INTO role_permissions (role_id, permission_id) KEY(role_id, permission_id)
SELECT role_id, permission_id FROM (
    SELECT 2 role_id, X permission_id FROM SYSTEM_RANGE(41, 45)
    UNION ALL SELECT 3, 41
    UNION ALL SELECT 3, 44
    UNION ALL SELECT 3, 45
);

MERGE INTO app_users (id, username, email, phone, full_name, password_hash, branch_id, role_id, status, created_at) KEY(id) VALUES
(1, 'admin', 'admin@chuanphat.vn', '0909000001', 'Admin Chuan Phat', '{bcrypt}$2a$10$7EqJtq98hPqEX7fNZaFWoOhi/3zO4IdbQGtoK9PHT7y.gD1yP7z8m', NULL, 1, 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00');

MERGE INTO branches (id, code, name, address, phone, status, created_at) KEY(id) VALUES
(1, 'CP-GV', 'Chuan Phat Go Vap', '121 Quang Trung, Quan Go Vap, TP.HCM', '02839010001', 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(2, 'CP-TD', 'Chuan Phat Thu Duc', '45 Vo Van Ngan, TP. Thu Duc, TP.HCM', '02839010002', 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(3, 'CP-Q7', 'Chuan Phat Quan 7', '88 Nguyen Thi Thap, Quan 7, TP.HCM', '02839010003', 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(4, 'CP-TB', 'Chuan Phat Tan Binh', '19 Cong Hoa, Quan Tan Binh, TP.HCM', '02839010004', 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(5, 'CP-BD', 'Chuan Phat Binh Duong', '22 Dai lo Binh Duong, Thu Dau Mot', '02743901005', 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(6, 'CP-DN', 'Chuan Phat Dong Nai', '9 Pham Van Thuan, Bien Hoa', '02513901006', 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00');

MERGE INTO warehouses (id, warehouse_code, warehouse_name, branch_id, type, status, location_aisle, location_shelf, location_bin, description, created_at) KEY(id)
SELECT X,
       'WH-MAIN-' || LPAD(CAST(X AS VARCHAR), 2, '0'),
       'Kho chinh chi nhanh ' || X,
       X,
       'MAIN',
       'ACTIVE',
       'A',
       'S1',
       'B1',
       'Seed main warehouse for branch ' || X,
       TIMESTAMP '2026-01-01 08:30:00'
FROM SYSTEM_RANGE(1, 6);

MERGE INTO app_users (id, username, email, phone, full_name, password_hash, branch_id, role_id, status, created_at) KEY(id)
SELECT X + 1,
       'nv' || LPAD(CAST(X AS VARCHAR), 3, '0'),
       'nv' || LPAD(CAST(X AS VARCHAR), 3, '0') || '@chuanphat.vn',
       '09' || LPAD(CAST(10000000 + X AS VARCHAR), 8, '0'),
       CASE MOD(X, 6) WHEN 1 THEN 'Nguyen Minh Anh' WHEN 2 THEN 'Tran Bao Chau' WHEN 3 THEN 'Le Quoc Dat' WHEN 4 THEN 'Pham Gia Huy' WHEN 5 THEN 'Vo Thanh Khoa' ELSE 'Dang Nhat Linh' END || ' ' || X,
       '{bcrypt}$2a$10$7EqJtq98hPqEX7fNZaFWoOhi/3zO4IdbQGtoK9PHT7y.gD1yP7z8m',
       MOD(X - 1, 6) + 1,
       CASE WHEN X <= 6 THEN 2 WHEN MOD(X, 5) = 0 THEN 5 WHEN MOD(X, 4) = 0 THEN 6 WHEN MOD(X, 3) = 0 THEN 4 ELSE 3 END,
       'ACTIVE',
       TIMESTAMP '2026-01-01 08:00:00'
FROM SYSTEM_RANGE(1, 20);

MERGE INTO app_users (id, username, email, phone, full_name, password_hash, branch_id, role_id, status, created_at) KEY(id) VALUES
(101, 'manager1', 'manager1@chuanphat.vn', '0909100001', 'Demo Branch Manager 1', '{bcrypt}$2a$10$GzAVGEgQ4s3vZ3c1Ew1DtOvTXqMJ09v0XyTHiWAevfDQZVNCyNyoa', 1, 2, 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(102, 'sales1', 'sales1@chuanphat.vn', '0909100002', 'Demo Sales 1', '{bcrypt}$2a$10$GzAVGEgQ4s3vZ3c1Ew1DtOvTXqMJ09v0XyTHiWAevfDQZVNCyNyoa', 1, 3, 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(103, 'warehouse1', 'warehouse1@chuanphat.vn', '0909100003', 'Demo Warehouse 1', '{bcrypt}$2a$10$GzAVGEgQ4s3vZ3c1Ew1DtOvTXqMJ09v0XyTHiWAevfDQZVNCyNyoa', 1, 4, 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(104, 'accountant1', 'accountant1@chuanphat.vn', '0909100004', 'Demo Accountant 1', '{bcrypt}$2a$10$GzAVGEgQ4s3vZ3c1Ew1DtOvTXqMJ09v0XyTHiWAevfDQZVNCyNyoa', 1, 5, 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(105, 'technician1', 'technician1@chuanphat.vn', '0909100005', 'Demo Technician 1', '{bcrypt}$2a$10$GzAVGEgQ4s3vZ3c1Ew1DtOvTXqMJ09v0XyTHiWAevfDQZVNCyNyoa', 1, 6, 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(106, 'sales2', 'sales2@chuanphat.vn', '0909100006', 'Demo Sales 2', '{bcrypt}$2a$10$GzAVGEgQ4s3vZ3c1Ew1DtOvTXqMJ09v0XyTHiWAevfDQZVNCyNyoa', 2, 3, 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00');

MERGE INTO products (id, product_code, product_name, category, brand, model, color, battery_capacity, motor_power, import_price, sale_price, warranty_months, status, created_at) KEY(id)
SELECT X,
       'CP-' || CASE WHEN X <= 30 THEN 'XE' WHEN X <= 40 THEN 'PIN' ELSE 'PT' END || '-' || LPAD(CAST(X AS VARCHAR), 3, '0'),
       CASE WHEN X <= 30 THEN 'Xe may dien Chuan Phat ' || CASE MOD(X, 5) WHEN 1 THEN 'S1' WHEN 2 THEN 'City' WHEN 3 THEN 'Sport' WHEN 4 THEN 'Neo' ELSE 'Plus' END
            WHEN X <= 40 THEN 'Pin lithium LFP ' || CAST(48 + MOD(X, 5) * 12 AS VARCHAR) || 'V'
            ELSE CASE MOD(X, 5) WHEN 1 THEN 'Bo sac nhanh' WHEN 2 THEN 'Lop xe dien' WHEN 3 THEN 'Bo dieu khien' WHEN 4 THEN 'Tay ga dien' ELSE 'Den pha LED' END END || ' #' || X,
       CASE WHEN X <= 30 THEN 'ELECTRIC_MOTORBIKE' WHEN X <= 40 THEN 'BATTERY' WHEN MOD(X, 5) = 1 THEN 'CHARGER' ELSE 'SPARE_PART' END,
       CASE MOD(X, 4) WHEN 1 THEN 'Chuan Phat' WHEN 2 THEN 'VinFast' WHEN 3 THEN 'Dat Bike' ELSE 'Yadea' END,
       CASE MOD(X, 5) WHEN 1 THEN 'S1' WHEN 2 THEN 'City' WHEN 3 THEN 'Sport' WHEN 4 THEN 'Neo' ELSE 'Plus' END,
       CASE MOD(X, 6) WHEN 1 THEN 'Trang' WHEN 2 THEN 'Den' WHEN 3 THEN 'Do' WHEN 4 THEN 'Xanh duong' WHEN 5 THEN 'Xam' ELSE 'Bac' END,
       CASE WHEN X <= 40 THEN CAST(48 + MOD(X, 4) * 12 AS VARCHAR) || 'V ' || CAST(20 + MOD(X, 5) * 8 AS VARCHAR) || 'Ah' ELSE NULL END,
       CASE WHEN X <= 30 THEN CAST(800 + MOD(X, 6) * 250 AS VARCHAR) || 'W' ELSE NULL END,
       CASE WHEN X <= 30 THEN 9500000 + X * 125000 WHEN X <= 40 THEN 2800000 + X * 45000 ELSE 120000 + X * 35000 END,
       CASE WHEN X <= 30 THEN 13500000 + X * 180000 WHEN X <= 40 THEN 4200000 + X * 70000 ELSE 250000 + X * 55000 END,
       CASE WHEN X <= 30 THEN 24 WHEN X <= 40 THEN 12 ELSE 6 END,
       'ACTIVE',
       TIMESTAMP '2026-01-15 09:00:00'
FROM SYSTEM_RANGE(1, 50);

MERGE INTO product_serials (id, product_id, serial_number, branch_id, warehouse_id, battery_serial, motor_serial, import_date, status, created_at) KEY(id)
SELECT X,
       MOD(X - 1, 30) + 1,
       'CP26-' || LPAD(CAST(MOD(X - 1, 30) + 1 AS VARCHAR), 3, '0') || '-' || LPAD(CAST(X AS VARCHAR), 5, '0'),
       MOD(X - 1, 6) + 1,
       MOD(X - 1, 6) + 1,
       'BAT26-' || LPAD(CAST(X AS VARCHAR), 5, '0'),
       'MOT26-' || LPAD(CAST(X AS VARCHAR), 5, '0'),
       DATEADD('DAY', -MOD(X, 120), DATE '2026-06-06'),
       CASE WHEN X <= 60 THEN 'SOLD' WHEN MOD(X, 10) = 0 THEN 'WARRANTY' ELSE 'IN_STOCK' END,
       CURRENT_TIMESTAMP
FROM SYSTEM_RANGE(1, 100);

MERGE INTO customers (id, phone, full_name, email, address, source, branch_id, tier, rank, score, status, total_purchase_amount, total_purchase_count, total_debt, lifetime_value, created_at) KEY(id)
SELECT X,
       '09' || LPAD(CAST(20000000 + X AS VARCHAR), 8, '0'),
       CASE MOD(X, 10) WHEN 1 THEN 'Nguyen Van Minh' WHEN 2 THEN 'Tran Thi Huong' WHEN 3 THEN 'Le Quoc Bao' WHEN 4 THEN 'Pham Ngoc Anh' WHEN 5 THEN 'Hoang Thanh Tung' WHEN 6 THEN 'Vo Thi Mai' WHEN 7 THEN 'Dang Gia Khang' WHEN 8 THEN 'Bui Minh Thu' WHEN 9 THEN 'Do Van Phuc' ELSE 'Phan Thanh Lam' END || ' ' || X,
       'kh' || LPAD(CAST(X AS VARCHAR), 5, '0') || '@gmail.com',
       CASE MOD(X, 6) WHEN 1 THEN 'Go Vap, TP.HCM' WHEN 2 THEN 'Thu Duc, TP.HCM' WHEN 3 THEN 'Quan 7, TP.HCM' WHEN 4 THEN 'Tan Binh, TP.HCM' WHEN 5 THEN 'Thu Dau Mot, Binh Duong' ELSE 'Bien Hoa, Dong Nai' END,
       CASE MOD(X, 4) WHEN 1 THEN 'FACEBOOK' WHEN 2 THEN 'ZALO' WHEN 3 THEN 'REFERRAL' ELSE 'WALK_IN' END,
       MOD(X - 1, 6) + 1,
       'NEW',
       'NEW',
       0,
       'ACTIVE',
       0,
       0,
       0,
       0,
       DATEADD('DAY', -MOD(X, 365), TIMESTAMP '2026-06-06 10:00:00')
FROM SYSTEM_RANGE(1, 100);

MERGE INTO inventory_stocks (id, branch_id, warehouse_id, product_id, quantity_on_hand, reserved_quantity, available_quantity, min_quantity, max_quantity, updated_at) KEY(id)
SELECT (b.X - 1) * 50 + p.X,
       b.X,
       b.X,
       p.X,
       CASE WHEN p.X <= 30 THEN MOD(b.X + p.X, 7) + 1 WHEN p.X <= 40 THEN MOD(b.X * p.X, 11) + 3 ELSE MOD(b.X + p.X, 18) + 5 END,
       0,
       CASE WHEN p.X <= 30 THEN MOD(b.X + p.X, 7) + 1 WHEN p.X <= 40 THEN MOD(b.X * p.X, 11) + 3 ELSE MOD(b.X + p.X, 18) + 5 END,
       CASE WHEN p.X <= 30 THEN 2 WHEN p.X <= 40 THEN 5 ELSE 8 END,
       100,
       TIMESTAMP '2026-06-06 18:00:00'
FROM SYSTEM_RANGE(1, 6) b
CROSS JOIN SYSTEM_RANGE(1, 50) p;

MERGE INTO sales_orders (
    id, order_no, branch_id, customer_id, employee_id, order_date, status,
    subtotal, discount_amount, voucher_code, total_amount, vat_rate, vat_amount,
    paid_amount, payment_status, accounting_recorded, stock_issued, warranty_created,
    voucher_consumed, max_discount_pct, discount_approval_status, created_at
) KEY(id)
SELECT X,
       'SO-2026-' || LPAD(CAST(X AS VARCHAR), 5, '0'),
       MOD(X - 1, 6) + 1,
       MOD(X - 1, 100) + 1,
       MOD(X - 1, 20) + 2,
       DATEADD('DAY', -MOD(X, 365), DATE '2026-06-06'),
       CASE WHEN MOD(X, 25) = 0 THEN 'CANCELLED' WHEN MOD(X, 6) = 0 THEN 'PARTIALLY_PAID' ELSE 'PAID' END,
       CASE WHEN MOD(X, 4) = 0 THEN 5600000 + X * 10000 ELSE 14800000 + X * 22000 END,
       CASE WHEN MOD(X, 7) = 0 THEN 500000 ELSE 0 END,
       '',
       CASE WHEN MOD(X, 4) = 0 THEN 5600000 + X * 10000 ELSE 14800000 + X * 22000 END - CASE WHEN MOD(X, 7) = 0 THEN 500000 ELSE 0 END,
       10.00,
       ROUND((CASE WHEN MOD(X, 4) = 0 THEN 5600000 + X * 10000 ELSE 14800000 + X * 22000 END - CASE WHEN MOD(X, 7) = 0 THEN 500000 ELSE 0 END) / 11, 2),
       CASE WHEN MOD(X, 6) = 0 THEN 5000000 ELSE CASE WHEN MOD(X, 4) = 0 THEN 5600000 + X * 10000 ELSE 14800000 + X * 22000 END - CASE WHEN MOD(X, 7) = 0 THEN 500000 ELSE 0 END END,
       CASE WHEN MOD(X, 6) = 0 THEN 'PARTIAL' ELSE 'PAID' END,
       TRUE,
       TRUE,
       CASE WHEN MOD(X, 4) = 0 THEN FALSE ELSE TRUE END,
       FALSE,
       5.00,
       CASE WHEN MOD(X, 7) = 0 THEN 'APPROVED' ELSE 'NONE' END,
       DATEADD('DAY', -MOD(X, 365), TIMESTAMP '2026-06-06 10:00:00')
FROM SYSTEM_RANGE(1, 200);

MERGE INTO sales_order_items (id, order_id, product_id, serial_id, quantity, unit_price, line_total) KEY(id)
SELECT X,
       X,
       CASE WHEN MOD(X, 4) = 0 THEN 31 + MOD(X, 20) ELSE MOD(X - 1, 30) + 1 END,
       CASE WHEN X <= 100 THEN X ELSE NULL END,
       CASE WHEN MOD(X, 4) = 0 THEN 2 ELSE 1 END,
       CASE WHEN MOD(X, 4) = 0 THEN 2800000 + MOD(X, 20) * 70000 ELSE 14800000 + X * 22000 END,
       CASE WHEN MOD(X, 4) = 0 THEN (2800000 + MOD(X, 20) * 70000) * 2 ELSE 14800000 + X * 22000 END
FROM SYSTEM_RANGE(1, 200);

MERGE INTO invoices (id, invoice_no, order_id, invoice_date, total_amount, vat_amount, status, created_at) KEY(id)
SELECT id,
       'INV-2026-' || LPAD(CAST(id AS VARCHAR), 5, '0'),
       id,
       order_date,
       total_amount,
       ROUND(total_amount / 11, 2),
       CASE WHEN status = 'CANCELLED' THEN 'CANCELLED' ELSE 'ISSUED' END,
       CAST(order_date AS TIMESTAMP)
FROM sales_orders;

MERGE INTO warranties (id, serial_number, vehicle_id, customer_name, purchase_date, start_date, end_date, status, created_at) KEY(id)
SELECT X,
       ps.serial_number,
       ps.id,
       c.full_name,
       so.order_date,
       so.order_date,
       DATEADD('MONTH', 24, so.order_date),
       'ACTIVE',
       TIMESTAMP '2026-06-06 10:00:00'
FROM SYSTEM_RANGE(1, 50) r
JOIN product_serials ps ON ps.id = r.X
JOIN sales_orders so ON so.id = r.X
JOIN customers c ON c.id = so.customer_id
WHERE ps.product_id <= 30;

MERGE INTO service_tickets (
    id, vehicle_id, branch_id, serial_number, customer_name, customer_id, customer_phone,
    issue_description, customer_reported_issue, received_date, expected_return_date,
    service_type, status, technician_username, diagnosis_note, component_type,
    warranty_repair, labor_cost, parts_cost, warranty_cost, customer_pay_amount,
    total_cost, created_at, updated_at
) KEY(id)
SELECT X,
       X,
       MOD(X - 1, 6) + 1,
       'CP26-' || LPAD(CAST(MOD(X - 1, 30) + 1 AS VARCHAR), 3, '0') || '-' || LPAD(CAST(X AS VARCHAR), 5, '0'),
       'Khach hang dich vu ' || X,
       MOD(X - 1, 100) + 1,
       '09' || LPAD(CAST(30000000 + X AS VARCHAR), 8, '0'),
       CASE MOD(X, 5) WHEN 1 THEN 'Kiem tra pin va thoi luong su dung' WHEN 2 THEN 'Xe khong nhan sac' WHEN 3 THEN 'Bao loi bo dieu khien' WHEN 4 THEN 'Thay lop va can chinh phanh' ELSE 'Bao duong dinh ky sau ban hang' END,
       CASE MOD(X, 5) WHEN 1 THEN 'Kiem tra pin va thoi luong su dung' WHEN 2 THEN 'Xe khong nhan sac' WHEN 3 THEN 'Bao loi bo dieu khien' WHEN 4 THEN 'Thay lop va can chinh phanh' ELSE 'Bao duong dinh ky sau ban hang' END,
       DATEADD('DAY', -MOD(X, 90), DATE '2026-06-06'),
       DATEADD('DAY', 3 - MOD(X, 7), DATE '2026-06-06'),
       CASE WHEN MOD(X, 3) = 0 THEN 'WARRANTY' WHEN MOD(X, 3) = 1 THEN 'PAID_REPAIR' ELSE 'MAINTENANCE' END,
       CASE WHEN MOD(X, 5) = 0 THEN 'WAITING_PARTS' WHEN MOD(X, 4) = 0 THEN 'IN_PROGRESS' ELSE 'ASSIGNED' END,
       'tech',
       'Chan doan seed ticket ' || X,
       CASE MOD(X, 6) WHEN 1 THEN 'BATTERY' WHEN 2 THEN 'MOTOR' WHEN 3 THEN 'CONTROLLER' WHEN 4 THEN 'BRAKE' WHEN 5 THEN 'CHARGER' ELSE 'ACCESSORY' END,
       CASE WHEN MOD(X, 3) = 0 THEN TRUE ELSE FALSE END,
       CASE WHEN MOD(X, 3) = 0 THEN 0 ELSE 90000 + MOD(X, 5) * 30000 END,
       CASE WHEN MOD(X, 3) = 0 THEN 0 ELSE 160000 + MOD(X, 9) * 150000 END,
       CASE WHEN MOD(X, 3) = 0 THEN 0 ELSE 250000 + MOD(X, 9) * 180000 END,
       CASE WHEN MOD(X, 3) = 0 THEN 0 ELSE 90000 + MOD(X, 5) * 30000 + 160000 + MOD(X, 9) * 150000 END,
       CASE WHEN MOD(X, 3) = 0 THEN 0 ELSE 250000 + MOD(X, 9) * 180000 END,
       DATEADD('DAY', -MOD(X, 90), TIMESTAMP '2026-06-06 09:30:00'),
       DATEADD('DAY', -MOD(X, 80), TIMESTAMP '2026-06-06 17:30:00')
FROM SYSTEM_RANGE(1, 50);

MERGE INTO suppliers (
    id, code, name, tax_code, phone, email, website, address, contact_person,
    current_debt, credit_limit, payment_terms_days, rating, notes, status, created_at
) KEY(id)
SELECT X,
       'NCC-' || LPAD(CAST(X AS VARCHAR), 3, '0'),
       CASE MOD(X, 5)
           WHEN 1 THEN 'Cong ty TNHH Xe Dien Viet Nhat ' || X
           WHEN 2 THEN 'Nha phan phoi Pin LFP Sai Gon ' || X
           WHEN 3 THEN 'Cong ty Phu tung xe dien Minh Phat ' || X
           WHEN 4 THEN 'Dai ly Sac va Phu kien An Tam ' || X
           ELSE 'Cong ty Thuong mai Xe dien Nam Viet ' || X
       END,
       '031' || LPAD(CAST(5000000 + X AS VARCHAR), 7, '0'),
       '0908' || LPAD(CAST(700000 + X AS VARCHAR), 6, '0'),
       'ncc' || LPAD(CAST(X AS VARCHAR), 3, '0') || '@chuanphat.vn',
       'https://supplier' || X || '.example.vn',
       CASE MOD(X, 4)
           WHEN 1 THEN 'Quan Binh Thanh, TP.HCM'
           WHEN 2 THEN 'TP Thu Duc, TP.HCM'
           WHEN 3 THEN 'Di An, Binh Duong'
           ELSE 'Bien Hoa, Dong Nai'
       END,
       CASE MOD(X, 4) WHEN 1 THEN 'Nguyen Minh Khoa' WHEN 2 THEN 'Tran Thi Thanh' WHEN 3 THEN 'Le Quoc Hung' ELSE 'Pham Van Duc' END,
       0,
       100000000,
       30,
       CAST(3 + MOD(X, 3) AS SMALLINT),
       'Seed supplier ' || X,
       'ACTIVE',
       TIMESTAMP '2026-01-10 08:00:00'
FROM SYSTEM_RANGE(1, 20);

MERGE INTO purchase_orders (
    id, purchase_order_no, supplier_id, branch_id, status, purchase_date, expected_delivery,
    total_amount, paid_amount, approval_threshold, note, created_by, created_at,
    approved_at, approved_by, accounting_recorded, stock_received, serials_created
) KEY(id)
SELECT X,
       'PO-2026-' || LPAD(CAST(X AS VARCHAR), 5, '0'),
       MOD(X - 1, 20) + 1,
       MOD(X - 1, 6) + 1,
       CASE WHEN MOD(X, 5) = 0 THEN 'PARTIALLY_RECEIVED' ELSE 'APPROVED' END,
       DATEADD('DAY', -MOD(X, 180), DATE '2026-06-06'),
       DATEADD('DAY', 7 - MOD(X, 10), DATE '2026-06-06'),
       18000000 + MOD(X, 12) * 2500000,
       CASE WHEN MOD(X, 4) = 0 THEN 8000000 ELSE 18000000 + MOD(X, 12) * 2500000 END,
       50000000,
       'Seed purchase order ' || X,
       'system',
       DATEADD('DAY', -MOD(X, 180), TIMESTAMP '2026-06-06 09:00:00'),
       DATEADD('DAY', -MOD(X, 180), TIMESTAMP '2026-06-06 10:00:00'),
       'system',
       TRUE,
       TRUE,
       TRUE
FROM SYSTEM_RANGE(1, 30);

MERGE INTO purchase_order_items (id, purchase_order_id, product_id, quantity, unit_cost, line_total) KEY(id)
SELECT X,
       MOD(X - 1, 30) + 1,
       MOD(X - 1, 50) + 1,
       MOD(X, 5) + 1,
       CASE WHEN MOD(X - 1, 50) + 1 <= 30 THEN 10800000 + MOD(X, 8) * 350000 ELSE 1200000 + MOD(X, 10) * 250000 END,
       (MOD(X, 5) + 1) * CASE WHEN MOD(X - 1, 50) + 1 <= 30 THEN 10800000 + MOD(X, 8) * 350000 ELSE 1200000 + MOD(X, 10) * 250000 END
FROM SYSTEM_RANGE(1, 60);

MERGE INTO inventory_transactions (id, type, transaction_no, transaction_date, product_id, from_branch_id, to_branch_id, quantity, unit_cost, total_cost, note, created_at) KEY(id)
SELECT X,
       CASE MOD(X, 7)
           WHEN 1 THEN 'IMPORT'
           WHEN 2 THEN 'EXPORT'
           WHEN 3 THEN 'TRANSFER_OUT'
           WHEN 4 THEN 'TRANSFER_IN'
           WHEN 5 THEN 'STOCKTAKE'
           WHEN 6 THEN 'SALE'
           ELSE 'RETURN'
       END,
       'ITX-' || LPAD(CAST(X AS VARCHAR), 6, '0'),
       DATEADD('DAY', -MOD(X, 180), DATE '2026-06-06'),
       MOD(X - 1, 50) + 1,
       CASE WHEN MOD(X, 7) IN (2, 3, 6) THEN MOD(X - 1, 6) + 1 ELSE NULL END,
       CASE WHEN MOD(X, 7) IN (1, 4, 5, 0) THEN MOD(X, 6) + 1 ELSE NULL END,
       MOD(X, 5) + 1,
       1800000 + MOD(X, 8) * 250000,
       (MOD(X, 5) + 1) * (1800000 + MOD(X, 8) * 250000),
       'Seed transaction ' || X,
       DATEADD('DAY', -MOD(X, 180), TIMESTAMP '2026-06-06 12:00:00')
FROM SYSTEM_RANGE(1, 120);

MERGE INTO bank_accounts (id, bank_name, account_number, account_holder, current_balance, active, created_at) KEY(id) VALUES
(1, 'Vietcombank', '970400001', 'CONG TY CHUAN PHAT', 520000000, TRUE, TIMESTAMP '2026-01-01 08:00:00'),
(2, 'ACB', '970400002', 'CONG TY CHUAN PHAT', 225000000, TRUE, TIMESTAMP '2026-01-01 08:00:00');

MERGE INTO receivables (id, customer_id, customer_name, type, transaction_date, debit_amount, credit_amount, source_type, source_no, due_date, status, description, created_at) KEY(id)
SELECT X,
       X,
       c.full_name,
       CASE WHEN MOD(X, 3) = 0 THEN 'RECEIPT' ELSE 'SALE' END,
       DATEADD('DAY', -MOD(X, 90), DATE '2026-06-06'),
       CASE WHEN MOD(X, 3) = 0 THEN 0 ELSE 8000000 + X * 50000 END,
       CASE WHEN MOD(X, 3) = 0 THEN 3000000 ELSE 0 END,
       CASE WHEN MOD(X, 3) = 0 THEN 'RECEIPT_VOUCHER' ELSE 'SALES_ORDER' END,
       CASE WHEN MOD(X, 3) = 0 THEN 'PT-SEED-' || LPAD(CAST(X AS VARCHAR), 4, '0') ELSE 'SO-2026-' || LPAD(CAST(X AS VARCHAR), 5, '0') END,
       DATEADD('DAY', 30 - MOD(X, 80), DATE '2026-06-06'),
       CASE WHEN MOD(X, 5) = 0 THEN 'PAID' ELSE 'UNPAID' END,
       'Seed receivable ' || X,
       TIMESTAMP '2026-06-06 10:00:00'
FROM SYSTEM_RANGE(1, 20) r
JOIN customers c ON c.id = r.X;

MERGE INTO accounting_payables (id, supplier_id, supplier_name, type, transaction_date, debit_amount, credit_amount, source_type, source_no, due_date, status, description, created_at) KEY(id)
SELECT X,
       X,
       s.name,
       CASE WHEN MOD(X, 4) = 0 THEN 'PAYMENT' ELSE 'PURCHASE' END,
       DATEADD('DAY', -MOD(X, 120), DATE '2026-06-06'),
       CASE WHEN MOD(X, 4) = 0 THEN 5000000 ELSE 0 END,
       CASE WHEN MOD(X, 4) = 0 THEN 0 ELSE 15000000 + X * 100000 END,
       CASE WHEN MOD(X, 4) = 0 THEN 'PAYMENT_VOUCHER' ELSE 'PURCHASE_ORDER' END,
       CASE WHEN MOD(X, 4) = 0 THEN 'PC-SEED-' || LPAD(CAST(X AS VARCHAR), 4, '0') ELSE 'PO-2026-' || LPAD(CAST(X AS VARCHAR), 5, '0') END,
       DATEADD('DAY', 35 - MOD(X, 90), DATE '2026-06-06'),
       CASE WHEN MOD(X, 6) = 0 THEN 'PAID' ELSE 'UNPAID' END,
       'Seed payable ' || X,
       TIMESTAMP '2026-06-06 10:00:00'
FROM SYSTEM_RANGE(1, 20) r
JOIN suppliers s ON s.id = r.X;

MERGE INTO accounting_transactions (id, type, source_type, source_no, transaction_date, amount, cost_amount, description, created_at) KEY(id)
SELECT X,
       CASE WHEN MOD(X, 5) = 0 THEN 'COST_OF_GOODS_SOLD' ELSE 'SALES_REVENUE' END,
       'SALES_ORDER',
       'SO-2026-' || LPAD(CAST(X AS VARCHAR), 5, '0'),
       DATEADD('DAY', -MOD(X, 120), DATE '2026-06-06'),
       CASE WHEN MOD(X, 5) = 0 THEN 0 ELSE 12000000 + X * 85000 END,
       CASE WHEN MOD(X, 5) = 0 THEN 7000000 + X * 50000 ELSE NULL END,
       'Seed transaction ' || X,
       TIMESTAMP '2026-06-06 10:00:00'
FROM SYSTEM_RANGE(1, 80);

MERGE INTO cash_books (id, type, transaction_date, amount_in, amount_out, balance_after, bank_account_id, source_type, source_no, description, created_at) KEY(id) VALUES
(1, 'BANK_IN', DATE '2026-06-01', 50000000, 0, 570000000, 1, 'RECEIPT_VOUCHER', 'PT-2026-001', 'Thu tien don hang', TIMESTAMP '2026-06-01 10:00:00'),
(2, 'BANK_OUT', DATE '2026-06-02', 0, 18000000, 552000000, 1, 'PAYMENT_VOUCHER', 'PC-2026-001', 'Thanh toan nha cung cap', TIMESTAMP '2026-06-02 10:00:00'),
(3, 'CASH_IN', DATE '2026-06-03', 9000000, 0, 9000000, NULL, 'RECEIPT_VOUCHER', 'PT-2026-002', 'Thu tien mat', TIMESTAMP '2026-06-03 10:00:00');

MERGE INTO system_settings (id, setting_key, setting_value, updated_at) KEY(id) VALUES
(1, 'companyName', 'Chuan Phat', TIMESTAMP '2026-06-06 08:00:00'),
(2, 'companyAddress', '121 Quang Trung, Quan Go Vap, TP.HCM', TIMESTAMP '2026-06-06 08:00:00'),
(3, 'companyPhone', '02839010001', TIMESTAMP '2026-06-06 08:00:00'),
(4, 'taxCode', '0315000000', TIMESTAMP '2026-06-06 08:00:00'),
(5, 'logoUrl', '', TIMESTAMP '2026-06-06 08:00:00'),
(6, 'invoiceTemplate', 'Mau hoa don ban le Chuan Phat', TIMESTAMP '2026-06-06 08:00:00'),
(7, 'defaultWarrantyPolicy', 'Bao hanh xe 24 thang, pin 12 thang, phu tung 6 thang.', TIMESTAMP '2026-06-06 08:00:00'),
(8, 'lowStockThreshold', '5', TIMESTAMP '2026-06-06 08:00:00');

MERGE INTO vouchers (id, code, name, discount_type, discount_value, minimum_order_amount, start_date, end_date, usage_limit, used_count, status) KEY(id) VALUES
(1, 'CPWELCOME', 'Uu dai khach hang moi', 'AMOUNT', 500000, 10000000, DATE '2026-06-01', DATE '2026-12-31', 200, 12, 'ACTIVE'),
(2, 'PIN10', 'Giam gia pin lithium', 'PERCENT', 10, 3000000, DATE '2026-06-01', DATE '2026-09-30', 100, 8, 'ACTIVE');

MERGE INTO marketing_campaigns (id, campaign_name, channel, start_date, end_date, budget, status, note) KEY(id) VALUES
(1, 'Facebook Lead Thang 6', 'FACEBOOK', DATE '2026-06-01', DATE '2026-06-30', 25000000, 'RUNNING', 'Tap trung xe may dien CP S1'),
(2, 'Zalo cham soc khach cu', 'ZALO', DATE '2026-06-05', DATE '2026-07-05', 8000000, 'PLANNED', 'Nhac bao duong va doi pin');

ALTER TABLE permissions ALTER COLUMN id RESTART WITH 46;
ALTER TABLE roles ALTER COLUMN id RESTART WITH 8;
ALTER TABLE app_users ALTER COLUMN id RESTART WITH 22;
ALTER TABLE branches ALTER COLUMN id RESTART WITH 7;
ALTER TABLE warehouses ALTER COLUMN id RESTART WITH 7;
ALTER TABLE products ALTER COLUMN id RESTART WITH 51;
ALTER TABLE product_serials ALTER COLUMN id RESTART WITH 101;
ALTER TABLE customers ALTER COLUMN id RESTART WITH 101;
ALTER TABLE inventory_stocks ALTER COLUMN id RESTART WITH 301;
ALTER TABLE sales_orders ALTER COLUMN id RESTART WITH 201;
ALTER TABLE sales_order_items ALTER COLUMN id RESTART WITH 201;
ALTER TABLE invoices ALTER COLUMN id RESTART WITH 201;
ALTER TABLE warranties ALTER COLUMN id RESTART WITH 51;
ALTER TABLE service_tickets ALTER COLUMN id RESTART WITH 51;
ALTER TABLE suppliers ALTER COLUMN id RESTART WITH 21;
ALTER TABLE purchase_orders ALTER COLUMN id RESTART WITH 31;
ALTER TABLE purchase_order_items ALTER COLUMN id RESTART WITH 61;
ALTER TABLE inventory_transactions ALTER COLUMN id RESTART WITH 121;
ALTER TABLE bank_accounts ALTER COLUMN id RESTART WITH 3;
ALTER TABLE receivables ALTER COLUMN id RESTART WITH 21;
ALTER TABLE accounting_payables ALTER COLUMN id RESTART WITH 21;
ALTER TABLE accounting_transactions ALTER COLUMN id RESTART WITH 81;
ALTER TABLE cash_books ALTER COLUMN id RESTART WITH 4;
ALTER TABLE system_settings ALTER COLUMN id RESTART WITH 9;
ALTER TABLE vouchers ALTER COLUMN id RESTART WITH 3;
ALTER TABLE marketing_campaigns ALTER COLUMN id RESTART WITH 3;
