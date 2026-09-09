const fs = require('fs');
const path = require('path');

const replacements = [
  { match: /Khong co chung tu/g, replace: "Không có chứng từ" },
  { match: /Tao phieu moi hoac thay doi bo loc/g, replace: "Tạo phiếu mới hoặc thay đổi bộ lọc" },
  { match: /Chua co nha cung cap/g, replace: "Chưa có nhà cung cấp" },
  { match: /Khong co du lieu ton kho/g, replace: "Không có dữ liệu tồn kho" },
  { match: /Dang tai du lieu/g, replace: "Đang tải dữ liệu" },
  { match: /TEN TAI KHOAN/g, replace: "TÊN TÀI KHOẢN" },
  { match: /"NO"/g, replace: '"NỢ"' },
  { match: /"CO"/g, replace: '"CÓ"' },
  { match: /'NO'/g, replace: "'NỢ'" },
  { match: /'CO'/g, replace: "'CÓ'" },
  { match: /SO DU/g, replace: "SỐ DƯ" },
  { match: /DOI TUONG/g, replace: "ĐỐI TƯỢNG" },
  { match: /TONG/g, replace: "TỔNG" },
  { match: /Bao gia/g, replace: "Báo giá" },
  { match: /Don hang/g, replace: "Đơn hàng" },
  { match: /Thanh toan/g, replace: "Thanh toán" },
  { match: /Hoa don/g, replace: "Hóa đơn" },
  { match: /Doi tra/g, replace: "Đổi trả" },
  { match: /Dat Coc/g, replace: "Đặt cọc" },
  { match: /Xac nhan/g, replace: "Xác nhận" },
  { match: /Giao hang/g, replace: "Giao hàng" },
  { match: /Release qua han/g, replace: "Quá hạn" },
  { match: /Trial Balance/g, replace: "Bảng cân đối số phát sinh" },
  { match: /Balance Sheet co ban/g, replace: "Bảng cân đối kế toán" },
  { match: /Income Statement co ban/g, replace: "Báo cáo kết quả kinh doanh" },
  { match: /Customer\/Supplier Debt Aging/g, replace: "Phân tích tuổi nợ" }
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let updatedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  replacements.forEach(r => {
    newContent = newContent.replace(r.match, r.replace);
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated: ' + file);
    updatedFiles++;
  }
});

console.log('Total files updated: ' + updatedFiles);
