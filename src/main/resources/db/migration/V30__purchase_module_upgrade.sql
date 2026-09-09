-- V30: Nang cap toan dien module Mua Hang
-- Bo sung cac cot con thieu cho purchase_orders, purchase_order_items,
-- purchase_receipt_items, suppliers
-- ===================================================================

-- ── 1. Nang cap purchase_orders ──────────────────────────────────
ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS nguoi_phu_trach       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS dia_chi_giao_hang      TEXT,
    ADD COLUMN IF NOT EXISTS hinh_thuc_tt           VARCHAR(20) NOT NULL DEFAULT 'DEBT'
                             CHECK (hinh_thuc_tt IN ('CASH','BANK','DEBT')),
    ADD COLUMN IF NOT EXISTS han_thanh_toan         DATE,
    ADD COLUMN IF NOT EXISTS trang_thai_thanh_toan  VARCHAR(20) NOT NULL DEFAULT 'UNPAID'
                             CHECK (trang_thai_thanh_toan IN ('UNPAID','PARTIAL','PAID')),
    ADD COLUMN IF NOT EXISTS tong_tien_hang         NUMERIC(18,0) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tong_chiet_khau        NUMERIC(18,0) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tong_thue_gtgt         NUMERIC(18,0) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS file_hoa_don_ncc       VARCHAR(500),
    ADD COLUMN IF NOT EXISTS ngay_cap_nhat          TIMESTAMPTZ   NOT NULL DEFAULT NOW();

-- Backfill tong_tien_hang = total_amount cho don cu
UPDATE purchase_orders SET tong_tien_hang = total_amount WHERE tong_tien_hang = 0;

-- ── 2. Nang cap purchase_order_items ─────────────────────────────
ALTER TABLE purchase_order_items
    ADD COLUMN IF NOT EXISTS so_luong_da_nhan      NUMERIC(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS chiet_khau_phan_tram  NUMERIC(5,2)  NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS thue_gtgt_phan_tram   NUMERIC(5,2)  NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ten_san_pham          VARCHAR(255),
    ADD COLUMN IF NOT EXISTS don_vi_tinh           VARCHAR(50),
    ADD COLUMN IF NOT EXISTS thu_tu               INT            NOT NULL DEFAULT 1;

-- Backfill ten_san_pham tu products neu con null
UPDATE purchase_order_items poi
SET ten_san_pham = p.name
FROM products p
WHERE poi.product_id = p.id AND poi.ten_san_pham IS NULL;

-- ── 3. Nang cap purchase_receipt_items ───────────────────────────
ALTER TABLE purchase_receipt_items
    ADD COLUMN IF NOT EXISTS gia_von_truoc_nhap       NUMERIC(18,0),
    ADD COLUMN IF NOT EXISTS gia_von_sau_nhap         NUMERIC(18,0),
    ADD COLUMN IF NOT EXISTS purchase_order_item_id   BIGINT REFERENCES purchase_order_items(id);

-- ── 4. Nang cap suppliers ─────────────────────────────────────────
ALTER TABLE suppliers
    ADD COLUMN IF NOT EXISTS ten_viet_tat         VARCHAR(100),
    ADD COLUMN IF NOT EXISTS tinh_thanh           VARCHAR(100),
    ADD COLUMN IF NOT EXISTS chuc_vu_nguoi_lh     VARCHAR(100),
    ADD COLUMN IF NOT EXISTS dien_thoai_nguoi_lh  VARCHAR(20),
    ADD COLUMN IF NOT EXISTS email_nguoi_lh       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS so_tai_khoan_nh      VARCHAR(50),
    ADD COLUMN IF NOT EXISTS ten_ngan_hang        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS chi_nhanh_nh         VARCHAR(255),
    ADD COLUMN IF NOT EXISTS phuong_thuc_tt       VARCHAR(10) NOT NULL DEFAULT 'BOTH'
                             CHECK (phuong_thuc_tt IN ('CASH','BANK','BOTH'));

-- ── 5. Indexes bo sung ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_po_ngay_dat_hang    ON purchase_orders(purchase_date);
CREATE INDEX IF NOT EXISTS idx_po_payment_status   ON purchase_orders(trang_thai_thanh_toan);
CREATE INDEX IF NOT EXISTS idx_po_han_tt           ON purchase_orders(han_thanh_toan);
CREATE INDEX IF NOT EXISTS idx_po_items_sl_nhan    ON purchase_order_items(so_luong_da_nhan);
CREATE INDEX IF NOT EXISTS idx_receipt_items_poi   ON purchase_receipt_items(purchase_order_item_id);

-- ── 6. Seed permissions bo sung ──────────────────────────────────
INSERT INTO permissions (code, module, action) VALUES
('PURCHASE_RECEIVE', 'PURCHASE', 'RECEIVE'),
('PURCHASE_PAY',     'PURCHASE', 'PAY'),
('SUPPLIER_DEBT',    'SUPPLIER', 'DEBT')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'ADMIN'
  AND p.code IN ('PURCHASE_RECEIVE','PURCHASE_PAY','SUPPLIER_DEBT')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code IN ('BRANCH_MANAGER','ACCOUNTANT','WAREHOUSE_STAFF')
  AND p.code IN ('PURCHASE_RECEIVE','PURCHASE_PAY','SUPPLIER_DEBT')
ON CONFLICT DO NOTHING;

COMMENT ON COLUMN purchase_orders.hinh_thuc_tt          IS 'CASH=Tien mat, BANK=Chuyen khoan, DEBT=Cong no';
COMMENT ON COLUMN purchase_orders.trang_thai_thanh_toan IS 'UNPAID=Chua TT, PARTIAL=1 phan, PAID=Du';
COMMENT ON COLUMN purchase_orders.han_thanh_toan        IS 'Ngay den han thanh toan cho NCC';
COMMENT ON COLUMN purchase_order_items.so_luong_da_nhan IS 'Cap nhat moi lan nhap kho';
