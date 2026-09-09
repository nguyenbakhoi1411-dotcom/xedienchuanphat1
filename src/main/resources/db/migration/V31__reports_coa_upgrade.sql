-- V31: Reports Module Upgrade — Chart of Accounts TT200 + Account Nature
-- Nâng cấp module báo cáo: seed data TT200 đầy đủ + account_level + account_nature

-- ========================
-- 1. Thêm cột account_level và account_nature vào chart_of_accounts
-- ========================
ALTER TABLE chart_of_accounts
    ADD COLUMN IF NOT EXISTS account_level INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS account_nature VARCHAR(20) NOT NULL DEFAULT 'DEBIT_NORMAL';
-- account_nature: DEBIT_NORMAL (Dư Nợ) | CREDIT_NORMAL (Dư Có) | DUAL_NATURE (Lưỡng tính)

COMMENT ON COLUMN chart_of_accounts.account_level IS '1=cấp 1 (3 số), 2=cấp 2 (4 số), v.v.';
COMMENT ON COLUMN chart_of_accounts.account_nature IS 'DEBIT_NORMAL=Tài sản/CP, CREDIT_NORMAL=NV/DT, DUAL_NATURE=131/331/421';

-- ========================
-- 2. Seed data TT200/2014/TT-BTC đầy đủ
-- Sử dụng ON CONFLICT DO UPDATE để an toàn khi tái chạy
-- ========================

-- Helper: upsert theo account_code
-- LOẠI 1: TÀI SẢN (ASSET)
INSERT INTO chart_of_accounts (account_code, account_name, account_type, parent_account_id, active, account_level, account_nature) VALUES
('111',  'Tiền mặt',                              'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('1111', 'Tiền Việt Nam',                          'ASSET',            NULL, true, 2, 'DEBIT_NORMAL'),
('1112', 'Ngoại tệ',                               'ASSET',            NULL, true, 2, 'DEBIT_NORMAL'),
('112',  'Tiền gửi Ngân hàng',                    'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('1121', 'Tiền gửi VNĐ',                           'ASSET',            NULL, true, 2, 'DEBIT_NORMAL'),
('1122', 'Tiền gửi ngoại tệ',                     'ASSET',            NULL, true, 2, 'DEBIT_NORMAL'),
('113',  'Tiền đang chuyển',                       'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('128',  'Đầu tư nắm giữ đến ngày đáo hạn',      'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('131',  'Phải thu của khách hàng',                'ASSET',            NULL, true, 1, 'DUAL_NATURE'),
('133',  'Thuế GTGT được khấu trừ',               'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('1331', 'Thuế GTGT được KT của HHDV',            'ASSET',            NULL, true, 2, 'DEBIT_NORMAL'),
('1332', 'Thuế GTGT được KT của TSCĐ',            'ASSET',            NULL, true, 2, 'DEBIT_NORMAL'),
('136',  'Phải thu nội bộ',                        'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('138',  'Phải thu khác',                          'ASSET',            NULL, true, 1, 'DUAL_NATURE'),
('1381', 'Tài sản thiếu chờ xử lý',               'ASSET',            NULL, true, 2, 'DEBIT_NORMAL'),
('1388', 'Phải thu khác (chi tiết)',               'ASSET',            NULL, true, 2, 'DUAL_NATURE'),
('141',  'Tạm ứng',                                'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('151',  'Hàng mua đang đi trên đường',            'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('152',  'Nguyên liệu, vật liệu',                 'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('153',  'Công cụ, dụng cụ',                      'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('154',  'Chi phí SXKD dở dang',                  'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('155',  'Thành phẩm',                             'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('156',  'Hàng hóa',                               'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('1561', 'Giá mua hàng hóa',                      'ASSET',            NULL, true, 2, 'DEBIT_NORMAL'),
('1562', 'Chi phí thu mua hàng hóa',              'ASSET',            NULL, true, 2, 'DEBIT_NORMAL'),
('157',  'Hàng gửi đi bán',                       'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('211',  'Tài sản cố định hữu hình',              'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('213',  'Tài sản cố định vô hình',               'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('214',  'Hao mòn tài sản cố định',               'LIABILITY',        NULL, true, 1, 'CREDIT_NORMAL'),
('217',  'Bất động sản đầu tư',                   'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('221',  'Đầu tư vào công ty con',                'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('228',  'Đầu tư khác',                            'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('242',  'Chi phí trả trước',                     'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
('244',  'Cầm cố, thế chấp, ký quỹ, ký cược',    'ASSET',            NULL, true, 1, 'DEBIT_NORMAL'),
-- LOẠI 3: NỢ PHẢI TRẢ (LIABILITY)
('311',  'Vay ngắn hạn',                           'LIABILITY',        NULL, true, 1, 'CREDIT_NORMAL'),
('315',  'Nợ dài hạn đến hạn trả',               'LIABILITY',        NULL, true, 1, 'CREDIT_NORMAL'),
('331',  'Phải trả cho người bán',                'LIABILITY',        NULL, true, 1, 'DUAL_NATURE'),
('333',  'Thuế và các khoản phải nộp NN',        'LIABILITY',        NULL, true, 1, 'CREDIT_NORMAL'),
('3331', 'Thuế GTGT phải nộp',                    'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('33311','Thuế GTGT đầu ra',                       'LIABILITY',        NULL, true, 3, 'CREDIT_NORMAL'),
('33312','Thuế GTGT hàng nhập khẩu',              'LIABILITY',        NULL, true, 3, 'CREDIT_NORMAL'),
('3332', 'Thuế TTĐB',                              'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3333', 'Thuế xuất, nhập khẩu',                  'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3334', 'Thuế TNDN phải nộp',                    'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3335', 'Thuế TNCN',                              'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3336', 'Thuế tài nguyên',                        'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3337', 'Thuế nhà đất, tiền thuê đất',           'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3338', 'Các loại thuế khác',                    'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3339', 'Phí, lệ phí và các khoản phải nộp khác','LIABILITY',       NULL, true, 2, 'CREDIT_NORMAL'),
('334',  'Phải trả người lao động',               'LIABILITY',        NULL, true, 1, 'CREDIT_NORMAL'),
('3341', 'Phải trả công nhân viên',               'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3348', 'Phải trả người lao động khác',          'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('335',  'Chi phí phải trả',                      'LIABILITY',        NULL, true, 1, 'CREDIT_NORMAL'),
('336',  'Phải trả nội bộ',                       'LIABILITY',        NULL, true, 1, 'CREDIT_NORMAL'),
('338',  'Phải trả, phải nộp khác',               'LIABILITY',        NULL, true, 1, 'CREDIT_NORMAL'),
('3381', 'Tài sản thừa chờ giải quyết',           'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3382', 'Kinh phí công đoàn',                    'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3383', 'Bảo hiểm xã hội',                       'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3384', 'Bảo hiểm y tế',                         'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3385', 'Phải trả về cổ phần hóa',               'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3386', 'Nhận ký quỹ, ký cược ngắn hạn',         'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3387', 'Doanh thu chưa thực hiện',              'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3388', 'Phải trả, phải nộp khác (chi tiết)',    'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('341',  'Vay và nợ thuê tài chính dài hạn',     'LIABILITY',        NULL, true, 1, 'CREDIT_NORMAL'),
('3411', 'Vay dài hạn',                            'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
('3412', 'Nợ thuê tài chính',                     'LIABILITY',        NULL, true, 2, 'CREDIT_NORMAL'),
-- LOẠI 4: VỐN CHỦ SỞ HỮU (EQUITY)
('411',  'Vốn đầu tư của chủ sở hữu',            'EQUITY',           NULL, true, 1, 'CREDIT_NORMAL'),
('4111', 'Vốn góp của chủ sở hữu',               'EQUITY',           NULL, true, 2, 'CREDIT_NORMAL'),
('4118', 'Vốn khác',                               'EQUITY',           NULL, true, 2, 'CREDIT_NORMAL'),
('412',  'Chênh lệch đánh giá lại tài sản',      'EQUITY',           NULL, true, 1, 'DUAL_NATURE'),
('413',  'Chênh lệch tỷ giá hối đoái',           'EQUITY',           NULL, true, 1, 'DUAL_NATURE'),
('414',  'Quỹ đầu tư phát triển',                'EQUITY',           NULL, true, 1, 'CREDIT_NORMAL'),
('418',  'Các quỹ khác thuộc vốn chủ sở hữu',   'EQUITY',           NULL, true, 1, 'CREDIT_NORMAL'),
('419',  'Cổ phiếu quỹ',                          'EQUITY',           NULL, true, 1, 'DEBIT_NORMAL'),
('421',  'Lợi nhuận sau thuế chưa phân phối',    'EQUITY',           NULL, true, 1, 'DUAL_NATURE'),
('4211', 'LNST chưa PP năm trước',                'EQUITY',           NULL, true, 2, 'DUAL_NATURE'),
('4212', 'LNST chưa PP năm nay',                  'EQUITY',           NULL, true, 2, 'DUAL_NATURE'),
-- LOẠI 5: DOANH THU (REVENUE)
('511',  'Doanh thu bán hàng và CCDV',            'REVENUE',          NULL, true, 1, 'CREDIT_NORMAL'),
('5111', 'DT bán hàng hóa',                       'REVENUE',          NULL, true, 2, 'CREDIT_NORMAL'),
('5112', 'DT bán thành phẩm',                     'REVENUE',          NULL, true, 2, 'CREDIT_NORMAL'),
('5113', 'DT cung cấp dịch vụ',                   'REVENUE',          NULL, true, 2, 'CREDIT_NORMAL'),
('5114', 'DT trợ cấp, trợ giá',                   'REVENUE',          NULL, true, 2, 'CREDIT_NORMAL'),
('515',  'Doanh thu hoạt động tài chính',         'REVENUE',          NULL, true, 1, 'CREDIT_NORMAL'),
('521',  'Các khoản giảm trừ doanh thu',          'REVENUE',          NULL, true, 1, 'DEBIT_NORMAL'),
('5211', 'Chiết khấu thương mại',                 'REVENUE',          NULL, true, 2, 'DEBIT_NORMAL'),
('5212', 'Hàng bán bị trả lại',                   'REVENUE',          NULL, true, 2, 'DEBIT_NORMAL'),
('5213', 'Giảm giá hàng bán',                     'REVENUE',          NULL, true, 2, 'DEBIT_NORMAL'),
-- LOẠI 6: CHI PHÍ SẢN XUẤT KINH DOANH (EXPENSE)
('611',  'Mua hàng',                               'EXPENSE',          NULL, true, 1, 'DEBIT_NORMAL'),
('621',  'Chi phí NVL trực tiếp',                 'EXPENSE',          NULL, true, 1, 'DEBIT_NORMAL'),
('622',  'Chi phí NC trực tiếp',                  'EXPENSE',          NULL, true, 1, 'DEBIT_NORMAL'),
('623',  'Chi phí sử dụng máy thi công',          'EXPENSE',          NULL, true, 1, 'DEBIT_NORMAL'),
('627',  'Chi phí SX chung',                      'EXPENSE',          NULL, true, 1, 'DEBIT_NORMAL'),
('6271', 'Chi phí nhân viên phân xưởng',          'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6272', 'Chi phí vật liệu',                      'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6273', 'Chi phí dụng cụ sản xuất',              'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6274', 'Chi phí khấu hao TSCĐ',                 'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6277', 'Chi phí dịch vụ mua ngoài',             'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6278', 'Chi phí bằng tiền khác',                'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('632',  'Giá vốn hàng bán',                      'COST_OF_GOODS_SOLD', NULL, true, 1, 'DEBIT_NORMAL'),
('635',  'Chi phí tài chính',                     'EXPENSE',          NULL, true, 1, 'DEBIT_NORMAL'),
('641',  'Chi phí bán hàng',                      'EXPENSE',          NULL, true, 1, 'DEBIT_NORMAL'),
('6411', 'Chi phí nhân viên bán hàng',            'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6412', 'Chi phí vật liệu bao bì',               'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6413', 'Chi phí dụng cụ đồ dùng',               'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6414', 'Chi phí khấu hao TSCĐ (BH)',            'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6415', 'Chi phí bảo hành',                      'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6417', 'Chi phí dịch vụ mua ngoài (BH)',        'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6418', 'Chi phí bằng tiền khác (BH)',           'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('642',  'Chi phí quản lý doanh nghiệp',          'EXPENSE',          NULL, true, 1, 'DEBIT_NORMAL'),
('6421', 'Chi phí nhân viên QLDN',                'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6422', 'Chi phí vật liệu QLDN',                 'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6423', 'Chi phí đồ dùng văn phòng',             'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6424', 'Chi phí khấu hao TSCĐ (QLDN)',          'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6425', 'Thuế, phí và lệ phí (QLDN)',            'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6426', 'Chi phí dự phòng (QLDN)',               'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6427', 'Chi phí dịch vụ mua ngoài (QLDN)',      'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('6428', 'Chi phí bằng tiền khác (QLDN)',         'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
-- LOẠI 7: THU NHẬP KHÁC (REVENUE)
('711',  'Thu nhập khác',                          'REVENUE',          NULL, true, 1, 'CREDIT_NORMAL'),
-- LOẠI 8: CHI PHÍ KHÁC (EXPENSE)
('811',  'Chi phí khác',                           'EXPENSE',          NULL, true, 1, 'DEBIT_NORMAL'),
('821',  'Chi phí thuế TNDN',                     'EXPENSE',          NULL, true, 1, 'DEBIT_NORMAL'),
('8211', 'Chi phí thuế TNDN hiện hành',           'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
('8212', 'Chi phí thuế TNDN hoãn lại',            'EXPENSE',          NULL, true, 2, 'DEBIT_NORMAL'),
-- LOẠI 9: XÁC ĐỊNH KQKD (EQUITY)
('911',  'Xác định kết quả KD',                   'EQUITY',           NULL, true, 1, 'DUAL_NATURE')
ON CONFLICT (account_code) DO UPDATE
    SET account_name    = EXCLUDED.account_name,
        account_type    = EXCLUDED.account_type,
        account_level   = EXCLUDED.account_level,
        account_nature  = EXCLUDED.account_nature;

-- ========================
-- 3. Cập nhật parent_account_id dựa theo account_code cha
-- ========================

-- Cập nhật parent cho TK cấp 2 → cấp 1
UPDATE chart_of_accounts child
SET parent_account_id = (
    SELECT parent.id FROM chart_of_accounts parent
    WHERE parent.account_code = LEFT(child.account_code, 3)
      AND parent.id != child.id
)
WHERE LENGTH(child.account_code) = 4
  AND parent_account_id IS NULL;

-- Cập nhật parent cho TK cấp 3 → cấp 2
UPDATE chart_of_accounts child
SET parent_account_id = (
    SELECT parent.id FROM chart_of_accounts parent
    WHERE parent.account_code = LEFT(child.account_code, 4)
      AND parent.id != child.id
)
WHERE LENGTH(child.account_code) = 5
  AND parent_account_id IS NULL;

-- ========================
-- 4. Cập nhật account_level cho các tài khoản đã tồn tại nhưng thiếu level
-- ========================
UPDATE chart_of_accounts SET account_level = 1 WHERE LENGTH(account_code) = 3 AND account_level = 0;
UPDATE chart_of_accounts SET account_level = 2 WHERE LENGTH(account_code) = 4 AND account_level = 0;
UPDATE chart_of_accounts SET account_level = 3 WHERE LENGTH(account_code) >= 5 AND account_level = 0;

-- ========================
-- 5. Index cho tìm kiếm theo account_code prefix (dùng cho LIKE 'xxx%')
-- ========================
CREATE INDEX IF NOT EXISTS idx_coa_account_code_text ON chart_of_accounts(account_code varchar_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_coa_account_nature ON chart_of_accounts(account_nature);
CREATE INDEX IF NOT EXISTS idx_coa_account_level ON chart_of_accounts(account_level);
CREATE INDEX IF NOT EXISTS idx_coa_active ON chart_of_accounts(active);

-- ========================
-- 6. Permissions cho module báo cáo
-- ========================
INSERT INTO permissions (code, module, action) VALUES
    ('REPORTS_VIEW',   'REPORTS', 'VIEW'),
    ('REPORTS_EXPORT', 'REPORTS', 'EXPORT')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code IN ('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'ACCOUNTANT')
  AND p.code IN ('REPORTS_VIEW', 'REPORTS_EXPORT')
ON CONFLICT DO NOTHING;
