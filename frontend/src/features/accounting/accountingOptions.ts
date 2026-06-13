import type { PaymentMethod, VoucherStatus } from "./types";

export const voucherStatusOptions: Array<{ value: VoucherStatus; label: string }> = [
  { value: "POSTED", label: "Da ghi so" },
  { value: "DRAFT", label: "Nhap" },
  { value: "CANCELLED", label: "Da huy" }
];

export const paymentMethodOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: "CASH", label: "Tien mat" },
  { value: "BANK_TRANSFER", label: "Chuyen khoan" }
];

export function getVoucherStatusLabel(value: VoucherStatus) {
  return voucherStatusOptions.find((item) => item.value === value)?.label ?? value;
}

export function getPaymentMethodLabel(value: PaymentMethod) {
  return paymentMethodOptions.find((item) => item.value === value)?.label ?? value;
}
