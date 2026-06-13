import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-orange-200 bg-orange-50/35 px-4 py-8 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-orange-200 bg-white text-primary shadow-sm">
        <Inbox className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-text">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
