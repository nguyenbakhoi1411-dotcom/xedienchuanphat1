"use client";

import { SERIAL_STATUS_COLORS, SERIAL_STATUS_LABELS } from "./types";
import type { SerialStatus } from "./types";

export function SerialStatusBadge({ status }: { status: SerialStatus }) {
  const label = SERIAL_STATUS_LABELS[status] ?? status;
  const colorClass = SERIAL_STATUS_COLORS[status] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
      {label}
    </span>
  );
}
