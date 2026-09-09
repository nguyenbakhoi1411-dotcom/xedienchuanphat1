import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";

export type OBCardStatus = "DONE" | "PARTIAL" | "EMPTY";

interface OBCardProps {
  title: string;
  icon: React.ElementType;
  status: OBCardStatus;
  summaryValue?: string;
  summaryLabel?: string;
  href: string;
}

export function OBCard({ title, icon: Icon, status, summaryValue, summaryLabel, href }: OBCardProps) {
  const isDone = status === "DONE";
  const isPartial = status === "PARTIAL";

  return (
    <Link href={href} className="block group h-full">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer relative">
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {isDone && (
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" /> Đã nhập
            </span>
          )}
          {isPartial && (
            <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
              <AlertCircle className="w-3 h-3" /> Đang nhập
            </span>
          )}
          {status === "EMPTY" && (
            <span className="flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-medium">
              <span className="w-2 h-2 rounded-full border-2 border-slate-400 block" /> Chưa nhập
            </span>
          )}
        </div>

        {/* Icon */}
        <div className="mt-4 mb-3">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform relative">
            <Icon className="w-6 h-6" />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">VNĐ</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-800 mb-2">{title}</h3>

        {/* Summary Value */}
        <div className="mt-auto">
          {summaryValue ? (
            <div className="text-xs">
              <span className="font-bold text-slate-700">{summaryValue}</span>
              {summaryLabel && <span className="text-slate-500 ml-1">{summaryLabel}</span>}
            </div>
          ) : (
            <div className="text-xs text-transparent select-none">-</div>
          )}
        </div>
      </div>
    </Link>
  );
}
