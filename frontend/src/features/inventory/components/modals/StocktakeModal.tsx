import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function StocktakeModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Kiểm kê vật tư hàng hóa</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Kiểm kê kho</label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
              <option>Tất cả</option>
              <option>Kho nguyên vật liệu</option>
              <option>Kho thành phẩm</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Đến ngày</label>
            <div className="w-2/3">
              <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500" defaultValue="2026-06-20" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            Hủy
          </button>
          <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-white bg-[#008f89] rounded-lg hover:bg-[#007a75] transition-colors shadow-sm">
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
