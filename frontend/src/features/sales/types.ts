export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "INSTALLMENT" | "MIXED";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export type PosCustomer = {
  id: number;
  name: string;
  phone: string;
  address: string;
  debtAmount: number;
};

export type PosProduct = {
  id: number;
  productCode: string;
  productName: string;
  category: "ELECTRIC_MOTORBIKE" | "BATTERY" | "CHARGER" | "SPARE_PART";
  salePrice: number;
  listPrice?: number;
  effectivePrice?: number;
  pricePolicyId?: number | null;
  pricePolicyName?: string | null;
  policyDiscountAmount?: number;
  stockQuantity: number;
  imageUrl?: string;
  serials: ProductSerial[];
};

export type ProductSerial = {
  id?: number;
  serialNumber: string;
  branchName: string;
  status: "IN_STOCK" | "RESERVED" | "SOLD" | "WARRANTY" | "SERVICE" | "TRANSFERING" | "RETURNED" | "DAMAGED" | "IN_SERVICE";
};

export type CartItem = {
  productId: number;
  productCode: string;
  productName: string;
  category: PosProduct["category"];
  unitPrice: number;
  listPrice?: number;
  pricePolicyName?: string | null;
  policyDiscountAmount?: number;
  quantity: number;
  selectedSerials: string[];
  serialOptions: ProductSerial[];
};

export type PaymentPayload = {
  method: PaymentMethod;
  cashAmount: number;
  bankAmount: number;
  installmentAmount: number;
  voucherCode: string;
  discountAmount: number;
};

export type PaymentEntry = {
  paymentMethod: Exclude<PaymentMethod, "MIXED">;
  amount: number;
  bankAccountId?: number | null;
  paymentDate?: string;
  referenceNo?: string;
  note?: string;
};

export type CreateInvoicePayload = {
  branchId?: number;
  employeeId?: number;
  customer: PosCustomer;
  items: CartItem[];
  payment: PaymentPayload;
  subtotal: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
};

export type InvoiceResponse = {
  id?: number;
  invoiceNo: string;
  createdAt: string;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paidAmount: number;
  pdfUrl?: string;
};

export type CreateQuotationPayload = {
  branchId: number;
  customerId: number;
  employeeId: number;
  quotationDate?: string;
  validUntil: string;
  discountAmount: number;
  voucherCode?: string;
  note?: string;
  itemCount?: number;
  items?: Array<{
    productId: number;
    serialId?: number;
    quantity: number;
    unitPrice?: number;
  }>;
};

export type CreateReturnPayload = {
  orderId: number;
  refundAmount: number;
  refundMethod?: "CASH" | "BANK_TRANSFER";
  reason?: string;
  itemCount?: number;
  items?: Array<{
    orderItemId: number;
    quantity: number;
    serialDisposition?: "RETURNED" | "DAMAGED";
  }>;
};

export type SalesOrderStatus =
  | "DRAFT"
  | "WAITING_DISCOUNT_APPROVAL"
  | "CONFIRMED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type DiscountApprovalStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export type SalesOrder = {
  id: number;
  orderNo: string;
  branchId: number;
  customerId: number;
  employeeId: number;
  quotationId?: number | null;
  orderDate: string;
  status: SalesOrderStatus;
  subtotal: number;
  discountAmount: number;
  voucherCode?: string | null;
  // VAT
  vatRate: number;
  vatAmount: number;
  taxInvoiceId?: number | null;
  totalAmount: number;
  paidAmount: number;
  amountDue: number;
  paymentStatus: PaymentStatus;
  reservationUntil?: string | null;
  note?: string | null;
  // Discount approval
  discountApprovalStatus: DiscountApprovalStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  approvalNote?: string | null;
  // Flags
  accountingRecorded: boolean;
  stockIssued: boolean;
  warrantyCreated: boolean;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    returnedQuantity: number;
    serialId?: number | null;
    serialNumber?: string | null;
    quantity: number;
    unitPrice: number;
    listPrice?: number | null;
    pricePolicyId?: number | null;
    pricePolicyCode?: string | null;
    pricePolicyName?: string | null;
    policyDiscountAmount?: number | null;
    lineTotal: number;
  }>;
};

export type QuotationStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export type Quotation = {
  id: number;
  quotationNo: string;
  branchId: number;
  customerId: number;
  employeeId: number;
  quotationDate: string;
  validUntil: string;
  status: QuotationStatus;
  subtotal: number;
  discountAmount: number;
  voucherCode?: string | null;
  totalAmount: number;
  note?: string | null;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    serialId?: number | null;
    serialNumber?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

export type SalesPayment = {
  id: number;
  orderId: number;
  paymentMethod: Exclude<PaymentMethod, "MIXED">;
  amount: number;
  paymentDate: string;
  bankAccountId?: number | null;
  referenceNo?: string | null;
  note?: string | null;
  installmentDisbursement: boolean;
};

export type InstallmentApplication = {
  id: number;
  orderId: number;
  applicationNo: string;
  financeCompany: string;
  downPaymentAmount: number;
  loanAmount: number;
  termMonths: number;
  interestRate: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISBURSED";
  disbursedAmount?: number | null;
  disbursedAt?: string | null;
};

export type SalesReturn = {
  id: number;
  returnNo: string;
  orderId: number;
  orderNo: string;
  branchId: number;
  customerId: number;
  returnDate: string;
  returnAmount: number;
  refundAmount: number;
  status: "DRAFT" | "COMPLETED" | "CANCELLED";
  reason?: string | null;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

// ── Deposit ──
export type DepositStatus = "ACTIVE" | "CONVERTED" | "REFUNDED" | "FORFEITED" | "EXPIRED";

export type Deposit = {
  id: number;
  depositCode: string;
  customerId: number;
  branchId: number;
  productId?: number | null;
  serialId?: number | null;
  amount: number;
  depositDate: string;
  expiredAt?: string | null;
  paymentMethod: string;
  status: DepositStatus;
  convertedToOrderId?: number | null;
  convertedAt?: string | null;
  convertedBy?: string | null;
  refundAmount?: number | null;
  refundedAt?: string | null;
  refundedBy?: string | null;
  note?: string | null;
  accountingRecorded: boolean;
  journalEntryNo?: string | null;
  createdAt: string;
  createdBy: string;
};

export type CreateDepositPayload = {
  customerId: number;
  branchId: number;
  productId?: number;
  serialId?: number;
  amount: number;
  depositDate?: string;
  expiredAt?: string;
  paymentMethod?: "CASH" | "BANK_TRANSFER" | "MOMO";
  note?: string;
};

// ── Customer 360 ──
export type Customer360 = {
  id: number;
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  tier?: string | null;
  totalPurchaseAmount: number;
  totalOrders: number;
  debtAmount: number;
  lastPurchaseDate?: string | null;
  ownedSerials?: Array<{
    serialNumber: string;
    productName: string;
    soldDate?: string | null;
    warrantyEndDate?: string | null;
  }> | null;
  recentWarrantyRequests?: Array<{
    ticketNo: string;
    createdAt: string;
    status: string;
  }> | null;
};
