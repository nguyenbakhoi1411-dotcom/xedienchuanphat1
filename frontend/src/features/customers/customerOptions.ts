import type { CustomerSource, CustomerType } from "./types";

export const customerTypeOptions: Array<{ value: CustomerType; label: string }> = [
  { value: "NEW", label: "Moi" },
  { value: "NORMAL", label: "Thong thuong" },
  { value: "RETAIL", label: "Ban le" },
  { value: "VIP", label: "VIP" },
  { value: "WHOLESALE", label: "Dai ly" },
  { value: "POTENTIAL", label: "Tiem nang" },
  { value: "HIGH_RISK_DEBT", label: "No rui ro cao" }
];

export const customerSourceOptions: Array<{ value: CustomerSource; label: string }> = [
  { value: "WALK_IN", label: "Tai cua hang" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "ZALO", label: "Zalo" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "WEBSITE", label: "Website" },
  { value: "REFERRAL", label: "Gioi thieu" }
];

export function getCustomerTypeLabel(value: CustomerType) {
  return customerTypeOptions.find((item) => item.value === value)?.label ?? value;
}

export function getCustomerSourceLabel(value: CustomerSource) {
  return customerSourceOptions.find((item) => item.value === value)?.label ?? value;
}
