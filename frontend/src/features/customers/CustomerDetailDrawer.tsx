"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { getCustomerSourceLabel, getCustomerTypeLabel } from "./customerOptions";
import { careNoteSchema, careReminderSchema, type CareNoteFormValues, type CareReminderFormValues } from "./schemas";
import type { CustomerDetail } from "./types";

type DetailTab = "info" | "purchases" | "payments" | "warranty" | "notes" | "reminders" | "sales";

type CustomerDetailDrawerProps = {
  open: boolean;
  customer?: CustomerDetail;
  loading: boolean;
  noteLoading?: boolean;
  reminderLoading?: boolean;
  onClose: () => void;
  onAddNote: (values: CareNoteFormValues) => void;
  onAddReminder: (values: CareReminderFormValues) => void;
};

const tabs: Array<{ value: DetailTab; label: string }> = [
  { value: "info", label: "Thong tin" },
  { value: "purchases", label: "Lich su mua hang" },
  { value: "payments", label: "Thanh toán & no" },
  { value: "warranty", label: "Bao hanh/sua chua" },
  { value: "notes", label: "Ghi chu" },
  { value: "reminders", label: "Nhac lich" },
  { value: "sales", label: "Voucher/co hoi" }
];

export function CustomerDetailDrawer({
  open,
  customer,
  loading,
  noteLoading = false,
  reminderLoading = false,
  onClose,
  onAddNote,
  onAddReminder
}: CustomerDetailDrawerProps) {
  const [tab, setTab] = useState<DetailTab>("info");
  const noteForm = useForm<CareNoteFormValues>({ resolver: zodResolver(careNoteSchema), defaultValues: { content: "" } });
  const reminderForm = useForm<CareReminderFormValues>({ resolver: zodResolver(careReminderSchema), defaultValues: { reminderDate: "", title: "", content: "" } });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/45">
      <aside className="ml-auto flex h-full w-full max-w-4xl flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text">{customer?.fullName ?? "Chi tiet khach hang"}</h2>
            <p className="mt-1 text-sm text-slate-500">{customer?.phone ?? "Đang tải dữ liệu"}</p>
          </div>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-orange-50 hover:text-primary" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((item) => (
              <button
                type="button"
                key={item.value}
                className={cn("h-9 shrink-0 rounded-lg px-3 text-sm font-medium", tab === item.value ? "bg-primary text-white" : "text-slate-600 hover:bg-orange-50 hover:text-primary")}
                onClick={() => setTab(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-14" />)}</div>
          ) : !customer ? (
            <EmptyState title="Khong tai duoc khach hang" />
          ) : (
            <>
              {tab === "info" && <InfoTab customer={customer} />}
              {tab === "purchases" && <PurchaseTab customer={customer} />}
              {tab === "payments" && <PaymentTab customer={customer} />}
              {tab === "warranty" && <WarrantyTab customer={customer} />}
              {tab === "notes" && (
                <NoteTab
                  customer={customer}
                  loading={noteLoading}
                  form={noteForm}
                  onSubmit={(values) => {
                    onAddNote(values);
                    noteForm.reset({ content: "" });
                  }}
                />
              )}
              {tab === "reminders" && (
                <ReminderTab
                  customer={customer}
                  loading={reminderLoading}
                  form={reminderForm}
                  onSubmit={(values) => {
                    onAddReminder(values);
                    reminderForm.reset({ reminderDate: "", title: "", content: "" });
                  }}
                />
              )}
              {tab === "sales" && <SalesTab customer={customer} />}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function InfoTab({ customer }: { customer: CustomerDetail }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <InfoCard label="Loai khach" value={getCustomerTypeLabel(customer.type)} />
      <InfoCard label="Nguon khach" value={getCustomerSourceLabel(customer.source)} />
      <InfoCard label="Tong da mua" value={formatCurrency(customer.totalSpent)} />
      <InfoCard label="Cong no" value={formatCurrency(customer.debtAmount)} />
      <InfoCard label="Canh bao no" value={customer.overdueDebtWarning ? "Co cong no can xu ly" : "Khong"} />
      <InfoCard label="Nhan vien phu trach" value={customer.assignedTo ? `#${customer.assignedTo}` : "-"} />
      <InfoCard label="Email" value={customer.email || "-"} />
      <InfoCard label="Dia chi" value={customer.address} />
    </div>
  );
}

function PurchaseTab({ customer }: { customer: CustomerDetail }) {
  if (customer.purchases.length === 0) return <EmptyState title="Chua co lich su mua hang" />;
  return <SimpleTable headers={["Hóa đơn", "Ngay", "San pham", "Serial", "So tien", "Trang thai"]} rows={customer.purchases.map((item) => [item.invoiceNo ?? "-", item.purchaseDate ?? "-", item.productName ?? "-", item.serialNumber ?? "-", formatCurrency(item.amount), item.paymentStatus ?? "-"])} />;
}

function WarrantyTab({ customer }: { customer: CustomerDetail }) {
  const warrantyRows = customer.warranties.map((item) => [item.ticketNo, item.createdAt, item.serialNumber, item.issue, item.status]);
  const repairRows = (customer.repairs ?? []).map((item) => [`SC-${item.id}`, item.createdAt.slice(0, 10), item.serialNumber, item.issueDescription, item.status]);
  const rows = [...warrantyRows, ...repairRows];
  if (rows.length === 0) return <EmptyState title="Chua co lich su bao hanh/sua chua" />;
  return <SimpleTable headers={["So phieu", "Ngay", "Serial", "Noi dung", "Trang thai"]} rows={rows} />;
}

function PaymentTab({ customer }: { customer: CustomerDetail }) {
  const rows = (customer.payments ?? []).map((item) => [item.orderNo, item.paymentDate, item.paymentMethod, formatCurrency(item.amount), item.referenceNo ?? "-"]);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Tong chi tieu" value={formatCurrency(customer.totalSpent)} />
        <InfoCard label="Cong no hien tai" value={formatCurrency(customer.debtAmount)} />
        <InfoCard label="Canh bao" value={customer.overdueDebtWarning ? "Khach co no qua han/can thu" : "Binh thuong"} />
      </div>
      {rows.length === 0 ? <EmptyState title="Chua co lich su thanh toan" /> : <SimpleTable headers={["Đơn hàng", "Ngay", "Phuong thuc", "So tien", "Tham chieu"]} rows={rows} />}
    </div>
  );
}

function NoteTab({ customer, form, loading, onSubmit }: { customer: CustomerDetail; form: ReturnType<typeof useForm<CareNoteFormValues>>; loading: boolean; onSubmit: (values: CareNoteFormValues) => void }) {
  return (
    <div className="space-y-4">
      <form className="rounded-lg border border-border p-4" onSubmit={form.handleSubmit(onSubmit)}>
        <textarea className={inputClass} placeholder="Noi dung cham soc khach hang" {...form.register("content")} />
        {form.formState.errors.content && <p className="mt-1 text-xs text-red-600">{form.formState.errors.content.message}</p>}
        <Button className="mt-3" type="submit" disabled={loading}>{loading ? "Dang luu" : "Them ghi chu"}</Button>
      </form>
      {customer.notes.length === 0 ? <EmptyState title="Chua co ghi chu" /> : customer.notes.map((note) => (
        <div key={note.id} className="rounded-lg border border-border p-4">
          <p className="text-sm text-text">{note.content}</p>
          <p className="mt-2 text-xs text-slate-500">{note.noteDate} - {note.createdBy}</p>
        </div>
      ))}
    </div>
  );
}

function ReminderTab({ customer, form, loading, onSubmit }: { customer: CustomerDetail; form: ReturnType<typeof useForm<CareReminderFormValues>>; loading: boolean; onSubmit: (values: CareReminderFormValues) => void }) {
  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
        <input className={inputLineClass} type="date" {...form.register("reminderDate")} />
        <input className={inputLineClass} placeholder="Tieu de" {...form.register("title")} />
        <textarea className={`${inputLineClass} min-h-20 py-2 md:col-span-2`} placeholder="Noi dung nhac lich" {...form.register("content")} />
        <Button className="md:col-span-2" type="submit" disabled={loading}>{loading ? "Dang luu" : "Tao lich nhac"}</Button>
      </form>
      {customer.reminders.length === 0 ? <EmptyState title="Chua co lich nhac" /> : customer.reminders.map((reminder) => (
        <div key={reminder.id} className="rounded-lg border border-border p-4">
          <p className="font-semibold text-text">{reminder.title}</p>
          <p className="mt-1 text-sm text-slate-600">{reminder.content}</p>
          <p className="mt-2 text-xs text-slate-500">{reminder.reminderDate} - {reminder.status}</p>
        </div>
      ))}
    </div>
  );
}

function SalesTab({ customer }: { customer: CustomerDetail }) {
  const voucherRows = (customer.usedVouchers ?? []).map((code) => [code]);
  const opportunityRows = (customer.opportunities ?? []).map((item) => [`#${item.id}`, formatCurrency(item.expectedValue), item.expectedCloseDate ?? "-", item.stage, `${item.probability}%`]);
  return (
    <div className="space-y-4">
      {voucherRows.length === 0 ? <EmptyState title="Chua co voucher da dung" /> : <SimpleTable headers={["Voucher da dung"]} rows={voucherRows} />}
      {opportunityRows.length === 0 ? <EmptyState title="Chua co co hoi ban hang" /> : <SimpleTable headers={["Ma", "Gia tri", "Ngay dong", "Giai doan", "Xac suat"]} rows={opportunityRows} />}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 font-semibold text-text">{value}</p></div>;
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-background text-xs uppercase text-slate-500"><tr>{headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 text-slate-700">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

const inputClass = "min-h-24 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
const inputLineClass = "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
