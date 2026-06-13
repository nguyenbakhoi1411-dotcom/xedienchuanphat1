import type { ProductCategory, ProductStatus } from "./types";

export const categoryOptions: Array<{ value: ProductCategory; label: string }> = [
  { value: "ELECTRIC_MOTORBIKE", label: "Xe may dien" },
  { value: "BATTERY", label: "Pin / Ac quy" },
  { value: "CHARGER", label: "Bo sac" },
  { value: "SPARE_PART", label: "Phu tung" }
];

export const statusOptions: Array<{ value: ProductStatus; label: string }> = [
  { value: "ACTIVE", label: "Dang ban" },
  { value: "INACTIVE", label: "Tam ngung" },
  { value: "DISCONTINUED", label: "Ngung kinh doanh" },
  { value: "DELETED", label: "Da xoa" }
];

export function getCategoryLabel(value: ProductCategory) {
  return categoryOptions.find((item) => item.value === value)?.label ?? value;
}

export function getStatusLabel(value: ProductStatus) {
  return statusOptions.find((item) => item.value === value)?.label ?? value;
}
