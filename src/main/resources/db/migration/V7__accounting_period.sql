-- V7: Kỳ kế toán (Accounting Period)
-- Cho phép khóa/mở kỳ, ngăn sửa chứng từ trong kỳ đã khóa

CREATE TABLE IF NOT EXISTS accounting_periods (
    id BIGSERIAL PRIMARY KEY,
    period_code VARCHAR(20) NOT NULL UNIQUE,
    month INTEGER,
    quarter INTEGER,
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    branch_id BIGINT,
    locked_by VARCHAR(120),
    locked_at TIMESTAMPTZ,
    unlocked_by VARCHAR(120),
    unlocked_at TIMESTAMPTZ,
    note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(120) NOT NULL DEFAULT 'system',
    CONSTRAINT chk_period_status CHECK (status IN ('OPEN', 'LOCKED')),
    CONSTRAINT chk_period_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_accounting_periods_year ON accounting_periods(year);
CREATE INDEX IF NOT EXISTS idx_accounting_periods_status ON accounting_periods(status);
CREATE INDEX IF NOT EXISTS idx_accounting_periods_branch ON accounting_periods(branch_id);
CREATE INDEX IF NOT EXISTS idx_accounting_periods_dates ON accounting_periods(start_date, end_date);

-- Seed kỳ kế toán năm 2025 và 2026 (trạng thái OPEN)
INSERT INTO accounting_periods (period_code, month, year, start_date, end_date, status, created_by)
VALUES
  ('2025-01', 1, 2025, '2025-01-01', '2025-01-31', 'OPEN', 'system'),
  ('2025-02', 2, 2025, '2025-02-01', '2025-02-28', 'OPEN', 'system'),
  ('2025-03', 3, 2025, '2025-03-01', '2025-03-31', 'OPEN', 'system'),
  ('2025-04', 4, 2025, '2025-04-01', '2025-04-30', 'OPEN', 'system'),
  ('2025-05', 5, 2025, '2025-05-01', '2025-05-31', 'OPEN', 'system'),
  ('2025-06', 6, 2025, '2025-06-01', '2025-06-30', 'OPEN', 'system'),
  ('2025-07', 7, 2025, '2025-07-01', '2025-07-31', 'OPEN', 'system'),
  ('2025-08', 8, 2025, '2025-08-01', '2025-08-31', 'OPEN', 'system'),
  ('2025-09', 9, 2025, '2025-09-01', '2025-09-30', 'OPEN', 'system'),
  ('2025-10', 10, 2025, '2025-10-01', '2025-10-31', 'OPEN', 'system'),
  ('2025-11', 11, 2025, '2025-11-01', '2025-11-30', 'OPEN', 'system'),
  ('2025-12', 12, 2025, '2025-12-01', '2025-12-31', 'OPEN', 'system'),
  -- 2026
  ('2026-01', 1, 2026, '2026-01-01', '2026-01-31', 'OPEN', 'system'),
  ('2026-02', 2, 2026, '2026-02-01', '2026-02-28', 'OPEN', 'system'),
  ('2026-03', 3, 2026, '2026-03-01', '2026-03-31', 'OPEN', 'system'),
  ('2026-04', 4, 2026, '2026-04-01', '2026-04-30', 'OPEN', 'system'),
  ('2026-05', 5, 2026, '2026-05-01', '2026-05-31', 'OPEN', 'system'),
  ('2026-06', 6, 2026, '2026-06-01', '2026-06-30', 'OPEN', 'system'),
  ('2026-07', 7, 2026, '2026-07-01', '2026-07-31', 'OPEN', 'system'),
  ('2026-08', 8, 2026, '2026-08-01', '2026-08-31', 'OPEN', 'system'),
  ('2026-09', 9, 2026, '2026-09-01', '2026-09-30', 'OPEN', 'system'),
  ('2026-10', 10, 2026, '2026-10-01', '2026-10-31', 'OPEN', 'system'),
  ('2026-11', 11, 2026, '2026-11-01', '2026-11-30', 'OPEN', 'system'),
  ('2026-12', 12, 2026, '2026-12-01', '2026-12-31', 'OPEN', 'system')
ON CONFLICT (period_code) DO NOTHING;
