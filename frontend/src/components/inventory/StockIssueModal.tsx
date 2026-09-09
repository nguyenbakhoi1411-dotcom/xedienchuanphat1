"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { inventoryProductOptions } from "@/features/inventory/inventoryOptions";
import { inventoryApi } from "@/features/inventory/api";
import { toast } from "sonner";

type StockIssueModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

// Mock available quantity for validation
const MOCK_AVAILABLE_QTY: Record<number, number> = {
  1: 50,
  2: 120,
  3: 15,
  4: 0,
};

export function StockIssueModal({ open, onClose, onSuccess }: StockIssueModalProps) {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({ customerId: 1, branchId: 1, issueDate: new Date().toISOString().slice(0, 10), reference: "" });
  const [items, setItems] = useState([{ productId: 1, quantity: 1 }]);
  const [note, setNote] = useState("");

  const handleAddItem = () => setItems([...items, { productId: 1, quantity: 1 }]);
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const validateItems = () => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const available = MOCK_AVAILABLE_QTY[item.productId] ?? 100;
      if (item.quantity > available) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateItems()) {
      toast.error("Vui lòng kiểm tra lại số lượng xuất không hợp lệ");
      return;
    }
    
    setLoading(true);
    try {
      // Create issue
      const payload = { ...info, items, note };
      const issue = await inventoryApi.createIssue(payload);
      
      // Confirm issue sequentially
      await inventoryApi.confirmIssue(issue.id);
      
      toast.success("Xuất kho thành công");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xuất kho");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} title="Phiếu xuất kho" size="lg" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info Section */}
        <div>
          <h3 className="text-lg font-medium text-text mb-3">1. Thông tin phiếu xuất</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Khách hàng / Đối tác</span>
              <select className="input-class mt-1 block w-full rounded-md border p-2" value={info.customerId} onChange={(e) => setInfo({...info, customerId: Number(e.target.value)})}>
                <option value={1}>Khách hàng A</option>
                <option value={2}>Khách hàng B</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Từ Chi nhánh</span>
              <select className="input-class mt-1 block w-full rounded-md border p-2" value={info.branchId} onChange={(e) => setInfo({...info, branchId: Number(e.target.value)})}>
                <option value={1}>Chi nhánh Trung tâm</option>
                <option value={2}>Chi nhánh Q1</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Ngày xuất</span>
              <input type="date" className="input-class mt-1 block w-full rounded-md border p-2" value={info.issueDate} onChange={(e) => setInfo({...info, issueDate: e.target.value})} required />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Mã tham chiếu</span>
              <input type="text" className="input-class mt-1 block w-full rounded-md border p-2" value={info.reference} onChange={(e) => setInfo({...info, reference: e.target.value})} placeholder="Số đơn hàng..." />
            </label>
          </div>
        </div>

        {/* Table Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-text">2. Danh sách sản phẩm</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>+ Thêm sản phẩm</Button>
          </div>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3">Sản phẩm</th>
                  <th className="p-3 w-32">Tồn kho</th>
                  <th className="p-3 w-40">SL Xuất</th>
                  <th className="p-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const available = MOCK_AVAILABLE_QTY[item.productId] ?? 100;
                  const isError = item.quantity > available;
                  return (
                    <tr key={idx} className="border-t">
                      <td className="p-2">
                        <select className="w-full rounded-md border p-2" value={item.productId} onChange={(e) => updateItem(idx, "productId", Number(e.target.value))}>
                          {inventoryProductOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </td>
                      <td className="p-2 text-center font-medium">
                        {available}
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" 
                          min={1} 
                          className={`w-full rounded-md border p-2 ${isError ? 'border-red-500 bg-red-50 text-red-700' : ''}`} 
                          value={item.quantity} 
                          onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} 
                          required 
                        />
                        {isError && <span className="text-xs text-red-500 block mt-1">Vượt quá tồn kho</span>}
                      </td>
                      <td className="p-2">
                        <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => handleRemoveItem(idx)}>Xóa</Button>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">Chưa có sản phẩm nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Note Section */}
        <div>
          <h3 className="text-lg font-medium text-text mb-3">3. Ghi chú</h3>
          <textarea className="w-full rounded-md border p-2 min-h-24" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập ghi chú phiếu xuất..."></textarea>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button type="submit" disabled={loading}>{loading ? "Đang xử lý..." : "Lưu & Xác nhận xuất kho"}</Button>
        </div>
      </form>
    </Modal>
  );
}
