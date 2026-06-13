export type ServiceTicketStatus =
  | "CREATED" | "ASSIGNED" | "IN_PROGRESS"
  | "RECEIVED" | "CHECKING" | "DIAGNOSING" | "QUOTED" | "WAITING_CUSTOMER_APPROVAL" | "WAITING_PARTS"
  | "REPAIRING" | "QC_CHECK" | "COMPLETED" | "RETURNED" | "CANCELLED";

export type ServiceItemType = "PART" | "LABOR" | "OTHER";
export type ServiceType = "WARRANTY" | "PAID_REPAIR" | "MAINTENANCE";
export type ComponentType =
  | "FRAME" | "BATTERY" | "MOTOR" | "CHARGER" | "CONTROLLER" | "DISPLAY"
  | "BRAKE" | "LIGHT" | "TIRE" | "ACCESSORY";

export type WarrantyComponent = {
  id: number;
  componentType: ComponentType;
  startDate: string;
  endDate: string;
  warrantyKm?: number;
  conditions?: string;
  exclusions?: string;
  status: "ACTIVE" | "EXPIRED" | "VOIDED";
  valid: boolean;
};

export type WarrantyCheck = {
  serialNumber: string;
  vehicleId: number;
  customerName: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "VOIDED";
  valid: boolean;
  policyId?: number;
  batteryEndDate?: string;
  motorEndDate?: string;
  chargerEndDate?: string;
  mainPartsWarranty?: string;
  components?: WarrantyComponent[];
};

export type ServiceTicketItem = {
  id: number;
  type: ServiceItemType;
  name: string;
  productId?: number;
  warehouseId?: number;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  isWarrantyCovered?: boolean;
  componentType?: ComponentType;
  lineTotal: number;
};

export type ServiceTimelineEvent = {
  id: number;
  eventTime: string;
  title: string;
  description: string;
};

export type ServiceTicket = {
  id: number;
  ticketNo: string;
  vehicleId: number;
  branchId?: number;
  serialNumber: string;
  customerName: string;
  phone: string;
  customerId?: number;
  issueDescription: string;
  customerReportedIssue?: string;
  receivedDate?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  beforeRepairImages?: string;
  faultImages?: string;
  afterRepairImages?: string;
  documentFiles?: string;
  serviceType: ServiceType;
  status: ServiceTicketStatus;
  technicianUsername?: string;
  diagnosisNote?: string;
  predictedCause?: string;
  technicianDiagnosis?: string;
  componentType?: ComponentType;
  warrantyRepair: boolean;
  laborCost: number;
  partsCost: number;
  warrantyCost: number;
  customerPayAmount: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  items: ServiceTicketItem[];
  timeline: ServiceTimelineEvent[];
};

export type TicketListParams = {
  keyword: string;
  status: "ALL" | ServiceTicketStatus;
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

export type CreateTicketPayload = {
  vehicleId: number;
  serialNumber: string;
  customerId?: number;
  branchId?: number;
  customerName: string;
  phone: string;
  issueDescription: string;
  customerReportedIssue?: string;
  receivedDate?: string;
  expectedReturnDate?: string;
  beforeRepairImages?: string;
  vehicleReceivedImages?: string;
  faultImages?: string;
  afterRepairImages?: string;
  documentFiles?: string;
  serviceType?: ServiceType;
  warrantyRepair?: boolean;
};

export type UpdateStatusPayload = {
  status: ServiceTicketStatus;
};

export type AssignTechnicianPayload = {
  technicianUsername: string;
};

export type AddTicketItemPayload = {
  type: ServiceItemType;
  name: string;
  productId?: number;
  warehouseId?: number;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  isWarrantyCovered?: boolean;
  componentType?: ComponentType;
};

export type ServiceReport = {
  ticketsByStatus: Array<{ status: ServiceTicketStatus; total: number }>;
  averageHandlingHours: number;
  commonIssues: Array<{ issue: string; total: number }>;
  topTechnicians: Array<{ technicianUsername: string; total: number }>;
  warrantyCost: number;
  repairRevenue: number;
  topFaultyModels: Array<{ issue: string; total: number }>;
  topFaultyComponents: Array<{ issue: string; total: number }>;
  topFaultySuppliers: Array<{ issue: string; total: number }>;
  warrantyCostByMonth: Array<{ issue: string; total: number }>;
  reworkRate: number;
};
