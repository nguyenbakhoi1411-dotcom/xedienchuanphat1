export type ProductStatus = "ACTIVE" | "INACTIVE" | "DISCONTINUED" | "DELETED";

export type ProductCategory = "ELECTRIC_MOTORBIKE" | "BATTERY" | "CHARGER" | "SPARE_PART";

export type Product = {
  id: number;
  productCode: string;
  productName: string;
  category: ProductCategory;
  brand: string;
  model: string;
  color: string;
  batteryCapacity: string;
  motorPower: string;
  importPrice: number;
  salePrice: number;
  warrantyMonths: number;
  imageUrl: string;
  description: string;
  status: ProductStatus;
  serials: ProductSerial[];
  createdAt: string;
  updatedAt: string;
};

export type ProductEffectivePrice = {
  productId: number;
  branchId?: number | null;
  listPrice: number;
  effectivePrice: number;
  policyDiscountAmount: number;
  policyId?: number | null;
  policyCode?: string | null;
  policyName?: string | null;
  priceChangeType?: string | null;
};

export type ProductPriceHistory = {
  id: number;
  productId: number;
  oldBasePrice?: number | null;
  newBasePrice?: number | null;
  oldSellingPrice?: number | null;
  newSellingPrice?: number | null;
  reason?: string | null;
  sourceType: string;
  sourceId?: number | null;
  changedBy?: string | null;
  changedAt?: string | null;
  branchId?: number | null;
  note?: string | null;
};

export type ProductSerial = {
  id: number;
  serialNumber: string;
  status: "IN_STOCK" | "SOLD" | "WARRANTY" | "IN_SERVICE";
  branchName: string;
};

export type ProductListParams = {
  keyword: string;
  category: "ALL" | ProductCategory;
  status: "ALL" | ProductStatus;
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

export type ProductPayload = Omit<Product, "id" | "serials" | "createdAt" | "updatedAt">;
