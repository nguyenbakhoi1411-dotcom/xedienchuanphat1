import { useState } from "react";
import { Search, Save, X, Printer, Plus } from "lucide-react";
import { EditableDataTable, Column } from "@/components/ui/EditableDataTable";

export function QuoteTab() {
  const [items, setItems] = useState<any[]>([{
    id: "1", productCode: "SP001", productName: "Sản phẩm A", unit: "Cái", quantity: 10, unitPrice: 150000, amount: 1500000, vatRate: 10, vatAmount: 150000
  }]);

  const columns: Column<any>[] = [
    { key: "productCode", header: "Mã hàng", type: "text", width: "120px" },
    { key: "productName", header: "Tên hàng", type: "text" },
    { key: "unit", header: "ĐVT", type: "text", width: "80px" },
    { key: "quantity", header: "Số lượng", type: "number", width: "100px" },
    { key: "unitPrice", header: "Đơn giá", type: "number", width: "120px" },
    { key: "amount", header: "Thành tiền", type: "number", width: "120px", readOnly: true },
    { key: "vatRate", header: "% Thuế GTGT", type: "number", width: "100px" },
    { key: "vatAmount", header: "Tiền thuế GTGT", type: "number", width: "120px", readOnly: true },
  ];

  const handleItemsChange = (newItems: any[]) => {
    const calculated = newItems.map(item => {
      const amount = (item.quantity || 0) * (item.unitPrice || 0);
      const vatAmount = amount * (item.vatRate || 0) / 100;
      return { ...item, amount, vatAmount };
    });
    setItems(calculated);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Báo giá BG00001</h2>
        <div className="flex items-center gap-2">
          <button className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-2">
            <Save className="w-4 h-4" /> Lưu và Gửi Email
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
          <p className="text-sm text-slate-500 mb-4">Nhập thông tin khách hàng và bảng giá...</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex gap-1 bg-slate-50 border-b border-slate-200 px-2 pt-2">
            <button className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-white border-t-2 border-emerald-500 rounded-t-lg">Hàng tiền</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <EditableDataTable columns={columns} value={items} onChange={handleItemsChange} defaultRow={{}} />
          </div>
        </div>
      </div>
    </div>
  );
}
