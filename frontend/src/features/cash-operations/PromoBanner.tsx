"use client";

import { Button } from "@/components/ui/Button";

interface PromoBannerProps {
  onCtaClick?: () => void;
}

export function PromoBanner({ onCtaClick }: PromoBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-white sm:text-base">
        AMIS Quy trình — Phê duyệt và tự động hóa quy trình chi tiền, tạm ứng
      </p>
      <button
        onClick={onCtaClick}
        className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 transition-colors whitespace-nowrap"
      >
        Kết nối ngay
      </button>
    </div>
  );
}
