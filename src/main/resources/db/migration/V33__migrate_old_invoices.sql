-- 1. Migrate data from invoices to invoices_new
INSERT INTO invoices_new (
    ma_hoa_don,
    loai_hoa_don,
    ngay_xuat,
    order_id,
    tong_tien_truoc_thue,
    tong_thue_gtgt,
    tong_cong,
    trang_thai,
    ngay_tao
)
SELECT 
    invoice_no,
    'INTERNAL' AS loai_hoa_don,
    invoice_date,
    order_id,
    total_amount - vat_amount,
    vat_amount,
    total_amount,
    CASE 
        WHEN status = 'DRAFT' THEN 'DRAFT'
        WHEN status = 'CANCELLED' THEN 'CANCELLED'
        ELSE 'ISSUED'
    END,
    created_at
FROM invoices;

-- 2. Migrate data from tax_invoices to invoices_new
INSERT INTO invoices_new (
    ma_hoa_don,
    loai_hoa_don,
    so_hoa_don,
    ky_hieu,
    ngay_xuat,
    khach_hang_id,
    tong_tien_truoc_thue,
    tong_thue_gtgt,
    tong_cong,
    trang_thai,
    ngay_tao,
    created_by,
    chi_nhanh_id
)
SELECT 
    invoice_code,
    'VAT' AS loai_hoa_don,
    e_invoice_no,
    invoice_serial,
    invoice_date,
    customer_id,
    tax_base_amount,
    vat_amount,
    total_amount,
    CASE 
        WHEN status = 'DRAFT' THEN 'DRAFT'
        WHEN status = 'ISSUED' THEN 'ISSUED'
        WHEN status = 'ADJUSTED' THEN 'ADJUSTED'
        WHEN status = 'REPLACED' THEN 'REPLACED'
        WHEN status = 'CANCELLED' THEN 'CANCELLED'
        ELSE 'DRAFT'
    END,
    created_at,
    created_by,
    branch_id
FROM tax_invoices
WHERE invoice_type = 'OUTPUT';

-- 3. Migrate data from supplier_invoices to invoice_input_new
INSERT INTO invoice_input_new (
    ma_hoa_don_vao,
    so_hoa_don_ncc,
    ngay_hoa_don,
    nha_cung_cap_id,
    tong_tien_hang,
    tong_thue_gtgt,
    tong_cong,
    thue_suat,
    trang_thai,
    created_by,
    ngay_tao
)
SELECT 
    'HDV-MIGRATE-' || id,
    invoice_no,
    invoice_date,
    supplier_id,
    subtotal,
    vat_amount,
    total_amount,
    vat_rate,
    CASE 
        WHEN status = 'RECEIVED' THEN 'PENDING'
        WHEN status = 'VERIFIED' THEN 'APPROVED'
        WHEN status = 'CANCELLED' THEN 'REJECTED'
        ELSE 'PENDING'
    END,
    created_by,
    created_at
FROM supplier_invoices;

-- Migrate tax_invoices INPUT to invoice_input_new if any
INSERT INTO invoice_input_new (
    ma_hoa_don_vao,
    so_hoa_don_ncc,
    ky_hieu_ncc,
    ngay_hoa_don,
    nha_cung_cap_id,
    tong_tien_hang,
    tong_thue_gtgt,
    tong_cong,
    thue_suat,
    trang_thai,
    created_by,
    ngay_tao
)
SELECT 
    invoice_code,
    e_invoice_no,
    invoice_serial,
    invoice_date,
    supplier_id,
    tax_base_amount,
    vat_amount,
    total_amount,
    vat_rate,
    CASE 
        WHEN status = 'DRAFT' THEN 'PENDING'
        WHEN status = 'ISSUED' THEN 'APPROVED'
        ELSE 'PENDING'
    END,
    created_by,
    created_at
FROM tax_invoices
WHERE invoice_type = 'INPUT';

-- 4. Xóa FK tham chiếu nội bộ trong tax_invoices (nếu có)
ALTER TABLE tax_invoices DROP CONSTRAINT IF EXISTS tax_invoices_adjusted_invoice_id_fkey;

-- 5. Drop bảng cũ
DROP TABLE IF EXISTS tax_invoices CASCADE;
DROP TABLE IF EXISTS supplier_invoices CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;

-- 6. Đổi tên bảng mới thành tên chính thức
ALTER TABLE invoices_new RENAME TO invoices;
ALTER TABLE invoice_input_new RENAME TO invoice_input;

-- Đổi tên constraints / indexes cho chuẩn nếu cần
-- (PostgreSQL giữ nguyên tên constraint/index khi RENAME TABLE, nên ta rename cả index để đồng bộ)
ALTER INDEX IF EXISTS idx_invoices_new_order RENAME TO idx_invoices_order;
ALTER INDEX IF EXISTS idx_invoices_new_ngay RENAME TO idx_invoices_ngay;
ALTER INDEX IF EXISTS idx_invoices_new_trang_thai RENAME TO idx_invoices_trang_thai;
ALTER INDEX IF EXISTS idx_invoices_new_so_hd RENAME TO idx_invoices_so_hd;
ALTER INDEX IF EXISTS idx_invoice_input_new_ncc RENAME TO idx_invoice_input_ncc;
