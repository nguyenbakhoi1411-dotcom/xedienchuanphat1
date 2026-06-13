export type CustomerType = "NEW" | "NORMAL" | "VIP" | "WHOLESALE" | "HIGH_RISK_DEBT" | "RETAIL" | "POTENTIAL";
export type CustomerSource = "WALK_IN" | "FACEBOOK" | "ZALO" | "TIKTOK" | "WEBSITE" | "REFERRAL";

export type Customer = {
  id: number;
  customerCode: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  type: CustomerType;
  source: CustomerSource;
  birthday: string;
  branchId?: number;
  assignedTo?: number;
  totalSpent: number;
  debtAmount: number;
  overdueDebtWarning?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseHistory = {
  id: number;
  invoiceNo?: string;
  orderNo?: string;
  purchaseDate: string;
  productName: string;
  serialNumber?: string;
  amount: number;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
};

export type WarrantyHistory = {
  id: number;
  ticketNo: string;
  createdAt: string;
  serialNumber: string;
  issue: string;
  status: "CREATED" | "IN_PROGRESS" | "COMPLETED";
};

export type CareNote = {
  id: number;
  noteDate: string;
  content: string;
  createdBy: string;
};

export type CareReminder = {
  id: number;
  reminderDate: string;
  title: string;
  content: string;
  status: "OPEN" | "DONE";
};

export type CustomerDetail = Customer & {
  purchases: PurchaseHistory[];
  payments?: Array<{ id: number; orderNo: string; paymentDate: string; amount: number; paymentMethod: string; referenceNo?: string }>;
  warranties: WarrantyHistory[];
  repairs?: Array<{ id: number; serialNumber: string; issueDescription: string; status: string; totalCost: number; createdAt: string }>;
  notes: CareNote[];
  reminders: CareReminder[];
  usedVouchers?: string[];
  opportunities?: Array<{ id: number; expectedValue: number; expectedCloseDate?: string; stage: string; probability: number }>;
};

export type CustomerListParams = {
  keyword: string;
  type: "ALL" | CustomerType;
  source: "ALL" | CustomerSource;
  page: number;
  pageSize: number;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type CustomerPayload = Omit<Customer, "id" | "totalSpent" | "debtAmount" | "createdAt" | "updatedAt">;

export type CareNotePayload = {
  content: string;
};

export type CareReminderPayload = {
  reminderDate: string;
  title: string;
  content: string;
};
