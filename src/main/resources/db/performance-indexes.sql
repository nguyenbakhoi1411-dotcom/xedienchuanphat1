-- Performance indexes for high-volume lists and reports.
-- Run after the base schema is available. PostgreSQL syntax.

CREATE INDEX IF NOT EXISTS idx_sales_orders_order_date ON sales_orders (order_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_branch_id ON sales_orders (branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_branch_order_date ON sales_orders (branch_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_order_date ON sales_orders (customer_id, order_date DESC);

CREATE INDEX IF NOT EXISTS idx_sales_order_items_product_id ON sales_order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_product ON sales_order_items (order_id, product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions (created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON inventory_transactions (product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_from_branch_id ON inventory_transactions (from_branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_to_branch_id ON inventory_transactions (to_branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_date ON inventory_transactions (product_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_from_branch_date ON inventory_transactions (from_branch_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_to_branch_date ON inventory_transactions (to_branch_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON customers (branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_branch_created_at ON customers (branch_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_serials_serial_number ON product_serials (serial_number);
CREATE INDEX IF NOT EXISTS idx_product_serials_status ON product_serials (status);
CREATE INDEX IF NOT EXISTS idx_product_serials_branch_status ON product_serials (branch_id, status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created_at ON audit_logs (user_id, created_at DESC);
