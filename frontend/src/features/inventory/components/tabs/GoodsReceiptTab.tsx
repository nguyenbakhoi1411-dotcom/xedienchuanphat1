import { useState } from "react";
import { Search, Save, Printer, Plus, X } from "lucide-react";
import { EditableDataTable, Column } from "@/components/ui/EditableDataTable";

export function GoodsReceiptTab() {
  const [items, setItems] = useState<any[]>([{
    id: "1", productCode: "SP002", productName: "Sản phẩm B", warehouse: "Kho nguyên vật liệu", debitAccount: "152", creditAccount: "331", unit: "Kg", quantity: 100, unitPrice: 0, amount: 0
  }]);

  const columns: Column<any>[] = [
    { key: "productCode", header: "Mã hàng", type: "text", width: "120px" },
    { key: "productName", header: "Tên hàng", type: "text" },
    { key: "warehouse", header: "Kho", type: "text", width: "120px" },
    { key: "debitAccount", header: "TK Nợ", type: "text", width: "100px" },
    { key: "creditAccount", header: "TK Có", type: "text", width: "100px" },
    { key: "unit", header: "ĐVT", type: "text", width: "80px" },
    { key: "quantity", header: "Số lượng", type: "number", width: "100px" },
    { key: "unitPrice", header: "Đơn giá", type: "number", width: "120px" },
    { key: "amount", header: "Thành tiền", type: "number", width: "120px", readOnly: true },
  ];

  const handleItemsChange = (newItems: any[]) => {
    const calculated = newItems.map(item => {
      const amount = (item.quantity || 0) * (item.unitPrice || 0);
      return { ...item, amount };
    });
    setItems(calculated);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-4">
          Phiếu nhập kho MH00481
          <select className="text-sm font-normal px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-600 outline-none">
            <option>1. Mua hàng</option>
            <option>2. Thành phẩm sản xuất</option>
            <option>3. Khác (NVL thừa, HH thuê gia công, ...)</option>
          </select>
        </h2>
        <div className="flex items-center gap-2">
          <button className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm">
            <Save className="w-4 h-4" /> Cất và In
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mã đối tượng</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:border-emerald-500" placeholder="Chọn đối tượng..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tên đối tượng</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-slate-50" readOnly />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Địa chỉ</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Người giao hàng</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Diễn giải</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" defaultValue="Nhập kho khác" />
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500">Ngày hạch toán</span>
                  <input type="datetime-local" className="text-sm bg-transparent font-medium text-slate-800 outline-none text-right" defaultValue="2026-06-20T23:40:37" />
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500">Ngày chứng từ</span>
                  <input type="date" className="text-sm bg-transparent font-medium text-slate-800 outline-none text-right" defaultValue="2026-06-20" />
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500">Số chứng từ</span>
                  <input type="text" className="text-sm bg-transparent font-bold text-slate-800 outline-none text-right w-24" defaultValue="MH00481" />
                </div>
              </div>
              <div className="mt-4 text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng tiền</p>
                <p className="text-3xl font-bold text-emerald-600">{new Intl.NumberFormat('vi-VN').format(totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex gap-1 bg-slate-50 border-b border-slate-200 px-2 pt-2">
            <button className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-white border-t-2 border-emerald-500 rounded-t-lg">Hàng tiền</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <EditableDataTable columns={columns} value={items} onChange={handleItemsChange} defaultRow={{}} />
          </div>
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-start">
            <div className="flex gap-2">
              <button onClick={() => handleItemsChange([...items, {id: Math.random().toString()}])} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Thêm dòng
              </button>
              <button onClick={() => setItems([])} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-red-50 text-red-600 flex items-center gap-1">
                <X className="w-3 h-3" /> Xóa hết dòng
              </button>
            </div>
            <div>
               <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="rounded text-emerald-600" /> Lấy đơn giá nhập theo đơn giá BQCK</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
