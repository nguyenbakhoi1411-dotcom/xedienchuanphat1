-- V17: Sales Order — VAT fields + Discount Approval Workflow
-- Them vat_rate, vat_amount, tax_invoice_id
-- Them discount_approval_status, approved_by, approved_at, approval_note

ALTER TABLE sales_orders
    ADD COLUMN IF NOT EXISTS vat_rate               DECIMAL(5,2)         NOT NULL DEFAULT 10.00,
    ADD COLUMN IF NOT EXISTS vat_amount             DECIMAL(14,2)        NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS tax_invoice_id         BIGINT               NULL,
    ADD COLUMN IF NOT EXISTS discount_approval_status VARCHAR(30)        NOT NULL DEFAULT 'NONE',
    ADD COLUMN IF NOT EXISTS approved_by            VARCHAR(120)         NULL,
    ADD COLUMN IF NOT EXISTS approved_at            TIMESTAMPTZ          NULL,
    ADD COLUMN IF NOT EXISTS approval_note          VARCHAR(500)         NULL,
    ADD COLUMN IF NOT EXISTS max_discount_pct       DECIMAL(5,2)         NOT NULL DEFAULT 5.00;

-- Index de truy van theo trang thai duyet giam gia
CREATE INDEX IF NOT EXISTS idx_sales_orders_discount_approval
    ON sales_orders (discount_approval_status)
    WHERE discount_approval_status <> 'NONE';

-- Deposit Controller expose: khong can migration moi cho deposit
-- Deposit table da co day du fields tu V10

COMMENT ON COLUMN sales_orders.vat_rate IS 'Thue suat VAT mac dinh 10%. Co the override theo tung san pham.';
COMMENT ON COLUMN sales_orders.vat_amount IS 'Tong tien thue VAT = subtotal_taxable * vat_rate / 100';
COMMENT ON COLUMN sales_orders.discount_approval_status IS 'NONE | PENDING | APPROVED | REJECTED';
COMMENT ON COLUMN sales_orders.max_discount_pct IS 'Muc giam gia toi da theo role nguoi tao don. Default 5% cho nhan vien.';
