-- ═══════════════════════════════════════════════════════
-- V38: Nâng cấp module Kho theo chuẩn MISA AMIS
-- ═══════════════════════════════════════════════════════

-- 1. PRODUCTS: Thêm fields còn thiếu (Giảm thuế, Tính chất, Nhóm VTHH, Kho ngăn định, TK Kho, Số lượng tối thiểu theo kho)
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS product_nature        VARCHAR(30)   DEFAULT 'GOODS'
        CHECK (product_nature IN ('GOODS','SERVICE','MATERIAL','FINISHED_GOOD','TOOL')),
    ADD COLUMN IF NOT EXISTS product_group         VARCHAR(100),
    ADD COLUMN IF NOT EXISTS tax_reduction_code    VARCHAR(10),
    ADD COLUMN IF NOT EXISTS default_warehouse_id  BIGINT REFERENCES warehouses(id),
    ADD COLUMN IF NOT EXISTS inventory_account_code VARCHAR(20)  DEFAULT '156',
    ADD COLUMN IF NOT EXISTS costing_method        VARCHAR(20)   DEFAULT 'AVERAGE_COST'
        CHECK (costing_method IN ('AVERAGE_COST','FIFO','LAST_PRICE')),
    ADD COLUMN IF NOT EXISTS min_quantity          NUMERIC(14,3) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_quantity          NUMERIC(14,3) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS lead_time_days        INTEGER       DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_tracked            BOOLEAN       DEFAULT TRUE;

COMMENT ON COLUMN products.product_nature       IS 'Tính chất: GOODS=Hàng hóa, SERVICE=Dịch vụ, MATERIAL=Nguyên vật liệu, FINISHED_GOOD=Thành phẩm, TOOL=Công cụ dụng cụ';
COMMENT ON COLUMN products.inventory_account_code IS '152=NVL, 153=CC/DC, 155=Thành phẩm, 156=Hàng hóa';

-- 2. INVENTORY_TRANSFERS: Thêm fields chuyển kho đầy đủ
ALTER TABLE inventory_transfers
    ADD COLUMN IF NOT EXISTS transfer_type        VARCHAR(30)   DEFAULT 'INTERNAL'
        CHECK (transfer_type IN ('INTERNAL','CONSIGNMENT','INTERNAL_SAME_BRANCH')),
    ADD COLUMN IF NOT EXISTS dispatch_order_no    VARCHAR(80),
    ADD COLUMN IF NOT EXISTS dispatch_date        DATE,
    ADD COLUMN IF NOT EXISTS dispatch_by          VARCHAR(120),
    ADD COLUMN IF NOT EXISTS reason               TEXT,
    ADD COLUMN IF NOT EXISTS receiving_unit_code  VARCHAR(80),
    ADD COLUMN IF NOT EXISTS receiving_unit_name  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS receiving_unit_tax   VARCHAR(20),
    ADD COLUMN IF NOT EXISTS carrier_code         VARCHAR(80),
    ADD COLUMN IF NOT EXISTS carrier_name         VARCHAR(255),
    ADD COLUMN IF NOT EXISTS carrier_vehicle      VARCHAR(120),
    ADD COLUMN IF NOT EXISTS carrier_contract     VARCHAR(120),
    ADD COLUMN IF NOT EXISTS voucher_form         VARCHAR(20),
    ADD COLUMN IF NOT EXISTS voucher_serial       VARCHAR(10),
    ADD COLUMN IF NOT EXISTS is_replacement_invoice BOOLEAN     DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS accounting_date      DATE,
    ADD COLUMN IF NOT EXISTS reference_no         VARCHAR(120),
    ADD COLUMN IF NOT EXISTS document_count       INTEGER       DEFAULT 0,
    ADD COLUMN IF NOT EXISTS from_warehouse_address VARCHAR(500),
    ADD COLUMN IF NOT EXISTS to_warehouse_address VARCHAR(500);

-- 3. GOODS_ISSUES: Thêm fields xuất kho đầy đủ
ALTER TABLE goods_issues
    ADD COLUMN IF NOT EXISTS customer_id          BIGINT REFERENCES customers(id),
    ADD COLUMN IF NOT EXISTS customer_name        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS receiver_name        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS receiver_address     VARCHAR(500),
    ADD COLUMN IF NOT EXISTS salesperson_id       BIGINT,
    ADD COLUMN IF NOT EXISTS issue_reason         VARCHAR(500),
    ADD COLUMN IF NOT EXISTS accounting_date      DATE,
    ADD COLUMN IF NOT EXISTS sales_order_id       BIGINT,
    ADD COLUMN IF NOT EXISTS invoice_issued       BOOLEAN        DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS invoice_status       VARCHAR(30),
    ADD COLUMN IF NOT EXISTS tax_authority_code   VARCHAR(50),
    ADD COLUMN IF NOT EXISTS delivery_address     VARCHAR(500),
    ADD COLUMN IF NOT EXISTS reference_no         VARCHAR(120),
    ADD COLUMN IF NOT EXISTS document_count       INTEGER        DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_amount         NUMERIC(14,2)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_cost           NUMERIC(14,2)  DEFAULT 0;

-- 4. GOODS_ISSUE_ITEMS: Thêm fields chi tiết xuất kho
ALTER TABLE goods_issue_items
    ADD COLUMN IF NOT EXISTS warehouse_id         BIGINT REFERENCES warehouses(id),
    ADD COLUMN IF NOT EXISTS debit_account        VARCHAR(20),
    ADD COLUMN IF NOT EXISTS credit_account       VARCHAR(20),
    ADD COLUMN IF NOT EXISTS unit_price           NUMERIC(14,2)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS line_total           NUMERIC(14,2)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS variant_spec         VARCHAR(120),
    ADD COLUMN IF NOT EXISTS unit_of_measure      VARCHAR(30);

-- 5. PURCHASE_RECEIPTS: Thêm fields nhập kho đầy đủ
ALTER TABLE purchase_receipts
    ADD COLUMN IF NOT EXISTS receipt_type         VARCHAR(30)    DEFAULT 'FROM_SUPPLIER'
        CHECK (receipt_type IN ('FROM_SUPPLIER','FROM_IMPORT','OTHER','FROM_TRANSFER','FROM_PRODUCTION','FROM_RETURN')),
    ADD COLUMN IF NOT EXISTS object_code          VARCHAR(80),
    ADD COLUMN IF NOT EXISTS object_name          VARCHAR(255),
    ADD COLUMN IF NOT EXISTS object_address       VARCHAR(500),
    ADD COLUMN IF NOT EXISTS delivery_person      VARCHAR(255),
    ADD COLUMN IF NOT EXISTS description          VARCHAR(500),
    ADD COLUMN IF NOT EXISTS accounting_date      DATE,
    ADD COLUMN IF NOT EXISTS source_transfer_no   VARCHAR(80),
    ADD COLUMN IF NOT EXISTS reference_no         VARCHAR(120),
    ADD COLUMN IF NOT EXISTS document_count       INTEGER        DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_amount         NUMERIC(14,2)  DEFAULT 0;

-- 6. PURCHASE_RECEIPT_ITEMS: Thêm fields đầy đủ
ALTER TABLE purchase_receipt_items
    ADD COLUMN IF NOT EXISTS warehouse_id         BIGINT REFERENCES warehouses(id),
    ADD COLUMN IF NOT EXISTS debit_account        VARCHAR(20)    DEFAULT '156',
    ADD COLUMN IF NOT EXISTS credit_account       VARCHAR(20)    DEFAULT '331',
    ADD COLUMN IF NOT EXISTS variant_spec         VARCHAR(120),
    ADD COLUMN IF NOT EXISTS unit_of_measure      VARCHAR(30),
    ADD COLUMN IF NOT EXISTS discount_rate        NUMERIC(5,2)   DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount_amount      NUMERIC(14,2)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS purchase_cost        NUMERIC(14,2)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS inventory_value      NUMERIC(14,2)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS lot_no               VARCHAR(80),
    ADD COLUMN IF NOT EXISTS expiry_date          DATE;

-- 7. INVENTORY_TRANSFER_ITEMS: Thêm fields chi tiết chuyển kho
ALTER TABLE inventory_transfer_items
    ADD COLUMN IF NOT EXISTS from_warehouse_id    BIGINT REFERENCES warehouses(id),
    ADD COLUMN IF NOT EXISTS to_warehouse_id      BIGINT REFERENCES warehouses(id),
    ADD COLUMN IF NOT EXISTS debit_account        VARCHAR(20),
    ADD COLUMN IF NOT EXISTS credit_account       VARCHAR(20),
    ADD COLUMN IF NOT EXISTS variant_spec         VARCHAR(120),
    ADD COLUMN IF NOT EXISTS unit_of_measure      VARCHAR(30),
    ADD COLUMN IF NOT EXISTS sale_unit_price      NUMERIC(14,2)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sale_line_total      NUMERIC(14,2)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cost_unit_price      NUMERIC(14,2)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cost_line_total      NUMERIC(14,2)  DEFAULT 0;

-- 8. INVENTORY_COUNTS: Thêm fields kiểm kê đầy đủ
ALTER TABLE inventory_counts
    ADD COLUMN IF NOT EXISTS count_to_date        DATE,
    ADD COLUMN IF NOT EXISTS count_purpose        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS conclusion           TEXT,
    ADD COLUMN IF NOT EXISTS is_processed         BOOLEAN        DEFAULT FALSE;

-- 9. INVENTORY_COUNT_ITEMS: Thêm fields đa quy cách
ALTER TABLE inventory_count_items
    ADD COLUMN IF NOT EXISTS variant_spec         VARCHAR(120),
    ADD COLUMN IF NOT EXISTS spec_1               VARCHAR(80),
    ADD COLUMN IF NOT EXISTS spec_2               VARCHAR(80),
    ADD COLUMN IF NOT EXISTS spec_3               VARCHAR(80),
    ADD COLUMN IF NOT EXISTS spec_4               VARCHAR(80),
    ADD COLUMN IF NOT EXISTS spec_5               VARCHAR(80),
    ADD COLUMN IF NOT EXISTS unit_of_measure      VARCHAR(30),
    ADD COLUMN IF NOT EXISTS unit_cost            NUMERIC(14,2)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS system_value         NUMERIC(14,2)  DEFAULT 0,
    ADD COLUMN IF NOT EXISTS counted_value        NUMERIC(14,2)  DEFAULT 0;

-- 10. PERMISSIONS mới cho kho
INSERT INTO permissions (code, module, action) VALUES
('INVENTORY_RECEIPT_CREATE','INVENTORY','RECEIPT_CREATE'),
('INVENTORY_RECEIPT_APPROVE','INVENTORY','RECEIPT_APPROVE'),
('INVENTORY_ISSUE_CREATE','INVENTORY','ISSUE_CREATE'),
('INVENTORY_TRANSFER_CREATE','INVENTORY','TRANSFER_CREATE'),
('INVENTORY_COUNT_CREATE','INVENTORY','COUNT_CREATE'),
('INVENTORY_REPORT_VIEW','INVENTORY','REPORT_VIEW'),
('INVENTORY_PRODUCT_MANAGE','INVENTORY','PRODUCT_MANAGE')
ON CONFLICT (code) DO NOTHING;

-- Grant cho ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'ADMIN'
  AND p.code IN ('INVENTORY_RECEIPT_CREATE','INVENTORY_RECEIPT_APPROVE',
    'INVENTORY_ISSUE_CREATE','INVENTORY_TRANSFER_CREATE','INVENTORY_COUNT_CREATE',
    'INVENTORY_REPORT_VIEW','INVENTORY_PRODUCT_MANAGE')
ON CONFLICT DO NOTHING;

-- Grant cho WAREHOUSE_STAFF
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'WAREHOUSE_STAFF'
  AND p.code IN ('INVENTORY_RECEIPT_CREATE','INVENTORY_ISSUE_CREATE',
    'INVENTORY_TRANSFER_CREATE','INVENTORY_COUNT_CREATE','INVENTORY_REPORT_VIEW')
ON CONFLICT DO NOTHING;

-- Grant cho BRANCH_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'BRANCH_MANAGER'
  AND p.code IN ('INVENTORY_RECEIPT_CREATE','INVENTORY_RECEIPT_APPROVE',
    'INVENTORY_ISSUE_CREATE','INVENTORY_TRANSFER_CREATE','INVENTORY_COUNT_CREATE',
    'INVENTORY_REPORT_VIEW','INVENTORY_PRODUCT_MANAGE')
ON CONFLICT DO NOTHING;

-- 11. Indexes cho performance
CREATE INDEX IF NOT EXISTS idx_purchase_receipts_date ON purchase_receipts(accounting_date DESC);
CREATE INDEX IF NOT EXISTS idx_goods_issues_date ON goods_issues(accounting_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_date ON inventory_transfers(transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_products_group ON products(product_group);
CREATE INDEX IF NOT EXISTS idx_products_nature ON products(product_nature);
