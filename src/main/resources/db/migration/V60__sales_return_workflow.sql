ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS reason_code VARCHAR(40);
ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS reason_note VARCHAR(500);
ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS disposition VARCHAR(30);
ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS created_by VARCHAR(120);
ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS approved_by VARCHAR(120);
ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS rejected_by VARCHAR(120);
ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sales_returns ADD COLUMN IF NOT EXISTS received_at TIMESTAMP WITH TIME ZONE;

UPDATE sales_returns
SET reason_code = 'OTHER'
WHERE reason_code IS NULL;

UPDATE sales_returns
SET reason_note = reason
WHERE reason_note IS NULL AND reason IS NOT NULL;

ALTER TABLE sales_returns ALTER COLUMN reason_code SET NOT NULL;
ALTER TABLE sales_returns ALTER COLUMN status TYPE VARCHAR(20);

ALTER TABLE sales_return_items ADD COLUMN IF NOT EXISTS batch_id BIGINT;

ALTER TABLE sales_payments ADD COLUMN IF NOT EXISTS entry_type VARCHAR(20) NOT NULL DEFAULT 'RECEIPT';

CREATE INDEX IF NOT EXISTS idx_sales_returns_order_status ON sales_returns(order_id, status);
CREATE INDEX IF NOT EXISTS idx_sales_return_items_order_item ON sales_return_items(order_item_id);
CREATE INDEX IF NOT EXISTS idx_sales_payments_order_entry_type ON sales_payments(order_id, entry_type);
