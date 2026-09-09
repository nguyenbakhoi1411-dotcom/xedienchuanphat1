"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ModalProps = {
  open?: boolean;
  isOpen?: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  onClose: () => void;
  footer?: ReactNode;
};

export function Modal({ open, isOpen, title, description, children, size = "lg", onClose, footer }: ModalProps) {
  const isModalOpen = open ?? isOpen ?? false;

  // Close on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isModalOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        animation: "fadeIn 0.15s ease-out",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={cn(
          "flex max-h-[94vh] w-full flex-col overflow-hidden",
          "rounded-t-2xl border border-border bg-white sm:rounded-2xl",
          "animate-[scaleIn_0.2s_ease-out]",
          size === "sm"   && "sm:max-w-md",
          size === "md"   && "sm:max-w-xl",
          size === "lg"   && "sm:max-w-3xl",
          size === "xl"   && "sm:max-w-5xl",
          size === "full" && "sm:max-w-[95vw]"
        )}
        style={{ boxShadow: "var(--shadow-modal)" }}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5"
          style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)" }}>
          <div>
            <h2 className="text-lg font-bold text-text tracking-tight">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-slate-400 shadow-soft transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-border bg-slate-50/80 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
