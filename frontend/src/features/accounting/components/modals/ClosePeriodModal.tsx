import { X, AlertTriangle, Clock } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function ClosePeriodModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Khóa sổ kế toán</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 text-sm text-yellow-800">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="italic">
              Sau khi khóa sổ bạn sẽ không thể sửa đổi các chứng từ được hạch toán kể từ ngày khóa sổ mới trở về trước. Muốn thực hiện sửa đổi bạn phải thực hiện: "Bỏ khóa sổ kỳ kế toán".
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Ngày khóa sổ hiện thời</label>
              <input type="date" disabled className="w-full px-3 py-2 border border-slate-300 bg-slate-50 text-slate-500 rounded-md text-sm outline-none cursor-not-allowed" defaultValue="2025-12-31" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Ngày khóa sổ mới</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500" defaultValue="2026-06-21" />
            </div>
          </div>
          
          <div className="flex justify-end items-center mt-2">
            <button className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700">
              <Clock className="w-4 h-4" /> Thiết lập khóa sổ tự động
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            Hủy
          </button>
          <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-white bg-[#008f89] rounded-lg hover:bg-[#007a75] transition-colors shadow-sm">
            Thực hiện
          </button>
        </div>
      </div>
    </div>
  );
}
