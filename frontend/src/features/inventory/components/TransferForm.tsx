"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { X, Upload, HelpCircle, Settings, ChevronDown, Plus, Trash2, Printer, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

interface TransferFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  transferId?: number;
}

const TRANSFER_TYPES = [
  "Xuất kho kiêm vận chuyển nội bộ",
  "Xuất kho gửi bán đại lý",
  "Xuất chuyển kho nội bộ",
];

const defaultItem = () => ({
  id: Date.now() + Math.random(),
  productId: '',
  productCode: '',
  productName: '',
  unitOfMeasure: '',
  quantity: 1,
  note: '',
});

export function TransferForm({ onSuccess, onCancel, transferId }: TransferFormProps) {
  const [items, setItems] = useState<any[]>([defaultItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const isEditing = !!transferId;

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      transferNo: '',
      transferDate: new Date().toISOString().split('T')[0],
      fromWarehouseId: '',
      toWarehouseId: '',
      description: '',
      transferType: TRANSFER_TYPES[0],
      transporter: '',
      transportContract: '',
      transportVehicle: '',
      branchId: '1',
    },
  });

  const fromWarehouseId = watch('fromWarehouseId');
  const toWarehouseId = watch('toWarehouseId');

  useEffect(() => {
    api.get('/api/inventory/v2/warehouses?size=100')
      .then(r => setWarehouses(r.data.items || []))
      .catch(() => {});
  }, []);

  const addItem = () => setItems(prev => [...prev, defaultItem()]);
  const removeItem = (idx: number) => { if (items.length === 1) return; setItems(prev => prev.filter((_, i) => i !== idx)); };
  const removeAllItems = () => setItems([defaultItem()]);

  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text/plain');
    const rows = text.trim().split('\n').filter(r => r.trim());
    if (!rows.length) return;
    const parsed = rows.map(row => { const cols = row.split('\t'); return { ...defaultItem(), productCode: cols[0] || '', productName: cols[1] || '', unitOfMeasure: cols[2] || '', quantity: Number(cols[3]) || 1 }; });
    setItems(prev => { const existing = prev.filter(it => it.productCode || it.productName); return [...existing, ...parsed]; });
    toast.success(`Đã dán ${parsed.length} dòng từ Excel`);
  };

  const totalQty = items.reduce((s, it) => s + (Number(it.quantity) || 0), 0);

  const onSubmit = async (data: any) => {
    if (!data.fromWarehouseId || !data.toWarehouseId) {
      toast.error("Vui lòng chọn kho xuất và kho nhập!");
      return;
    }
    if (data.fromWarehouseId === data.toWarehouseId) {
      toast.error("Kho đi và kho đến không được trùng nhau!");
      return;
    }
    const validItems = items.filter(it => it.productCode || it.productId || it.productName);
    if (validItems.length === 0) { toast.error("Vui lòng nhập ít nhất một mặt hàng!"); return; }
    try {
      setIsSubmitting(true);
      const payload = { ...data, items: validItems };
      isEditing
        ? await api.put(`/api/inventory/v2/transfers/${transferId}`, payload)
        : await api.post("/api/inventory/v2/transfers", payload);
      toast.success(isEditing ? "Đã cập nhật phiếu chuyển kho!" : "Đã lưu phiếu chuyển kho thành công!");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi lưu phiếu chuyển kho");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 h-[50px] border-b border-gray-200 bg-white shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors">
            <span className="font-bold text-gray-800 text-[15px]">Chuyển kho</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          <div className="h-5 w-px bg-gray-200 mx-1" />
          <div className="flex items-center gap-4 bg-blue-50 rounded-md px-3 h-7">
            {TRANSFER_TYPES.map(t => (
              <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" value={t} {...register('transferType')} className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500" />
                <span className="text-[12px] font-medium text-gray-700">{t}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded border border-gray-200">
            <Upload className="w-3.5 h-3.5" /> Đính kèm
          </button>
          <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><HelpCircle className="w-4 h-4" /></button>
          <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><Settings className="w-4 h-4" /></button>
          <button type="button" onClick={onCancel} className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-auto bg-[#f4f5f8]">
        <form id="transferForm" onSubmit={handleSubmit(onSubmit)}>
          {/* Warehouse route bar */}
          <div className="mx-3 mt-3 bg-white rounded-lg border border-gray-200 shadow-sm p-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-0.5">
                <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Kho xuất (Đi)</label>
                <select {...register('fromWarehouseId')} className="w-full h-8 border border-gray-200 rounded px-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                  <option value="">-- Chọn kho xuất --</option>
                  {warehouses.map(w => <option key={w.id} value={w.id} disabled={String(w.id) === toWarehouseId}>{w.warehouseName}</option>)}
                </select>
              </div>
              <div className="flex flex-col items-center justify-center pt-4">
                <ArrowLeftRight className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 space-y-0.5">
                <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Đơn vị nhận / Kho nhập (Đến)</label>
                <select {...register('toWarehouseId')} className="w-full h-8 border border-gray-200 rounded px-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                  <option value="">-- Chọn kho nhận --</option>
                  {warehouses.map(w => <option key={w.id} value={w.id} disabled={String(w.id) === fromWarehouseId}>{w.warehouseName}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 px-3 pt-3">
            {/* LEFT info panel */}
            <div className="flex-[3] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="space-y-0.5">
                  <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Lệnh điều động số</label>
                  <input type="text" {...register('description')} className="w-full h-8 border-b border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none text-[13px] bg-transparent transition-colors" placeholder="Số lệnh điều động..." />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Người vận chuyển</label>
                  <input type="text" {...register('transporter')} className="w-full h-8 border-b border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none text-[13px] bg-transparent transition-colors" />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Hợp đồng vận chuyển</label>
                  <input type="text" {...register('transportContract')} className="w-full h-8 border-b border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none text-[13px] bg-transparent transition-colors" />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Phương tiện vận chuyển</label>
                  <input type="text" {...register('transportVehicle')} className="w-full h-8 border-b border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none text-[13px] bg-transparent transition-colors" />
                </div>
              </div>
            </div>

            {/* RIGHT totals */}
            <div className="w-[260px] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center py-4 bg-gradient-to-b from-blue-50 to-white border-b border-gray-100">
                <span className="text-[11px] text-gray-500 uppercase tracking-widest font-medium">Tổng SL chuyển</span>
                <span className="text-3xl font-bold text-blue-600 mt-1 tabular-nums">{new Intl.NumberFormat('vi-VN').format(totalQty)}</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-0.5">
                  <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Ngày hạch toán</label>
                  <input type="date" {...register('transferDate')} className="w-full h-8 border-b border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none text-[13px] bg-transparent transition-colors" />
                </div>
                <div className="col-span-2 space-y-0.5">
                  <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Số chứng từ</label>
                  <input type="text" {...register('transferNo')} className="w-full h-8 border-b border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none text-[13px] bg-transparent transition-colors" placeholder="Tự động sinh nếu để trống" />
                </div>
              </div>
            </div>
          </div>

          {/* DataGrid */}
          <div className="mx-3 mt-3 mb-3 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col min-h-[260px]">
            <div className="flex items-center justify-between px-3 h-10 border-b border-gray-200 bg-gray-50/80 rounded-t-lg">
              <h3 className="text-[13px] font-semibold text-gray-700">Hàng hóa chuyển</h3>
            </div>

            <div onPaste={handlePaste} className="flex-1 overflow-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="text-gray-500 border-b border-gray-200 text-[12px]">
                    <th className="py-2 px-3 text-center w-10 font-semibold">#</th>
                    <th className="py-2 px-2 text-left w-32 border-l border-gray-100 font-semibold">Mã hàng</th>
                    <th className="py-2 px-2 text-left border-l border-gray-100 font-semibold">Tên hàng</th>
                    <th className="py-2 px-2 text-left w-20 border-l border-gray-100 font-semibold">ĐVT</th>
                    <th className="py-2 px-2 text-right w-28 border-l border-gray-100 font-semibold">Số lượng chuyển</th>
                    <th className="py-2 px-2 text-left border-l border-gray-100 font-semibold">Ghi chú</th>
                    <th className="py-2 px-2 w-8 border-l border-gray-100"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/20 group">
                      <td className="py-1 px-3 text-center text-gray-400 text-[12px]">{idx + 1}</td>
                      <td className="p-0 border-l border-gray-100"><input value={item.productCode} onChange={e => updateItem(idx, 'productCode', e.target.value)} className="w-full h-8 px-2 text-[13px] bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-blue-400" placeholder="Mã..." /></td>
                      <td className="p-0 border-l border-gray-100"><input value={item.productName} onChange={e => updateItem(idx, 'productName', e.target.value)} className="w-full h-8 px-2 text-[13px] bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-blue-400" placeholder="Tên hàng..." /></td>
                      <td className="p-0 border-l border-gray-100"><input value={item.unitOfMeasure} onChange={e => updateItem(idx, 'unitOfMeasure', e.target.value)} className="w-full h-8 px-2 text-[13px] bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-blue-400" /></td>
                      <td className="p-0 border-l border-gray-100"><input type="number" min="0" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="w-full h-8 px-2 text-[13px] text-right bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-blue-400" /></td>
                      <td className="p-0 border-l border-gray-100"><input value={item.note} onChange={e => updateItem(idx, 'note', e.target.value)} className="w-full h-8 px-2 text-[13px] bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-blue-400" /></td>
                      <td className="py-1 px-1 border-l border-gray-100 text-center">
                        <button type="button" onClick={() => removeItem(idx)} className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50/80 font-semibold text-[13px]">
                    <td colSpan={4} className="py-2.5 px-3 text-right text-gray-600">Tổng số lượng:</td>
                    <td className="py-2.5 px-2 text-right text-blue-700 font-bold">{totalQty}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 p-2 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
              <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-white hover:shadow-sm rounded border border-transparent hover:border-gray-200 transition-all font-medium">
                <Plus className="w-3.5 h-3.5 text-blue-500" /> Thêm dòng
              </button>
              <button type="button" onClick={removeAllItems} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-white hover:shadow-sm rounded border border-transparent hover:border-gray-200 transition-all font-medium">
                <Trash2 className="w-3.5 h-3.5 text-red-400" /> Xóa hết
              </button>
              <span className="text-[12px] text-gray-400 ml-auto">Tip: Ctrl+V để dán từ Excel</span>
            </div>
          </div>
        </form>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.06)] shrink-0">
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded border border-gray-200"><Printer className="w-3.5 h-3.5" /> In</button>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="px-5 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded border border-gray-300 transition-colors">Hủy</button>
          <div className="flex border border-blue-600 rounded-md overflow-hidden shadow-sm">
            <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="px-6 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors min-w-[100px] disabled:opacity-60 flex items-center gap-1.5">
              {isSubmitting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang lưu...</> : 'Cất'}
            </button>
            <div className="w-px bg-blue-700" />
            <button type="button" className="px-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"><ChevronDown className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
