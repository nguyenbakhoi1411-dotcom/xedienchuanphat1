-- V13: Mô-đun Nhân Sự (HR)
-- Nhân viên, phòng ban, chức danh, chấm công, nghỉ phép, lương, KPI

-- Phòng ban
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    branch_id BIGINT,
    parent_id BIGINT REFERENCES departments(id),
    manager_id BIGINT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chức danh / Vị trí
CREATE TABLE IF NOT EXISTS positions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department_id BIGINT REFERENCES departments(id),
    level INTEGER DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Nhân viên
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(120),
    address VARCHAR(500),
    gender VARCHAR(10),
    date_of_birth DATE,
    id_number VARCHAR(20),
    branch_id BIGINT NOT NULL,
    department_id BIGINT REFERENCES departments(id),
    position_id BIGINT REFERENCES positions(id),
    user_id BIGINT,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    termination_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    base_salary NUMERIC(14,2) NOT NULL DEFAULT 0,
    allowance NUMERIC(14,2) NOT NULL DEFAULT 0,
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_employee_status CHECK (status IN ('ACTIVE','INACTIVE','PROBATION','TERMINATED'))
);

-- Ca làm việc
CREATE TABLE IF NOT EXISTS work_shifts (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER DEFAULT 60,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Chấm công
CREATE TABLE IF NOT EXISTS attendances (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    work_date DATE NOT NULL,
    work_shift_id BIGINT REFERENCES work_shifts(id),
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    late_minutes INTEGER DEFAULT 0,
    early_leave_minutes INTEGER DEFAULT 0,
    overtime_hours NUMERIC(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PRESENT',
    note VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_attendance_employee_date UNIQUE (employee_id, work_date),
    CONSTRAINT chk_attendance_status CHECK (status IN ('PRESENT','ABSENT','LATE','HALF_DAY','HOLIDAY','LEAVE'))
);

-- Đơn nghỉ phép
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    leave_type VARCHAR(30) NOT NULL DEFAULT 'ANNUAL',
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    days_count NUMERIC(4,1) NOT NULL DEFAULT 1,
    reason VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by BIGINT REFERENCES employees(id),
    approved_at TIMESTAMPTZ,
    rejected_reason VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_leave_status CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED'))
);

-- Bảng lương tháng
CREATE TABLE IF NOT EXISTS payrolls (
    id BIGSERIAL PRIMARY KEY,
    payroll_code VARCHAR(30) NOT NULL UNIQUE,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    branch_id BIGINT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    base_salary NUMERIC(14,2) NOT NULL DEFAULT 0,
    allowance NUMERIC(14,2) NOT NULL DEFAULT 0,
    commission NUMERIC(14,2) NOT NULL DEFAULT 0,
    kpi_bonus NUMERIC(14,2) NOT NULL DEFAULT 0,
    overtime_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
    deduction_late NUMERIC(14,2) NOT NULL DEFAULT 0,
    advance_taken NUMERIC(14,2) NOT NULL DEFAULT 0,
    gross_salary NUMERIC(14,2) NOT NULL DEFAULT 0,
    net_salary NUMERIC(14,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    approved_by VARCHAR(120),
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(120) NOT NULL,
    CONSTRAINT uq_payroll_employee_month UNIQUE (employee_id, month, year),
    CONSTRAINT chk_payroll_status CHECK (status IN ('DRAFT','APPROVED','PAID'))
);

-- Quy tắc hoa hồng
CREATE TABLE IF NOT EXISTS commission_rules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position_id BIGINT REFERENCES positions(id),
    product_category VARCHAR(50),
    commission_type VARCHAR(20) NOT NULL DEFAULT 'PERCENT',
    commission_value NUMERIC(10,4) NOT NULL,
    min_revenue NUMERIC(14,2),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_commission_type CHECK (commission_type IN ('PERCENT','FIXED'))
);

-- KPI nhân viên
CREATE TABLE IF NOT EXISTS employee_kpis (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    leads_handled INTEGER DEFAULT 0,
    quotations_sent INTEGER DEFAULT 0,
    orders_closed INTEGER DEFAULT 0,
    revenue NUMERIC(14,2) DEFAULT 0,
    conversion_rate NUMERIC(5,2) DEFAULT 0,
    service_tickets_handled INTEGER DEFAULT 0,
    kpi_score NUMERIC(5,2) DEFAULT 0,
    note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_kpi_employee_month UNIQUE (employee_id, month, year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_branch ON employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_attendances_employee ON attendances(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(work_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_payrolls_employee ON payrolls(employee_id);
CREATE INDEX IF NOT EXISTS idx_payrolls_month_year ON payrolls(month, year);
CREATE INDEX IF NOT EXISTS idx_kpis_employee ON employee_kpis(employee_id);
CREATE INDEX IF NOT EXISTS idx_kpis_month_year ON employee_kpis(month, year);

-- Seed ca làm việc mặc định
INSERT INTO work_shifts (code, name, start_time, end_time, break_minutes)
VALUES
    ('MORNING', 'Ca sáng', '07:30', '16:30', 60),
    ('AFTERNOON', 'Ca chiều', '12:00', '21:00', 60),
    ('FULL_DAY', 'Cả ngày', '08:00', '17:30', 90)
ON CONFLICT (code) DO NOTHING;
