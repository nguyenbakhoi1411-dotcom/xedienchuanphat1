"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { X, Upload, HelpCircle, Settings, ChevronDown, Plus, Trash2, Printer, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

interface InboundFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  receiptId?: number; // for editing
}

const RECEIPT_TYPES = [
  "1. Thành phẩm sản xuất",
  "2. Hàng bán bị trả lại",
  "3. Khác (NVL thừa, HH thuê gia công, ...)",
];

const defaultItem = () => ({
  id: Date.now() + Math.random(),
  productId: '',
  productCode: '',
  productName: '',
  warehouseCode: '',
  unitOfMeasure: '',
  quantity: 1,
  unitCost: 0,
  lineTotal: 0,
  note: '',
});

export function InboundForm({ onSuccess, onCancel, receiptId }: InboundFormProps) {
  const [items, setItems] = useState<any[]>([defaultItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!receiptId;

  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      receiptNo: '',
      receiptDate: new Date().toISOString().split('T')[0],
      warehouseId: '',
      description: '',
      objectCode: '',
      objectAddress: '',
      deliverer: '',
      receiptType: RECEIPT_TYPES[2],
      branchId: '1',
    },
  });

  useEffect(() => {
    api.get('/api/inventory/v2/warehouses?size=100')
      .then(r => setWarehouses(r.data.items || []))
      .catch(() => {});
  }, []);

  const addItem = () => setItems(prev => [...prev, defaultItem()]);

  const removeItem = (idx: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const removeAllItems = () => setItems([defaultItem()]);

  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'quantity' || field === 'unitCost') {
        const q = Number(next[idx].quantity) || 0;
        const c = Number(next[idx].unitCost) || 0;
        next[idx].lineTotal = q * c;
      }
      return next;
    });
  };

  // Paste from Excel handler
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text/plain');
    const rows = text.trim().split('\n').filter(r => r.trim());
    if (rows.length === 0) return;
    const parsed = rows.map(row => {
      const cols = row.split('\t');
      const qty = Number(cols[3]) || 1;
      const cost = Number((cols[4] || '0').replace(/[,\.]/g, match => match === '.' && cols[4].split('.').length > 2 ? '' : match)) || 0;
      return { ...defaultItem(), productCode: cols[0] || '', productName: cols[1] || '', unitOfMeasure: cols[2] || '', quantity: qty, unitCost: cost, lineTotal: qty * cost };
    });
    if (parsed.length > 0) {
      setItems(prev => {
        const existing = prev.filter(it => it.productCode || it.productName);
        return [...existing, ...parsed];
      });
      toast.success(`Đã dán ${parsed.length} dòng từ Excel`);
    }
  };

  const totalAmount = items.reduce((s, it) => s + (Number(it.lineTotal) || 0), 0);

  const onSubmit = async (data: any) => {
    const validItems = items.filter(it => it.productCode || it.productId || it.productName);
    if (validItems.length === 0) {
      toast.error("Vui lòng nhập ít nhất một mặt hàng!");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = { ...data, items: validItems };
      if (isEditing) {
        await api.put(`/api/inventory/v2/receipts/${receiptId}`, payload);
        toast.success("Đã cập nhật phiếu nhập kho!");
      } else {
        await api.post("/api/inventory/v2/receipts", payload);
        toast.success("Đã lưu phiếu nhập kho thành công!");
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi lưu phiếu nhập kho");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveAndNew = async (data: any) => {
    const validItems = items.filter(it => it.productCode || it.productId || it.productName);
    if (validItems.length === 0) { toast.error("Vui lòng nhập ít nhất một mặt hàng!"); return; }
    try {
      setIsSaving(true);
      await api.post("/api/inventory/v2/receipts", { ...data, items: validItems });
      toast.success("Đã lưu! Tạo phiếu mới...");
      reset();
      setItems([defaultItem()]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi lưu");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 h-[50px] border-b border-gray-200 bg-white shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors">
            <span className="font-bold text-gray-800 text-[15px]">Phiếu nhập kho</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          <div className="h-5 w-px bg-gray-200 mx-1" />
          <select
            {...register('receiptType')}
            className="h-7 px-2 text-[13px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white text-green-700 font-medium min-w-[260px]"
          >
            {RECEIPT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded transition-colors border border-gray-200">
            <Upload className="w-3.5 h-3.5" /> Đính kèm
          </button>
          <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"><HelpCircle className="w-4 h-4" /></button>
          <button type="button" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"><Settings className="w-4 h-4" /></button>
          <button type="button" onClick={onCancel} className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded transition-colors"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 overflow-auto bg-[#f4f5f8]">
        <form id="inboundForm" onSubmit={handleSubmit(onSubmit)}>
          {/* Top panels */}
          <div className="flex gap-3 p-3">
            {/* LEFT info panel */}
            <div className="flex-[3] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Object bar */}
              <div className="h-9 bg-gray-50 border-b border-gray-200 flex items-center px-3 gap-2">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  {...register('objectCode')}
                  placeholder="Nhập mã đối tượng (nhà cung cấp)..."
                  className="flex-1 text-[13px] bg-transparent border-none focus:outline-none"
                />
                <button type="button" className="text-green-600 text-[12px] font-medium hover:underline">Chọn</button>
              </div>
              <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="space-y-0.5">
                  <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Người giao hàng</label>
                  <input type="text" {...register('deliverer')} className="w-full h-8 border-b border-gray-200 hover:border-gray-400 focus:border-green-500 focus:outline-none text-[13px] bg-transparent transition-colors" placeholder="Tên người giao hàng..." />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Địa chỉ</label>
                  <input type="text" {...register('objectAddress')} className="w-full h-8 border-b border-gray-200 hover:border-gray-400 focus:border-green-500 focus:outline-none text-[13px] bg-transparent transition-colors" />
                </div>
                <div className="space-y-0.5 col-span-2">
                  <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Diễn giải</label>
                  <input type="text" {...register('description')} className="w-full h-8 border-b border-gray-200 hover:border-gray-400 focus:border-green-500 focus:outline-none text-[13px] bg-transparent transition-colors" placeholder="Nhập kho khác..." />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Kho nhận</label>
                  <select {...register('warehouseId')} className="w-full h-8 border-b border-gray-200 hover:border-gray-400 focus:border-green-500 focus:outline-none text-[13px] bg-transparent transition-colors">
                    <option value="">-- Chọn kho --</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouseName}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* RIGHT totals panel */}
            <div className="w-[260px] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center py-4 bg-gradient-to-b from-green-50 to-white border-b border-gray-100">
                <span className="text-[11px] text-gray-500 uppercase tracking-widest font-medium">Tổng tiền hàng</span>
                <span className="text-3xl font-bold text-green-700 mt-1 tabular-nums">
                  {new Intl.NumberFormat('vi-VN').format(totalAmount)}
                </span>
                <span className="text-[12px] text-gray-400 mt-0.5">VND</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-0.5">
                  <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Ngày hạch toán</label>
                  <input type="date" {...register('receiptDate')} className="w-full h-8 border-b border-gray-200 hover:border-gray-400 focus:border-green-500 focus:outline-none text-[13px] bg-transparent transition-colors" />
                </div>
                <div className="col-span-2 space-y-0.5">
                  <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide">Số chứng từ</label>
                  <input type="text" {...register('receiptNo')} className="w-full h-8 border-b border-gray-200 hover:border-gray-400 focus:border-green-500 focus:outline-none text-[13px] bg-transparent transition-colors" placeholder="Tự động sinh nếu để trống" />
                </div>
              </div>
            </div>
          </div>

          {/* DataGrid */}
          <div className="mx-3 mb-3 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col min-h-[280px]">
            <div className="flex items-center justify-between px-3 h-10 border-b border-gray-200 bg-gray-50/80 rounded-t-lg">
              <h3 className="text-[13px] font-semibold text-gray-700">Hàng tiền</h3>
              <div className="flex items-center gap-3 text-[12px] text-green-600 font-medium">
                <button type="button" className="hover:underline">Chiết khấu</button>
                <span className="text-gray-300">|</span>
                <button type="button" className="hover:underline">Chi phí</button>
                <span className="text-gray-300">|</span>
                <button type="button" className="hover:underline">Thuế</button>
              </div>
            </div>

            <div onPaste={handlePaste} className="flex-1 overflow-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="text-gray-500 border-b border-gray-200 text-[12px]">
                    <th className="py-2 px-3 text-center w-10 font-semibold">#</th>
                    <th className="py-2 px-2 text-left w-28 border-l border-gray-100 font-semibold">Mã hàng</th>
                    <th className="py-2 px-2 text-left border-l border-gray-100 font-semibold">Tên hàng</th>
                    <th className="py-2 px-2 text-left w-20 border-l border-gray-100 font-semibold">Kho</th>
                    <th className="py-2 px-2 text-left w-16 border-l border-gray-100 font-semibold">ĐVT</th>
                    <th className="py-2 px-2 text-right w-20 border-l border-gray-100 font-semibold">Số lượng</th>
                    <th className="py-2 px-2 text-right w-28 border-l border-gray-100 font-semibold">Đơn giá</th>
                    <th className="py-2 px-2 text-right w-28 border-l border-gray-100 font-semibold">Thành tiền</th>
                    <th className="py-2 px-2 w-8 border-l border-gray-100"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-green-50/20 group">
                      <td className="py-1 px-3 text-center text-gray-400 text-[12px]">{idx + 1}</td>
                      <td className="p-0 border-l border-gray-100">
                        <input value={item.productCode} onChange={e => updateItem(idx, 'productCode', e.target.value)} className="w-full h-8 px-2 text-[13px] bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-green-400" placeholder="Mã..." />
                      </td>
                      <td className="p-0 border-l border-gray-100">
                        <input value={item.productName} onChange={e => updateItem(idx, 'productName', e.target.value)} className="w-full h-8 px-2 text-[13px] bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-green-400" placeholder="Tên hàng..." />
                      </td>
                      <td className="p-0 border-l border-gray-100">
                        <input value={item.warehouseCode} onChange={e => updateItem(idx, 'warehouseCode', e.target.value)} className="w-full h-8 px-2 text-[13px] bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-green-400" />
                      </td>
                      <td className="p-0 border-l border-gray-100">
                        <input value={item.unitOfMeasure} onChange={e => updateItem(idx, 'unitOfMeasure', e.target.value)} className="w-full h-8 px-2 text-[13px] bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-green-400" />
                      </td>
                      <td className="p-0 border-l border-gray-100">
                        <input type="number" min="0" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="w-full h-8 px-2 text-[13px] text-right bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-green-400" />
                      </td>
                      <td className="p-0 border-l border-gray-100">
                        <input type="number" min="0" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', e.target.value)} className="w-full h-8 px-2 text-[13px] text-right bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-green-400" />
                      </td>
                      <td className="p-0 border-l border-gray-100">
                        <input readOnly value={new Intl.NumberFormat('vi-VN').format(item.lineTotal || 0)} className="w-full h-8 px-2 text-[13px] text-right bg-gray-50/50 text-gray-600 cursor-default focus:outline-none" />
                      </td>
                      <td className="py-1 px-1 border-l border-gray-100 text-center">
                        <button type="button" onClick={() => removeItem(idx)} className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50/80 font-semibold text-[13px]">
                    <td colSpan={7} className="py-2.5 px-3 text-right text-gray-600">Tổng số lượng: <span className="text-gray-900">{items.reduce((s, it) => s + (Number(it.quantity) || 0), 0)}</span> &nbsp;|&nbsp; Tổng tiền:</td>
                    <td className="py-2.5 px-2 text-right text-green-700 font-bold">{new Intl.NumberFormat('vi-VN').format(totalAmount)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 p-2 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
              <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-white hover:shadow-sm rounded border border-transparent hover:border-gray-200 transition-all font-medium">
                <Plus className="w-3.5 h-3.5 text-green-600" /> Thêm dòng
              </button>
              <button type="button" onClick={removeAllItems} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-white hover:shadow-sm rounded border border-transparent hover:border-gray-200 transition-all font-medium">
                <Trash2 className="w-3.5 h-3.5 text-red-400" /> Xóa hết
              </button>
              <span className="text-[12px] text-gray-400 ml-auto">Tip: Dán (Ctrl+V) từ Excel để nhập nhanh</span>
              <span className="text-[12px] text-gray-400">Số dòng/trang:</span>
              <select className="h-7 text-[12px] border border-gray-200 rounded px-1 focus:outline-none focus:ring-1 focus:ring-green-500">
                <option>20</option><option>50</option><option>100</option>
              </select>
            </div>
          </div>

          {/* Notes section */}
          <div className="mx-3 mb-3 bg-white rounded-lg border border-gray-200 shadow-sm p-3">
            <label className="block text-[11px] text-gray-500 font-medium uppercase tracking-wide mb-1">Ghi chú</label>
            <textarea className="w-full h-16 text-[13px] bg-gray-50 border border-gray-100 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none" placeholder="Ghi chú thêm (không bắt buộc)..." />
          </div>
        </form>
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.06)] shrink-0">
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded border border-gray-200 transition-colors">
            <Printer className="w-3.5 h-3.5" /> In
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="px-5 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded border border-gray-300 transition-colors">
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSaveAndNew)}
            disabled={isSaving}
            className="px-4 py-2 text-[13px] font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-300 transition-colors disabled:opacity-60"
          >
            {isSaving ? 'Đang lưu...' : 'Cất và thêm mới'}
          </button>
          <div className="flex border border-green-600 rounded-md overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="px-6 py-2 text-[13px] font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors min-w-[100px] disabled:opacity-60 flex items-center gap-1.5"
            >
              {isSubmitting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang lưu...</> : 'Cất'}
            </button>
            <div className="w-px bg-green-700" />
            <button type="button" className="px-2 bg-green-600 hover:bg-green-700 text-white transition-colors">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
