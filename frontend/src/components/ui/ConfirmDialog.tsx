"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ConfirmDialogProps = {
  open?: boolean;
  isOpen?: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  isOpen,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  danger = true,
  loading = false,
  onConfirm,
  onClose,
  children
}: ConfirmDialogProps) {
  const isDialogOpen = open ?? isOpen ?? false;

  useEffect(() => {
    if (!isDialogOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isDialogOpen, onClose]);

  if (!isDialogOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        animation: "fadeIn 0.15s ease-out",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <section
        className="w-full max-w-sm rounded-2xl bg-white p-6"
        style={{
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-modal)",
          animation: "scaleIn 0.2s ease-out",
        }}
      >
        {/* Icon */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4"
          style={{
            background: danger ? "linear-gradient(135deg, #FEF2F2, #FEE2E2)" : "linear-gradient(135deg, #FFF7ED, #FFEDD5)",
            border: danger ? "1px solid #FCA5A5" : "1px solid #FED7AA",
          }}
        >
          <AlertTriangle
            className="h-5 w-5"
            style={{ color: danger ? "#EF4444" : "#F97316" }}
          />
        </div>

        <h2 className="text-lg font-bold text-text mb-2">{title}</h2>
        <p className="text-sm leading-relaxed text-slate-500">{description}</p>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </section>
    </div>
  );
}
