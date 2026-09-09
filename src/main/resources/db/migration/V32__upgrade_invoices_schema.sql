-- Bảng 1: invoices_new (Hóa đơn — mọi loại)
CREATE TABLE IF NOT EXISTS invoices_new (
    id                    BIGSERIAL PRIMARY KEY,
    ma_hoa_don            VARCHAR(30) UNIQUE,    -- HD-YYYYMMDD-XXX
    loai_hoa_don          VARCHAR(20) DEFAULT 'VAT' CHECK (loai_hoa_don IN ('INTERNAL','VAT','ADJUSTMENT','REPLACEMENT')),
    
    -- Thông tin số hiệu HĐ điện tử
    mau_so                VARCHAR(20),
    ky_hieu               VARCHAR(20),
    so_hoa_don            VARCHAR(20),
    so_hoa_don_goc_id     BIGINT REFERENCES invoices_new(id),

    -- Thông tin thời gian
    ngay_xuat             DATE NOT NULL,
    ngay_ky               TIMESTAMP WITH TIME ZONE,
    ngay_gui_cqt          TIMESTAMP WITH TIME ZONE,

    -- Liên kết nghiệp vụ
    order_id              BIGINT REFERENCES sales_orders(id),
    purchase_order_id     BIGINT REFERENCES purchase_orders(id),

    -- Thông tin người bán (snapshot)
    ten_nguoi_ban         VARCHAR(255),
    dia_chi_nguoi_ban     TEXT,
    ma_so_thue_nguoi_ban  VARCHAR(20),
    so_dien_thoai_nguoi_ban VARCHAR(20),

    -- Thông tin người mua (snapshot)
    ten_nguoi_mua         VARCHAR(255),
    dia_chi_nguoi_mua     TEXT,
    ma_so_thue_nguoi_mua  VARCHAR(20),
    ten_don_vi_mua        VARCHAR(255),
    hinh_thuc_tt          VARCHAR(100),
    so_tai_khoan_mua      VARCHAR(50),
    ngan_hang_mua         VARCHAR(255),
    khach_hang_id         BIGINT REFERENCES customers(id),

    -- Tổng tiền
    tong_tien_hang        NUMERIC(18,2) DEFAULT 0,
    tong_chiet_khau       NUMERIC(18,2) DEFAULT 0,
    tong_tien_truoc_thue  NUMERIC(18,2) DEFAULT 0,
    tong_thue_gtgt        NUMERIC(18,2) DEFAULT 0,
    tong_cong             NUMERIC(18,2) DEFAULT 0,
    so_tien_bang_chu      TEXT,

    -- Trạng thái
    trang_thai            VARCHAR(20) DEFAULT 'DRAFT' CHECK (trang_thai IN ('DRAFT','ISSUED','ADJUSTED','REPLACED','CANCELLED')),
    ly_do_huy             TEXT,
    ngay_huy              DATE,

    -- Ký điện tử
    da_ky_dien_tu         BOOLEAN DEFAULT FALSE,
    chu_ky_nguoi_ban      TEXT,
    ma_cqt                VARCHAR(100),

    -- File
    file_pdf_path         VARCHAR(500),
    file_xml_path         VARCHAR(500),

    -- Audit
    chi_nhanh_id          BIGINT,
    created_by            VARCHAR(255),
    updated_by            VARCHAR(255),
    ngay_tao              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ngay_cap_nhat         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng 2: invoice_items
CREATE TABLE IF NOT EXISTS invoice_items (
    id                    BIGSERIAL PRIMARY KEY,
    invoice_id            BIGINT NOT NULL REFERENCES invoices_new(id) ON DELETE CASCADE,
    thu_tu                INT DEFAULT 1,
    ten_hang_hoa          VARCHAR(500) NOT NULL,
    don_vi_tinh           VARCHAR(50),
    so_luong              NUMERIC(10,3),
    don_gia               NUMERIC(18,2),
    chiet_khau_phan_tram  NUMERIC(5,2) DEFAULT 0,
    thanh_tien_truoc_thue NUMERIC(18,2),
    thue_suat             NUMERIC(5,2) DEFAULT 10,
    tien_thue             NUMERIC(18,2),
    thanh_tien            NUMERIC(18,2)
);

-- Bảng 3: invoice_serial_config
CREATE TABLE IF NOT EXISTS invoice_serial_config (
    id                    BIGSERIAL PRIMARY KEY,
    mau_so                VARCHAR(20) NOT NULL,
    ky_hieu               VARCHAR(20) NOT NULL,
    so_bat_dau            INT DEFAULT 1,
    so_hien_tai           INT DEFAULT 0,
    so_ket_thuc           INT DEFAULT 9999999,
    loai_hoa_don          VARCHAR(20) CHECK (loai_hoa_don IN ('VAT','INTERNAL')),
    nam_su_dung           INT,
    trang_thai            VARCHAR(20) CHECK (trang_thai IN ('ACTIVE','INACTIVE')),
    ngay_ky_thong_bao     DATE,
    ngay_tao              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (mau_so, ky_hieu, nam_su_dung)
);

-- Bảng 4: invoice_input_new (Hóa đơn đầu vào)
CREATE TABLE IF NOT EXISTS invoice_input_new (
    id                    BIGSERIAL PRIMARY KEY,
    ma_hoa_don_vao        VARCHAR(30) UNIQUE,
    mau_so_ncc            VARCHAR(20),
    ky_hieu_ncc           VARCHAR(20),
    so_hoa_don_ncc        VARCHAR(20),
    ngay_hoa_don          DATE NOT NULL,
    nha_cung_cap_id       BIGINT NOT NULL REFERENCES suppliers(id),
    purchase_order_id     BIGINT REFERENCES purchase_orders(id),
    ten_ncc               VARCHAR(255),
    ma_so_thue_ncc        VARCHAR(20),
    tong_tien_hang        NUMERIC(18,2),
    tong_thue_gtgt        NUMERIC(18,2),
    tong_cong             NUMERIC(18,2),
    thue_suat             NUMERIC(5,2) DEFAULT 10,
    da_khai_thue          BOOLEAN DEFAULT FALSE,
    file_hoa_don          VARCHAR(500),
    ghi_chu               TEXT,
    trang_thai            VARCHAR(20) DEFAULT 'PENDING' CHECK (trang_thai IN ('PENDING','APPROVED','REJECTED')),
    created_by            VARCHAR(255),
    ngay_tao              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo Indexes
CREATE INDEX idx_invoices_new_order ON invoices_new(order_id);
CREATE INDEX idx_invoices_new_ngay ON invoices_new(ngay_xuat);
CREATE INDEX idx_invoices_new_trang_thai ON invoices_new(trang_thai);
CREATE INDEX idx_invoices_new_so_hd ON invoices_new(mau_so, ky_hieu, so_hoa_don);
CREATE INDEX idx_invoice_input_new_ncc ON invoice_input_new(nha_cung_cap_id);
