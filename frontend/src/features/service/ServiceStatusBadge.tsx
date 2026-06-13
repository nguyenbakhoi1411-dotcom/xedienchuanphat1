import { cn } from "@/lib/cn";
import { getStatusLabel } from "./serviceOptions";
import type { ServiceTicketStatus } from "./types";

const statusClass: Record<ServiceTicketStatus, string> = {
  CREATED: "bg-slate-100 text-slate-700",
  ASSIGNED: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-orange-50 text-primary",
  RECEIVED: "bg-slate-100 text-slate-700",
  CHECKING: "bg-blue-50 text-blue-700",
  DIAGNOSING: "bg-blue-50 text-blue-700",
  QUOTED: "bg-purple-50 text-purple-700",
  WAITING_CUSTOMER_APPROVAL: "bg-amber-50 text-amber-700",
  WAITING_PARTS: "bg-amber-50 text-amber-700",
  REPAIRING: "bg-orange-50 text-primary",
  QC_CHECK: "bg-cyan-50 text-cyan-700",
  COMPLETED: "bg-green-50 text-green-700",
  RETURNED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700"
};

export function ServiceStatusBadge({ status }: { status: ServiceTicketStatus }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusClass[status])}>{getStatusLabel(status)}</span>;
}
