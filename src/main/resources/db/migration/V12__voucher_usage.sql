-- V12: Lịch sử sử dụng voucher

CREATE TABLE IF NOT EXISTS voucher_usages (
    id BIGSERIAL PRIMARY KEY,
    voucher_id BIGINT NOT NULL,
    voucher_code VARCHAR(50) NOT NULL,
    customer_id BIGINT NOT NULL,
    sales_order_id BIGINT,
    sales_order_no VARCHAR(30),
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    branch_id BIGINT NOT NULL,
    used_by VARCHAR(120) NOT NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voucher_usages_voucher ON voucher_usages(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usages_customer ON voucher_usages(customer_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usages_order ON voucher_usages(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usages_used_at ON voucher_usages(used_at);

-- Thêm cột max_discount_amount và per_customer_limit vào bảng vouchers nếu chưa có
ALTER TABLE vouchers
    ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(14,2),
    ADD COLUMN IF NOT EXISTS per_customer_limit INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS applicable_customer_groups VARCHAR(500),
    ADD COLUMN IF NOT EXISTS combinable BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS description VARCHAR(500),
    ADD COLUMN IF NOT EXISTS total_quantity INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(120);
