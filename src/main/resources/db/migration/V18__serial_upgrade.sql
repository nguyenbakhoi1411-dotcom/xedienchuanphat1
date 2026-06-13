-- V18: Serial Management Upgrade
-- 1. Them unique constraint cho battery_serial (so pin)
-- 2. Them index tim kiem nhanh theo frame/engine/battery number
-- 3. Them cot last_service_ticket_no, last_serviced_at neu chua co (V15 co the da them)
-- 4. Cho phep enum values moi: REPAIRING, DEFECTIVE, RETURNED_TO_SUPPLIER, TRANSFERRED

-- Unique constraint cho battery_serial (so pin xe phai duy nhat)
-- Dung partial unique: chi bat unique khi battery_serial IS NOT NULL
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_serials_battery_serial
    ON product_serials (battery_serial)
    WHERE battery_serial IS NOT NULL;

-- Unique constraint cho engine_number (so may)
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_serials_engine_number
    ON product_serials (engine_number)
    WHERE engine_number IS NOT NULL;

-- Index tim kiem nhanh theo so khung, so may, so pin (LIKE search)
CREATE INDEX IF NOT EXISTS idx_product_serials_frame_number
    ON product_serials (frame_number);

CREATE INDEX IF NOT EXISTS idx_product_serials_engine_number
    ON product_serials (engine_number);

CREATE INDEX IF NOT EXISTS idx_product_serials_battery_serial
    ON product_serials (battery_serial);

-- Index cho filter theo status + branch (query pho bien nhat)
CREATE INDEX IF NOT EXISTS idx_product_serials_branch_status
    ON product_serials (branch_id, status);

-- Index cho filter theo product + status
CREATE INDEX IF NOT EXISTS idx_product_serials_product_status
    ON product_serials (product_id, status);

-- Them cot last_service_ticket_no va last_serviced_at neu V15 chua them
-- (V15 da them, nhung dung IF NOT EXISTS cho an toan)
ALTER TABLE product_serials
    ADD COLUMN IF NOT EXISTS last_service_ticket_no VARCHAR(80) NULL,
    ADD COLUMN IF NOT EXISTS last_serviced_at        DATE        NULL;

-- Them cot defect_reason de ghi ly do loi (moi)
ALTER TABLE product_serials
    ADD COLUMN IF NOT EXISTS defect_reason VARCHAR(500) NULL;

-- Ghi chu: SerialStatus enum moi (REPAIRING, DEFECTIVE, RETURNED_TO_SUPPLIER, TRANSFERRED)
-- duoc them vao Java enum SerialStatus.java.
-- PostgreSQL khong can ALTER TYPE vi dung column type VARCHAR.

COMMENT ON COLUMN product_serials.battery_serial IS 'So pin xe — duy nhat neu co gia tri';
COMMENT ON COLUMN product_serials.engine_number IS 'So may — duy nhat neu co gia tri';
COMMENT ON COLUMN product_serials.defect_reason IS 'Ly do xe bi loi (neu status = DEFECTIVE)';
