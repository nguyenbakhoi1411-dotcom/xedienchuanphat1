"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { customerSourceOptions, customerTypeOptions } from "./customerOptions";
import { customerSchema, type CustomerFormValues } from "./schemas";
import type { Customer, CustomerPayload } from "./types";

type CustomerFormModalProps = {
  open: boolean;
  customer?: Customer | null;
  loading?: boolean;
  onSubmit: (payload: CustomerPayload) => void;
  onClose: () => void;
};

const defaultValues: CustomerFormValues = {
  customerCode: "",
  fullName: "",
  phone: "",
  email: "",
  address: "",
  type: "RETAIL",
  source: "WALK_IN",
  birthday: ""
};

export function CustomerFormModal({ open, customer, loading = false, onSubmit, onClose }: CustomerFormModalProps) {
  const form = useForm<CustomerFormValues>({ resolver: zodResolver(customerSchema), defaultValues });

  useEffect(() => {
    if (open) form.reset(customer ? toFormValues(customer) : defaultValues);
  }, [customer, form, open]);

  return (
    <Modal
      open={open}
      title={customer ? "Sua khach hang" : "Them khach hang"}
      description="Cap nhat thong tin lien he, phan loai va nguon khach."
      size="lg"
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Ma khach hang" error={form.formState.errors.customerCode?.message}>
            <input className={inputClass} {...form.register("customerCode")} />
          </Field>
          <Field label="Ho ten" error={form.formState.errors.fullName?.message}>
            <input className={inputClass} {...form.register("fullName")} />
          </Field>
          <Field label="So dien thoai" error={form.formState.errors.phone?.message}>
            <input className={inputClass} {...form.register("phone")} />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <input className={inputClass} {...form.register("email")} />
          </Field>
          <Field label="Loai khach" error={form.formState.errors.type?.message}>
            <select className={inputClass} {...form.register("type")}>
              {customerTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </Field>
          <Field label="Nguon khach" error={form.formState.errors.source?.message}>
            <select className={inputClass} {...form.register("source")}>
              {customerSourceOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </Field>
          <Field label="Ngay sinh" error={form.formState.errors.birthday?.message}>
            <input className={inputClass} type="date" {...form.register("birthday")} />
          </Field>
        </div>
        <Field label="Dia chi" error={form.formState.errors.address?.message}>
          <textarea className={`${inputClass} min-h-24 py-2`} {...form.register("address")} />
        </Field>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Huy</Button>
          <Button type="submit" disabled={loading}>{loading ? "Dang luu" : "Luu khach hang"}</Button>
        </div>
      </form>
    </Modal>
  );
}

const inputClass = "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function toFormValues(customer: Customer): CustomerFormValues {
  return {
    customerCode: customer.customerCode,
    fullName: customer.fullName,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    type: customer.type,
    source: customer.source,
    birthday: customer.birthday
  };
}
