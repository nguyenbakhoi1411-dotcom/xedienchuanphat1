import { useState } from "react";
import { Search, Save, X, Printer, Plus } from "lucide-react";
import { EditableDataTable, Column } from "@/components/ui/EditableDataTable";

interface OrderItem {
  id: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  soldQuantity: number;
  deliveredQuantity: number;
  unitPrice: number;
  amount: number;
  vatRate: number;
  vatAmount: number;
}

export function SalesOrderTab() {
  const [items, setItems] = useState<OrderItem[]>([{
    id: "1",
    productCode: "SP001",
    productName: "Sản phẩm mẫu 1",
    unit: "Cái",
    quantity: 1,
    soldQuantity: 0,
    deliveredQuantity: 0,
    unitPrice: 100000,
    amount: 100000,
    vatRate: 10,
    vatAmount: 10000
  }]);

  const columns: Column<OrderItem>[] = [
    { key: "productCode", header: "Mã hàng", type: "text", width: "120px" },
    { key: "productName", header: "Tên hàng", type: "text" },
    { key: "unit", header: "ĐVT", type: "text", width: "80px" },
    { key: "quantity", header: "Số lượng", type: "number", width: "100px" },
    { key: "soldQuantity", header: "Số lượng đã bán", type: "number", width: "120px", readOnly: true },
    { key: "deliveredQuantity", header: "Số lượng đã xuất", type: "number", width: "120px", readOnly: true },
    { key: "unitPrice", header: "Đơn giá", type: "number", width: "120px" },
    { key: "amount", header: "Thành tiền", type: "number", width: "120px", readOnly: true },
    { key: "vatRate", header: "% Thuế GTGT", type: "number", width: "100px" },
    { key: "vatAmount", header: "Tiền thuế GTGT", type: "number", width: "120px", readOnly: true },
  ];

  const defaultRow: OrderItem = {
    id: Math.random().toString(),
    productCode: "",
    productName: "",
    unit: "",
    quantity: 0,
    soldQuantity: 0,
    deliveredQuantity: 0,
    unitPrice: 0,
    amount: 0,
    vatRate: 0,
    vatAmount: 0
  };

  const handleItemsChange = (newItems: OrderItem[]) => {
    // Recalculate amounts
    const calculated = newItems.map(item => {
      const amount = (item.quantity || 0) * (item.unitPrice || 0);
      const vatAmount = amount * (item.vatRate || 0) / 100;
      return { ...item, amount, vatAmount };
    });
    setItems(calculated);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalVat = items.reduce((sum, item) => sum + (item.vatAmount || 0), 0);
  const grandTotal = totalAmount + totalVat;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Đơn đặt hàng DH00001
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Nhập số báo giá để lấy dữ liệu..." className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <Printer className="w-4 h-4" /> In
          </button>
          <button className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm">
            <Save className="w-4 h-4" /> Lưu (Ctrl+S)
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Form Header Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-3 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Khách hàng</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Chọn khách hàng..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tên khách hàng</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-slate-50" readOnly />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Địa chỉ</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Diễn giải</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" defaultValue="Bán hàng" />
              </div>
              <div className="grid grid-cols-3 gap-2 col-span-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Điều khoản TT</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none bg-white">
                    <option>Thanh toán ngay</option>
                    <option>Trả sau</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Số ngày được nợ</label>
                  <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" defaultValue={0} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tình trạng đơn hàng</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none bg-white">
                    <option>Chưa thực hiện</option>
                    <option>Đang thực hiện</option>
                    <option>Đã hoàn thành</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500">Ngày đơn hàng</span>
                  <input type="date" className="text-sm bg-transparent font-medium text-slate-800 outline-none text-right" defaultValue="2026-06-20" />
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500">Số đơn hàng</span>
                  <input type="text" className="text-sm bg-transparent font-bold text-slate-800 outline-none text-right w-24" defaultValue="DH00001" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Hạn giao hàng</span>
                  <input type="date" className="text-sm bg-transparent font-medium text-slate-800 outline-none text-right" />
                </div>
              </div>
              <div className="mt-4 text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng tiền thanh toán</p>
                <p className="text-3xl font-bold text-emerald-600">{new Intl.NumberFormat('vi-VN').format(grandTotal)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Detail Data */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex gap-1 bg-slate-50 border-b border-slate-200 px-2 pt-2">
            <button className="px-4 py-2 text-sm font-semibold text-emerald-700 bg-white border-t-2 border-emerald-500 rounded-t-lg">Hàng tiền</button>
            <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">Chiết khấu</button>
            <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">Khác</button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {/* The Editable Data Table */}
            <EditableDataTable 
              columns={columns}
              value={items}
              onChange={handleItemsChange}
              defaultRow={defaultRow}
            />
          </div>

          {/* Footer Summary */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-start">
            <div className="flex gap-2">
              <button onClick={() => handleItemsChange([...items, {...defaultRow, id: Math.random().toString()}])} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Thêm dòng
              </button>
              <button onClick={() => setItems([])} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded hover:bg-red-50 text-red-600 flex items-center gap-1">
                <X className="w-3 h-3" /> Xóa hết dòng
              </button>
            </div>
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng tiền hàng</span>
                <span className="font-semibold text-slate-700">{new Intl.NumberFormat('vi-VN').format(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thuế GTGT</span>
                <span className="font-semibold text-slate-700">{new Intl.NumberFormat('vi-VN').format(totalVat)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800">Tổng tiền thanh toán</span>
                <span className="font-bold text-emerald-600">{new Intl.NumberFormat('vi-VN').format(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
