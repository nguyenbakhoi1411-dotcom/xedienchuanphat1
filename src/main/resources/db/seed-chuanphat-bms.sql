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
(40, 'MARKETING_UPDATE', 'MARKETING', 'UPDATE'),
(41, 'SALES_UPDATE', 'SALES', 'UPDATE'),
(42, 'SALES_CANCEL', 'SALES', 'CANCEL'),
(43, 'SALES_DISCOUNT_APPROVE', 'SALES', 'APPROVE'),
(44, 'SALES_RETURN', 'SALES', 'RETURN'),
(45, 'INVOICE_ISSUE', 'INVOICE', 'ISSUE');

MERGE INTO roles (id, code, name) KEY(id) VALUES
(1, 'ADMIN', 'Quản trị hệ thống'),
(2, 'BRANCH_MANAGER', 'Quản lý chi nhánh'),
(3, 'SALES_STAFF', 'Nhân viên bán hàng (Seller)'),
(4, 'WAREHOUSE_STAFF', 'Thủ kho'),
(5, 'ACCOUNTANT', 'Kế toán'),
(6, 'TECHNICIAN', 'Kỹ thuật viên'),
(7, 'USER', 'Người dùng'),
(8, 'CASHIER', 'Thủ quỹ'),
(9, 'MARKETING_STAFF', 'Nhân viên Marketing');

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
(1, 'admin', 'admin@chuanphat.vn', '0909000001', 'Admin Chuan Phat', '{bcrypt}$2a$10$7EqJtq98hPqEX7fNZaFWoOhi/3zO4IdbQGtoK9PHT7y.gD1yP7z8m', NULL, 1, 'INACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(2, 'sales', 'sales@chuanphat.vn', '0909000002', 'Sales Chuan Phat', '{bcrypt}$2a$10$7EqJtq98hPqEX7fNZaFWoOhi/3zO4IdbQGtoK9PHT7y.gD1yP7z8m', NULL, 3, 'INACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(3, 'checker', 'checker@chuanphat.vn', '0909000003', 'Checker Chuan Phat', '{bcrypt}$2a$10$7EqJtq98hPqEX7fNZaFWoOhi/3zO4IdbQGtoK9PHT7y.gD1yP7z8m', NULL, 2, 'INACTIVE', TIMESTAMP '2026-01-01 08:00:00');

MERGE INTO branches (id, code, name, address, phone, status, created_at) KEY(id) VALUES
(1, 'CP-LVT', 'Chuẩn Phát Lê Viết Thuật', 'Số 389 Lê Viết Thuật, Vinh Lộc, Nghệ An', '0832032555', 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(2, 'CP-NT', 'Chuẩn Phát Nguyễn Trãi', 'Số 7 Nguyễn Trãi, P. Vinh Hưng, Nghệ An', '0832058555', 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(3, 'CP-ND', 'Chuẩn Phát Nam Đàn', 'Số 238, QL46, TT. Nam Đàn, Nghệ An', '0832028555', 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(4, 'CP-NDU', 'Chuẩn Phát Nguyễn Du', 'Số 116 Nguyễn Du, P. Trường Vinh, Nghệ An', '0815016555', 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(5, 'CP-LL', 'Chuẩn Phát Lê Lợi', 'Số 60 Lê Lợi, P. Thành Vinh, Nghệ An', '0815018555', 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'),
(6, 'CP-VF', 'Xưởng dịch vụ VinFast Chuẩn Phát', 'Số 389 Lê Viết Thuật, Vinh Lộc, Nghệ An', '0912186586', 'ACTIVE', TIMESTAMP '2026-01-01 08:00:00');

MERGE INTO warehouses (id, warehouse_code, warehouse_name, branch_id, type, status, location_aisle, location_shelf, location_bin, description, created_at) KEY(id)
SELECT X, 'WH-MAIN-' || LPAD(CAST(X AS VARCHAR), 2, '0'), 'Kho chinh chi nhanh ' || X, X, 'MAIN', 'ACTIVE', 'A', 'S1', 'B1', 'Seed main warehouse for branch ' || X, TIMESTAMP '2026-01-01 08:30:00'
FROM SYSTEM_RANGE(1, 6);

MERGE INTO app_users (id, username, email, phone, full_name, password_hash, branch_id, role_id, status, created_at) KEY(id)
SELECT X + 1, 'nv' || LPAD(CAST(X AS VARCHAR), 3, '0'), 'nv' || LPAD(CAST(X AS VARCHAR), 3, '0') || '@chuanphat.vn', '09' || LPAD(CAST(10000000 + X AS VARCHAR), 8, '0'), 
       CASE MOD(X, 6) WHEN 1 THEN 'Nguyen Minh Anh' WHEN 2 THEN 'Tran Bao Chau' WHEN 3 THEN 'Le Quoc Dat' WHEN 4 THEN 'Pham Gia Huy' WHEN 5 THEN 'Vo Thanh Khoa' ELSE 'Dang Nhat Linh' END || ' ' || X,
       '{bcrypt}$2a$10$7EqJtq98hPqEX7fNZaFWoOhi/3zO4IdbQGtoK9PHT7y.gD1yP7z8m', MOD(X - 1, 6) + 1,
       CASE WHEN X <= 6 THEN 2 WHEN MOD(X, 5) = 0 THEN 5 WHEN MOD(X, 4) = 0 THEN 6 WHEN MOD(X, 3) = 0 THEN 4 ELSE 3 END,
       'ACTIVE', TIMESTAMP '2026-01-01 08:00:00'
FROM SYSTEM_RANGE(1, 20);

-- 20 Products
MERGE INTO products (id, product_code, product_name, category, brand, model, import_price, sale_price, warranty_months, status, is_service, tax_reduction_allowed, created_at) KEY(id)
SELECT X,
       'CP-' || CASE WHEN X <= 10 THEN 'XE' WHEN X <= 15 THEN 'PIN' ELSE 'PT' END || '-' || LPAD(CAST(X AS VARCHAR), 3, '0'),
       CASE WHEN X <= 10 THEN 'Xe may dien Chuan Phat S' || X WHEN X <= 15 THEN 'Pin lithium LFP ' || X ELSE 'Phu tung xe dien ' || X END,
       CASE WHEN X <= 10 THEN 'ELECTRIC_MOTORBIKE' WHEN X <= 15 THEN 'BATTERY' ELSE 'SPARE_PART' END,
       'Chuan Phat', 'S' || MOD(X, 5),
       CASE WHEN X <= 10 THEN 9500000 WHEN X <= 15 THEN 2800000 ELSE 120000 END,
       CASE WHEN X <= 10 THEN 13500000 WHEN X <= 15 THEN 4200000 ELSE 250000 END,
       24, 'ACTIVE', FALSE, FALSE, TIMESTAMP '2026-01-15 09:00:00'
FROM SYSTEM_RANGE(1, 20);

-- Product Serials for Warranty (only for some)
MERGE INTO product_serials (id, product_id, serial_number, branch_id, warehouse_id, battery_serial, motor_serial, import_date, status, created_at) KEY(id)
SELECT X, MOD(X - 1, 10) + 1, 'CP26-' || LPAD(CAST(X AS VARCHAR), 5, '0'), MOD(X - 1, 2) + 1, MOD(X - 1, 2) + 1,
       'BAT26-' || LPAD(CAST(X AS VARCHAR), 5, '0'), 'MOT26-' || LPAD(CAST(X AS VARCHAR), 5, '0'),
       DATEADD('DAY', -MOD(X, 120), CURRENT_DATE), CASE WHEN X <= 30 THEN 'SOLD' ELSE 'IN_STOCK' END, CURRENT_TIMESTAMP
FROM SYSTEM_RANGE(1, 40);

-- 5 Customers
MERGE INTO customers (id, phone, full_name, email, address, source, branch_id, tier, rank, score, status, total_purchase_amount, total_purchase_count, total_debt, lifetime_value, is_organization, is_supplier, is_internal, created_at) KEY(id)
SELECT X, '09' || LPAD(CAST(20000000 + X AS VARCHAR), 8, '0'), 'Khach Hang ' || X, 'kh' || LPAD(CAST(X AS VARCHAR), 5, '0') || '@gmail.com',
       'Dia chi Khach Hang ' || X, 'WALK_IN', MOD(X - 1, 2) + 1, 'NEW', 'NEW', 0, 'ACTIVE', 0, 0, 0, 0, FALSE, FALSE, FALSE, DATEADD('MONTH', -X, CURRENT_TIMESTAMP)
FROM SYSTEM_RANGE(1, 5);

-- 5 Suppliers
MERGE INTO suppliers (id, code, name, tax_code, phone, email, website, address, contact_person, current_debt, credit_limit, payment_terms_days, rating, notes, status, created_at) KEY(id)
SELECT X, 'NCC-' || LPAD(CAST(X AS VARCHAR), 3, '0'), 'Nha Cung Cap ' || X, '0315000' || LPAD(CAST(X AS VARCHAR), 3, '0'), '090870000' || X,
       'ncc' || X || '@chuanphat.vn', 'https://supplier' || X || '.example.vn', 'Dia chi NCC ' || X, 'Nguoi Lien He ' || X, 0, 100000000, 30, 5, 'Seed supplier ' || X, 'ACTIVE', DATEADD('MONTH', -12, CURRENT_TIMESTAMP)
FROM SYSTEM_RANGE(1, 5);

-- Inventory Stocks
MERGE INTO inventory_stocks (id, branch_id, warehouse_id, product_id, quantity_on_hand, reserved_quantity, available_quantity, min_quantity, max_stock_level, updated_at) KEY(id)
SELECT (b.X - 1) * 20 + p.X, b.X, b.X, p.X, 100, 0, 100, 5, 200, CURRENT_TIMESTAMP
FROM SYSTEM_RANGE(1, 2) b CROSS JOIN SYSTEM_RANGE(1, 20) p;

-- 30 Sales Orders (spread over 12 months)
MERGE INTO sales_orders (id, order_no, branch_id, customer_id, employee_id, order_date, status, subtotal, discount_amount, voucher_code, total_amount, vat_rate, vat_amount, paid_amount, payment_status, accounting_recorded, stock_issued, warranty_created, voucher_consumed, max_discount_pct, discount_approval_status, created_at) KEY(id)
SELECT X, 'SO-2026-' || LPAD(CAST(X AS VARCHAR), 5, '0'), MOD(X - 1, 2) + 1, MOD(X - 1, 5) + 1, MOD(X - 1, 6) + 2,
       DATEADD('DAY', -MOD(X * 12, 365), CURRENT_DATE), 'DELIVERED', 13500000, 0, '', 13500000, 10.00, 1227272.73, 13500000, 'PAID', TRUE, TRUE, FALSE, FALSE, 5.00, 'NONE', DATEADD('DAY', -MOD(X * 12, 365), CURRENT_TIMESTAMP)
FROM SYSTEM_RANGE(1, 30);

MERGE INTO sales_order_items (id, order_id, product_id, serial_id, quantity, returned_quantity, is_deposit_row, unit_price, line_total) KEY(id)
SELECT X, X, MOD(X - 1, 20) + 1, NULL, 1, 0, FALSE, 13500000, 13500000
FROM SYSTEM_RANGE(1, 30);

MERGE INTO invoices (id, ma_hoa_don, loai_hoa_don, order_id, ngay_xuat, tong_tien_truoc_thue, tong_thue_gtgt, tong_cong, trang_thai, ngay_tao) KEY(id)
SELECT id, 'INV-2026-' || LPAD(CAST(id AS VARCHAR), 5, '0'), 'INTERNAL', id, order_date, total_amount - ROUND(total_amount / 11, 2), ROUND(total_amount / 11, 2), total_amount, 'ISSUED', CAST(order_date AS TIMESTAMP)
FROM sales_orders;

-- 15 Purchase Orders (spread over 12 months)
MERGE INTO purchase_orders (id, purchase_order_no, supplier_id, branch_id, status, purchase_date, expected_delivery, total_amount, paid_amount, approval_threshold, note, created_by, created_at, approved_at, approved_by, accounting_recorded, stock_received, serials_created, tong_tien_hang, tong_chiet_khau, tong_thue_gtgt) KEY(id)
SELECT X, 'PO-2026-' || LPAD(CAST(X AS VARCHAR), 5, '0'), MOD(X - 1, 5) + 1, MOD(X - 1, 2) + 1, 'RECEIVED',
       DATEADD('DAY', -MOD(X * 24, 365), CURRENT_DATE), DATEADD('DAY', 7 - MOD(X * 24, 365), CURRENT_DATE),
       95000000, 95000000, 50000000, 'Seed purchase order ' || X, 'system', DATEADD('DAY', -MOD(X * 24, 365), CURRENT_TIMESTAMP), DATEADD('DAY', -MOD(X * 24, 365), CURRENT_TIMESTAMP), 'system', TRUE, TRUE, TRUE, 95000000, 0, 0
FROM SYSTEM_RANGE(1, 15);

MERGE INTO purchase_order_items (id, purchase_order_id, product_id, quantity, unit_cost, line_total) KEY(id)
SELECT X, X, MOD(X - 1, 20) + 1, 10, 9500000, 95000000
FROM SYSTEM_RANGE(1, 15);

-- Accounting & Cash (Simplistic representation of the flows)
MERGE INTO bank_accounts (id, bank_name, account_number, account_holder, current_balance, active, created_at, is_default) KEY(id) VALUES
(1, 'Vietcombank', '970400001', 'CONG TY CHUAN PHAT', 520000000, TRUE, TIMESTAMP '2026-01-01 08:00:00', TRUE),
(2, 'ACB', '970400002', 'CONG TY CHUAN PHAT', 225000000, TRUE, TIMESTAMP '2026-01-01 08:00:00', FALSE);

MERGE INTO accounting_transactions (id, type, source_type, source_no, transaction_date, amount, cost_amount, description, created_at) KEY(id)
SELECT X, 'SALES_REVENUE', 'SALES_ORDER', 'SO-2026-' || LPAD(CAST(X AS VARCHAR), 5, '0'), DATEADD('DAY', -MOD(X * 12, 365), CURRENT_DATE), 13500000, 9500000, 'Doanh thu SO ' || X, DATEADD('DAY', -MOD(X * 12, 365), CURRENT_TIMESTAMP)
FROM SYSTEM_RANGE(1, 30);

MERGE INTO cash_books (id, type, transaction_date, amount_in, amount_out, balance_after, bank_account_id, source_type, source_no, description, created_at) KEY(id)
SELECT X, 'BANK_IN', DATEADD('DAY', -MOD(X * 12, 365), CURRENT_DATE), 13500000, 0, 520000000 + (X * 13500000), 1, 'RECEIPT_VOUCHER', 'PT-2026-' || LPAD(CAST(X AS VARCHAR), 5, '0'), 'Thu tien don hang', DATEADD('DAY', -MOD(X * 12, 365), CURRENT_TIMESTAMP)
FROM SYSTEM_RANGE(1, 30);

MERGE INTO cash_books (id, type, transaction_date, amount_in, amount_out, balance_after, bank_account_id, source_type, source_no, description, created_at) KEY(id)
SELECT X + 30, 'BANK_OUT', DATEADD('DAY', -MOD(X * 24, 365), CURRENT_DATE), 0, 95000000, 520000000 - (X * 95000000), 1, 'PAYMENT_VOUCHER', 'PC-2026-' || LPAD(CAST(X AS VARCHAR), 5, '0'), 'Thanh toan nha cung cap', DATEADD('DAY', -MOD(X * 24, 365), CURRENT_TIMESTAMP)
FROM SYSTEM_RANGE(1, 15);

MERGE INTO system_settings (id, setting_key, setting_value, updated_at) KEY(id) VALUES
(1, 'companyName', 'Chuan Phat', TIMESTAMP '2026-06-06 08:00:00'),
(2, 'companyAddress', '121 Quang Trung, Quan Go Vap, TP.HCM', TIMESTAMP '2026-06-06 08:00:00'),
(3, 'companyPhone', '02839010001', TIMESTAMP '2026-06-06 08:00:00'),
(4, 'taxCode', '0315000000', TIMESTAMP '2026-06-06 08:00:00'),
(5, 'logoUrl', '', TIMESTAMP '2026-06-06 08:00:00'),
(6, 'invoiceTemplate', 'Mau hoa don ban le Chuan Phat', TIMESTAMP '2026-06-06 08:00:00'),
(7, 'defaultWarrantyPolicy', 'Bao hanh xe 24 thang, pin 12 thang, phu tung 6 thang.', TIMESTAMP '2026-06-06 08:00:00'),
(8, 'lowStockThreshold', '5', TIMESTAMP '2026-06-06 08:00:00');

-- 15 Purchase Receipts
MERGE INTO purchase_receipts (id, receipt_no, purchase_order_id, supplier_id, branch_id, warehouse_id, receipt_date, status, total_amount, note, created_by, accounting_recorded, created_at) KEY(id)
SELECT X, 'NK-' || LPAD(CAST(X AS VARCHAR), 5, '0'), X, MOD(X - 1, 5) + 1, MOD(X - 1, 2) + 1, MOD(X - 1, 6) + 1,
       DATEADD('DAY', -MOD(X * 24, 365), CURRENT_DATE), 'CONFIRMED', 95000000, 'Nhap kho mua hang', 'system', TRUE, DATEADD('DAY', -MOD(X * 24, 365), CURRENT_TIMESTAMP)
FROM SYSTEM_RANGE(1, 15);

MERGE INTO purchase_receipt_items (id, receipt_id, product_id, quantity, unit_cost, line_total) KEY(id)
SELECT X, X, MOD(X - 1, 20) + 1, 10, 9500000, 95000000
FROM SYSTEM_RANGE(1, 15);

-- 30 Goods Issues (Xuất kho)
MERGE INTO goods_issues (id, issue_no, branch_id, warehouse_id, issue_date, status, issue_type, note, created_by, created_at) KEY(id)
SELECT X, 'XK-' || LPAD(CAST(X AS VARCHAR), 5, '0'), MOD(X - 1, 2) + 1, MOD(X - 1, 6) + 1,
       DATEADD('DAY', -MOD(X * 12, 365), CURRENT_DATE), 'ISSUED', 'SALE', 'Xuat ban hang', 'system', DATEADD('DAY', -MOD(X * 12, 365), CURRENT_TIMESTAMP)
FROM SYSTEM_RANGE(1, 30);

MERGE INTO goods_issue_items (id, issue_id, product_id, quantity, unit_cost) KEY(id)
SELECT X, X, MOD(X - 1, 20) + 1, 1, 9500000
FROM SYSTEM_RANGE(1, 30);

-- 10 Inventory Transfers (Chuyển kho)
MERGE INTO inventory_transfers (id, transfer_no, transfer_date, from_branch_id, to_branch_id, from_warehouse_id, to_warehouse_id, product_id, quantity, transfer_cost, status, approval_required, note, created_by, created_at) KEY(id)
SELECT X, 'CK-' || LPAD(CAST(X AS VARCHAR), 5, '0'),
       DATEADD('DAY', -MOD(X * 30, 365), CURRENT_DATE), 1, 2, 1, 2, MOD(X - 1, 20) + 1, 2, 19000000, 'RECEIVED', FALSE, 'Chuyen hang noi bo', 'system', DATEADD('DAY', -MOD(X * 30, 365), CURRENT_TIMESTAMP)
FROM SYSTEM_RANGE(1, 10);

ALTER TABLE permissions ALTER COLUMN id RESTART WITH 50;
ALTER TABLE roles ALTER COLUMN id RESTART WITH 20;
ALTER TABLE app_users ALTER COLUMN id RESTART WITH 25;
ALTER TABLE branches ALTER COLUMN id RESTART WITH 10;
ALTER TABLE warehouses ALTER COLUMN id RESTART WITH 10;
ALTER TABLE products ALTER COLUMN id RESTART WITH 30;
ALTER TABLE product_serials ALTER COLUMN id RESTART WITH 50;
ALTER TABLE customers ALTER COLUMN id RESTART WITH 10;
ALTER TABLE inventory_stocks ALTER COLUMN id RESTART WITH 50;
ALTER TABLE sales_orders ALTER COLUMN id RESTART WITH 50;
ALTER TABLE sales_order_items ALTER COLUMN id RESTART WITH 31;
ALTER TABLE invoices ALTER COLUMN id RESTART WITH 31;
ALTER TABLE warranties ALTER COLUMN id RESTART WITH 1;
ALTER TABLE service_tickets ALTER COLUMN id RESTART WITH 1;
ALTER TABLE suppliers ALTER COLUMN id RESTART WITH 6;
ALTER TABLE purchase_orders ALTER COLUMN id RESTART WITH 16;
ALTER TABLE purchase_order_items ALTER COLUMN id RESTART WITH 16;
ALTER TABLE inventory_transactions ALTER COLUMN id RESTART WITH 1;
ALTER TABLE bank_accounts ALTER COLUMN id RESTART WITH 3;
ALTER TABLE receivables ALTER COLUMN id RESTART WITH 1;
ALTER TABLE accounting_payables ALTER COLUMN id RESTART WITH 1;
ALTER TABLE accounting_transactions ALTER COLUMN id RESTART WITH 31;
ALTER TABLE cash_books ALTER COLUMN id RESTART WITH 46;
ALTER TABLE system_settings ALTER COLUMN id RESTART WITH 9;
