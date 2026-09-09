import { X, Info } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function CalculateIssueCostModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tính giá xuất kho</h2>
            <p className="text-sm text-slate-500 mt-1">Lần tính giá cuối cùng: <span className="font-semibold text-slate-700">17/06/2026 17:37:40</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Vật tư hàng hóa cần tính giá */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Vật tư hàng hóa cần tính giá</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="itemSelection" defaultChecked className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                <span className="text-sm text-slate-700">Tất cả vật tư, hàng hóa</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="itemSelection" className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                  <span className="text-sm text-slate-700">Vật tư, hàng hóa được chọn</span>
                </label>
                <button className="px-3 py-1 text-sm border border-slate-300 rounded text-slate-500 bg-slate-50 opacity-50 cursor-not-allowed">Chọn...</button>
              </div>
            </div>
          </div>

          {/* Thời gian */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Thời gian</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                <option>Đầu tháng đến hiện tại</option>
                <option>Tháng này</option>
                <option>Tháng trước</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Từ ngày</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500" defaultValue="2026-06-01" />
            </div>
            <div className="col-span-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Đến ngày</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500" defaultValue="2026-06-20" />
            </div>
          </div>

          {/* Kỳ tính giá */}
          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-3">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Kỳ tính giá</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                <option>Tháng</option>
                <option>Quý</option>
                <option>Năm</option>
              </select>
            </div>
            <div className="col-span-9 flex items-center gap-6 pb-2 pl-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="calcMethod" defaultChecked className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                <span className="text-sm text-slate-700">Tính giá theo kho</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="calcMethod" className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                <span className="text-sm text-slate-700">Tính giá không theo kho</span>
              </label>
            </div>
          </div>

          {/* Chi nhánh */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Chi nhánh</label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="branch" defaultChecked className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                  <span className="text-sm text-slate-700">Tính giá chung cho các chi nhánh phụ thuộc</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="branch" className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                  <span className="text-sm text-slate-700">Tính giá riêng theo từng chi nhánh</span>
                </label>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Thay đổi tùy chọn</button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex gap-3 text-sm text-emerald-800">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p>Bạn <strong>chưa biết cách thiết lập</strong> tính giá xuất kho? <a href="#" className="text-blue-600 font-semibold hover:underline uppercase">Xem hướng dẫn tính giá</a></p>
              <p className="text-emerald-700/80 italic">Trong khi tính giá, bạn không nên thêm/sửa hàng hóa, các chứng từ liên quan đến hàng hóa phát sinh trong khoảng thời gian tính giá</p>
            </div>
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
