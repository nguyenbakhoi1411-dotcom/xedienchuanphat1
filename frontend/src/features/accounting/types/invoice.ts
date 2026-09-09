export interface InvoiceItem {
  id?: number;
  productId?: number;
  tenHangHoa: string;
  donViTinh: string;
  soLuong: number;
  donGia: number;
  thueSuat: number;
  thanhTien?: number;
  tienThue?: number;
}

export interface Invoice {
  id: number;
  maHoaDon: string;
  loaiHoaDon: string;
  mauSo?: string;
  kyHieu?: string;
  soHoaDon?: string;
  ngayXuat: string;
  ngayKy?: string;
  ngayGuiCqt?: string;
  orderId?: number;
  tenNguoiBan?: string;
  diaChiNguoiBan?: string;
  maSoThueNguoiBan?: string;
  tenNguoiMua?: string;
  diaChiNguoiMua?: string;
  maSoThueNguoiMua?: string;
  hinhThucThanhToan?: string;
  tongTienTruocThue: number;
  tongThueGtgt: number;
  tongCong: number;
  trangThai: string; // DRAFT, ISSUED, CANCELLED
  electronicInvoiceStatus?: string; // READY, SENT_TO_TAX_AUTHORITY, CANCELLED
  items: InvoiceItem[];
}

export interface InvoiceInput {
  id: number;
  maHoaDonVao: string;
  soHoaDonNcc?: string;
  kyHieuNcc?: string;
  mauSoNcc?: string;
  ngayHoaDon: string;
  nhaCungCapId: number;
  tenNhaCungCap: string;
  maSoThueNcc: string;
  tongTienHang: number;
  tongThueGtgt: number;
  tongCong: number;
  thueSuat: number;
  trangThai: string; // PENDING, APPROVED
  purchaseOrderId?: number;
  ghiChu?: string;
}

export interface SerialConfig {
  id: number;
  mauSo: string;
  kyHieu: string;
  soBatDau: number;
  soHienTai: number;
  soKetThuc: number;
  loaiHoaDon: string;
  namSuDung: number;
  trangThai: string;
}

export interface VatReportItem {
  invoiceNo: string;
  serialNo: string;
  date: string;
  customerOrSupplierName: string;
  taxCode: string;
  taxBaseAmount: number;
  vatAmount: number;
  type: 'OUTPUT' | 'INPUT';
}

export interface VatReportResponse {
  year: number;
  month: number;
  branchId: number;
  outputInvoices: VatReportItem[];
  totalOutputVat: number;
  totalOutputTaxBase: number;
  inputInvoices: VatReportItem[];
  totalInputVat: number;
  totalInputTaxBase: number;
  netVatPayable: number;
}
