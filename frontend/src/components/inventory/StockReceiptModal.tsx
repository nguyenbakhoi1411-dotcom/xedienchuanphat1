"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { inventoryProductOptions } from "@/features/inventory/inventoryOptions";
import { inventoryApi } from "@/features/inventory/api";
import { toast } from "sonner";

type StockReceiptModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function StockReceiptModal({ open, onClose, onSuccess }: StockReceiptModalProps) {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({ supplierId: 1, branchId: 1, receiptDate: new Date().toISOString().slice(0, 10), reference: "" });
  const [items, setItems] = useState([{ productId: 1, quantity: 1, unitCost: 0, lotNo: "", expiryDate: "", frameNumber: "", engineNumber: "" }]);
  const [note, setNote] = useState("");

  const isAdmin = typeof window !== "undefined" && localStorage.getItem("token") 
    ? (JSON.parse(atob(localStorage.getItem("token")!.split(".")[1]))?.roles || []).includes("ROLE_ADMIN") 
    : false;

  const handleAddItem = () => setItems([...items, { productId: 1, quantity: 1, unitCost: 0, lotNo: "", expiryDate: "", frameNumber: "", engineNumber: "" }]);
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const handleDuplicateItem = (index: number) => {
    const itemToCopy = items[index];
    setItems([...items, { ...itemToCopy, lotNo: "", expiryDate: "", frameNumber: "", engineNumber: "" }]); // copy product & price, clear serials
  };
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    // Force quantity to 1 if user enters frameNumber
    if ((field === "frameNumber" || field === "engineNumber") && value) {
      newItems[index].quantity = 1;
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  const handleSubmit = async (action: 'draft' | 'confirm') => {
    setLoading(true);
    try {
      // Validate EV quantity
      const hasInvalidEV = items.some(i => i.frameNumber && i.quantity !== 1);
      if (hasInvalidEV) {
        toast.error("Xe điện chỉ được nhập số lượng 1 mỗi dòng!");
        return;
      }

      // Create receipt (DRAFT)
      const payload = { ...info, items, note, totalAmount };
      const receipt = await inventoryApi.createReceipt(payload);
      
      if (action === 'confirm') {
        try {
          await inventoryApi.confirmReceipt(receipt.id);
          toast.success("Đã xác nhận nhập kho thành công!");
        } catch (confirmError: any) {
          console.error(confirmError);
          // Catch Maker-Checker access denied error
          if (confirmError?.response?.status === 403 || confirmError?.response?.data?.message?.includes("Maker-Checker")) {
            toast.warning("Lưu nháp thành công. Bạn không có quyền tự duyệt phiếu của mình!");
          } else {
            toast.error("Lưu nháp thành công, nhưng lỗi khi duyệt: " + (confirmError?.response?.data?.message || ""));
          }
        }
      } else {
        toast.success("Đã lưu nháp phiếu nhập kho");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error("Lỗi khi lưu phiếu nhập kho");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} title="Phiếu nhập kho" size="xl" onClose={onClose}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Info Section */}
        <div>
          <h3 className="text-lg font-medium text-text mb-3">1. Thông tin phiếu nhập</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Nhà cung cấp</span>
              <select className="input-class mt-1 block w-full rounded-md border p-2" value={info.supplierId} onChange={(e) => setInfo({...info, supplierId: Number(e.target.value)})}>
                <option value={1}>NCC A</option>
                <option value={2}>NCC B</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Chi nhánh nhận</span>
              <select className="input-class mt-1 block w-full rounded-md border p-2" value={info.branchId} onChange={(e) => setInfo({...info, branchId: Number(e.target.value)})}>
                <option value={1}>Chi nhánh Trung tâm</option>
                <option value={2}>Chi nhánh Q1</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Ngày nhập</span>
              <input type="date" className="input-class mt-1 block w-full rounded-md border p-2" value={info.receiptDate} onChange={(e) => setInfo({...info, receiptDate: e.target.value})} required />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Chứng từ gốc (PO/Invoice)</span>
              <input type="text" className="input-class mt-1 block w-full rounded-md border p-2" value={info.reference} onChange={(e) => setInfo({...info, reference: e.target.value})} placeholder="Số PO hoặc Hóa đơn NCC..." required />
            </label>
          </div>
        </div>

        {/* Table Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-text">2. Danh sách hàng hóa</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>+ Thêm hàng hóa</Button>
          </div>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3">Hàng hóa</th>
                  <th className="p-3 w-40">Lô / Hạn SD</th>
                  <th className="p-3 w-40">Khung / Máy (Xe)</th>
                  <th className="p-3 w-24">Số lượng</th>
                  <th className="p-3 w-32">Đơn giá</th>
                  <th className="p-3 w-32">Thành tiền</th>
                  <th className="p-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">
                      <select className="w-full rounded-md border p-2 text-sm" value={item.productId} onChange={(e) => updateItem(idx, "productId", Number(e.target.value))}>
                        {inventoryProductOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </td>
                    <td className="p-2 space-y-1">
                      <input type="text" className="w-full rounded-md border p-1.5 text-sm" placeholder="Số lô..." value={item.lotNo} onChange={(e) => updateItem(idx, "lotNo", e.target.value)} />
                      <input type="date" className="w-full rounded-md border p-1.5 text-sm" value={item.expiryDate} onChange={(e) => updateItem(idx, "expiryDate", e.target.value)} />
                    </td>
                    <td className="p-2 space-y-1">
                      <input type="text" className="w-full rounded-md border p-1.5 text-sm" placeholder="Số khung..." value={item.frameNumber} onChange={(e) => updateItem(idx, "frameNumber", e.target.value)} />
                      <input type="text" className="w-full rounded-md border p-1.5 text-sm" placeholder="Số máy..." value={item.engineNumber} onChange={(e) => updateItem(idx, "engineNumber", e.target.value)} />
                    </td>
                    <td className="p-2 align-top">
                      <input type="number" min={1} className="w-full rounded-md border p-1.5 text-sm" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} required readOnly={!!item.frameNumber} />
                    </td>
                    <td className="p-2 align-top">
                      <input type="number" min={0} className="w-full rounded-md border p-1.5 text-sm" value={item.unitCost} onChange={(e) => updateItem(idx, "unitCost", Number(e.target.value))} required />
                    </td>
                    <td className="p-2 font-medium align-top pt-3">
                      {(item.quantity * item.unitCost).toLocaleString()} đ
                    </td>
                    <td className="p-2 align-top pt-2 flex flex-col gap-1">
                      <Button type="button" variant="ghost" size="sm" className="text-blue-600 px-2 h-7" onClick={() => handleDuplicateItem(idx)}>Nhân bản</Button>
                      <Button type="button" variant="ghost" size="sm" className="text-red-600 px-2 h-7" onClick={() => handleRemoveItem(idx)}>Xóa</Button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-slate-500">Chưa có sản phẩm nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-2 italic">* Đối với Xe điện, vui lòng điền số Khung/Máy. Số lượng sẽ tự động giới hạn là 1 mỗi dòng.</p>
        </div>

        {/* Summary Section */}
        <div className="flex justify-end bg-slate-50 p-4 rounded-lg border">
          <div className="text-right">
            <p className="text-sm text-slate-500">Tổng cộng (VNĐ)</p>
            <p className="text-2xl font-bold text-primary">{totalAmount.toLocaleString()} đ</p>
          </div>
        </div>

        {/* Note Section */}
        <div>
          <h3 className="text-lg font-medium text-text mb-3">3. Ghi chú</h3>
          <textarea className="w-full rounded-md border p-2 min-h-24" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập ghi chú phiếu nhập..."></textarea>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button type="button" variant="outline" onClick={() => handleSubmit('draft')} disabled={loading}>
            {loading ? "Đang xử lý..." : "Lưu Nháp"}
          </Button>
          {isAdmin && (
            <Button type="button" onClick={() => handleSubmit('confirm')} disabled={loading}>
              {loading ? "Đang xử lý..." : "Lưu & Xác nhận Cộng Kho"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
