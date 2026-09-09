export type SupplierStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type Supplier = {
  id: number;
  code: string;
  name: string;
  taxCode: string;
  phone: string;
  address: string;
  contactPerson: string;
  status: SupplierStatus;
  currentDebt?: number;
};

export type SupplierPayload = Omit<Supplier, "id">;

export type SupplierListParams = {
  keyword: string;
  page: number;
  pageSize: number;
};

export type PurchaseOrderItemPayload = {
  productId: number;
  quantity: number;
  unitCost: number;
};

export type PurchaseOrderPayload = {
  supplierId: number;
  branchId: number;
  purchaseDate: string;
  paidAmount: number;
  items: PurchaseOrderItemPayload[];
};

export type PurchaseOrderResponse = {
  id: number;
  purchaseOrderNo: string;
  supplierId: number;
  supplierName: string;
  branchId: number;
  purchaseDate: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
