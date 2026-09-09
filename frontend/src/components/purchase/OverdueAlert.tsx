"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, X, Clock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useOverduePayments } from "@/features/purchasing/hooks";
import { cn } from "@/lib/cn";

interface Props {
  branchId?: number;
  className?: string;
}

function getDaysOverdue(hanThanhToan: string | Date): number {
  const due = new Date(hanThanhToan);
  const today = new Date();
  // Zero out time components for an accurate day diff
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - due.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " \u20ab";
}

function SeverityBadge({ days }: { days: number }) {
  if (days >= 30) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
        <Clock className="h-3 w-3" />
        {days} ngay
      </span>
    );
  }
  if (days >= 14) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
        <Clock className="h-3 w-3" />
        {days} ngay
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-white">
      <Clock className="h-3 w-3" />
      {days} ngay
    </span>
  );
}

export function OverdueAlert({ branchId, className }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { data: overdueOrders = [], isLoading } = useOverduePayments(branchId);

  const ordersWithDays = useMemo(
    () =>
      overdueOrders
        .map((order) => ({
          ...order,
          daysOverdue: getDaysOverdue(order.hanThanhToan || ""),
        }))
        .sort((a, b) => b.daysOverdue - a.daysOverdue),
    [overdueOrders]
  );

  const totalAmount = useMemo(
    () => ordersWithDays.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0),
    [ordersWithDays]
  );

  // Loading placeholder
  if (isLoading) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-xl border border-orange-100 bg-orange-50 p-4",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-orange-200" />
          <div className="h-4 w-64 rounded bg-orange-200" />
        </div>
      </div>
    );
  }

  // Nothing overdue
  if (ordersWithDays.length === 0) return null;

  // User dismissed
  if (dismissed) return null;

  const PREVIEW_COUNT = 3;
  const visibleOrders = expanded ? ordersWithDays : ordersWithDays.slice(0, PREVIEW_COUNT);
  const hasMore = ordersWithDays.length > PREVIEW_COUNT;

  // Determine severity color scheme based on worst offender
  const worstDays = ordersWithDays[0]?.daysOverdue ?? 0;
  const isCritical = worstDays >= 30;
  const isWarning = worstDays >= 14;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "relative overflow-hidden rounded-xl border shadow-sm",
        isCritical
          ? "border-red-200 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50"
          : isWarning
          ? "border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50"
          : "border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50",
        className
      )}
    >
      {/* Accent stripe */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1 rounded-l-xl",
          isCritical ? "bg-red-500" : isWarning ? "bg-orange-500" : "bg-amber-400"
        )}
      />

      <div className="pl-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
                isCritical
                  ? "bg-red-100 text-red-600"
                  : isWarning
                  ? "bg-orange-100 text-orange-600"
                  : "bg-amber-100 text-amber-600"
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3
                className={cn(
                  "text-sm font-bold",
                  isCritical
                    ? "text-red-800"
                    : isWarning
                    ? "text-orange-800"
                    : "text-amber-800"
                )}
              >
                {ordersWithDays.length} don hang qua han thanh toan
              </h3>
              <p
                className={cn(
                  "mt-0.5 text-xs",
                  isCritical
                    ? "text-red-600"
                    : isWarning
                    ? "text-orange-600"
                    : "text-amber-600"
                )}
              >
                Tong so tien:{" "}
                <span className="font-bold">{formatCurrency(totalAmount)}</span>
                {" "}&bull;{" "}
                Qua han nang nhat:{" "}
                <span className="font-bold">{worstDays} ngay</span>
              </p>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className={cn(
              "flex-shrink-0 rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2",
              isCritical
                ? "text-red-400 hover:bg-red-100 hover:text-red-600 focus:ring-red-300"
                : isWarning
                ? "text-orange-400 hover:bg-orange-100 hover:text-orange-600 focus:ring-orange-300"
                : "text-amber-400 hover:bg-amber-100 hover:text-amber-600 focus:ring-amber-300"
            )}
            aria-label="An canh bao"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Order list */}
        <div className="px-4 pb-1">
          <div className="overflow-hidden rounded-lg border border-white/60 bg-white/50 backdrop-blur-sm">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className={cn(
                    "border-b text-xs font-semibold uppercase tracking-wide",
                    isCritical
                      ? "border-red-100 text-red-500"
                      : isWarning
                      ? "border-orange-100 text-orange-500"
                      : "border-amber-100 text-amber-500"
                  )}
                >
                  <th className="px-3 py-2 text-left">Ma don</th>
                  <th className="px-3 py-2 text-left">Nha cung cap</th>
                  <th className="px-3 py-2 text-right">So tien</th>
                  <th className="px-3 py-2 text-right">Qua han</th>
                  <th className="px-3 py-2 w-8" />
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={cn(
                      "border-b border-gray-50/80 transition-colors last:border-0",
                      idx % 2 === 0 ? "bg-white/30" : "bg-white/10",
                      "hover:bg-white/60"
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-xs font-semibold text-gray-700">
                        {order.purchaseOrderNo ?? `#${order.id}`}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-gray-700 line-clamp-1">
                        {order.supplierName ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-xs font-semibold text-gray-800">
                        {formatCurrency(order.totalAmount ?? 0)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <SeverityBadge days={order.daysOverdue} />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {order.id && (
                        <a
                          href={`/purchasing/purchase-orders/${order.id}`}
                          className={cn(
                            "inline-flex items-center justify-center rounded-md p-1 transition-colors",
                            isCritical
                              ? "text-red-400 hover:bg-red-100 hover:text-red-600"
                              : isWarning
                              ? "text-orange-400 hover:bg-orange-100 hover:text-orange-600"
                              : "text-amber-400 hover:bg-amber-100 hover:text-amber-600"
                          )}
                          aria-label={`Xem don hang ${order.purchaseOrderNo ?? order.id}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expand / collapse */}
        {hasMore && (
          <div className="px-4 pb-3 pt-1.5">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                isCritical
                  ? "text-red-600 hover:bg-red-100"
                  : isWarning
                  ? "text-orange-600 hover:bg-orange-100"
                  : "text-amber-600 hover:bg-amber-100"
              )}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Thu gon
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Xem them {ordersWithDays.length - PREVIEW_COUNT} don hang
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer note */}
        <div
          className={cn(
            "border-t px-4 py-2 text-xs",
            isCritical
              ? "border-red-100 text-red-400"
              : isWarning
              ? "border-orange-100 text-orange-400"
              : "border-amber-100 text-amber-400"
          )}
        >
          Can thanh toan ngay de tranh phat sinh chi phi tre han.
        </div>
      </div>
    </div>
  );
}
