CREATE TABLE IF NOT EXISTS employee_warehouses (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
    access_level VARCHAR(20) NOT NULL DEFAULT 'VIEW',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_employee_warehouse UNIQUE (employee_id, warehouse_id)
);

CREATE INDEX IF NOT EXISTS idx_employee_warehouses_employee
    ON employee_warehouses(employee_id, active);

CREATE INDEX IF NOT EXISTS idx_employee_warehouses_warehouse
    ON employee_warehouses(warehouse_id);
