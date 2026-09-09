"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { customersApi } from "@/features/customers/api";
import { suppliersApi } from "@/features/suppliers/api";
import { paymentMethodOptions } from "./accountingOptions";
import { accountingApi } from "./api";
import { paymentSchema, receiptSchema, type PaymentFormValues, type ReceiptFormValues } from "./schemas";
import type { CreatePaymentPayload, CreateReceiptPayload, VoucherType } from "./types";

type VoucherValues = ReceiptFormValues & PaymentFormValues;
type SelectOption = { id: number; name: string; secondary?: string };

export function VoucherFormModal({
  open,
  type,
  loading,
  onClose,
  onCreateReceipt,
  onCreatePayment
}: {
  open: boolean;
  type: VoucherType;
  loading: boolean;
  onClose: () => void;
  onCreateReceipt: (payload: CreateReceiptPayload) => void;
  onCreatePayment: (payload: CreatePaymentPayload) => void;
}) {
  const isReceipt = type === "RECEIPT";
  const form = useForm<VoucherValues>({
    resolver: zodResolver(isReceipt ? receiptSchema : paymentSchema),
    defaultValues: getDefaultValues(type)
  });
  const paymentMethod = form.watch("paymentMethod");
  const [customers, setCustomers] = useState<SelectOption[]>([]);
  const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
  const [bankAccounts, setBankAccounts] = useState<SelectOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    if (open) form.reset(getDefaultValues(type));
  }, [form, open, type]);

  useEffect(() => {
    if (!open) return;
    setOptionsLoading(true);
    Promise.all([
      customersApi.list({ keyword: "", type: "ALL", source: "ALL", page: 1, pageSize: 100 }),
      suppliersApi.list({ keyword: "", page: 1, pageSize: 100 }),
      accountingApi.bankAccounts()
    ])
      .then(([customerPage, supplierPage, bankAccountItems]) => {
        setCustomers(customerPage.items.map((item) => ({ id: item.id, name: item.fullName, secondary: item.phone })));
        setSuppliers(supplierPage.items.map((item) => ({ id: item.id, name: item.name, secondary: item.phone })));
        setBankAccounts(bankAccountItems.map((item) => ({ id: item.id, name: `${item.bankName} - ${item.accountNumber}`, secondary: item.accountHolder })));
      })
      .finally(() => setOptionsLoading(false));
  }, [open]);

  function submit(values: VoucherValues) {
    if (isReceipt) {
      onCreateReceipt({
        voucherNo: values.voucherNo,
        receiptDate: values.receiptDate,
        customerId: values.customerId,
        customerName: values.customerName,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        bankAccountId: values.bankAccountId,
        reason: values.reason
      });
      return;
    }
    onCreatePayment({
      voucherNo: values.voucherNo,
      paymentDate: values.paymentDate,
      supplierId: values.supplierId,
      supplierName: values.supplierName,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      bankAccountId: values.bankAccountId,
      reason: values.reason
    });
  }

  return (
    <Modal open={open} title={isReceipt ? "Tao phieu thu" : "Tao phieu chi"} description="Ghi nhan dong tien va cong no lien quan." size="md" onClose={onClose}>
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
        <Field label="So phieu" error={form.formState.errors.voucherNo?.message}>
          <input className={inputClass} {...form.register("voucherNo")} />
        </Field>
        <Field label={isReceipt ? "Ngay thu" : "Ngay chi"} error={(form.formState.errors.receiptDate ?? form.formState.errors.paymentDate)?.message}>
          <input className={inputClass} type="date" {...form.register(isReceipt ? "receiptDate" : "paymentDate")} />
        </Field>
        <Field label={isReceipt ? "Khach hang" : "Nha cung cap"} error={(form.formState.errors.customerId ?? form.formState.errors.supplierId ?? form.formState.errors.customerName ?? form.formState.errors.supplierName)?.message}>
          <select
            className={inputClass}
            disabled={optionsLoading}
            {...form.register(isReceipt ? "customerId" : "supplierId", {
              onChange: (event) => {
                const selectedId = Number(event.target.value);
                const selected = (isReceipt ? customers : suppliers).find((item) => item.id === selectedId);
                form.setValue(isReceipt ? "customerName" : "supplierName", selected?.name ?? "", { shouldValidate: true });
              }
            })}
          >
            <option value="">{optionsLoading ? "Đang tải dữ liệu" : isReceipt ? "Chon khach hang" : "Chon nha cung cap"}</option>
            {(isReceipt ? customers : suppliers).map((item) => (
              <option key={item.id} value={item.id}>{item.name}{item.secondary ? ` - ${item.secondary}` : ""}</option>
            ))}
          </select>
        </Field>
        <Field label="So tien" error={form.formState.errors.amount?.message}>
          <input className={inputClass} type="number" {...form.register("amount")} />
        </Field>
        <Field label="Phuong thuc" error={form.formState.errors.paymentMethod?.message}>
          <select className={inputClass} {...form.register("paymentMethod")}>
            {paymentMethodOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </Field>
        {paymentMethod === "BANK_TRANSFER" && (
          <Field label="Tai khoan ngan hang" error={form.formState.errors.bankAccountId?.message}>
            <select className={inputClass} disabled={optionsLoading} {...form.register("bankAccountId")}>
              <option value="">{optionsLoading ? "Đang tải dữ liệu" : "Chon tai khoan"}</option>
              {bankAccounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </Field>
        )}
        {paymentMethod === "CASH" && (
          <Field label="Quy tien mat">
            <input className={inputClass} value="Quy tien mat mac dinh" disabled />
          </Field>
        )}
        <Field label="Ly do" error={form.formState.errors.reason?.message}>
          <textarea className={`${inputClass} min-h-24 py-2`} {...form.register("reason")} />
        </Field>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Huy</Button>
          <Button type="submit" disabled={loading}>{loading ? "Dang luu" : "Luu chung tu"}</Button>
        </div>
      </form>
    </Modal>
  );
}

const inputClass = "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function getDefaultValues(type: VoucherType): VoucherValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    voucherNo: `${type === "RECEIPT" ? "PT" : "PC"}-${Date.now().toString().slice(-6)}`,
    receiptDate: today,
    paymentDate: today,
    customerId: 0,
    supplierId: 0,
    customerName: "",
    supplierName: "",
    amount: 0,
    paymentMethod: "CASH",
    bankAccountId: undefined,
    reason: ""
  };
}
