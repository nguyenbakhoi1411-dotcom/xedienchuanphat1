import { Save, Building2, Key, Database } from "lucide-react";

export function TaxSettingsTab() {
  return (
    <div className="p-8 h-full bg-slate-50/50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Thiết lập tham số Thuế</h2>
          <p className="text-slate-500 mt-1 text-sm">Cấu hình kết nối hệ thống cơ quan thuế (TVAN) và các thông số ngầm định.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Building2 className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-700">Thông tin đại lý / Người nộp thuế</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cơ quan thuế cấp cục</label>
              <input type="text" defaultValue="Cục Thuế TP Hà Nội" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cơ quan thuế quản lý trực tiếp</label>
              <input type="text" defaultValue="Chi cục Thuế Quận Đống Đa" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Người ký tờ khai</label>
              <input type="text" defaultValue="Lê Văn A" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Key className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-700">Tài khoản kê khai thuế qua mạng (TVAN)</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập (Thuedientu.gdt.gov.vn)</label>
              <input type="text" defaultValue="0123456789-ql" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
              <input type="password" defaultValue="********" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Database className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-700">Tài khoản kế toán mặc định</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">TK Thuế GTGT đầu vào được khấu trừ</label>
              <input type="text" defaultValue="1331" disabled className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">TK Thuế GTGT đầu ra phải nộp</label>
              <input type="text" defaultValue="33311" disabled className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button className="px-6 py-2.5 text-slate-600 hover:bg-slate-200 bg-slate-100 border border-slate-200 rounded-lg font-medium transition-colors text-sm">
            Hủy thay đổi
          </button>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 text-sm">
            <Save className="w-4 h-4" />
            Lưu thiết lập
          </button>
        </div>
      </div>
    </div>
  );
}
