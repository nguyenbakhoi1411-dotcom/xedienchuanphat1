const defaultNumbers = " không một hai ba bốn năm sáu bảy tám chín";
const chuSo = defaultNumbers.split(" ");
const tien = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];

function docBlock(so: number, dayDu: boolean): string {
  let chuoi = "";
  const tram = Math.floor(so / 100);
  so = so % 100;
  
  if (dayDu || tram > 0) {
    chuoi = " " + chuSo[tram] + " trăm";
    chuoi += docHangChuc(so, true);
  } else {
    chuoi = docHangChuc(so, false);
  }
  return chuoi;
}

function docHangChuc(so: number, dayDu: boolean): string {
  let chuoi = "";
  const chuc = Math.floor(so / 10);
  const donVi = so % 10;
  
  if (chuc > 1) {
    chuoi = " " + chuSo[chuc] + " mươi";
    if (donVi === 1) {
      chuoi += " mốt";
    }
  } else if (chuc === 1) {
    chuoi = " mười";
    if (donVi === 1) {
      chuoi += " một";
    }
  } else if (dayDu && donVi > 0) {
    chuoi = " lẻ";
  }
  
  if (donVi === 5 && chuc >= 1) {
    chuoi += " lăm";
  } else if (donVi > 1 || (donVi === 1 && chuc === 0)) {
    chuoi += " " + chuSo[donVi];
  }
  
  return chuoi;
}

export function soTienBangChu(so: number): string {
  if (so === 0) return "Không đồng";
  
  let chuoi = "";
  let hauto = "";
  
  // Xử lý số âm
  if (so < 0) {
    chuoi = "Âm";
    so = Math.abs(so);
  }

  const strSo = so.toString();
  // Giới hạn max 999 nghìn tỷ tỷ
  if (strSo.length > 24) return "Số quá lớn";

  let soChinh = so;
  let tiengTien = 0;
  let dayDu = false;
  
  do {
    const ty = soChinh % 1000000000;
    soChinh = Math.floor(soChinh / 1000000000);
    
    if (soChinh > 0) {
      chuoi = docTriệu(ty, true) + tien[tiengTien] + chuoi;
    } else {
      chuoi = docTriệu(ty, false) + tien[tiengTien] + chuoi;
    }
    tiengTien += 3;
  } while (soChinh > 0);

  chuoi = chuoi.trim();
  
  // Viết hoa chữ đầu tiên
  if (chuoi.length > 0) {
    chuoi = chuoi.charAt(0).toUpperCase() + chuoi.slice(1);
  }
  
  return chuoi + " đồng chẵn";
}

function docTriệu(so: number, dayDu: boolean): string {
  let chuoi = "";
  const trieu = Math.floor(so / 1000000);
  so = so % 1000000;
  
  if (trieu > 0) {
    chuoi = docBlock(trieu, dayDu) + " triệu";
    dayDu = true;
  }
  
  const nghin = Math.floor(so / 1000);
  so = so % 1000;
  
  if (nghin > 0) {
    chuoi += docBlock(nghin, dayDu) + " nghìn";
    dayDu = true;
  } else if (dayDu && so > 0) {
    chuoi += docBlock(nghin, dayDu) + " nghìn";
  }
  
  if (so > 0) {
    chuoi += docBlock(so, dayDu);
  }
  
  return chuoi;
}
