// Transaction and reconciliation types
export enum TransactionType {
  RECEIPT = 'RECEIPT',
  PAYMENT = 'PAYMENT',
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  POSTED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum PartnerType {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum ReconciliationStatus {
  OPEN = 'OPEN',
  MATCHED = 'MATCHED',
  CLOSED = 'CLOSED',
}

// BankAccountDTO - what the backend returns
export interface BankAccountDTO {
  id: number;
  maTaiKhoan: string;
  bankName: string;
  maNganHang: string | null;
  chiNhanhNganHang: string | null;
  accountNumber: string;  // so_tai_khoan
  accountHolder: string;  // ten_chu_tai_khoan
  currency: string;
  accountingCode: string;
  currentBalance: number;
  openingBalance: number;
  openingBalanceDate: string | null;
  spendingLimit: number | null;
  ghiChu: string | null;
  active: boolean;
  isDefault: boolean;
  branchId: number | null;
  createdAt: string;
  updatedAt: string;
}

// For backward compat with the existing page.tsx which uses BankAccount type with different field names
export interface BankAccount extends BankAccountDTO {
  accountNo: string;       // alias for accountNumber
  accountName: string;     // alias for accountHolder
  balance: number;         // alias for currentBalance
  isActive: boolean;       // alias for active
  bankBranch: string | null; // alias for chiNhanhNganHang
}

export interface CreateBankAccountRequest {
  bankName: string;
  maNganHang?: string;
  chiNhanhNganHang?: string;
  accountNumber: string;
  accountHolder: string;
  currency?: string;
  accountingCode?: string;
  openingBalance?: number;
  openingBalanceDate?: string;
  spendingLimit?: number;
  ghiChu?: string;
  isDefault?: boolean;
  branchId?: number;
}

export interface UpdateBankAccountRequest {
  bankName?: string;
  maNganHang?: string;
  chiNhanhNganHang?: string;
  accountHolder?: string;
  currency?: string;
  accountingCode?: string;
  spendingLimit?: number;
  ghiChu?: string;
  active?: boolean;
  isDefault?: boolean;
}

export interface BankAccountSummary {
  soDuDauKy: number;
  tongThuTrongKy: number;
  tongChiTrongKy: number;
  soDuCuoiKy: number;
  soGiaoDichChuaDcDoiChieu: number;
}

export interface BankTransactionDTO {
  id: number;
  maGiaoDich: string;
  loaiGiaoDich: 'RECEIPT' | 'PAYMENT';
  bankAccountId: number;
  bankAccount?: BankAccountDTO;
  ngayGiaoDich: string;
  soThamChieuNH: string | null;
  nganHangDoiUng: string | null;
  soTkDoiUng: string | null;
  tenChuTkDoiUng: string | null;
  soTien: number;
  
  // Master fields
  doiTuongId?: number | null;
  loaiDoiTuong?: string | null;
  tenDoiTuong?: string | null;
  diaChi?: string | null;
  lyDo?: string | null;
  nhanVienId?: number | null;
  
  items: BankTransactionItemDTO[];
  trangThaiDoiChieu: 'UNMATCHED' | 'MATCHED' | 'DISCREPANCY';
  trangThai: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface BankTransaction extends BankTransactionDTO {
  // backward compat aliases
  docNo: string;   // alias for maGiaoDich
  docDate: string; // alias for ngayGiaoDich
  amount: number;  // alias for soTien
  type: 'RECEIPT' | 'PAYMENT'; // alias for loaiGiaoDich
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED'; // alias for trangThai
  subType?: string; // missing in new schema but used by some old UI
  debitAccount?: string; 
  creditAccount?: string;
  // Items list
  items: BankTransactionItemDTO[];
}

export interface BankTransactionItemDTO {
  id: number;
  dienGiai: string;
  tkNo: string;
  tkCo: string;
  soTien: number;
  doiTuongId?: number;
  loaiDoiTuong?: string;
  tenDoiTuong?: string;
}

export interface CreateBankTransactionRequest {
  bankAccountId: number;
  ngayGiaoDich: string;
  doiTuongId?: number | null;
  loaiDoiTuong?: string | null;
  tenDoiTuong?: string | null;
  diaChi?: string | null;
  lyDo?: string | null;
  nhanVienId?: number | null;
  soThamChieuNH?: string | null;
  nganHangDoiUng?: string | null;
  soTkDoiUng?: string | null;
  tenChuTkDoiUng?: string | null;
  tongTien: number;
  branchId?: number | null;
  items: BankTransactionItemRequest[];
}

export interface BankTransactionItemRequest {
  dienGiai: string;
  tkNo: string;
  tkCo: string;
  soTien: number;
  doiTuongId?: number | null;
  loaiDoiTuong?: string | null;
  tenDoiTuong?: string | null;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ImportStatementResult {
  statementId: number;
  tongSoDong: number;
  soDoiChieuDuoc: number;
  soCanXemLai: number;
}

export interface AutoMatchResult {
  soTuDongGhep: number;
  soCanXemLai: number;
  soKhongGhepDuoc: number;
}

export interface ReconciliationReport {
  soDuSaoKe: number;
  soDuHeThong: number;
  chenhLech: number;
  trangThai: 'BALANCED' | 'UNBALANCED';
  danhSachChuaGhep: BankStatementLineDTO[];
  danhSachGdChuaCoSaoKe: BankTransactionDTO[];
}

export interface BankStatementLineDTO {
  id: number;
  statementId: number;
  ngayGiaoDich: string;
  soThamChieu: string | null;
  moTa: string | null;
  soTienThu: number;
  soTienChi: number;
  soDuSau: number | null;
  trangThaiDoiChieu: 'UNMATCHED' | 'MATCHED' | 'IGNORED';
  bankTransactionId: number | null;
  bankTransaction?: BankTransactionDTO;
}

// Keep old exports for backward compat
export type ApiResponse<T> = { data: T; success: boolean; message?: string; };
export type PaginatedResponse<T> = { data: T[]; total: number; page: number; limit: number; };

// Receipt and payment sub-type options
export const RECEIPT_SUB_TYPES = [
  { value: 'SALE', label: 'Thu bán hàng' },
  { value: 'DEBT', label: 'Thu công nợ' },
  { value: 'OTHER', label: 'Thu khác' },
];

export const PAYMENT_SUB_TYPES = [
  { value: 'PURCHASE', label: 'Chi mua hàng' },
  { value: 'SALARY', label: 'Chi lương' },
  { value: 'OPERATING', label: 'Chi vận hành' },
  { value: 'OTHER', label: 'Chi khác' },
];

export const BANK_NAMES = [
  { value: 'Vietcombank', label: 'Vietcombank', color: '#006934' },
  { value: 'Techcombank', label: 'Techcombank', color: '#E30613' },
  { value: 'MB Bank', label: 'MB Bank', color: '#6B2D8B' },
  { value: 'VietinBank', label: 'VietinBank', color: '#1A4F8A' },
  { value: 'BIDV', label: 'BIDV', color: '#003087' },
  { value: 'ACB', label: 'ACB', color: '#0072BB' },
  { value: 'TPBank', label: 'TPBank', color: '#E31837' },
  { value: 'VPBank', label: 'VPBank', color: '#00A651' },
  { value: 'Sacombank', label: 'Sacombank', color: '#004A97' },
  { value: 'Khác', label: 'Khác', color: '#6B7280' },
];

export const navItems = [
  { id: 1, label: 'Tất cả' },
  { id: 2, label: 'Hôm nay' },
  { id: 3, label: 'Tuần này' },
  { id: 4, label: 'Tháng này' },
  { id: 5, label: 'Khác' },
];

export const reportItems = [
  { id: 'daily-summary', title: 'Tóm tắt hàng ngày', count: 15 },
  { id: 'account-balance', title: 'Số dư tài khoản', count: 8 },
  { id: 'pending', title: 'Chứng từ chưa hạch toán', count: 3 },
  { id: 'reconciliation', title: 'Trạng thái đối chiếu', count: 12 },
  { id: 'audit', title: 'Lịch sử biến động', count: 42 },
];

export const receiptSubTypes = RECEIPT_SUB_TYPES;
export const paymentSubTypes = PAYMENT_SUB_TYPES;
