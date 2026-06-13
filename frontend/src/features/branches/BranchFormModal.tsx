"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Branch, BranchPayload, BranchStatus } from "./types";

type BranchFormModalProps = {
  open: boolean;
  branch: Branch | null;
  loading?: boolean;
  onSubmit: (payload: BranchPayload) => void;
  onClose: () => void;
};

const emptyForm: BranchPayload = {
  code: "",
  name: "",
  address: "",
  phone: "",
  status: "ACTIVE"
};

export function BranchFormModal({ open, branch, loading = false, onSubmit, onClose }: BranchFormModalProps) {
  const [form, setForm] = useState<BranchPayload>(emptyForm);

  useEffect(() => {
    if (!open) return;
    setForm(branch ? { code: branch.code, name: branch.name, address: branch.address, phone: branch.phone, status: branch.status } : emptyForm);
  }, [branch, open]);

  return (
    <Modal
      open={open}
      title={branch ? "Cap nhat chi nhanh" : "Them chi nhanh"}
      description="Quan ly thong tin van hanh va trang thai cua tung chi nhanh."
      size="md"
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            ...form,
            code: form.code.trim().toUpperCase(),
            name: form.name.trim(),
            address: form.address.trim(),
            phone: form.phone.trim()
          });
        }}
      >
        <Field label="Ma chi nhanh">
          <input
            required
            value={form.code}
            onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
            className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
            placeholder="CN-GV"
          />
        </Field>

        <Field label="Ten chi nhanh">
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
            placeholder="Chi nhanh Go Vap"
          />
        </Field>

        <Field label="Dia chi">
          <input
            required
            value={form.address}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
            className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
            placeholder="123 Quang Trung, Go Vap, TP.HCM"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="So dien thoai">
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
              placeholder="02873000001"
            />
          </Field>
          <Field label="Trang thai">
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as BranchStatus }))}
              className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
            >
              <option value="ACTIVE">Dang hoat dong</option>
              <option value="INACTIVE">Tam ngung</option>
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Huy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Dang luu" : "Luu chi nhanh"}
          </Button>
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
