import { useState } from "react";
import { Search, Settings, X, Plus, Paperclip } from "lucide-react";
import { EditableDataTable, Column } from "@/components/ui/EditableDataTable";

export function OtherVoucherTab() {
  const [items, setItems] = useState<any[]>([{
    id: "1", description: "", debitAccount: "", creditAccount: "", amount: 0, transaction: "", debitObject: "", debitObjectName: "", creditObject: "", creditObjectName: "", costItem: ""
  }]);

  const columns: Column<any>[] = [
    { key: "description", header: "Diễn giải", type: "text", width: "200px" },
    { key: "debitAccount", header: "TK Nợ", type: "text", width: "100px" },
    { key: "creditAccount", header: "TK Có", type: "text", width: "100px" },
    { key: "amount", header: "Số tiền", type: "number", width: "120px" },
    { key: "transaction", header: "Nghiệp vụ", type: "text", width: "150px" },
    { key: "debitObject", header: "Đối tượng nợ", type: "text", width: "120px" },
    { key: "debitObjectName", header: "Tên đối tượng nợ", type: "text", width: "150px" },
    { key: "creditObject", header: "Đối tượng có", type: "text", width: "120px" },
    { key: "creditObjectName", header: "Tên đối tượng có", type: "text", width: "150px" },
    { key: "costItem", header: "Khoản mục CP", type: "text", width: "120px" },
  ];

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="p-1.5 bg-slate-100 rounded-md text-slate-600"><Search className="w-5 h-5" /></span>
            Chứng từ nghiệp vụ khác NVK00007
          </h2>
          <select className="ml-4 px-3 py-1 border border-slate-300 rounded text-sm text-slate-600 outline-none">
            <option>4. Khác</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Tổng tiền</p>
            <p className="text-2xl font-bold text-slate-800">{new Intl.NumberFormat('vi-VN').format(totalAmount)}</p>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600"><Settings className="w-5 h-5" /></button>
          <button className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4 flex gap-6">
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-2 text-sm font-semibold text-slate-700">Diễn giải</label>
              <div className="col-span-10">
                <input type="text" className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-2 text-sm font-semibold text-slate-700">Hạn thanh toán</label>
              <div className="col-span-10">
                <input type="date" className="w-48 px-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-2 text-sm font-semibold text-slate-700">Tham chiếu</label>
              <div className="col-span-10">
                <span className="text-blue-500 text-sm cursor-pointer">...</span>
              </div>
            </div>
          </div>
          <div className="w-[300px] border-l border-slate-100 pl-6 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-700">Ngày hạch toán</label>
              <input type="date" className="w-36 px-2 py-1 border border-slate-300 rounded text-sm outline-none" defaultValue="2026-06-21" />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-700">Ngày chứng từ</label>
              <input type="date" className="w-36 px-2 py-1 border border-slate-300 rounded text-sm outline-none" defaultValue="2026-06-21" />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-700">Số chứng từ</label>
              <input type="text" className="w-36 px-2 py-1 border border-slate-300 rounded text-sm outline-none text-right font-semibold" defaultValue="NVK00007" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 bg-slate-50">
            <div className="flex gap-4">
              <button className="px-4 py-2.5 text-sm font-semibold text-emerald-700 border-b-2 border-emerald-500">Hạch toán</button>
              <button className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700">Kê khai hóa đơn và hạch toán thuế</button>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" className="text-emerald-600" /> Hạch toán gộp nhiều hóa đơn <span className="text-slate-400">?</span></label>
              <button className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded flex items-center gap-1"><span className="text-[10px]">🤖</span> AVA Kế toán ▾</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <EditableDataTable columns={columns} value={items} onChange={setItems} defaultRow={{}} />
          </div>
          
          <div className="p-4 bg-white border-t border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button onClick={() => setItems([...items, {id: Math.random().toString()}])} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Thêm dòng
                </button>
                <button onClick={() => setItems([])} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-red-50 text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" /> Xóa hết dòng
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Tổng số: <strong className="text-slate-700">{items.length}</strong> bản ghi</span>
                <select className="ml-4 px-2 py-1 border border-slate-300 rounded">
                  <option>20 bản ghi trên 1 trang</option>
                </select>
                <button className="px-2">Trước</button>
                <button className="px-2 font-bold text-emerald-600 bg-emerald-50 rounded">1</button>
                <button className="px-2">Sau</button>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" className="text-emerald-600" /> Không lên bảng kê thuế GTGT <span className="text-slate-400">?</span></label>
            </div>
            <div className="w-1/3 mt-4">
              <div className="border border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 bg-slate-50 cursor-pointer hover:bg-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-xs font-semibold">Đính kèm</span>
                  <span className="text-[10px] text-slate-400">Dung lượng tối đa 5MB</span>
                </div>
                <span className="text-xs text-slate-400">Kéo thả tệp vào đây hoặc bấm vào đây</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center z-20 sticky bottom-0">
        <button className="px-4 py-1.5 text-sm font-medium border border-slate-600 rounded hover:bg-slate-700">Hủy</button>
        <div className="flex items-center gap-2">
          <button className="px-4 py-1.5 text-sm font-medium border border-slate-600 rounded hover:bg-slate-700">Cất</button>
          <button className="px-4 py-1.5 text-sm font-medium bg-[#008f89] rounded hover:bg-[#007a75] flex items-center gap-1">Cất và In ▾</button>
        </div>
      </div>
    </div>
  );
}
