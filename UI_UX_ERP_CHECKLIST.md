# UI/UX ERP Checklist - Chuan Phat

## Diem UI hien tai can sua

- Mot so chuoi hien thi bi loi encoding, can chuan hoa lai toan bo text tieng Viet.
- Style input, select, badge, table va pagination con lap lai theo tung feature.
- Nhieu bang da co search/filter/pagination/loading/empty state, nhung thieu column visibility va action menu chuan.
- Form da co validate bang schema, nhung can ap dung dong nhat required marker, section, dirty-close confirm va error message duoi field cho tat ca form.
- POS can uu tien thao tac nhanh, focus keyboard, tim san pham/serial va vung tong tien ro rang.
- Permission matrix can hien so quyen dang bat theo module, co reset va bo chon nhanh.
- Toast loi can uu tien ngon ngu nghiep vu, tranh tra ve loi ky thuat tu API.

## Design system

- Mau chinh cam/trang, nen sang sach, border nhe.
- Dung `erp-input`, `erp-table`, `erp-card`, `erp-section`, `erp-badge` cho UI chung.
- Button dung `Button` component, ho tro `primary`, `secondary`, `ghost`, `danger`.
- Badge trang thai dung `Badge` component, tone gioi han: orange, green, blue, slate, amber, red.
- Focus state phai ro bang ring cam; moi control co keyboard focus.

## Layout

- Sidebar co active state ro, icon + label de quet nhanh.
- Header co breadcrumb, global search, notification va user menu.
- Page dau trang gom title, mo ta ngan va action/filter chinh.
- Desktop/tablet can giu spacing 16-24px, table scroll ngang khi cot nhieu.

## Table

- Search theo keyword.
- Filter theo trang thai/module/branch/date neu co.
- Sort cho cac cot quan trong khi API ho tro.
- Pagination ro: trang hien tai, tong so ban ghi, next/prev disabled dung.
- Empty state co mo ta va action neu phu hop.
- Loading skeleton khong gay shift layout.
- Row action nen gom icon button hoac menu ba cham neu qua 2 hanh dong.
- Badge trang thai dung mau co y nghia, khong qua ruc.
- Column visibility nen them cho bang nhieu cot nhu san pham, khach hang, kho, bao cao.

## Form

- Chia section theo ngu canh nghiep vu.
- Field bat buoc co marker `*`.
- Error message nam ngay duoi field.
- Submit disabled khi loading.
- Khi co dirty data, dong modal/form phai confirm.
- Placeholder chi dung de goi y, khong thay the label.

## Dashboard

- KPI card it mau, nhan manh so lieu va xu huong.
- Chart dung mau nhat quan, de doc tren nen trang.
- Filter nhanh nam tren cung, co nut lam moi.
- Khi API fail co empty state va nut tai lai.
- Khi chua co du lieu, khong hien chart trong.

## POS

- Search san pham/ma SKU/serial la control dau tien.
- Card san pham co ton kho va gia ban ro.
- Serial xe hien trong selector rieng va bao loi neu chua chon du.
- Gio hang can hien khach hang, so mat hang, tam tinh.
- Thanh toan can nhom voucher, giam gia, phuong thuc, tong tien, con lai.
- Nut tao hoa don, bao gia, in phai ro trang thai disabled.

## Permission Matrix

- Group theo module.
- Co checkbox chon tat ca theo module.
- Hien so quyen dang bat tren tung module.
- Co reset ve quyen goc va bo chon tat ca.
- Checkbox du lon de thao tac bang chuot va keyboard.

## UX Error

- Loi API hien toast bang ngon ngu nguoi dung.
- Khong hien stack trace, exception class, payload ky thuat.
- Man hinh fetch fail can co retry button.
- Action nguy hiem can confirm.

## Accessibility

- Font size toi thieu 14-15px cho noi dung chinh.
- Contrast text/nen dat muc doc duoc tren nen sang.
- Moi input/button/select co focus state.
- Icon button co `aria-label` va `title` khi can.
- Table action va pagination thao tac duoc bang keyboard.
