import { useState } from "react";
import { Settings, X, Plus, Paperclip, RefreshCcw } from "lucide-react";
import { EditableDataTable, Column } from "@/components/ui/EditableDataTable";

export function ProfitLossTransferTab() {
  const [items, setItems] = useState<any[]>([
    { id: "1", description: "Kết chuyển doanh thu bán hàng và cung cấp dịch vụ", debitAccount: "51111", creditAccount: "911", amount: 15086940423 },
    { id: "2", description: "Kết chuyển doanh thu bán hàng và cung cấp dịch vụ", debitAccount: "51112", creditAccount: "911", amount: 34700000 },
    { id: "3", description: "Kết chuyển doanh thu bán hàng và cung cấp dịch vụ", debitAccount: "51113", creditAccount: "911", amount: 3798704062 },
    { id: "4", description: "Kết chuyển doanh thu bán hàng và cung cấp dịch vụ", debitAccount: "51114", creditAccount: "911", amount: 4102727291 },
    { id: "5", description: "Kết chuyển doanh thu bán hàng và cung cấp dịch vụ", debitAccount: "51115", creditAccount: "911", amount: 9157501683 },
    { id: "6", description: "Kết chuyển giá vốn hàng bán", debitAccount: "911", creditAccount: "632", amount: 23969189066 },
    { id: "7", description: "Kết chuyển chi phí hoạt động tài chính", debitAccount: "911", creditAccount: "635", amount: 3388 },
    { id: "8", description: "Kết chuyển chi phí bán hàng", debitAccount: "911", creditAccount: "6421", amount: 8842000 },
    { id: "9", description: "Kết chuyển chi phí quản lý doanh nghiệp", debitAccount: "911", creditAccount: "6422", amount: 4372600 },
    { id: "10", description: "Kết chuyển kết quả hoạt động kinh doanh trong kỳ", debitAccount: "911", creditAccount: "4212", amount: 7386074568 },
  ]);

  const columns: Column<any>[] = [
    { key: "description", header: "Diễn giải", type: "text" },
    { key: "debitAccount", header: "TK Nợ", type: "text", width: "120px" },
    { key: "creditAccount", header: "TK Có", type: "text", width: "120px" },
    { key: "amount", header: "Số tiền", type: "number", width: "180px" },
  ];

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="p-1.5 bg-slate-100 rounded-md text-slate-600"><RefreshCcw className="w-5 h-5" /></span>
          Kết chuyển lãi lỗ NVK00006
        </h2>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600"><Settings className="w-5 h-5" /></button>
          <button className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4 flex justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-slate-700">Tham chiếu</label>
            <span className="text-blue-500 text-sm cursor-pointer">...</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-slate-700">Số chứng từ</label>
            <input type="text" className="w-48 px-3 py-1.5 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500 text-right font-semibold" defaultValue="NVK00006" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
            <span className="text-sm font-semibold text-emerald-700">Hạch toán</span>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <EditableDataTable columns={columns} value={items} onChange={setItems} defaultRow={{}} />
          </div>
          
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-right font-bold text-slate-800">
            {new Intl.NumberFormat('vi-VN').format(totalAmount)}
          </div>
          
          <div className="p-4 bg-white border-t border-slate-200 space-y-4">
            <div className="flex gap-2">
              <button onClick={() => setItems([...items, {id: Math.random().toString()}])} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Thêm dòng
              </button>
              <button onClick={() => setItems([])} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-red-50 text-red-600 flex items-center gap-1">
                <X className="w-3 h-3" /> Xóa hết dòng
              </button>
            </div>
            <div className="w-1/3">
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
