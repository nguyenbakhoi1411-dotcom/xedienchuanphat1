-- Thêm trường thuế vào Báo giá
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5, 2) NOT NULL DEFAULT 10.00;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(14, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 0.00;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(14, 2) DEFAULT 0.00;

-- Thêm trường ERP vào Đơn đặt hàng
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(200);
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS execution_status VARCHAR(50) DEFAULT 'Chưa thực hiện';

ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 0.00;
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(14, 2) DEFAULT 0.00;
