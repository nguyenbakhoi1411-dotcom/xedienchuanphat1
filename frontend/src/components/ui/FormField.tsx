import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function FormField({
  label,
  error,
  required,
  children,
  className
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className={cn("erp-label", required && "erp-required")}>{label}</span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="erp-error">{error}</span>}
    </label>
  );
}
