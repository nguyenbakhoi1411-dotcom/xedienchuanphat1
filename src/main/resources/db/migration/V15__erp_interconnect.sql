-- V15: ERP Interconnect — Liên thông dữ liệu toàn hệ thống
-- Thêm các cột còn thiếu để các module liên thông chính xác

-- Ghi chú: CustomerTier enum mở rộng với REGULAR và PLATINUM
-- (không cần thay đổi DB vì tier lưu dạng VARCHAR)
-- ========================
-- 1. CRM Lead → Customer linkage
-- ========================
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;

-- ========================
-- 2. CRM Opportunity → Quotation → Sales Order
-- ========================
ALTER TABLE crm_opportunities ADD COLUMN IF NOT EXISTS quotation_id BIGINT REFERENCES quotations(id);
ALTER TABLE crm_opportunities ADD COLUMN IF NOT EXISTS sales_order_id BIGINT REFERENCES sales_orders(id);
ALTER TABLE crm_opportunities ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
ALTER TABLE crm_opportunities ADD COLUMN IF NOT EXISTS converted_by VARCHAR(120);

-- ========================
-- 3. Deposit — accounting idempotency flag
-- ========================
ALTER TABLE deposits ADD COLUMN IF NOT EXISTS accounting_recorded BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE deposits ADD COLUMN IF NOT EXISTS journal_entry_no VARCHAR(80);

-- ========================
-- 4. Customer 360 — aggregated stats
-- ========================
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_purchase_amount NUMERIC(14,2) NOT NULL DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_purchase_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_purchase_date DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_service_date DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS lifetime_value NUMERIC(14,2) NOT NULL DEFAULT 0;

-- ========================
-- 5. Purchase Order — idempotency flags
-- ========================
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS accounting_recorded BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS stock_received BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS serials_created BOOLEAN NOT NULL DEFAULT FALSE;

-- ========================
-- 6. Service Tickets — branch/customer FK + idempotency flags
-- ========================
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS branch_id BIGINT REFERENCES branches(id);
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS customer_id BIGINT REFERENCES customers(id);
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS accounting_recorded BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS parts_issued BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS order_no VARCHAR(80);

-- ========================
-- 7. Sales Returns — accounting reversal idempotency
-- ========================
ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS accounting_reversed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS reversal_entry_no VARCHAR(80);

-- ========================
-- 8. Purchase Returns — accounting idempotency
-- ========================
ALTER TABLE purchase_returns ADD COLUMN IF NOT EXISTS accounting_recorded BOOLEAN NOT NULL DEFAULT FALSE;

-- ========================
-- 9. Inventory Transfers — audit + serial linkage
-- ========================
ALTER TABLE inventory_transfers ADD COLUMN IF NOT EXISTS created_by VARCHAR(120);
ALTER TABLE inventory_transfers ADD COLUMN IF NOT EXISTS approved_by VARCHAR(120);
ALTER TABLE inventory_transfers ADD COLUMN IF NOT EXISTS serial_id BIGINT REFERENCES product_serials(id);

-- ========================
-- 10. Product Serials — service history tracking
-- ========================
ALTER TABLE product_serials ADD COLUMN IF NOT EXISTS last_service_ticket_no VARCHAR(80);
ALTER TABLE product_serials ADD COLUMN IF NOT EXISTS last_serviced_at DATE;

-- ========================
-- 11. Indexes cho hiệu năng
-- ========================
CREATE INDEX IF NOT EXISTS idx_crm_opp_quotation    ON crm_opportunities(quotation_id);
CREATE INDEX IF NOT EXISTS idx_crm_opp_order        ON crm_opportunities(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_svc_ticket_customer  ON service_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_svc_ticket_branch    ON service_tickets(branch_id);
CREATE INDEX IF NOT EXISTS idx_po_accounting        ON purchase_orders(accounting_recorded);
CREATE INDEX IF NOT EXISTS idx_deposit_accounting   ON deposits(accounting_recorded);
CREATE INDEX IF NOT EXISTS idx_sr_reversed          ON sales_returns(accounting_reversed);
CREATE INDEX IF NOT EXISTS idx_inv_transfer_serial  ON inventory_transfers(serial_id);
