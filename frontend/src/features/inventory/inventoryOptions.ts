import type { InventoryTransactionType } from "./types";

export const branchOptions = [
  { value: 1, label: "Go Vap" },
  { value: 2, label: "Thu Duc" },
  { value: 3, label: "Quan 7" }
];

export const inventoryProductOptions = [
  { value: 1, label: "CP-S1 - Xe may dien CP S1" },
  { value: 2, label: "CP-CITY - Xe may dien CP City" },
  { value: 3, label: "PIN-LFP-72 - Binh ac quy LFP 72V" },
  { value: 4, label: "SAC-NHANH - Bo sac nhanh" }
];

export const transactionTypeOptions: Array<{ value: InventoryTransactionType; label: string }> = [
  { value: "IMPORT", label: "Nhap kho" },
  { value: "EXPORT", label: "Xuat kho" },
  { value: "TRANSFER_OUT", label: "Chuyen kho xuat" },
  { value: "TRANSFER_IN", label: "Chuyen kho nhap" },
  { value: "STOCKTAKE", label: "Kiem kho" },
  { value: "SALE", label: "Ban hang" },
  { value: "RETURN", label: "Tra hang" }
];

export function getTransactionTypeLabel(value: InventoryTransactionType) {
  return transactionTypeOptions.find((item) => item.value === value)?.label ?? value;
}
