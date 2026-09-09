"use client";
import { useState } from "react";
import { 
  FileEdit, RefreshCcw, Lock, FileText, BarChart3, 
  Network, Code2, Tags, Hammer, Settings, ChevronRight, CheckCircle2, ChevronDown, List
} from "lucide-react";
import { GeneralOpsTab as AccountingTabKey } from "../GeneralOperationsPanel";
import { ClosePeriodModal } from "../modals/ClosePeriodModal";
import Link from "next/link";

interface Props {
  onNavigate: (tab: AccountingTabKey) => void;
}

export function AccountingProcessFlowTab({ onNavigate }: Props) {
  const [showCloseModal, setShowCloseModal] = useState(false);

  return (
    <div className="p-6 h-full bg-[#e8f1f2] overflow-y-auto">
      <div className="max-w-6xl mx-auto flex gap-6">
        
        {/* LEFT PANEL: NGHIỆP VỤ TỔNG HỢP */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white shadow-sm border border-slate-200 h-[460px] flex flex-col relative">
            <div className="text-center py-4 border-b border-slate-100">
              <h2 className="text-[15px] font-bold text-slate-700 uppercase">Nghiệp vụ tổng hợp</h2>
            </div>
            
            <div className="flex-1 relative flex items-center justify-center p-8">
              {/* Arrows */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <svg width="600" height="200" style={{ stroke: '#c0cfc5', strokeWidth: 1.5, fill: 'none' }}>
                  {/* Horizontal line Quyết toán -> Kết chuyển -> Khóa sổ */}
                  <path d="M 120 70 L 250 70" markerEnd="url(#arrowhead)" />
                  <path d="M 350 70 L 480 70" markerEnd="url(#arrowhead)" />
                  
                  {/* Vertical line from left node down to Chứng từ nghiệp vụ khác */}
                  <path d="M 160 70 L 160 140" />
                  <path d="M 160 140 L 100 140" />
                  
                  {/* Vertical line from right node down to Lập báo cáo */}
                  <path d="M 440 70 L 440 140" />
                  <path d="M 440 140 L 500 140" />

                  <defs>
                    <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill="#c0cfc5" />
                    </marker>
                  </defs>
                </svg>
              </div>

              {/* Nodes container */}
              <div className="relative z-10 w-[600px] h-[200px]">
                
                {/* Node: Quyết toán tạm ứng */}
                <button onClick={() => onNavigate("advance_settlement")} className="absolute top-0 left-0 w-24 flex flex-col items-center group">
                  <div className="w-[52px] h-[60px] rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center relative hover:border-emerald-500 hover:shadow-md transition-all z-10 group-hover:-translate-y-1">
                    <div className="absolute top-0 w-full h-4 bg-yellow-500 rounded-t-lg"></div>
                    <FileEdit className="w-8 h-8 text-yellow-500 mt-2" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      <Settings className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <span className="mt-4 text-xs font-medium text-slate-700 text-center leading-tight">Quyết toán<br/>tạm ứng</span>
                </button>

                {/* Node: Kết chuyển lãi lỗ */}
                <button onClick={() => onNavigate("profit_loss")} className="absolute top-10 left-[250px] w-24 flex flex-col items-center group">
                  <div className="w-[52px] h-[60px] rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center relative hover:border-emerald-500 hover:shadow-md transition-all z-10 group-hover:-translate-y-1">
                    <div className="absolute top-0 w-full h-4 bg-orange-500 rounded-t-lg"></div>
                    <RefreshCcw className="w-8 h-8 text-orange-500 mt-2" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      <BarChart3 className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <span className="mt-4 text-xs font-medium text-slate-700 text-center leading-tight">Kết chuyển<br/>lãi lỗ</span>
                </button>

                {/* Node: Khóa sổ kỳ kế toán */}
                <button onClick={() => setShowCloseModal(true)} className="absolute top-0 right-0 w-24 flex flex-col items-center group">
                  <div className="w-[52px] h-[60px] rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center relative hover:border-emerald-500 hover:shadow-md transition-all z-10 group-hover:-translate-y-1">
                    <div className="absolute top-0 w-full h-4 bg-yellow-500 rounded-t-lg"></div>
                    <Lock className="w-8 h-8 text-yellow-500 mt-2" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <span className="mt-4 text-xs font-medium text-slate-700 text-center leading-tight">Khóa sổ kỳ<br/>kế toán</span>
                </button>

                {/* Node: Chứng từ nghiệp vụ khác */}
                <button onClick={() => onNavigate("other_voucher")} className="absolute bottom-0 left-[20px] w-28 flex flex-col items-center group">
                  <div className="w-[52px] h-[60px] rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center relative hover:border-emerald-500 hover:shadow-md transition-all z-10 group-hover:-translate-y-1">
                    <div className="absolute top-0 w-full h-4 bg-emerald-500 rounded-t-lg"></div>
                    <FileText className="w-8 h-8 text-emerald-500 mt-2" />
                  </div>
                  <span className="mt-4 text-xs font-medium text-slate-700 text-center leading-tight">Chứng từ<br/>nghiệp vụ khác</span>
                </button>

                {/* Node: Lập báo cáo tài chính */}
                <button className="absolute bottom-0 right-[20px] w-28 flex flex-col items-center group">
                  <div className="w-[52px] h-[60px] rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center relative hover:border-emerald-500 hover:shadow-md transition-all z-10 group-hover:-translate-y-1">
                    <div className="absolute top-0 w-full h-4 bg-yellow-500 rounded-t-lg"></div>
                    <BarChart3 className="w-8 h-8 text-yellow-500 mt-2" />
                  </div>
                  <span className="mt-4 text-xs font-medium text-slate-700 text-center leading-tight">Lập báo cáo tài chính</span>
                </button>

              </div>
            </div>

            {/* Bottom Menu Items */}
            <div className="grid grid-cols-5 border-t border-slate-100 mt-auto bg-white">
              {[
                { icon: Network, label: "Hệ thống tài khoản" },
                { icon: Code2, label: "Mã thống kê" },
                { icon: Tags, label: "Khoản mục chi phí" },
                { icon: Hammer, label: "Tiện ích" },
                { icon: Settings, label: "Tùy chọn" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <button key={index} className="flex flex-col items-center justify-center py-4 hover:bg-slate-50 transition-colors border-r border-slate-100 last:border-r-0 group">
                    <Icon className="w-6 h-6 mb-2 text-[#008f89]" strokeWidth={1.5} />
                    <span className="text-[11px] font-medium text-slate-600">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: BÁO CÁO */}
        <div className="w-[320px] bg-white shadow-sm border border-slate-200 h-[460px] flex flex-col">
          <div className="text-center py-4 border-b border-slate-100">
            <h2 className="text-[15px] font-bold text-slate-700 uppercase">Báo cáo</h2>
          </div>
          <div className="flex-1 p-4 flex flex-col overflow-y-auto">
            <ul className="space-y-4">
              {[
                "Sổ chi tiết các tài khoản",
                "Sổ nhật ký chung",
                "Tổng hợp công nợ nhân viên",
                "Tổng hợp công nợ theo đối tượng",
                "B01a-DNN: Báo cáo tình hình tài chính"
              ].map((report, idx) => (
                <li key={idx}>
                  <Link href={`/reports/detail/${idx}`} className="flex items-start gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 group-hover:bg-[#008f89] transition-colors shrink-0"></span>
                    <span className="text-[13px] text-slate-700 group-hover:text-[#008f89] transition-colors line-clamp-2">{report}</span>
                  </Link>
                  {idx < 4 && <div className="border-b border-slate-100 mt-4"></div>}
                </li>
              ))}
            </ul>
            
            <div className="mt-auto pt-6 text-center">
              <Link href="/reports" className="text-[13px] text-[#008f89] hover:text-[#007a75] font-medium">
                Tất cả báo cáo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AMIS QUY TRÌNH BANNER */}
      <div className="max-w-6xl mx-auto mt-4 bg-white border border-[#b2e5e5] flex items-center justify-between p-4 shadow-sm relative overflow-hidden">
        {/* Soft blue gradient background layer for the left side of banner */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-[#d9f2f2] to-transparent"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#008f89] rounded-md flex items-center justify-center text-white font-bold text-lg">Q</div>
            <span className="font-bold text-[#008f89] text-[15px]">AMIS Quy trình</span>
          </div>
          <span className="text-[14px] text-slate-700 font-medium">
            Phê duyệt và <span className="font-bold">tự động hóa</span> quy trình chi tiền, tạm ứng
          </span>
          <button className="flex items-center gap-1 text-[13px] text-[#008f89] hover:underline ml-2">
            <span className="w-4 h-4 border border-[#008f89] rounded-full flex items-center justify-center text-[10px]">?</span>
            Xem tính năng
          </button>
        </div>
        <button className="relative z-10 px-4 py-1.5 border border-[#008f89] text-[#008f89] text-[13px] font-semibold rounded bg-white hover:bg-[#f0f9f9] transition-colors">
          Kết nối ngay
        </button>
      </div>

      {showCloseModal && <ClosePeriodModal onClose={() => setShowCloseModal(false)} />}
    </div>
  );
}
