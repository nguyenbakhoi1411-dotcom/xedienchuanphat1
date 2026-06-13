// ────────────────────────────────────────────────────────────────────────────
// CRM Customer 360 — TypeScript Types
// ────────────────────────────────────────────────────────────────────────────

export type LeadStatus =
  | "NEW" | "CONTACTED" | "CONSULTING" | "QUOTED" | "DEPOSITED" | "WON" | "LOST" | "CONVERTED";

export type CustomerTier = "NEW" | "REGULAR" | "VIP" | "PLATINUM" | "WHOLESALE" | "HIGH_RISK_DEBT";
export type CustomerRank = "NEW" | "POTENTIAL" | "NORMAL" | "VIP" | "INACTIVE";
export type LeadSource = "WALK_IN" | "FACEBOOK" | "ZALO" | "WEBSITE" | "REFERRAL" | "PHONE" | "OTHER";
export type CrmTaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type CrmTaskType = "CARE" | "FOLLOW_UP" | "DEMO" | "MEETING" | "REMINDER";
export type OpportunityStage = "NEW" | "CONSULTING" | "QUOTED" | "NEGOTIATING" | "WON" | "LOST";
export type AlertSeverity = "INFO" | "WARNING" | "URGENT";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Mới",
  CONTACTED: "Đã liên hệ",
  CONSULTING: "Đang tư vấn",
  QUOTED: "Đã báo giá",
  DEPOSITED: "Đã đặt cọc",
  WON: "Chốt thành công",
  LOST: "Thất bại",
  CONVERTED: "Đã chuyển đổi",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: "bg-slate-100 text-slate-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  CONSULTING: "bg-yellow-100 text-yellow-700",
  QUOTED: "bg-purple-100 text-purple-700",
  DEPOSITED: "bg-orange-100 text-orange-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
  CONVERTED: "bg-teal-100 text-teal-700",
};

export const RANK_COLORS: Record<CustomerRank, string> = {
  NEW: "bg-slate-100 text-slate-600",
  POTENTIAL: "bg-blue-100 text-blue-700",
  NORMAL: "bg-green-100 text-green-700",
  VIP: "bg-amber-100 text-amber-700",
  INACTIVE: "bg-gray-100 text-gray-500",
};

export const ALERT_COLORS: Record<AlertSeverity, string> = {
  INFO: "bg-blue-50 border-blue-200 text-blue-800",
  WARNING: "bg-yellow-50 border-yellow-200 text-yellow-800",
  URGENT: "bg-red-50 border-red-200 text-red-800",
};

export interface CustomerGroup {
  id: number;
  code: string;
  name: string;
  description: string;
  discountPercent: number;
  status: string;
}

export interface CustomerSummary {
  id: number;
  customerCode: string;
  phone: string;
  fullName: string;
  email: string;
  source: string;
  branchId: number;
  tier: CustomerTier;
  rank: CustomerRank;
  score: number;
  totalDebt: number;
  lifetimeValue: number;
  lastPurchaseDate: string | null;
  lastCareDate: string | null;
  birthday: string | null;
  createdAt: string;
}

export interface Lead {
  id: number;
  leadName: string;
  phone: string;
  email: string | null;
  source: LeadSource;
  interestedProduct: string | null;
  assignedTo: number | null;
  branchId: number | null;
  nextFollowUpDate: string | null;
  expectedValue: number | null;
  status: LeadStatus;
  statusLabel: string;
  lostReason: string | null;
  note: string | null;
  convertedCustomerId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadRequest {
  leadName: string;
  phone: string;
  email?: string;
  source: LeadSource;
  interestedProduct?: string;
  assignedTo?: number;
  branchId?: number;
  nextFollowUpDate?: string;
  expectedValue?: number;
  status?: LeadStatus;
  lostReason?: string;
  note?: string;
}

export interface TimelineEvent {
  type: "ORDER" | "QUOTATION" | "DEPOSIT" | "VEHICLE_SOLD" | "WARRANTY" | "REPAIR" | "CARE_NOTE";
  title: string;
  detail: string;
  occurredAt: string;
  referenceId: number;
}

export interface VehicleSerial {
  id: number;
  serialNumber: string;
  frameNumber: string | null;
  engineNumber: string | null;
  batterySerial: string | null;
  productName: string | null;
  status: string;
  soldDate: string | null;
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
}

export interface QuotationSummary {
  id: number;
  quotationNo: string;
  quotationDate: string;
  validUntil: string;
  status: string;
  totalAmount: number;
}

export interface DepositSummary {
  id: number;
  depositCode: string;
  depositAmount: number;
  status: string;
  note: string | null;
  createdAt: string;
}

export interface AlertItem {
  id: number;
  alertType: string;
  customerId: number | null;
  leadId: number | null;
  title: string;
  detail: string;
  severity: AlertSeverity;
  createdAt: string;
}

export interface PurchaseHistory {
  id: number;
  orderNo: string;
  orderDate: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  voucherCode: string | null;
}

export interface PaymentHistory {
  id: number;
  orderNo: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNo: string | null;
}

export interface WarrantyHistory {
  id: number;
  serialNumber: string;
  invoiceNo: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface RepairHistory {
  id: number;
  serialNumber: string;
  issueDescription: string;
  status: string;
  totalCost: number;
  createdAt: string;
}

export interface CareNote {
  id: number;
  customerId: number;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface CareTask {
  id: number;
  customerId: number | null;
  leadId: number | null;
  title: string;
  content: string | null;
  type: CrmTaskType;
  status: CrmTaskStatus;
  dueDate: string | null;
  assignedTo: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface Customer360 {
  id: number;
  customerCode: string;
  phone: string;
  fullName: string;
  email: string | null;
  address: string | null;
  source: string | null;
  branchId: number;
  assignedTo: number | null;
  customerGroupId: number | null;
  birthday: string | null;
  tier: CustomerTier;
  rank: CustomerRank;
  score: number;
  totalSpent: number;
  debtAmount: number;
  overdueDebtWarning: boolean;
  purchases: PurchaseHistory[];
  payments: PaymentHistory[];
  warranties: WarrantyHistory[];
  repairs: RepairHistory[];
  notes: CareNote[];
  reminders: CareTask[];
  usedVouchers: string[];
  opportunities: Opportunity[];
  vehicles: VehicleSerial[];
  quotations: QuotationSummary[];
  deposits: DepositSummary[];
  alerts: AlertItem[];
  timeline: TimelineEvent[];
  createdAt: string;
}

export interface Opportunity {
  id: number;
  customerId: number | null;
  leadId: number | null;
  expectedValue: number;
  expectedCloseDate: string | null;
  stage: OpportunityStage;
  probability: number;
  assignedTo: number | null;
  createdAt: string;
}

export interface PageResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
}
