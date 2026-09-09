export type ReportItem = {
  id: string;
  name: string;
  href?: string;
};

export type ReportGroup = {
  id: string;
  name: string;
  items: ReportItem[];
};

export type ReportCategory = {
  id: string;
  name: string;
  groups?: ReportGroup[];
  items?: ReportItem[];
};

export const REPORT_CATALOG: ReportCategory[] = [
  {
    id: "bao-cao-tai-chinh",
    name: "Báo cáo tài chính",
    items: [
      { id: "b09-dnn", name: "B09-DNN: Thuyết minh báo cáo tài chính" },
      { id: "f01-dnn", name: "F01-DNN: Bảng cân đối tài khoản", href: "/reports/financial?type=trial-balance" },
      { id: "f01-dnn-quantri", name: "Bảng cân đối tài khoản (Mẫu quản trị)" },
      { id: "nghia-vu-nha-nuoc", name: "Tình hình thực hiện nghĩa vụ với nhà nước" },
      { id: "b01b-dnn", name: "B01b-DNN: Báo cáo tình hình tài chính" },
      { id: "b02-dnn", name: "B02-DNN: Báo cáo kết quả hoạt động kinh doanh", href: "/reports/financial?type=income-statement" },
      { id: "b01a-dnn", name: "B01a-DNN: Báo cáo tình hình tài chính", href: "/reports/financial?type=balance-sheet" },
      { id: "b03-dnn-tt", name: "B03-DNN: Báo cáo lưu chuyển tiền tệ (PP trực tiếp)", href: "/reports/financial?type=cash-flow" },
      { id: "b03-dnn-gt", name: "B03-DNN-GT: Báo cáo lưu chuyển tiền tệ (PP gián tiếp)" },
    ],
  },
  {
    id: "bao-cao-phan-tich",
    name: "Báo cáo phân tích",
    items: [
      { id: "pt-tai-chinh", name: "Phân tích tài chính" },
      { id: "pt-doanh-thu", name: "Phân tích doanh thu" },
      { id: "pt-chi-phi", name: "Phân tích chi phí" },
      { id: "pt-dong-tien", name: "Phân tích dòng tiền" },
    ],
  },
  {
    id: "tien-mat",
    name: "Tiền mặt",
    items: [
      { id: "s03a1-dnn", name: "S03a1-DNN: Sổ nhật ký thu tiền" },
      { id: "bang-ke-so-du-ngay", name: "Bảng kê số dư tiền theo ngày" },
      { id: "so-chi-tiet-quy-tien-mat", name: "Sổ kế toán chi tiết quỹ tiền mặt" },
      { id: "dong-tien", name: "Dòng tiền" },
      { id: "s03a2-dnn", name: "S03a2-DNN: Sổ nhật ký chi tiền" },
    ],
  },
  {
    id: "tien-gui",
    name: "Tiền gửi",
    groups: [
      {
        id: "tg-1",
        name: "Báo cáo tiền gửi",
        items: [
          { id: "tg-bang-ke-so-du-ngay", name: "Bảng kê số dư tiền theo ngày" },
          { id: "tg-so-tien-gui", name: "Sổ tiền gửi ngân hàng" },
          { id: "tg-bang-ke-so-du", name: "Bảng kê số dư ngân hàng" },
          { id: "tg-s03a1", name: "S03a1-DNN: Sổ nhật ký thu tiền" },
          { id: "tg-s03a2", name: "S03a2-DNN: Sổ nhật ký chi tiền" },
          { id: "tg-so-chuyen-tien", name: "Sổ chi tiết chuyển tiền nội bộ" },
        ],
      },
      {
        id: "tg-2",
        name: "Báo cáo khế ước đi vay",
        items: [
          { id: "vay-tong-hop", name: "Báo cáo tổng hợp tình hình khế ước vay" },
          { id: "vay-chung-tu", name: "Bảng kê chứng từ theo khế ước vay" },
          { id: "vay-s15", name: "S15-DNN: Sổ chi tiết tiền vay" },
          { id: "vay-lich-tra", name: "Tổng hợp lịch trả nợ khế ước vay" },
        ],
      },
      {
        id: "tg-3",
        name: "Báo cáo khế ước cho vay",
        items: [
          { id: "chovay-tong-hop", name: "Báo cáo tổng hợp tình hình khế ước cho vay" },
          { id: "chovay-chung-tu", name: "Bảng kê chứng từ theo khế ước cho vay" },
        ],
      },
    ],
  },
  {
    id: "mua-hang",
    name: "Mua hàng",
    groups: [
      {
        id: "mh-1",
        name: "Báo cáo mua hàng theo nhà cung cấp, mặt hàng",
        items: [
          { id: "mh-so-chi-tiet", name: "Sổ chi tiết mua hàng" },
          { id: "mh-so-chi-tiet-quy-cach", name: "Sổ chi tiết mua hàng theo mã quy cách" },
          { id: "mh-tong-hop-mat-hang-ncc", name: "Tổng hợp mua hàng theo mặt hàng và nhà cung cấp" },
          { id: "mh-so-nhat-ky", name: "Sổ nhật ký mua hàng" },
          { id: "mh-tong-hop-mat-hang", name: "Tổng hợp mua hàng theo mặt hàng" },
          { id: "mh-tong-hop-ncc", name: "Tổng hợp mua hàng theo nhà cung cấp" },
        ],
      },
      {
        id: "mh-2",
        name: "Báo cáo công nợ nhà cung cấp",
        items: [
          { id: "mh-cn-tong-hop", name: "Tổng hợp công nợ phải trả nhà cung cấp" },
          { id: "mh-cn-hoa-don", name: "Chi tiết công nợ phải trả theo hóa đơn" },
          { id: "mh-cn-chi-tiet-ncc", name: "Chi tiết công nợ phải trả nhà cung cấp" },
          { id: "mh-cn-bien-ban", name: "Biên bản đối chiếu và xác nhận công nợ phải trả" },
          { id: "mh-cn-thong-bao", name: "Thông báo công nợ với nhà cung cấp" },
          { id: "mh-cn-mat-hang", name: "Chi tiết công nợ phải trả theo mặt hàng" },
          { id: "mh-cn-mat-hang-tinh", name: "Chi tiết công nợ phải trả theo mặt hàng (tính)" },
          { id: "mh-cn-phan-tich-tuoi", name: "Phân tích công nợ phải trả theo tuổi nợ", href: "/reports/financial?type=debt-aging-supplier" },
          { id: "mh-cn-chi-tiet-tuoi", name: "Chi tiết công nợ phải trả theo tuổi nợ" },
        ],
      },
      {
        id: "mh-3",
        name: "Báo cáo theo nhân viên mua hàng",
        items: [
          { id: "mh-nv-tong-hop-mh", name: "Tổng hợp mua hàng theo mặt hàng và nhân viên" },
          { id: "mh-nv-chi-tiet-cn", name: "Chi tiết công nợ phải trả theo nhân viên" },
          { id: "mh-nv-tong-hop-cn", name: "Tổng hợp công nợ phải trả theo nhân viên" },
        ],
      },
      {
        id: "mh-4",
        name: "Báo cáo đơn mua hàng",
        items: [
          { id: "mh-don-thuc-hien", name: "Tình hình thực hiện đơn mua hàng" },
          { id: "mh-don-quy-cach", name: "Tình hình thực hiện đơn mua hàng theo mã quy cách" },
          { id: "mh-don-cn-tong", name: "Tổng hợp công nợ phải trả theo đơn mua hàng" },
          { id: "mh-don-cn-chi-tiet", name: "Chi tiết công nợ phải trả theo đơn mua hàng" },
        ],
      },
      {
        id: "mh-5",
        name: "Báo cáo hợp đồng mua",
        items: [
          { id: "mh-hd-tong", name: "Tổng hợp công nợ phải trả theo hợp đồng mua" },
          { id: "mh-hd-chi-tiet", name: "Chi tiết công nợ phải trả theo hợp đồng mua" },
          { id: "mh-hd-thuc-hien", name: "Tình hình thực hiện hợp đồng mua" },
        ],
      },
      {
        id: "mh-6",
        name: "Báo cáo theo công trình",
        items: [
          { id: "mh-ct-tong-mh", name: "Tổng hợp mua hàng theo nhà cung cấp và công trình" },
          { id: "mh-ct-tong-cn", name: "Tổng hợp công nợ phải trả theo công trình" },
          { id: "mh-ct-chi-tiet-cn", name: "Chi tiết công nợ phải trả theo công trình" },
        ],
      },
      {
        id: "mh-7",
        name: "Báo cáo đối chiếu",
        items: [
          { id: "mh-dc-chung-tu", name: "Đối chiếu chứng từ công nợ phải trả và chứng từ thanh toán" },
          { id: "mh-dc-chi-phi", name: "Đối chiếu chi phí mua hàng trên chứng từ mua hàng và chứng từ chi phí" },
        ],
      },
    ],
  },
  {
    id: "ban-hang",
    name: "Bán hàng",
    groups: [
      {
        id: "bh-1",
        name: "Báo cáo bán hàng theo khách hàng, mặt hàng",
        items: [
          { id: "bh-s16", name: "S16-DNN: Sổ chi tiết bán hàng" },
          { id: "bh-so-chi-tiet", name: "Sổ chi tiết bán hàng" },
          { id: "bh-tong-mat-hang", name: "Tổng hợp bán hàng theo mặt hàng" },
          { id: "bh-tong-mat-hang-kh", name: "Tổng hợp bán hàng theo mặt hàng và khách hàng" },
          { id: "bh-tong-ma-thong-ke", name: "Tổng hợp bán hàng theo mã thống kê và mặt hàng" },
          { id: "bh-tong-tmdt", name: "Tổng hợp bán hàng theo sàn thương mại điện tử" },
          { id: "bh-so-nhat-ky", name: "Sổ nhật ký bán hàng" },
          { id: "bh-tong-dia-phuong", name: "Tổng hợp bán hàng theo địa phương" },
          { id: "bh-chi-tiet-quy-cach", name: "Sổ chi tiết bán hàng theo mã quy cách" },
          { id: "bh-tong-khach-hang", name: "Tổng hợp bán hàng theo khách hàng" },
          { id: "bh-so-sanh-kh", name: "Báo cáo so sánh số lượng bán, doanh số bán theo thời gian (Khách hàng và mặt hàng)" },
          { id: "bh-tong-nhom-kh", name: "Tổng hợp bán hàng theo nhóm khách hàng" },
          { id: "bh-phan-tich-dt", name: "Phân tích chi tiết doanh thu sản phẩm/nhóm sản phẩm theo thời gian" },
          { id: "bh-tong-xuat-kho", name: "Tổng hợp xuất kho bán hàng" },
          { id: "bh-so-sanh-nv", name: "Báo cáo so sánh số lượng bán, doanh số bán theo thời gian (Nhân viên và mặt hàng)" },
          { id: "bh-tong-nhom-mh", name: "Tổng hợp bán hàng theo nhóm mặt hàng" },
          { id: "bh-bao-hanh", name: "Sổ chi tiết theo dõi tình trạng bảo hành" },
        ],
      },
      {
        id: "bh-2",
        name: "Báo cáo công nợ khách hàng",
        items: [
          { id: "bh-cn-tong", name: "Tổng hợp công nợ phải thu khách hàng" },
          { id: "bh-cn-tong-nhom", name: "Tổng hợp công nợ phải thu theo nhóm khách hàng" },
          { id: "bh-cn-bien-ban", name: "Biên bản đối chiếu và xác nhận công nợ" },
          { id: "bh-cn-chi-tiet", name: "Chi tiết công nợ phải thu khách hàng" },
          { id: "bh-cn-thong-bao-1", name: "Thông báo công nợ" },
          { id: "bh-cn-thong-bao-2", name: "Thông báo công nợ (Mẫu 2)" },
          { id: "bh-cn-ngay-thanh-toan", name: "Báo cáo ngày thanh toán theo khách hàng" },
          { id: "bh-cn-hoa-don", name: "Chi tiết công nợ phải thu theo hóa đơn" },
          { id: "bh-cn-phan-tich-tuoi", name: "Phân tích công nợ phải thu theo tuổi nợ", href: "/reports/financial?type=debt-aging-customer" },
          { id: "bh-cn-mat-hang-tinh", name: "Chi tiết công nợ phải thu theo mặt hàng (tính)" },
          { id: "bh-cn-mat-hang", name: "Chi tiết công nợ phải thu theo mặt hàng" },
          { id: "bh-cn-tong-giam-tru", name: "Tổng hợp công nợ phải thu (chi tiết theo các khoản giảm trừ)" },
          { id: "bh-cn-chi-tiet-giam-tru", name: "Chi tiết công nợ phải thu (chi tiết theo các khoản giảm trừ)" },
          { id: "bh-cn-tong-thanh-toan", name: "Tổng hợp thanh toán công nợ khách hàng" },
          { id: "bh-cn-chi-tiet-tuoi", name: "Chi tiết công nợ phải thu theo tuổi nợ" },
          { id: "bh-cn-giay-de-nghi", name: "Giấy đề nghị thanh toán công nợ" },
        ],
      },
      {
        id: "bh-3",
        name: "Báo cáo theo nhân viên bán hàng",
        items: [
          { id: "bh-nv-tong-nv-kh", name: "Tổng hợp bán hàng theo nhân viên và khách hàng" },
          { id: "bh-nv-chi-tiet", name: "Sổ chi tiết bán hàng theo nhân viên" },
          { id: "bh-nv-tong-cn", name: "Tổng hợp công nợ phải thu theo nhân viên" },
          { id: "bh-nv-tong", name: "Tổng hợp bán hàng theo nhân viên" },
          { id: "bh-nv-cn-chi-tiet", name: "Chi tiết công nợ phải thu theo nhân viên" },
          { id: "bh-nv-tong-mh", name: "Tổng hợp bán hàng theo mặt hàng và nhân viên" },
          { id: "bh-nv-cn-tong-kh", name: "Tổng hợp công nợ phải thu theo nhân viên và khách hàng" },
          { id: "bh-nv-tong-nv-kh-mh", name: "Tổng hợp bán hàng theo nhân viên, khách hàng và mặt hàng" },
          { id: "bh-nv-thanh-toan", name: "Tổng hợp thanh toán công nợ khách hàng theo nhân viên" },
        ],
      },
      {
        id: "bh-4",
        name: "Báo cáo theo đơn vị kinh doanh",
        items: [
          { id: "bh-dv-tong", name: "Tổng hợp bán hàng theo đơn vị kinh doanh" },
          { id: "bh-dv-cn-tong", name: "Tổng hợp công nợ phải thu khách hàng theo đơn vị kinh doanh" },
          { id: "bh-dv-tong-mh", name: "Tổng hợp bán hàng theo đơn vị kinh doanh và mặt hàng" },
          { id: "bh-dv-cn-chi-tiet", name: "Chi tiết công nợ phải thu khách hàng theo đơn vị kinh doanh" },
        ],
      },
      {
        id: "bh-5",
        name: "Báo cáo theo đơn hàng",
        items: [
          { id: "bh-dh-thuc-hien", name: "Tình hình thực hiện đơn đặt hàng" },
          { id: "bh-dh-cn-tong", name: "Tổng hợp công nợ phải thu theo đơn đặt hàng" },
          { id: "bh-dh-chi-tiet", name: "Báo cáo chi tiết tình hình thực hiện đơn đặt hàng" },
          { id: "bh-dh-cn-chi-tiet", name: "Chi tiết công nợ phải thu theo đơn đặt hàng" },
          { id: "bh-dh-lai-lo-tong", name: "Báo cáo tổng hợp lãi lỗ theo đơn hàng" },
          { id: "bh-dh-thong-ke", name: "Thống kê số lượng tồn kho và số lượng đặt hàng chưa giao" },
          { id: "bh-dh-lai-lo-chi-tiet", name: "Báo cáo chi tiết lãi lỗ theo đơn hàng" },
          { id: "bh-dh-quy-cach", name: "Chi tiết đơn đặt hàng theo mã quy cách" },
        ],
      },
      {
        id: "bh-6",
        name: "Báo cáo hợp đồng",
        items: [
          { id: "bh-hd-thuc-hien", name: "Tình hình thực hiện hợp đồng bán" },
          { id: "bh-hd-thanh-toan", name: "Tình hình thanh toán của hợp đồng (theo đợt thanh toán)" },
          { id: "bh-hd-lai-lo-tong", name: "Báo cáo tổng hợp lãi lỗ theo hợp đồng" },
          { id: "bh-hd-lai-lo-chi-tiet", name: "Báo cáo chi tiết lãi lỗ theo hợp đồng" },
          { id: "bh-hd-doanh-so-dv", name: "Tổng hợp doanh số hợp đồng theo đơn vị" },
          { id: "bh-hd-cn-tong", name: "Tổng hợp công nợ phải thu theo hợp đồng bán" },
          { id: "bh-hd-doanh-so-mh", name: "Tổng hợp doanh số mặt hàng theo hợp đồng bán" },
          { id: "bh-hd-cn-chi-tiet", name: "Chi tiết công nợ phải thu theo hợp đồng bán" },
          { id: "bh-hd-chi-tong", name: "Tổng hợp tình hình chi theo hợp đồng bán" },
          { id: "bh-hd-chi-phi-km", name: "Tổng hợp chi phí hợp đồng bán theo khoản mục chi phí" },
          { id: "bh-hd-so-chi-tiet-km", name: "Số chi tiết tài khoản theo hợp đồng và khoản mục chi phí" },
          { id: "bh-hd-cn-tong-hop", name: "Báo cáo tổng hợp công nợ phải thu - công nợ phải trả theo hợp đồng" },
        ],
      },
      {
        id: "bh-7",
        name: "Báo cáo theo công trình",
        items: [
          { id: "bh-ct-cn-chi-tiet", name: "Chi tiết công nợ phải thu theo công trình" },
          { id: "bh-ct-cn-tong", name: "Tổng hợp công nợ phải thu theo công trình" },
        ],
      },
      {
        id: "bh-8",
        name: "Báo cáo đối chiếu",
        items: [
          { id: "bh-dc-cn-pt", name: "Đối chiếu chứng từ công nợ phải thu và chứng từ thanh toán" },
        ],
      },
    ],
  },
  {
    id: "kho",
    name: "Kho",
    items: [
      { id: "kho-tong-hop", name: "Tổng hợp tồn kho" },
      { id: "kho-the", name: "Thẻ kho" },
      { id: "kho-chi-tiet", name: "Sổ chi tiết vật tư, hàng hóa" },
      { id: "kho-nxt", name: "Bảng kê nhập xuất tồn" },
    ],
  },
  {
    id: "cong-cu-dung-cu",
    name: "Công cụ dụng cụ",
    items: [
      { id: "ccdc-so", name: "Sổ công cụ dụng cụ" },
      { id: "ccdc-phan-bo", name: "Bảng phân bổ công cụ dụng cụ" },
      { id: "ccdc-tang-giam", name: "Tình hình tăng giảm công cụ dụng cụ" },
    ],
  },
  {
    id: "tai-san-co-dinh",
    name: "Tài sản cố định",
    items: [
      { id: "tscd-so", name: "S09-DNN: Sổ tài sản cố định" },
      { id: "tscd-khau-hao", name: "Bảng tính khấu hao tài sản cố định" },
      { id: "tscd-tang-giam", name: "Tình hình tăng giảm tài sản cố định" },
    ],
  },
  {
    id: "tien-luong",
    name: "Tiền lương",
    items: [
      { id: "tl-bang-luong-co-dinh", name: "Bảng tổng hợp thanh toán tiền lương (Bảng lương cố định)" },
      { id: "tl-tong-hop-luong-nv", name: "Báo cáo tổng hợp lương nhân viên" },
      { id: "tl-bang-luong-thoi-gian", name: "Bảng tổng hợp thanh toán tiền lương (Bảng lương thời gian)" },
    ],
  },
  {
    id: "thue",
    name: "Thuế",
    items: [
      { id: "thue-gtgt", name: "Tờ khai thuế GTGT" },
      { id: "thue-ban-ra", name: "Bảng kê hóa đơn, chứng từ hàng hóa, dịch vụ bán ra" },
      { id: "thue-mua-vao", name: "Bảng kê hóa đơn, chứng từ hàng hóa, dịch vụ mua vào" },
      { id: "thue-tndn", name: "Tờ khai thuế TNDN" },
    ],
  },
  {
    id: "gia-thanh",
    name: "Giá thành",
    groups: [
      {
        id: "gt-1",
        name: "Sản xuất liên tục",
        items: [
          { id: "gt-1-s17", name: "S17-DNN: Sổ chi phí sản xuất, kinh doanh theo đối tượng tập hợp chi phí" },
          { id: "gt-1-bang-ke", name: "Bảng kê phiếu nhập, phiếu xuất theo đối tượng tập hợp chi phí" },
          { id: "gt-1-s18-yt", name: "S18-DNN: Thẻ tính giá thành đối tượng tập hợp chi phí - theo yếu tố chi phí" },
          { id: "gt-1-s18-km", name: "S18-DNN: Thẻ tính giá thành đối tượng tập hợp chi phí - theo khoản mục chi phí" },
          { id: "gt-1-tong-chiphi", name: "Bảng tổng hợp chi phí theo đối tượng tập hợp chi phí" },
          { id: "gt-1-tong-sxkd", name: "Tổng hợp chi phí sản xuất kinh doanh theo đối tượng tập hợp chi phí" },
          { id: "gt-1-so-chitiet-km", name: "Số chi tiết tài khoản theo đối tượng tập hợp chi phí và khoản mục chi phí" },
          { id: "gt-1-so-chitiet", name: "Số chi tiết tài khoản theo đối tượng tập hợp chi phí" },
          { id: "gt-1-bang-tinh", name: "Bảng tính giá thành" },
          { id: "gt-1-tong-nx", name: "Tổng hợp nhập xuất kho theo đối tượng tập hợp chi phí" },
        ],
      },
      {
        id: "gt-2",
        name: "Giá thành công trình",
        items: [
          { id: "gt-2-s17", name: "S17-DNN: Sổ chi phí sản xuất, kinh doanh theo công trình" },
          { id: "gt-2-bang-tong", name: "Bảng tổng hợp chi phí theo công trình" },
          { id: "gt-2-s18", name: "S18-DNN: Thẻ tính giá thành công trình - theo khoản mục chi phí" },
          { id: "gt-2-tong-km", name: "Tổng hợp chi phí công trình theo khoản mục chi phí" },
          { id: "gt-2-tong-sxkd", name: "Tổng hợp chi phí sản xuất kinh doanh theo công trình" },
          { id: "gt-2-chitiet-km", name: "Số chi tiết tài khoản theo công trình và khoản mục chi phí" },
          { id: "gt-2-chitiet", name: "Số chi tiết tài khoản theo công trình" },
          { id: "gt-2-tong-lailo", name: "Báo cáo tổng hợp lãi lỗ theo công trình" },
          { id: "gt-2-tong-nx", name: "Tổng hợp nhập xuất kho theo công trình" },
          { id: "gt-2-chitiet-ngang", name: "Báo cáo chi tiết lãi lỗ theo công trình (Mẫu ngang)" },
          { id: "gt-2-chitiet-doc", name: "Báo cáo chi tiết lãi lỗ theo công trình (Mẫu dọc)" },
          { id: "gt-2-bang-ke", name: "Bảng kê phiếu nhập, phiếu xuất theo công trình" },
          { id: "gt-2-so-sanh", name: "Bảng so sánh định mức dự toán vật tư" },
          { id: "gt-2-cn-tong", name: "Tổng hợp công nợ nhân viên theo công trình" },
          { id: "gt-2-cn-chitiet", name: "Chi tiết công nợ nhân viên theo công trình" },
          { id: "gt-2-so-sanh-cp", name: "Báo cáo so sánh chi phí dự toán và thực tế theo công trình" },
        ],
      },
      {
        id: "gt-3",
        name: "Giá thành đơn hàng",
        items: [
          { id: "gt-3-tong-nx", name: "Tổng hợp nhập xuất kho theo đơn hàng" },
          { id: "gt-3-bang-ke", name: "Bảng kê phiếu nhập, phiếu xuất theo đơn hàng" },
          { id: "gt-3-tong-sxkd", name: "Tổng hợp chi phí sản xuất kinh doanh theo đơn hàng" },
          { id: "gt-3-bang-tong", name: "Bảng tổng hợp chi phí theo đơn hàng" },
          { id: "gt-3-chitiet-km", name: "Số chi tiết tài khoản theo đơn hàng và khoản mục chi phí" },
          { id: "gt-3-s17", name: "S17-DNN: Sổ chi phí sản xuất, kinh doanh theo đơn hàng" },
        ],
      },
      {
        id: "gt-4",
        name: "Giá thành hợp đồng",
        items: [
          { id: "gt-4-tong-nx", name: "Tổng hợp nhập xuất kho theo hợp đồng" },
          { id: "gt-4-bang-ke", name: "Bảng kê phiếu nhập, phiếu xuất theo hợp đồng" },
          { id: "gt-4-tong-sxkd", name: "Tổng hợp chi phí sản xuất kinh doanh theo hợp đồng" },
          { id: "gt-4-bang-tong", name: "Bảng tổng hợp chi phí theo hợp đồng" },
          { id: "gt-4-chitiet", name: "Số chi tiết tài khoản theo hợp đồng" },
          { id: "gt-4-s17", name: "S17-DNN: Sổ chi phí sản xuất, kinh doanh theo hợp đồng" },
        ],
      },
      {
        id: "gt-5",
        name: "Báo cáo đối chiếu",
        items: [
          { id: "gt-5-liet-ke", name: "Liệt kê danh sách chứng từ chi phí chung theo kỳ tính giá thành" },
          { id: "gt-5-doi-chieu", name: "Báo cáo đối chiếu giá thành và giá trị nhập kho" },
        ],
      },
    ],
  },
  {
    id: "tong-hop",
    name: "Tổng hợp",
    groups: [
      {
        id: "th-1",
        name: "Sổ sách kế toán",
        items: [
          { id: "th-1-chitiet-tk", name: "Sổ chi tiết các tài khoản" },
          { id: "th-1-chitiet-ps", name: "Sổ chi tiết phát sinh tài khoản (Chỉ lấy phát sinh)" },
          { id: "th-1-nkc", name: "Sổ nhật ký chung", href: "/reports/financial?type=journal-ledger" },
          { id: "th-1-bang-tong-chungtu", name: "Bảng tổng hợp chứng từ gốc cùng loại (Ghi Nợ TK)" },
          { id: "th-1-s03b", name: "S03b-DN: Sổ cái (Hình thức Nhật ký chung)", href: "/reports/financial?type=general-ledger" },
          { id: "th-1-bang-tong-chungtu-co", name: "Bảng tổng hợp chứng từ gốc cùng loại (Ghi Có TK)" },
          { id: "th-1-ps-dinhkhoan", name: "Báo cáo phát sinh theo từng cặp định khoản" },
        ],
      },
      {
        id: "th-2",
        name: "Báo cáo tổng hợp theo tài khoản",
        items: [
          { id: "th-2-bang-tong-ps", name: "Bảng tổng hợp phát sinh tài khoản" },
          { id: "th-2-tong-thongke", name: "Báo cáo tổng hợp theo mã thống kê" },
        ],
      },
      {
        id: "th-3",
        name: "Báo cáo chi phí, lãi lỗ",
        items: [
          { id: "th-3-tong-lailo", name: "Báo cáo tổng hợp lãi lỗ theo mã thống kê" },
          { id: "th-3-chitiet-lailo", name: "Báo cáo chi tiết lãi lỗ theo mã thống kê" },
          { id: "th-3-tong-cp-km", name: "Tổng hợp chi phí theo khoản mục chi phí" },
          { id: "th-3-chitiet-ps-dv", name: "Chi tiết phát sinh tài khoản theo đơn vị" },
          { id: "th-3-chitiet-ps-dv-km", name: "Chi tiết phát sinh tài khoản theo đơn vị và khoản mục chi phí" },
          { id: "th-3-chitiet-ps-km", name: "Chi tiết phát sinh tài khoản theo khoản mục chi phí" },
          { id: "th-3-tong-cp-khong-hoply", name: "Tổng hợp chi phí không hợp lý" },
          { id: "th-3-tong-cp-dv", name: "Tổng hợp chi phí theo đơn vị" },
          { id: "th-3-tong-lailo-dv", name: "Báo cáo tổng hợp lãi lỗ theo đơn vị" },
          { id: "th-3-tong-cp-dv-km", name: "Tổng hợp chi phí theo đơn vị và khoản mục chi phí" },
          { id: "th-3-chitiet-lailo-dv", name: "Báo cáo chi tiết lãi lỗ theo đơn vị" },
        ],
      },
      {
        id: "th-4",
        name: "Báo cáo công nợ",
        items: [
          { id: "th-4-cn-nv", name: "Tổng hợp công nợ nhân viên" },
          { id: "th-4-cn-nv-hd", name: "Tổng hợp công nợ nhân viên theo hợp đồng" },
          { id: "th-4-cn-dt", name: "Tổng hợp công nợ theo đối tượng" },
          { id: "th-4-chitiet-dt", name: "Sổ chi tiết tài khoản đối tượng" },
          { id: "th-4-chitiet-nv-hd", name: "Chi tiết công nợ nhân viên theo hợp đồng" },
          { id: "th-4-quyet-toan", name: "Tình hình quyết toán tạm ứng nhân viên chi tiết theo từng chứng từ" },
        ],
      },
    ],
  },
  {
    id: "bao-cao-doi-chieu",
    name: "Báo cáo đối chiếu",
    items: [
      { id: "dc-cn-pt", name: "Đối chiếu chứng từ công nợ phải trả và chứng từ thanh toán" },
      { id: "dc-cp-mh-1", name: "Đối chiếu chi phí mua hàng trên chứng từ mua hàng và chứng từ chi phí" },
      { id: "dc-cp-mh-2", name: "Đối chiếu chi phí mua hàng trên chứng từ chi phí và chứng từ mua hàng" },
      { id: "dc-cn-pth", name: "Đối chiếu chứng từ công nợ phải thu và chứng từ thanh toán" },
      { id: "dc-nx-kho", name: "Báo cáo đối chiếu nhập xuất kho giữa các chi nhánh" },
      { id: "dc-kho-sc", name: "Báo cáo đối chiếu kho và sổ cái" },
      { id: "dc-nx-kt", name: "Đối chiếu nhập xuất giữa kế toán và thủ kho" },
      { id: "dc-gt-nx", name: "Đối chiếu giá trị nhập, xuất kho của lệnh lắp ráp, tháo dỡ" },
      { id: "dc-ccdc", name: "Báo cáo đối chiếu sổ theo dõi CCDC, chi phí trả trước và sổ cái" },
      { id: "dc-tscd", name: "Báo cáo đối chiếu sổ tài sản và sổ cái" },
      { id: "dc-thue", name: "Báo cáo đối chiếu bảng kê thuế và sổ cái" },
      { id: "dc-tt-hd", name: "Đối chiếu thông tin hóa đơn trên bảng kê mua vào và chứng từ" },
      { id: "dc-ct-cp", name: "Liệt kê danh sách chứng từ chi phí chung theo kỳ tính giá thành" },
      { id: "dc-gt-gt", name: "Báo cáo đối chiếu giá thành và giá trị nhập kho" },
    ],
  },
];
