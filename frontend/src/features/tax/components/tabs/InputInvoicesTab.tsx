import { Search, Filter, Download, Plus, MoreHorizontal } from "lucide-react";

export function InputInvoicesTab() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo số hóa đơn, MST, tên NCC..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            <Filter className="w-4 h-4" />
            Lọc
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium">
            <Plus className="w-4 h-4" />
            Thêm hóa đơn
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
              <th className="p-4 font-medium">Ngày hóa đơn</th>
              <th className="p-4 font-medium">Số hóa đơn</th>
              <th className="p-4 font-medium">Mã số thuế</th>
              <th className="p-4 font-medium">Tên nhà cung cấp</th>
              <th className="p-4 font-medium text-right">Tổng tiền hàng</th>
              <th className="p-4 font-medium text-right">Tiền thuế GTGT</th>
              <th className="p-4 font-medium text-center">Trạng thái</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
            {/* Dummy Data */}
            <tr className="hover:bg-slate-50/50 transition-colors group">
              <td className="p-4">12/06/2026</td>
              <td className="p-4 font-medium text-slate-900">0001234</td>
              <td className="p-4 text-slate-500">0101234567</td>
              <td className="p-4">Công ty TNHH Cung cấp Thiết bị Điện</td>
              <td className="p-4 text-right">15,000,000</td>
              <td className="p-4 text-right">1,500,000</td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Hợp lệ
                </span>
              </td>
              <td className="p-4 text-right">
                <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/50 transition-colors group">
              <td className="p-4">15/06/2026</td>
              <td className="p-4 font-medium text-slate-900">0005678</td>
              <td className="p-4 text-slate-500">0309876543</td>
              <td className="p-4">Công ty CP Dịch vụ Văn phòng</td>
              <td className="p-4 text-right">3,200,000</td>
              <td className="p-4 text-right">256,000</td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Cảnh báo MST
                </span>
              </td>
              <td className="p-4 text-right">
                <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/50 transition-colors group">
              <td className="p-4">18/06/2026</td>
              <td className="p-4 font-medium text-slate-900">0009912</td>
              <td className="p-4 text-slate-500">0401122334</td>
              <td className="p-4">Nhà cung cấp Vật tư A</td>
              <td className="p-4 text-right">10,500,000</td>
              <td className="p-4 text-right">840,000</td>
              <td className="p-4 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Hợp lệ
                </span>
              </td>
              <td className="p-4 text-right">
                <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
        <span>Hiển thị 1-3 của 24 hóa đơn</span>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Trước</button>
          <button className="px-3 py-1 border border-blue-600 bg-blue-50 text-blue-600 rounded font-medium">1</button>
          <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">2</button>
          <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">3</button>
          <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">Sau</button>
        </div>
      </div>
    </div>
  );
}
