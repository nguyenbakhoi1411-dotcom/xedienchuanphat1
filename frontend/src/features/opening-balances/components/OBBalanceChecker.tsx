import React from "react";
import { AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

interface OBBalanceCheckerProps {
  totalDebit: number;
  totalCredit: number;
  detailsHref?: string;
}

export function OBBalanceChecker({ totalDebit, totalCredit, detailsHref = "/opening-balances" }: OBBalanceCheckerProps) {
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff === 0;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 border-t ${isBalanced ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'} shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]`}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {isBalanced ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            )}
            <span className={`font-bold ${isBalanced ? 'text-emerald-800' : 'text-rose-800'}`}>
              KIỂM TRA CÂN ĐỐI:
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <span className="text-slate-700">Dư Nợ: <strong className="text-slate-900">{new Intl.NumberFormat('vi-VN').format(totalDebit)} đ</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700">Dư Có: <strong className="text-slate-900">{new Intl.NumberFormat('vi-VN').format(totalCredit)} đ</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`text-sm font-bold ${isBalanced ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isBalanced ? (
              "✅ Đã cân đối"
            ) : (
              <>Chênh lệch: {new Intl.NumberFormat('vi-VN').format(diff)} đ ⚠</>
            )}
          </div>
          
          <Link href={detailsHref} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded border border-blue-200 shadow-sm transition-colors">
            Xem chi tiết <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
