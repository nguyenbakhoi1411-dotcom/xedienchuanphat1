"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Plus, Trash2, Keyboard, ShoppingCart, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { salesApi } from '@/features/sales/api';
import type { CreateSalesOrderDto } from '@/features/sales/types';

function fmt(n: number | null | undefined) {
  if (n == null) return '0';
  return new Intl.NumberFormat('vi-VN').format(n);
}

// Modal để hiển thị gợi ý kho
function StockSuggestionModal({ isOpen, onClose, errorData, onSelectWarehouse, saving }: { 
  isOpen: boolean; 
  onClose: () => void; 
  errorData: any; 
  onSelectWarehouse: (warehouseId: number) => void;
  saving: boolean;
}) {
  if (!isOpen || !errorData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] overflow-hidden">
        <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-bold text-red-700">Thiếu tồn kho: {errorData.productName}</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-2">Kho hiện tại không đủ số lượng khả dụng.</p>
          <ul className="text-sm text-gray-600 mb-4 list-disc pl-5">
            <li>Yêu cầu: <strong className="text-red-600">{errorData.required}</strong></li>
            <li>Thực tế khả dụng: <strong>{errorData.available}</strong></li>
          </ul>
          
          <h4 className="font-bold text-gray-800 mb-3 border-b pb-1">Gợi ý từ các kho khác:</h4>
          {errorData.suggestions && errorData.suggestions.length > 0 ? (
            <div className="space-y-3">
              {errorData.suggestions.map((sug: any, idx: number) => (
                <div key={idx} className={`p-3 border rounded-lg flex items-center justify-between ${sug.isWithinScope ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div>
                    <div className="font-bold text-gray-800">{sug.warehouseName}</div>
                    <div className="text-sm text-gray-600">Khả dụng: <span className="font-bold text-blue-600">{sug.availableStock}</span></div>
                    {!sug.isWithinScope && <div className="text-xs text-red-500 italic mt-1">Ngoài phạm vi, vui lòng liên hệ Kế toán trưởng để chuyển kho.</div>}
                  </div>
                  {sug.isWithinScope && (
                    <button 
                      onClick={() => onSelectWarehouse(sug.warehouseId)}
                      className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Đổi sang kho này
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 text-sm">
              Hiện không có kho nào khác còn hàng.
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button disabled={saving} onClick={onClose} className="px-4 py-2 border rounded text-gray-700 bg-white hover:bg-gray-50 font-medium disabled:opacity-50">Đóng</button>
        </div>
      </div>
    </div>
  );
}

// Modal xác nhận cho đơn hàng giá trị lớn
function HighValueConfirmationModal({ isOpen, onConfirm, onCancel, amount }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void; amount: number }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px]">
        <h3 className="text-xl font-bold text-orange-600 mb-3">Xác nhận thanh toán</h3>
        <p className="text-gray-700 mb-6">
          Đơn hàng có giá trị lớn (<span className="font-bold">{fmt(amount)} đ</span>).
          Bạn có chắc chắn muốn chốt đơn và xuất kho ngay?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 font-medium">Hủy (Esc)</button>
          <button autoFocus onClick={onConfirm} className="px-4 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700">Đồng ý (Enter)</button>
        </div>
      </div>
    </div>
  );
}

export default function PosPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Dummy danh sách kho để demo
  const warehouses = [
    { id: 1, name: 'Kho Thực phẩm HCM' },
    { id: 2, name: 'Kho Xe điện HN' },
    { id: 3, name: 'Kho Tổng Bình Dương' }
  ];

  const [formData, setFormData] = useState<CreateSalesOrderDto>({
    orderDate: new Date().toISOString().split('T')[0],
    customerName: 'Khách vãng lai',
    customerCode: 'KVL',
    phone: '',
    mobilePhone: '',
    deliveryAddress: '',
    warehouseId: 1, // Mặc định Kho 1
    deliveryDate: '',
    paymentTerm: '',
    note: '',
    depositAmount: 0,
    paymentMethod: 'CASH',
    lines: []
  });

  const [stockError, setStockError] = useState<any>(null);
  const [errorItemIndex, setErrorItemIndex] = useState<number | null>(null);
  
  const [highValueConfirmOpen, setHighValueConfirmOpen] = useState(false);
  const [pendingConfirmSubmit, setPendingConfirmSubmit] = useState(false);

  const summary = useMemo(() => {
    let total = 0;
    formData.lines.forEach(l => {
      const lineTotal = (l.quantity || 0) * (l.unitPrice || 0);
      const discount = lineTotal * ((l.discountRate || 0) / 100);
      const afterDiscount = lineTotal - discount;
      const vat = afterDiscount * ((l.vatRate || 0) / 100);
      total += (afterDiscount + vat);
    });
    return total;
  }, [formData.lines]);

  // Focus ô tìm kiếm khi vừa mở màn hình (Keyboard-first)
  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  // Phím tắt thanh toán
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9') {
        e.preventDefault();
        if (saving || formData.lines.length === 0 || stockError || highValueConfirmOpen) return;
        
        if (summary > 50000000) { // 50M threshold
          setHighValueConfirmOpen(true);
          setPendingConfirmSubmit(true);
        } else {
          handleSave(true);
        }
      }
      if (e.key === 'Escape' && highValueConfirmOpen) {
        setHighValueConfirmOpen(false);
        setPendingConfirmSubmit(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, saving, stockError, highValueConfirmOpen, summary]);

  const addLine = (productCode: string = '') => {
    // Demo: Xử lý tìm kiếm chính xác vs gợi ý
    // Trong thực tế sẽ gọi API check /search
    if (productCode.trim() === '') return;
    
    // Giả lập: Nếu mã chứa 'error' thì giả vờ có nhiều kết quả (không tự add)
    if (productCode.toLowerCase().includes('error')) {
      toast.warning('Có nhiều sản phẩm khớp với từ khóa. Vui lòng chọn cụ thể.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, {
        productCode: productCode, productName: productCode === 'XED01' ? 'Xe Máy Điện Vinfast' : 'Sản phẩm mới', 
        unit: 'CAI', quantity: 1, unitPrice: productCode === 'XED01' ? 15000000 : 100000, 
        discountRate: 0, vatRate: 10, promotionItem: false, commercialDiscount: false,
        revenueAccount: '5111', accountReceivable: '131',
        warehouseId: prev.warehouseId // Thừa kế kho mặc định
      }]
    }));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const removeLine = (index: number) => {
    const newLines = [...formData.lines];
    newLines.splice(index, 1);
    setFormData({ ...formData, lines: newLines });
  };

  const handleSave = async (confirmRecordRevenue: boolean = false, overrideData?: CreateSalesOrderDto) => {
    const dataToSave = overrideData || formData;
    if (dataToSave.lines.length === 0) {
      toast.error('Giỏ hàng trống!');
      return;
    }
    
    // Disable inputs & show loading via 'saving' state
    try {
      setSaving(true);
      const res = await salesApi.createOrder(dataToSave);
      toast.success('Đã lưu đơn đặt hàng thành công!');
      if (confirmRecordRevenue) {
        await salesApi.recordRevenue(res.id);
        toast.success('Đã thanh toán & xuất kho!');
      }
      router.push('/sales/orders');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error === 'INSUFFICIENT_STOCK') {
        setStockError(err.response.data);
        // Find which line caused it based on productName
        const idx = dataToSave.lines.findIndex(l => l.productName === err.response.data.productName);
        setErrorItemIndex(idx >= 0 ? idx : null);
      } else {
        toast.error('Lỗi khi lưu: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangeWarehouseForErrorLine = (newWarehouseId: number) => {
    if (errorItemIndex !== null) {
      const newLines = [...formData.lines];
      newLines[errorItemIndex] = { ...newLines[errorItemIndex], warehouseId: newWarehouseId };
      const updatedFormData = { ...formData, lines: newLines };
      
      setFormData(updatedFormData);
      setStockError(null);
      setErrorItemIndex(null);
      
      // Auto re-validate and submit immediately with the fresh updated state
      toast.info('Đang kiểm tra lại tồn kho và thanh toán...');
      handleSave(true, updatedFormData);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <StockSuggestionModal 
        isOpen={!!stockError} 
        onClose={() => setStockError(null)} 
        errorData={stockError}
        onSelectWarehouse={handleChangeWarehouseForErrorLine}
        saving={saving}
      />
      
      <HighValueConfirmationModal 
        isOpen={highValueConfirmOpen}
        amount={summary}
        onCancel={() => {
          setHighValueConfirmOpen(false);
          setPendingConfirmSubmit(false);
        }}
        onConfirm={() => {
          setHighValueConfirmOpen(false);
          if (pendingConfirmSubmit) {
            handleSave(true);
          }
        }}
      />

      {/* LEFT PANEL - CART & SEARCH */}
      <div className={`flex-1 flex flex-col h-full border-r border-gray-200 transition-opacity ${saving ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="bg-white p-4 border-b shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4 w-1/2">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800"><ArrowLeft className="w-5 h-5" /></button>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Tìm mã, tên SP (F3)..." 
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addLine(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Kho mặc định:</span>
            <select 
              value={formData.warehouseId} 
              onChange={e => setFormData({...formData, warehouseId: Number(e.target.value)})}
              className="border-gray-300 rounded-md text-sm font-bold text-gray-800 focus:ring-green-500 focus:border-green-500 bg-gray-50"
            >
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          <div className="space-y-3">
            {formData.lines.map((line, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 relative group">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <input type="text" value={line.productName} onChange={e => handleLineChange(idx, 'productName', e.target.value)} className="font-bold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-green-500 outline-none w-1/2 bg-transparent" />
                    <button onClick={() => removeLine(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">SL:</span>
                      <input type="number" min="1" value={line.quantity} onChange={e => handleLineChange(idx, 'quantity', Number(e.target.value))} className="w-16 border rounded px-2 py-1 text-center font-bold text-gray-800 focus:ring-1 focus:ring-green-500 outline-none" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Đơn giá:</span>
                      <input type="number" value={line.unitPrice} onChange={e => handleLineChange(idx, 'unitPrice', Number(e.target.value))} className="w-28 border rounded px-2 py-1 text-right font-medium text-gray-800 focus:ring-1 focus:ring-green-500 outline-none" />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-xs text-gray-500">Kho xuất:</span>
                      <select 
                        value={line.warehouseId || formData.warehouseId} 
                        onChange={e => handleLineChange(idx, 'warehouseId', Number(e.target.value))}
                        className={`text-xs rounded border px-2 py-1 focus:outline-none ${line.warehouseId && line.warehouseId !== formData.warehouseId ? 'bg-orange-50 border-orange-300 text-orange-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                      >
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {formData.lines.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                <ShoppingCart className="w-12 h-12 mb-3 text-gray-300" />
                <p>Giỏ hàng trống</p>
                <p className="text-sm mt-1">Gõ mã sản phẩm và nhấn Enter để thêm</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - CHECKOUT */}
      <div className={`w-[400px] bg-white flex flex-col h-full shadow-[-4px_0_15px_rgba(0,0,0,0.05)] z-10 transition-opacity ${saving ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="p-6 flex-1 overflow-auto space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Khách hàng</h3>
            <div className="flex gap-2">
              <input type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full border-b border-gray-300 py-1.5 text-gray-800 font-medium focus:border-green-500 outline-none transition-colors" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-dashed">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Thanh toán</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Tổng tiền hàng</span>
                <span className="font-medium">{fmt(summary)}</span>
              </div>
              <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100">
                <span className="font-bold text-green-800 text-lg">Khách cần trả</span>
                <span className="font-black text-green-700 text-2xl">{fmt(summary)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phương thức</label>
            <div className="grid grid-cols-3 gap-2">
              {['CASH', 'BANK_TRANSFER', 'CARD'].map(pm => (
                <button 
                  key={pm}
                  onClick={() => setFormData({...formData, paymentMethod: pm as any})}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors ${formData.paymentMethod === pm ? 'bg-gray-800 text-white border-gray-800 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {pm === 'CASH' ? 'Tiền mặt' : pm === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Thẻ'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t space-y-3 relative">
          {saving && (
            <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-xl font-bold text-green-700">
              Đang xử lý...
            </div>
          )}
          <button 
            disabled={saving || formData.lines.length === 0}
            onClick={() => summary > 50000000 ? setHighValueConfirmOpen(true) : handleSave(true)} 
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
          >
            <CheckCircle className="w-6 h-6" />
            THANH TOÁN (F9)
          </button>
          <button 
            disabled={saving || formData.lines.length === 0}
            onClick={() => handleSave(false)} 
            className="w-full py-3 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-sm border border-gray-300 shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            Lưu nháp
          </button>
        </div>
      </div>
    </div>
  );
}
