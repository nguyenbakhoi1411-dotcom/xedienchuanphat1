-- PR8: Link sales returns and replacement sales orders that belong to the same exchange.
ALTER TABLE sales_returns
    ADD COLUMN IF NOT EXISTS exchange_group_id UUID;

ALTER TABLE sales_orders
    ADD COLUMN IF NOT EXISTS exchange_group_id UUID;

CREATE INDEX IF NOT EXISTS idx_sales_returns_exchange_group
    ON sales_returns(exchange_group_id);

CREATE INDEX IF NOT EXISTS idx_sales_orders_exchange_group
    ON sales_orders(exchange_group_id);
