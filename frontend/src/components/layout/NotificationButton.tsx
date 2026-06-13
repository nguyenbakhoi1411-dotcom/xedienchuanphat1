"use client";

import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/features/notifications/hooks";
import type { NotificationItem, NotificationSeverity } from "@/features/notifications/types";
import { cn } from "@/lib/cn";

const severityClass: Record<NotificationSeverity, string> = {
  INFO: "bg-blue-500",
  WARNING: "bg-amber-500",
  ERROR: "bg-red-500",
  SUCCESS: "bg-emerald-500"
};

export function NotificationButton() {
  const [open, setOpen] = useState(false);
  const previousUnreadRef = useRef<number | null>(null);
  const { data, isLoading, isError, refetch } = useNotifications(20);
  const markRead = useMarkNotificationRead(20);
  const markAllRead = useMarkAllNotificationsRead(20);
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    if (!data) return;
    if (previousUnreadRef.current !== null && data.unreadCount > previousUnreadRef.current) {
      const newest = data.items.find((item) => !item.read);
      toast.info(newest ? newest.title : "Có thông báo mới");
    }
    previousUnreadRef.current = data.unreadCount;
  }, [data]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Thông báo"
        aria-expanded={open}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-slate-600 shadow-soft transition-colors hover:bg-orange-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full border-2 border-white bg-primary px-1 text-center text-[11px] font-semibold leading-4 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,380px)] overflow-hidden rounded-lg border border-border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-text">Thông báo</p>
              <p className="text-xs text-slate-500">{unreadCount} chưa đọc</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                title="Tải lại"
                onClick={() => void refetch()}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                title="Đánh dấu đã đọc"
                disabled={unreadCount === 0 || markAllRead.isPending}
                onClick={() => markAllRead.mutate()}
              >
                {markAllRead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-4">
                <EmptyState
                  title="Không tải được thông báo"
                  description="Vui lòng thử lại."
                  action={
                    <button type="button" className="text-sm font-semibold text-primary" onClick={() => void refetch()}>
                      Thử lại
                    </button>
                  }
                />
              </div>
            ) : data?.items.length ? (
              data.items.map((item) => (
                <NotificationRow key={item.id} item={item} disabled={markRead.isPending} onRead={() => markRead.mutate(item.id)} />
              ))
            ) : (
              <div className="p-4">
                <EmptyState title="Chưa có thông báo" description="Các cảnh báo quan trọng sẽ hiển thị tại đây." />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NotificationRow({ item, disabled, onRead }: { item: NotificationItem; disabled: boolean; onRead: () => void }) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-orange-50/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary",
        !item.read && "bg-orange-50/35"
      )}
      disabled={disabled}
      onClick={() => {
        if (!item.read) onRead();
      }}
    >
      <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", severityClass[item.severity])} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-text">{item.title}</span>
          <span className="shrink-0 text-[11px] text-slate-400">{formatTime(item.createdAt)}</span>
        </span>
        <span className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.message}</span>
        <span className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{item.module}</span>
      </span>
    </button>
  );
}

function formatTime(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
