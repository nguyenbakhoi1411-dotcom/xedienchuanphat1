// features/serials/types.ts
// Types cho quan ly serial xe dien

export type SerialStatus =
  | "IN_STOCK"
  | "RESERVED"
  | "SOLD"
  | "WARRANTY"
  | "SERVICE"
  | "REPAIRING"
  | "TRANSFERING"
  | "TRANSFERRED"
  | "RETURNED"
  | "DAMAGED"
  | "DEFECTIVE"
  | "RETURNED_TO_SUPPLIER";

export const SERIAL_STATUS_LABELS: Record<SerialStatus, string> = {
  IN_STOCK: "Có hàng",
  RESERVED: "Đang giữ",
  SOLD: "Đã bán",
  WARRANTY: "Bảo hành",
  SERVICE: "Đang sửa",
  REPAIRING: "Đang sửa chữa",
  TRANSFERING: "Đang chuyển kho",
  TRANSFERRED: "Đã chuyển kho",
  RETURNED: "Hoàn trả",
  DAMAGED: "Bị hư",
  DEFECTIVE: "Bị lỗi",
  RETURNED_TO_SUPPLIER: "Trả nhà cung cấp",
};

export const SERIAL_STATUS_COLORS: Record<SerialStatus, string> = {
  IN_STOCK: "bg-emerald-100 text-emerald-700 border-emerald-200",
  RESERVED: "bg-amber-100 text-amber-700 border-amber-200",
  SOLD: "bg-blue-100 text-blue-700 border-blue-200",
  WARRANTY: "bg-purple-100 text-purple-700 border-purple-200",
  SERVICE: "bg-orange-100 text-orange-700 border-orange-200",
  REPAIRING: "bg-orange-100 text-orange-700 border-orange-200",
  TRANSFERING: "bg-slate-100 text-slate-600 border-slate-200",
  TRANSFERRED: "bg-slate-100 text-slate-600 border-slate-200",
  RETURNED: "bg-rose-100 text-rose-700 border-rose-200",
  DAMAGED: "bg-red-100 text-red-700 border-red-200",
  DEFECTIVE: "bg-red-100 text-red-700 border-red-200",
  RETURNED_TO_SUPPLIER: "bg-gray-100 text-gray-600 border-gray-200",
};

export type ProductSerial = {
  id: number;
  productId: number;
  productName: string;
  serialNumber: string;
  branchId: number;
  warehouseId?: number | null;
  frameNumber?: string | null;
  engineNumber?: string | null;
  batterySerial?: string | null;
  motorSerial?: string | null;
  chargerNumber?: string | null;
  color?: string | null;
  version?: string | null;
  importDate?: string | null;
  supplierId?: number | null;
  purchaseCost?: number | null;
  status: SerialStatus;
  reservedOrderNo?: string | null;
  reservedCustomerId?: number | null;
  reservationUntil?: string | null;
  currentCustomerId?: number | null;
  soldDate?: string | null;
  warrantyStartDate?: string | null;
  warrantyEndDate?: string | null;
  lastServiceTicketNo?: string | null;
  lastServicedAt?: string | null;
  defectReason?: string | null;
  note?: string | null;
  createdAt: string;
};

export type SerialHistoryEntry = {
  id: number;
  serialId: number;
  action: string;
  oldStatus?: SerialStatus | null;
  newStatus?: SerialStatus | null;
  sourceDocumentType?: string | null;
  sourceDocumentId?: string | null;
  branchFromId?: number | null;
  branchToId?: number | null;
  warehouseFromId?: number | null;
  warehouseToId?: number | null;
  customerId?: number | null;
  createdBy: string;
  createdAt: string;
  note?: string | null;
};

export type CreateSerialPayload = {
  productId: number;
  serialNumber: string;
  branchId: number;
  warehouseId?: number;
  frameNumber?: string;
  engineNumber?: string;
  batterySerial?: string;
  motorSerial?: string;
  chargerNumber?: string;
  color?: string;
  version?: string;
  importDate?: string;
  supplierId?: number;
  purchaseCost?: number;
  note?: string;
};

export type UpdateSerialStatusPayload = {
  newStatus: SerialStatus;
  sourceDocumentType?: string;
  sourceDocumentId?: string;
  note?: string;
};

export type TransferSerialPayload = {
  toBranchId: number;
  toWarehouseId?: number;
  sourceDocumentType?: string;
  sourceDocumentId?: string;
  reason?: string;
};

export type SerialSearchParams = {
  keyword?: string;
  branchId?: number;
  warehouseId?: number;
  productId?: number;
  status?: SerialStatus;
  page?: number;
  pageSize?: number;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
