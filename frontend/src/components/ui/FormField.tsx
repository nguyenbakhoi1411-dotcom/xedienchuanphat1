import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AlertCircle, HelpCircle } from "lucide-react";

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="flex items-center gap-1.5">
        <span className={cn("erp-label mb-0", required && "erp-required")}>
          {label}
        </span>
        {hint && !error && (
          <span title={hint}>
            <HelpCircle className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          </span>
        )}
      </label>
      <div>{children}</div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 mt-1">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-400 mt-1">{hint}</p>
      )}
    </div>
  );
}
