"use client";

import { CalendarCheck, Check, ChevronLeft, ChevronRight, Plus, RotateCcw } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCreateReminder, useMarkReminderDone, useReminders } from "@/features/notifications/hooks";
import type { Reminder, ReminderStatus, ReminderType } from "@/features/notifications/types";

const typeLabels: Record<ReminderType, string> = {
  CALL_CUSTOMER: "Goi khach",
  MAINTENANCE: "Bao duong",
  WARRANTY_EXPIRY: "Het han bao hanh",
  DEBT_FOLLOWUP: "Theo doi cong no"
};

const statusLabels: Record<ReminderStatus, string> = {
  PENDING: "Dang cho",
  DONE: "Hoan tat",
  CANCELLED: "Da huy"
};

type FormState = {
  reminderDate: string;
  type: ReminderType;
  title: string;
  note: string;
  customerId: string;
};

const initialForm: FormState = {
  reminderDate: new Date().toISOString().slice(0, 10),
  type: "CALL_CUSTOMER",
  title: "",
  note: "",
  customerId: ""
};

export default function RemindersPage() {
  const [status, setStatus] = useState<ReminderStatus | "ALL">("PENDING");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const params = useMemo(() => ({ status: status === "ALL" ? undefined : status, page, pageSize: 10 }), [page, status]);
  const { data, isLoading, isError, refetch } = useReminders(params);
  const createReminder = useCreateReminder();
  const markDone = useMarkReminderDone();

  const titleError = form.title.trim() ? "" : "Nhap tieu de nhac lich";
  const dateError = form.reminderDate ? "" : "Chon ngay nhac";
  const canSubmit = !titleError && !dateError && !createReminder.isPending;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    createReminder.mutate(
      {
        reminderDate: form.reminderDate,
        type: form.type,
        title: form.title.trim(),
        note: form.note.trim() || undefined,
        customerId: form.customerId ? Number(form.customerId) : undefined
      },
      {
        onSuccess: () => {
          setForm(initialForm);
          setPage(1);
        }
      }
    );
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">CRM / Reminder</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-text">Nhac lich cham soc</h1>
          <p className="mt-1 text-sm text-slate-500">Quan ly lich goi khach, bao duong, het han bao hanh va theo doi cong no.</p>
        </div>
        <Button variant="secondary" onClick={() => void refetch()}>
          <RotateCcw className="h-4 w-4" />
          Lam moi
        </Button>
      </section>

      <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-primary">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-text">Tao nhac lich</h2>
              <p className="text-xs text-slate-500">Gan ngay, loai viec va khach hang neu co.</p>
            </div>
          </div>

          <label className="block text-sm font-medium text-text">
            Ngay nhac <span className="text-red-500">*</span>
            <input
              type="date"
              value={form.reminderDate}
              onChange={(event) => setForm((current) => ({ ...current, reminderDate: event.target.value }))}
              className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-orange-100"
            />
            {dateError ? <span className="mt-1 block text-xs text-red-600">{dateError}</span> : null}
          </label>

          <label className="block text-sm font-medium text-text">
            Loai nhac
            <select
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as ReminderType }))}
              className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-orange-100"
            >
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-text">
            Tieu de <span className="text-red-500">*</span>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="VD: Goi khach xac nhan lich bao duong"
              className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-orange-100"
            />
            {titleError ? <span className="mt-1 block text-xs text-red-600">{titleError}</span> : null}
          </label>

          <label className="block text-sm font-medium text-text">
            Ma khach hang
            <input
              type="number"
              min="1"
              value={form.customerId}
              onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
              placeholder="Nhap ID khach neu co"
              className="mt-1 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-orange-100"
            />
          </label>

          <label className="block text-sm font-medium text-text">
            Ghi chu
            <textarea
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              rows={4}
              placeholder="Noi dung can cham soc"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-orange-100"
            />
          </label>

          <Button type="submit" className="w-full" disabled={!canSubmit}>
            <CalendarCheck className="h-4 w-4" />
            {createReminder.isPending ? "Dang tao..." : "Tao nhac lich"}
          </Button>
        </form>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 shadow-soft md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text">Danh sach nhac lich</h2>
              <p className="text-xs text-slate-500">Loc nhanh theo trang thai xu ly.</p>
            </div>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ReminderStatus | "ALL");
                setPage(1);
              }}
              className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-orange-100"
            >
              <option value="PENDING">Dang cho</option>
              <option value="DONE">Hoan tat</option>
              <option value="CANCELLED">Da huy</option>
              <option value="ALL">Tat ca</option>
            </select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-28" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState title="Khong tai duoc nhac lich" description="Vui long thu lai." action={<Button onClick={() => void refetch()}>Tai lai</Button>} />
          ) : data?.items.length ? (
            <div className="space-y-3">
              {data.items.map((item) => (
                <ReminderCard key={item.id} item={item} onDone={() => markDone.mutate(item.id)} doneLoading={markDone.isPending} />
              ))}
            </div>
          ) : (
            <EmptyState title="Chua co nhac lich" description="Nhac lich den han se duoc tao tu scheduler hoac form ben trai." />
          )}

          {data ? (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Trang {data.page}/{Math.max(data.totalPages, 1)} - {data.totalItems} dong
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                  Truoc
                </Button>
                <Button variant="secondary" disabled={page >= data.totalPages || isLoading} onClick={() => setPage((current) => current + 1)}>
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </div>
  );
}

function ReminderCard({ item, onDone, doneLoading }: { item: Reminder; onDone: () => void; doneLoading: boolean }) {
  const overdue = item.status === "PENDING" && item.reminderDate < new Date().toISOString().slice(0, 10);
  return (
    <article className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={item.status === "DONE" ? "green" : overdue ? "red" : "amber"}>{overdue ? "Qua han" : statusLabels[item.status]}</Badge>
            <Badge tone="orange">{typeLabels[item.type]}</Badge>
            {item.customerId ? <Badge tone="slate">KH-{item.customerId}</Badge> : null}
          </div>
          <h3 className="mt-3 text-base font-semibold text-text">{item.title}</h3>
          {item.note ? <p className="mt-1 text-sm leading-6 text-slate-500">{item.note}</p> : null}
          <p className="mt-3 text-sm text-slate-500">Ngay nhac: {formatDate(item.reminderDate)}</p>
        </div>
        {item.status === "PENDING" ? (
          <Button variant="secondary" disabled={doneLoading} onClick={onDone}>
            <Check className="h-4 w-4" />
            Hoan tat
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function formatDate(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(value));
}
