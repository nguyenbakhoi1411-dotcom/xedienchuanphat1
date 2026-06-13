-- Management dashboard/report indexes for PostgreSQL.
-- Development uses Hibernate ddl-auto=update; run these in production migrations.

CREATE INDEX IF NOT EXISTS idx_sales_orders_date_branch_employee
    ON sales_orders(order_date, branch_id, employee_id, status);

CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_product
    ON sales_order_items(order_id, product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_stocks_branch_product
    ON inventory_stocks(branch_id, product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date_branch_product
    ON inventory_transactions(transaction_date, from_branch_id, to_branch_id, product_id);

CREATE INDEX IF NOT EXISTS idx_customers_created_branch_source
    ON customers(created_at, branch_id, source);

CREATE INDEX IF NOT EXISTS idx_receivables_customer_due_status
    ON receivables(customer_id, due_date, status);

CREATE INDEX IF NOT EXISTS idx_payables_supplier_due_status
    ON payables(supplier_id, due_date, status);

CREATE INDEX IF NOT EXISTS idx_service_tickets_created_status_vehicle
    ON service_tickets(created_at, status, vehicle_id);

CREATE INDEX IF NOT EXISTS idx_product_serials_branch
    ON product_serials(branch_id);

-- Optimized unique and composite indexes for reports
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_orders_no ON sales_orders(order_no);
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_orders_no ON purchase_orders(purchase_order_no);
CREATE INDEX IF NOT EXISTS idx_cash_books_date ON cash_books(transaction_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_status_vehicle ON service_tickets(status, vehicle_id);
CREATE INDEX IF NOT EXISTS idx_payables_source_no ON payables(source_no);
CREATE INDEX IF NOT EXISTS idx_receivables_source_no ON receivables(source_no);
