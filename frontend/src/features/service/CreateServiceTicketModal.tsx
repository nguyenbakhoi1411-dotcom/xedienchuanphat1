"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createTicketSchema, type CreateTicketFormValues } from "./schemas";
import { serviceTypeOptions } from "./serviceOptions";
import type { CreateTicketPayload } from "./types";

export function CreateServiceTicketModal({
  open,
  loading,
  onSubmit,
  onClose
}: {
  open: boolean;
  loading: boolean;
  onSubmit: (payload: CreateTicketPayload) => void;
  onClose: () => void;
}) {
  const form = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { vehicleId: 0, serialNumber: "", customerName: "", phone: "", issueDescription: "", serviceType: "WARRANTY" }
  });

  useEffect(() => {
    if (open) form.reset({ vehicleId: 0, serialNumber: "", customerName: "", phone: "", issueDescription: "", serviceType: "WARRANTY" });
  }, [form, open]);

  return (
    <Modal open={open} title="Tao phieu sua chua" description="Tiep nhan yeu cau bao hanh/sua chua cua khach hang." size="lg" onClose={onClose}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Ma xe" error={form.formState.errors.vehicleId?.message}>
            <input className={inputClass} type="number" {...form.register("vehicleId")} />
          </Field>
          <Field label="Serial xe" error={form.formState.errors.serialNumber?.message}>
            <input className={inputClass} {...form.register("serialNumber")} />
          </Field>
          <Field label="Khach hang" error={form.formState.errors.customerName?.message}>
            <input className={inputClass} {...form.register("customerName")} />
          </Field>
          <Field label="So dien thoai" error={form.formState.errors.phone?.message}>
            <input className={inputClass} {...form.register("phone")} />
          </Field>
          <Field label="Loai dich vu">
            <select className={inputClass} {...form.register("serviceType")}>
              {serviceTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </Field>
          <Field label="Ngay hen tra">
            <input className={inputClass} type="date" {...form.register("expectedReturnDate")} />
          </Field>
        </div>
        <Field label="Mo ta su co" error={form.formState.errors.issueDescription?.message}>
          <textarea className={`${inputClass} min-h-24 py-2`} {...form.register("issueDescription")} />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Anh xe khi nhan">
            <input className={inputClass} placeholder="URL anh, cach nhau bang dau phay" {...form.register("beforeRepairImages")} />
          </Field>
          <Field label="Anh loi">
            <input className={inputClass} placeholder="URL anh loi" {...form.register("faultImages")} />
          </Field>
          <Field label="File bien ban">
            <input className={inputClass} placeholder="URL file bien ban" {...form.register("documentFiles")} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Huy</Button>
          <Button type="submit" disabled={loading}>{loading ? "Dang tao" : "Tao phieu"}</Button>
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
