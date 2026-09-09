-- Bảng 1: opening_balance_config (Cấu hình thời điểm nhập số dư)
CREATE TABLE IF NOT EXISTS opening_balance_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ngay_bat_dau_su_dung DATE NOT NULL,
    nam_ke_toan INT NOT NULL,
    ky_ke_toan VARCHAR(10),
    trang_thai ENUM('DRAFT','LOCKED') DEFAULT 'DRAFT',
    ghi_chu TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    UNIQUE KEY idx_ob_config_nam (nam_ke_toan)
);

-- Bảng 2: ob_accounts (Số dư tài khoản kế toán tổng hợp)
CREATE TABLE IF NOT EXISTS ob_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nam_ke_toan INT NOT NULL,
    ma_tai_khoan VARCHAR(10) NOT NULL,
    ten_tai_khoan VARCHAR(255),
    du_no DECIMAL(18,0) DEFAULT 0,
    du_co DECIMAL(18,0) DEFAULT 0,
    ghi_chu TEXT,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_ob_acc_nam_ma (nam_ke_toan, ma_tai_khoan)
);

-- Bảng 3: ob_bank_accounts (Số dư TK ngân hàng)
CREATE TABLE IF NOT EXISTS ob_bank_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nam_ke_toan INT NOT NULL,
    bank_account_id BIGINT NOT NULL,
    ten_ngan_hang VARCHAR(255),
    so_tai_khoan VARCHAR(50),
    so_du_dau_ky DECIMAL(18,0) DEFAULT 0,
    ngay_so_du DATE,
    ghi_chu TEXT,
    UNIQUE KEY idx_ob_bank_nam_id (nam_ke_toan, bank_account_id)
);

-- Bảng 4: ob_customer_debt (Công nợ phải thu khách hàng)
CREATE TABLE IF NOT EXISTS ob_customer_debt (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nam_ke_toan INT NOT NULL,
    khach_hang_id BIGINT NOT NULL,
    ma_khach_hang VARCHAR(30),
    ten_khach_hang VARCHAR(255),
    so_tien_phai_thu DECIMAL(18,0) DEFAULT 0,
    so_tien_khach_ung DECIMAL(18,0) DEFAULT 0,
    han_thanh_toan DATE NULL,
    dien_giai TEXT,
    ghi_chu TEXT,
    UNIQUE KEY idx_ob_cust_nam_id (nam_ke_toan, khach_hang_id)
);

-- Bảng 5: ob_supplier_debt (Công nợ phải trả nhà cung cấp)
CREATE TABLE IF NOT EXISTS ob_supplier_debt (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nam_ke_toan INT NOT NULL,
    nha_cung_cap_id BIGINT NOT NULL,
    ma_ncc VARCHAR(30),
    ten_ncc VARCHAR(255),
    so_tien_phai_tra DECIMAL(18,0) DEFAULT 0,
    so_tien_ncc_ung DECIMAL(18,0) DEFAULT 0,
    han_thanh_toan DATE NULL,
    dien_giai TEXT,
    ghi_chu TEXT,
    UNIQUE KEY idx_ob_supp_nam_id (nam_ke_toan, nha_cung_cap_id)
);

-- Bảng 6: ob_employee_debt (Công nợ nhân viên)
CREATE TABLE IF NOT EXISTS ob_employee_debt (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nam_ke_toan INT NOT NULL,
    nhan_vien_id BIGINT NULL,
    ten_nhan_vien VARCHAR(255) NOT NULL,
    ma_nhan_vien VARCHAR(30),
    loai_cong_no ENUM('TAM_UNG','LUONG','KHOAN_VAY','KHAC'),
    so_tien_nv_no DECIMAL(18,0) DEFAULT 0,
    so_tien_cty_no DECIMAL(18,0) DEFAULT 0,
    dien_giai TEXT,
    ghi_chu TEXT
);

-- Bảng 7: ob_inventory (Tồn kho vật tư, hàng hóa, CCDC)
CREATE TABLE IF NOT EXISTS ob_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nam_ke_toan INT NOT NULL,
    san_pham_id BIGINT NOT NULL,
    ma_san_pham VARCHAR(30),
    ten_san_pham VARCHAR(255),
    don_vi_tinh VARCHAR(50),
    loai ENUM('HANG_HOA','VAT_TU','CCDC') DEFAULT 'HANG_HOA',
    so_luong_dau_ky DECIMAL(10,3) NOT NULL,
    don_gia_nhap DECIMAL(18,0) NOT NULL,
    gia_tri_ton_kho DECIMAL(18,0) AS (so_luong_dau_ky * don_gia_nhap),
    kho VARCHAR(100) DEFAULT 'Kho chính',
    ghi_chu TEXT,
    UNIQUE KEY idx_ob_inv_nam_id (nam_ke_toan, san_pham_id)
);

-- Bảng 8: ob_tools_in_use (CCDC đang sử dụng đầu kỳ)
CREATE TABLE IF NOT EXISTS ob_tools_in_use (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nam_ke_toan INT NOT NULL,
    ten_ccdc VARCHAR(255) NOT NULL,
    ma_ccdc VARCHAR(50),
    don_vi_tinh VARCHAR(50),
    so_luong DECIMAL(10,2) DEFAULT 1,
    nguyen_gia DECIMAL(18,0) NOT NULL,
    gia_tri_con_lai DECIMAL(18,0) NOT NULL,
    phan_bo_moi_thang DECIMAL(18,0) DEFAULT 0,
    thang_con_lai INT DEFAULT 0,
    bo_phan_su_dung VARCHAR(255),
    tai_khoan_cp VARCHAR(10) DEFAULT '642',
    ghi_chu TEXT
);

-- Bảng 9: ob_fixed_assets (Tài sản cố định đầu kỳ)
CREATE TABLE IF NOT EXISTS ob_fixed_assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nam_ke_toan INT NOT NULL,
    ten_tai_san VARCHAR(255) NOT NULL,
    ma_tai_san VARCHAR(50),
    loai_tscd VARCHAR(100),
    ngay_mua DATE,
    ngay_dua_vao_su_dung DATE NOT NULL,
    nguyen_gia DECIMAL(18,0) NOT NULL,
    gia_tri_hao_mon_lk DECIMAL(18,0) DEFAULT 0,
    gia_tri_con_lai DECIMAL(18,0) AS (nguyen_gia - gia_tri_hao_mon_lk),
    phuong_phap_kh ENUM('STRAIGHT_LINE','DECLINING') DEFAULT 'STRAIGHT_LINE',
    thoi_gian_su_dung INT NOT NULL,
    so_thang_da_kh INT DEFAULT 0,
    kh_moi_thang DECIMAL(18,0) DEFAULT 0,
    bo_phan_su_dung VARCHAR(255),
    tai_khoan_kh VARCHAR(10) DEFAULT '642',
    ghi_chu TEXT
);

-- Bảng 10: ob_prepaid_expenses (Chi phí trả trước)
CREATE TABLE IF NOT EXISTS ob_prepaid_expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nam_ke_toan INT NOT NULL,
    ten_chi_phi VARCHAR(255) NOT NULL,
    ma_chi_phi VARCHAR(50),
    ngay_bat_dau_pb DATE NOT NULL,
    ngay_ket_thuc_pb DATE NOT NULL,
    so_tien_goc DECIMAL(18,0) NOT NULL,
    so_tien_da_pb DECIMAL(18,0) DEFAULT 0,
    so_tien_con_lai DECIMAL(18,0) AS (so_tien_goc - so_tien_da_pb),
    pb_moi_thang DECIMAL(18,0),
    so_thang_con_lai INT,
    tai_khoan_cp VARCHAR(10) DEFAULT '642',
    ghi_chu TEXT
);

-- Bảng 11: ob_wip (Chi phí dở dang)
CREATE TABLE IF NOT EXISTS ob_wip (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nam_ke_toan INT NOT NULL,
    ten_cong_trinh VARCHAR(255) NOT NULL,
    ma_cong_trinh VARCHAR(50),
    loai ENUM('CONG_TRINH','DON_HANG','SAN_PHAM','KHAC'),
    chi_phi_nvl DECIMAL(18,0) DEFAULT 0,
    chi_phi_nc DECIMAL(18,0) DEFAULT 0,
    chi_phi_chung DECIMAL(18,0) DEFAULT 0,
    tong_chi_phi_dd DECIMAL(18,0) DEFAULT 0,
    ghi_chu TEXT
);

-- Index creation
CREATE INDEX idx_ob_accounts_nam ON ob_accounts(nam_ke_toan);
CREATE INDEX idx_ob_customer_nam ON ob_customer_debt(nam_ke_toan);
CREATE INDEX idx_ob_supplier_nam ON ob_supplier_debt(nam_ke_toan);
CREATE INDEX idx_ob_inventory_nam ON ob_inventory(nam_ke_toan);
