// ──── STATUS ENUMS ────
export type QuotationStatus =
  'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';

export type SalesOrderStatus =
  'DRAFT' | 'CONFIRMED' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';

export type InvoiceStatus =
  'DRAFT' | 'READY' | 'ISSUED' | 'ADJUSTED' | 'REPLACED' | 'CANCELLED' | 'INVALID';

export type RevenueRecordedStatus = 'NOT_RECORDED' | 'PARTIAL' | 'RECORDED';

export type PaymentMethod =
  'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOMO' | 'VNPAY' | 'INSTALLMENT' | 'MIXED' | 'OTHER';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export type DebtType = 'NORMAL' | 'BAD_DEBT' | 'IRRECOVERABLE';
export type BadgeTone = 'orange' | 'green' | 'blue' | 'slate' | 'amber' | 'red' | 'purple' | 'cyan' | 'emerald';

// ──── LABELS (tiếng Việt theo đúng MISA) ────
export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  DRAFT: 'Nháp', SENT: 'Đã gửi', ACCEPTED: 'Đã chấp nhận',
  REJECTED: 'Từ chối', EXPIRED: 'Hết hạn', CONVERTED: 'Đã chuyển đơn',
};
export const ORDER_STATUS_LABELS: Record<SalesOrderStatus, string> = {
  DRAFT: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', DELIVERING: 'Đang giao',
  COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy', RETURNED: 'Trả hàng',
};
export const SALES_STATUS_LABELS = ORDER_STATUS_LABELS;
export const REVENUE_STATUS_LABELS: Record<RevenueRecordedStatus, string> = {
  NOT_RECORDED: 'Chưa ghi doanh số',
  PARTIAL: 'Ghi một phần',
  RECORDED: 'Đã ghi doanh số',
};
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Nháp', READY: 'Đã lập đủ', ISSUED: 'Đã phát hành',
  ADJUSTED: 'Đã điều chỉnh', REPLACED: 'Đã thay thế',
  CANCELLED: 'Đã hủy', INVALID: 'Không hợp lệ',
};
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Tiền mặt', BANK_TRANSFER: 'Chuyển khoản',
  CARD: 'Thẻ', MOMO: 'Momo', VNPAY: 'VNPay',
  INSTALLMENT: 'Trả góp', MIXED: 'Kết hợp', OTHER: 'Khác',
};

// ──── BADGE TONES ────
export const ORDER_STATUS_BADGE: Record<SalesOrderStatus, BadgeTone> = {
  DRAFT: 'slate', CONFIRMED: 'blue', DELIVERING: 'amber',
  COMPLETED: 'green', CANCELLED: 'red', RETURNED: 'orange',
};
export const SALES_STATUS_BADGE_TONE = ORDER_STATUS_BADGE;
export const REVENUE_STATUS_BADGE: Record<RevenueRecordedStatus, string> = {
  NOT_RECORDED: 'amber', PARTIAL: 'blue', RECORDED: 'green',
};
export const INVOICE_STATUS_BADGE: Record<InvoiceStatus, string> = {
  DRAFT: 'slate', READY: 'blue', ISSUED: 'green',
  ADJUSTED: 'amber', REPLACED: 'orange', CANCELLED: 'red', INVALID: 'red',
};

// ──── CORE INTERFACES ────
export interface QuotationLine {
  id?: number; lineNo: number;
  productId?: number; productCode?: string; productName: string; unit?: string;
  quantity: number; unitPriceBeforeTax: number; unitPrice: number;
  discountRate: number; discountAmount: number;
  vatRate: number; vatAmount: number; totalPrice: number;
  warrantyMonths?: number; unitName?: string; note?: string;
}

export interface Quotation {
  id: number; quotationNo: string; quotationDate: string;
  customerCode?: string; customerName?: string; taxCode?: string; contactPerson?: string; note?: string;
  totalAmount: number; totalDiscount: number; totalVat: number; grandTotal: number;
  status: QuotationStatus; validUntil?: string;
  convertedToOrder?: number; lines: QuotationLine[];
  createdBy: string; createdAt: string;
}

export interface SalesOrderItem {
  id?: number; lineNo: number;
  productId?: number; productCode?: string; productName: string; unit?: string;
  quantity: number; quantitySold: number; quantityExported: number; unitPrice: number;
  discountRate: number; discountAmount: number;
  vatRate: number; vatAmount: number; totalPrice: number;
  warehouseId?: number; warehouseName?: string;
  returnedQuantity?: number;
  promotionItem: boolean; commercialDiscount: boolean;
  accountReceivable: string; revenueAccount: string;
  serialNo?: string; serialNumber?: string; lineTotal?: number; note?: string;
}

export interface SalesPayment {
  id: number; paymentNo: string; paymentDate: string;
  amount: number; paymentMethod: PaymentMethod; note?: string; bankAccount?: string;
  cashAccount: string; status: string; createdAt: string;
}

export interface Installment {
  id: number;
  orderId: number;
  applicationNo: string;
  financeCompany: string;
  downPaymentAmount: number;
  loanAmount: number;
  termMonths: number;
  interestRate: number;
  status: string;
  disbursedAmount?: number;
  disbursedAt?: string;
  note?: string;
  createdAt?: string;
}

export interface SalesOrder {
  id: number; orderNo: string; orderDate: string;
  customerId?: number; customerCode?: string; customerName?: string; phone?: string; customerPhone?: string; mobilePhone?: string;
  salespersonName?: string; address?: string;
  status: SalesOrderStatus;
  revenueRecordedStatus: RevenueRecordedStatus;
  invoiceStatus: string; deliveryStatus: string; invoiceExportedStatus: string;
  subtotal: number; discountAmount: number; vatRate?: number; vatAmount: number; totalAmount: number;
  invoicedAmount: number; collectedAmount: number; paidAmount: number; remainingAmount: number; amountDue: number; depositAmount: number;
  paymentStatus?: string; accountingRecorded?: boolean; stockIssued?: boolean; reservationUntil?: string;
  discountApprovalStatus?: string; approvedBy?: string; approvalNote?: string;
  items: SalesOrderItem[]; payments: SalesPayment[];
  note?: string; cancelReason?: string; createdBy: string; createdAt: string;
  confirmedAt?: string; completedAt?: string;
}

export interface TaxInvoiceLine {
  id?: number; lineNo: number;
  productCode?: string; productName: string; unit?: string;
  quantity: number; unitPrice: number;
  commercialDiscount: boolean; totalPrice: number;
  vatRate: number; vatAmount: number;
  expiryDate?: string; serialNo?: string; note?: string;
}

export interface TaxInvoice {
  id: number; invoiceNo?: string; invoiceSerial?: string;
  invoiceDate: string; invoiceType: string; invoiceForm: string;
  customerName?: string; customerAddress?: string; customerTaxCode?: string;
  paymentStatus?: PaymentStatus;
  taxBaseAmount: number; vatRate: number; vatAmount: number; totalAmount: number;
  status: InvoiceStatus; assemblyStatus: string; issueStatus: string;
  taxAuthorityCode?: string; invalidHandling?: string;
  originalInvoiceId?: number; lines: TaxInvoiceLine[];
  createdBy: string; createdAt: string; issuedAt?: string;
}

export type InvoiceResponse = TaxInvoice;

export interface SalesDiscountLine {
  id?: number; lineNo: number;
  productCode?: string; productName: string;
  discountAccount: string; arAccount: string;
  unit?: string; quantity: number;
  unitPriceAfterTax: number; unitPrice: number; totalPrice: number;
  vatRate: number; vatAmount: number; vatAccount?: string;
  originalVoucherNo?: string;
}

export interface SalesDiscount {
  id: number; discountNo: string; discountDate: string;
  customerName?: string; invoiceId?: number;
  totalAmount: number; status: string;
  lines: SalesDiscountLine[]; createdAt: string;
}

export interface SalesReturn {
  id: number;
  returnNo: string;
  orderNo?: string;
  status: string;
  refundAmount: number;
}

export interface ARBalance {
  customerCode: string; customerName: string;
  address?: string; taxCode?: string; customerGroup?: string;
  amountByInvoice: number; advanceReceived: number; remainingAmount: number;
  // Phân tích nợ trước hạn:
  beforeDue0_30: number; beforeDue31_60: number; beforeDue61_90: number;
  beforeDue91_120: number; beforeDueOver120: number; noDue: number;
  // Phân tích nợ quá hạn:
  overdue1_30: number; overdue31_60: number; overdue61_90: number;
  overdue91_120: number; overdueOver120: number;
  // Tình trạng nợ:
  normalDebt: number; hardDebt: number; irrecoverableDebt: number;
}

export interface ARAgingInvoice {
  invoiceNo: string;
  invoiceDate?: string;
  dueDate?: string;
  amount: number;
  remainingAmount: number;
  overdueDays: number;
}

export interface ARAgingRow {
  customerId: number;
  customerName: string;
  total: number;
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  daysOver90: number;
  invoices: ARAgingInvoice[];
}

export interface CustomerSales {
  id: number; customerCode: string; customerName: string; address?: string;
  taxCode?: string; idCardNo?: string; phone?: string; mobileNlh?: string;
  isInternal: boolean; arBalance: number;
}

export interface PosCustomer extends CustomerSales {
  name: string;
  debtAmount: number;
}

export interface SalesCustomer360 {
  tier?: string;
  totalOrders: number;
  totalPurchaseAmount: number;
  debtAmount: number;
  lastPurchaseDate?: string;
  ownedSerials?: Array<{
    serialNumber: string;
    productName: string;
    warrantyEndDate?: string;
  }>;
  recentWarrantyRequests?: Array<{
    ticketNo: string;
    status: string;
    createdAt: string;
  }>;
}

export type DepositStatus = "ACTIVE" | "CONVERTED" | "REFUNDED" | "FORFEITED" | "EXPIRED";

export interface Deposit {
  id: number;
  depositCode: string;
  customerId: number;
  branchId: number;
  productId?: number;
  serialId?: number;
  amount: number;
  depositDate: string;
  expiredAt?: string;
  paymentMethod: PaymentMethod;
  status: DepositStatus;
  convertedToOrderId?: number;
  convertedAt?: string;
  convertedBy?: string;
  refundAmount?: number;
  refundedAt?: string;
  refundedBy?: string;
  note?: string;
  accountingRecorded: boolean;
  journalEntryNo?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface CreateDepositPayload {
  customerId: number;
  branchId: number;
  productId?: number;
  serialId?: number;
  amount: number;
  depositDate?: string;
  expiredAt?: string;
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface ProductStock {
  productId: number; productCode: string; productName: string;
  mainUnit?: string; itemGroup?: string;
  totalStock: number; reserved: number; available: number;
  avgCost: number; stockValue: number; minStock: number;
  lowStock: boolean; defaultWarehouseId?: number; inventoryAccount?: string;
}

export type Product = ProductStock & {
  id?: number;
  itemType?: string;
  unit?: string;
  availableQuantity?: number;
  minimumQuantity?: number;
  unitPrice?: number;
  description?: string;
};

export interface PosProduct extends ProductStock {
  id: number;
  category?: string;
  salePrice: number;
  listPrice?: number;
  stockQuantity: number;
  imageUrl?: string;
  pricePolicyName?: string;
  policyDiscountAmount?: number;
  serials: PosProductSerial[];
}

export interface PosProductSerial {
  id?: number | string;
  serialNumber: string;
  status?: string;
  branchName?: string;
}

export interface CartItem {
  productId: number;
  productCode: string;
  productName: string;
  category?: string;
  unitPrice: number;
  listPrice?: number;
  pricePolicyName?: string;
  policyDiscountAmount?: number;
  quantity: number;
  selectedSerials: string[];
  serialOptions: PosProductSerial[];
}

export interface PaymentPayload {
  method: PaymentMethod;
  cashAmount: number;
  bankAmount: number;
  installmentAmount: number;
  voucherCode: string;
  discountAmount: number;
}

export interface CreateInvoicePayload {
  orderId?: number;
  customerId?: number;
  customer?: PosCustomer;
  items?: CartItem[];
  payment?: PaymentPayload;
  subtotal?: number;
  totalAmount?: number;
  paidAmount?: number;
  paymentStatus?: PaymentStatus;
  amount?: number;
  paymentMethod?: PaymentMethod;
}

export interface SalesDashboard {
  todayRevenue: number; yesterdayRevenue: number; revenueGrowthPct: number;
  newOrders: number;
  totalReceivable: number; totalByInvoice: number; totalAdvance: number;
  totalContractValue: number;
}

// ──── REQUEST TYPES ────
export interface CreateQuotationDto {
  quotationDate: string; customerId?: number;
  branchId?: number; employeeId?: number;
  customer?: PosCustomer; items?: CartItem[]; payment?: PaymentPayload;
  subtotal?: number; totalAmount?: number; paidAmount?: number; paymentStatus?: PaymentStatus;
  customerCode?: string; customerName?: string; customerAddress?: string;
  taxCode?: string; contactPerson?: string; note?: string;
  paymentTerm?: string; validUntil?: string; warehouseId?: number;
  lines: Array<{
    productId?: number; productCode?: string; productName: string; unit?: string;
    quantity: number; unitPriceBeforeTax?: number; unitPrice: number;
    discountRate?: number; vatRate?: number; warrantyMonths?: number; unitName?: string;
  }>;
}

export interface CreateSalesOrderDto extends Omit<CreateQuotationDto, 'quotationDate' | 'validUntil'> {
  orderDate?: string;
  phone?: string;
  mobilePhone?: string;
  depositAmount?: number; paymentMethod?: PaymentMethod;
  deliveryDate?: string; deliveryAddress?: string; salespersonId?: number;
  lines: Array<CreateQuotationDto['lines'][number] & {
    warehouseId?: number;
    promotionItem?: boolean;
    commercialDiscount?: boolean;
    accountReceivable?: string;
    revenueAccount?: string;
  }>;
}

export interface CollectPaymentDto {
  amount: number; paymentMethod: PaymentMethod;
  paymentDate?: string; bankAccount?: string; note?: string; cashAccount?: string;
}

// ──── PAGE RESPONSE ────
export interface PageResponse<T> {
  content: T[];
  items?: T[];
  totalElements: number;
  totalItems?: number;
  totalPages: number;
  number: number;
  size: number;
}
