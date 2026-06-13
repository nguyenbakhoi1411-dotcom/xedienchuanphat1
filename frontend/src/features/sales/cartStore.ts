"use client";

import { create } from "zustand";
import type { CartItem, PaymentMethod, PaymentPayload, PaymentStatus, PosCustomer, PosProduct } from "./types";

type CartState = {
  customer: PosCustomer | null;
  items: CartItem[];
  payment: PaymentPayload;
  setCustomer: (customer: PosCustomer) => void;
  addProduct: (product: PosProduct, serialNumber?: string) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  setSerials: (productId: number, serials: string[]) => void;
  setPayment: (payment: Partial<PaymentPayload>) => void;
  clearCart: () => void;
};

const defaultPayment: PaymentPayload = {
  method: "CASH",
  cashAmount: 0,
  bankAmount: 0,
  installmentAmount: 0,
  voucherCode: "",
  discountAmount: 0
};

export const useCartStore = create<CartState>((set) => ({
  customer: null,
  items: [],
  payment: defaultPayment,
  setCustomer: (customer) => set({ customer }),
  addProduct: (product, serialNumber) =>
    set((state) => {
      const exists = state.items.find((item) => item.productId === product.id);
      if (exists) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: product.category === "ELECTRIC_MOTORBIKE" ? item.quantity : item.quantity + 1,
                  serialOptions: product.serials,
                  selectedSerials: serialNumber
                    ? Array.from(new Set([...item.selectedSerials, serialNumber]))
                    : item.selectedSerials
                }
              : item
          )
        };
      }
      const selectedSerials = serialNumber ? [serialNumber] : [];
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            productCode: product.productCode,
            productName: product.productName,
            category: product.category,
            unitPrice: product.salePrice,
            listPrice: product.listPrice,
            pricePolicyName: product.pricePolicyName,
            policyDiscountAmount: product.policyDiscountAmount,
            quantity: product.category === "ELECTRIC_MOTORBIKE" ? Math.max(1, selectedSerials.length) : 1,
            selectedSerials,
            serialOptions: product.serials
          }
        ]
      };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: item.category === "ELECTRIC_MOTORBIKE" ? item.selectedSerials.length : Math.max(1, quantity)
            }
          : item
      )
    })),
  removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
  setSerials: (productId, serials) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? { ...item, selectedSerials: serials, quantity: serials.length }
          : item
      )
    })),
  setPayment: (payment) => set((state) => ({ payment: { ...state.payment, ...payment } })),
  clearCart: () => set({ customer: null, items: [], payment: defaultPayment })
}));

export function calculateSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function calculatePaidAmount(payment: PaymentPayload) {
  return payment.cashAmount + payment.bankAmount;
}

export function calculatePaymentStatus(total: number, payment: PaymentPayload): PaymentStatus {
  if (payment.method === "INSTALLMENT") return "PARTIAL";
  const paid = calculatePaidAmount(payment);
  if (paid <= 0) return "UNPAID";
  if (paid >= total) return "PAID";
  return "PARTIAL";
}

export function normalizePaymentForMethod(payment: PaymentPayload, method: PaymentMethod, total: number): PaymentPayload {
  if (method === "CASH") return { ...payment, method, cashAmount: total, bankAmount: 0, installmentAmount: 0 };
  if (method === "BANK_TRANSFER") return { ...payment, method, cashAmount: 0, bankAmount: total, installmentAmount: 0 };
  if (method === "INSTALLMENT") return { ...payment, method, cashAmount: 0, bankAmount: 0, installmentAmount: total };
  return { ...payment, method };
}
