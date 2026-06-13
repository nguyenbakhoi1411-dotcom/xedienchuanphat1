"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Supplier, SupplierPayload, SupplierStatus } from "./types";

type SupplierFormModalProps = {
  open: boolean;
  supplier: Supplier | null;
  loading?: boolean;
  onSubmit: (payload: SupplierPayload) => void;
  onClose: () => void;
};

const emptyForm: SupplierPayload = {
  code: "",
  name: "",
  taxCode: "",
  phone: "",
  address: "",
  contactPerson: "",
  status: "ACTIVE"
};

export function SupplierFormModal({ open, supplier, loading = false, onSubmit, onClose }: SupplierFormModalProps) {
  const [form, setForm] = useState<SupplierPayload>(emptyForm);

  useEffect(() => {
    if (!open) return;
    setForm(supplier ? { code: supplier.code, name: supplier.name, taxCode: supplier.taxCode, phone: supplier.phone, address: supplier.address, contactPerson: supplier.contactPerson, status: supplier.status } : emptyForm);
  }, [open, supplier]);

  return (
    <Modal open={open} title={supplier ? "Cap nhat nha cung cap" : "Them nha cung cap"} size="lg" onClose={onClose}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            ...form,
            code: form.code.trim().toUpperCase(),
            name: form.name.trim(),
            taxCode: form.taxCode.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            contactPerson: form.contactPerson.trim()
          });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ma nha cung cap">
            <input required value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100" />
          </Field>
          <Field label="Ma so thue">
            <input value={form.taxCode} onChange={(event) => setForm((current) => ({ ...current, taxCode: event.target.value }))} className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100" />
          </Field>
        </div>
        <Field label="Ten nha cung cap">
          <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Nguoi lien he">
            <input value={form.contactPerson} onChange={(event) => setForm((current) => ({ ...current, contactPerson: event.target.value }))} className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100" />
          </Field>
          <Field label="Dien thoai">
            <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100" />
          </Field>
          <Field label="Trang thai">
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as SupplierStatus }))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100">
              <option value="ACTIVE">Hoat dong</option>
              <option value="INACTIVE">Tam ngung</option>
            </select>
          </Field>
        </div>
        <Field label="Dia chi">
          <input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100" />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Huy</Button>
          <Button type="submit" disabled={loading}>{loading ? "Dang luu" : "Luu nha cung cap"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
