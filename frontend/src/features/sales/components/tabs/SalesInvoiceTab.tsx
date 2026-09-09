import { useState } from "react";
import { Search, Save, Printer } from "lucide-react";
import { EditableDataTable, Column } from "@/components/ui/EditableDataTable";

export function SalesInvoiceTab() {
  const [items, setItems] = useState<any[]>([{
    id: "1", productCode: "SP001", productName: "Sản phẩm A", unit: "Cái", quantity: 1, unitPrice: 150000, amount: 150000
  }]);

  const columns: Column<any>[] = [
    { key: "productCode", header: "Mã hàng", type: "text", width: "120px" },
    { key: "productName", header: "Tên hàng", type: "text" },
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

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">
          Hóa đơn bán hàng hóa, dịch vụ trong nước
        </h2>
        <div className="flex items-center gap-2">
          <button className="px-4 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200">
            Chưa phát hành
          </button>
          <button className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm">
            <Save className="w-4 h-4" /> Cất và In
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
          <p className="text-sm text-slate-500">Mẫu số HD, Ký hiệu HD, Số hóa đơn, Mã số thuế, Hình thức thanh toán...</p>
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
