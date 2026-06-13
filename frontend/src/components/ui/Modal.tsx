"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
  onClose: () => void;
};

export function Modal({ open, title, description, children, size = "lg", onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div
        className={cn(
          "max-h-[92vh] w-full overflow-hidden rounded-t-lg border border-border bg-white shadow-xl sm:rounded-lg",
          size === "md" && "max-w-xl",
          size === "lg" && "max-w-3xl",
          size === "xl" && "max-w-5xl"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border bg-slate-50/70 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Dong"
            onClick={onClose}
            className="erp-action-icon shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(92vh-77px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
