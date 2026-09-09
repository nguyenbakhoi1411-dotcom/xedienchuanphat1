import { Calendar, Play, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export function VatDeclarationTab() {
  const [period, setPeriod] = useState("06/2026");
  const [status, setStatus] = useState<"idle" | "running" | "success">("idle");

  const handleRun = () => {
    setStatus("running");
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30 p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Thực hiện Khấu trừ Thuế GTGT</h2>
              <p className="text-slate-500 mt-1 text-sm">Kết chuyển thuế đầu vào, đầu ra và sinh bút toán cuối kỳ tự động.</p>
            </div>
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Kỳ tính thuế (Tháng/Năm)</label>
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
              >
                <option value="06/2026">Tháng 06 / 2026</option>
                <option value="05/2026">Tháng 05 / 2026</option>
                <option value="04/2026">Tháng 04 / 2026</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Chi nhánh</label>
              <input 
                type="text" 
                disabled 
                value="Chi nhánh Tổng công ty" 
                className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-4 py-2.5 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8 space-y-4">
            <h3 className="font-semibold text-slate-700">Xem trước số liệu khấu trừ (Dự kiến)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500 mb-1">Tổng VAT đầu ra (33311)</p>
                <p className="text-lg font-semibold text-slate-800">45,230,000</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500 mb-1">Tổng VAT đầu vào (1331)</p>
                <p className="text-lg font-semibold text-slate-800">28,150,000</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 col-span-2 flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Số thuế GTGT phải nộp kỳ này</p>
                  <p className="text-2xl font-bold text-red-600">17,080,000 <span className="text-sm font-normal text-slate-500">VND</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 mb-1">Số thuế GTGT còn được khấu trừ chuyển kỳ sau</p>
                  <p className="text-xl font-semibold text-slate-400">0</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
              Hủy
            </button>
            <button 
              onClick={handleRun}
              disabled={status === "running" || status === "success"}
              className={cn(
                "px-6 py-2.5 text-white rounded-lg font-medium transition-all flex items-center gap-2",
                status === "idle" ? "bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/20" : "",
                status === "running" ? "bg-violet-400 cursor-not-allowed" : "",
                status === "success" ? "bg-emerald-500 cursor-default" : ""
              )}
            >
              {status === "idle" && <><Play className="w-4 h-4 fill-current" /> Chạy khấu trừ</>}
              {status === "running" && "Đang xử lý..."}
              {status === "success" && <><CheckCircle2 className="w-5 h-5" /> Đã hoàn thành</>}
            </button>
          </div>
        </div>

        {status === "success" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full mt-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-800">Thành công!</h3>
                <p className="text-emerald-700 mt-1">Đã thực hiện khấu trừ thuế và tự động sinh bút toán kết chuyển cuối kỳ.</p>
                
                <div className="mt-4 bg-white/60 p-4 rounded-lg border border-emerald-100">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Bút toán đã sinh (Mã: PK202606300001)</p>
                  <div className="flex justify-between text-sm py-1 border-b border-emerald-100/50">
                    <span className="text-slate-600">Nợ TK 33311 (Thuế GTGT đầu ra)</span>
                    <span className="font-medium text-slate-800">28,150,000</span>
                  </div>
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-slate-600">Có TK 1331 (Thuế GTGT được khấu trừ)</span>
                    <span className="font-medium text-slate-800">28,150,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
