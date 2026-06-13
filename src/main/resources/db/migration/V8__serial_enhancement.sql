-- V8: Nâng cấp ProductSerial và Lịch sử Serial xe

-- Thêm các trường mới vào bảng product_serials
ALTER TABLE product_serials
    ADD COLUMN IF NOT EXISTS charger_number VARCHAR(80),
    ADD COLUMN IF NOT EXISTS color VARCHAR(50),
    ADD COLUMN IF NOT EXISTS version VARCHAR(50),
    ADD COLUMN IF NOT EXISTS supplier_id BIGINT,
    ADD COLUMN IF NOT EXISTS purchase_cost NUMERIC(14,2),
    ADD COLUMN IF NOT EXISTS reserved_customer_id BIGINT,
    ADD COLUMN IF NOT EXISTS current_customer_id BIGINT,
    ADD COLUMN IF NOT EXISTS sold_date DATE,
    ADD COLUMN IF NOT EXISTS warranty_start_date DATE,
    ADD COLUMN IF NOT EXISTS warranty_end_date DATE,
    ADD COLUMN IF NOT EXISTS note VARCHAR(500),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Thêm UNIQUE constraint cho frame_number nếu chưa có
ALTER TABLE product_serials ADD CONSTRAINT uq_frame_number UNIQUE (frame_number);

-- Bảng lịch sử thay đổi trạng thái Serial
CREATE TABLE IF NOT EXISTS product_serial_histories (
    id BIGSERIAL PRIMARY KEY,
    serial_id BIGINT NOT NULL REFERENCES product_serials(id) ON DELETE CASCADE,
    action VARCHAR(80) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    source_document_type VARCHAR(80),
    source_document_id VARCHAR(100),
    branch_from_id BIGINT,
    branch_to_id BIGINT,
    warehouse_from_id BIGINT,
    warehouse_to_id BIGINT,
    customer_id BIGINT,
    created_by VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    note VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_prod_serial_hist_serial ON product_serial_histories(serial_id);
CREATE INDEX IF NOT EXISTS idx_prod_serial_hist_created ON product_serial_histories(created_at);
