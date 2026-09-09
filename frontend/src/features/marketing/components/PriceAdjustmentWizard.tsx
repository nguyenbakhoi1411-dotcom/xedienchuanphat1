"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, Settings2, Calculator, Eye, CheckCircle2, ArrowRight, ArrowLeft, Check, Search, TrendingUp, TrendingDown, Percent, DollarSign } from 'lucide-react';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';
import { PriceAdjustment, PricePreviewItem, PriceList, AdjustmentType, RoundingType } from './types';
import { api } from '@/lib/api/axios';

const STEPS = [
  { id: 1, title: 'Chọn Bảng Giá', icon: Settings2, description: 'Bảng giá gốc' },
  { id: 2, title: 'Thiết Lập', icon: Calculator, description: 'Công thức điều chỉnh' },
  { id: 3, title: 'Xem Trước', icon: Eye, description: 'Kiểm tra giá mới' },
  { id: 4, title: 'Hoàn Tất', icon: CheckCircle2, description: 'Áp dụng thay đổi' }
];

export function PriceAdjustmentWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [previewItems, setPreviewItems] = useState<PricePreviewItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adjustment, setAdjustment] = useState<PriceAdjustment>({
    kieuDieuChinh: 'PERCENT_UP',
    giaTri: 10,
    lamTron: 'THOUSAND',
    scope: 'GLOBAL',
    targetValue: ''
  });

  useEffect(() => {
    // Fetch price lists
    api.get('/api/marketing/price-lists')
       .then(res => setPriceLists(res.data))
       .catch(err => console.error(err));
  }, []);

  const handleNext = async () => {
    if (currentStep === 1 && !selectedListId) {
      toast.error('Vui lòng chọn bảng giá cần điều chỉnh');
      return;
    }
    if (currentStep === 2 && adjustment.giaTri <= 0) {
      toast.error('Giá trị điều chỉnh phải lớn hơn 0');
      return;
    }

    if (currentStep === 2) {
      // Fetch preview
      setIsSubmitting(true);
      try {
        const payload = {
          tenDieuChinh: "Điều chỉnh từ UI",
          priceListId: selectedListId,
          phamVi: adjustment.scope,
          kieuDieuChinh: adjustment.kieuDieuChinh,
          giaTri: adjustment.giaTri,
          lamTron: adjustment.lamTron,
          categoryIds: adjustment.scope === 'CATEGORY' && adjustment.targetValue ? [Number(adjustment.targetValue)] : [],
          productIds: adjustment.scope === 'PRODUCT' && adjustment.targetValue ? [Number(adjustment.targetValue)] : []
        };
        const res = await api.post('/api/marketing/price-adjustments/preview', payload);
        setPreviewItems(res.data.preview || []);
        setCurrentStep(3);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Lỗi khi lấy dữ liệu xem trước');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (currentStep === 3) {
      // Apply
      setIsSubmitting(true);
      try {
        const payload = {
          tenDieuChinh: "Điều chỉnh đồng loạt",
          priceListId: selectedListId,
          phamVi: adjustment.scope,
          kieuDieuChinh: adjustment.kieuDieuChinh,
          giaTri: adjustment.giaTri,
          lamTron: adjustment.lamTron,
          categoryIds: adjustment.scope === 'CATEGORY' && adjustment.targetValue ? [Number(adjustment.targetValue)] : [],
          productIds: adjustment.scope === 'PRODUCT' && adjustment.targetValue ? [Number(adjustment.targetValue)] : [],
          apDungTu: new Date().toISOString().split('T')[0]
        };
        await api.post('/api/marketing/price-adjustments/apply', payload);
        toast.success("Đã áp dụng thành công!");
        setCurrentStep(4);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Lỗi khi áp dụng điều chỉnh');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(p => p + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(p => p - 1);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount == null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50/50 min-h-full rounded-2xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Điều Chỉnh Giá Hàng Loạt
        </h2>
        <p className="text-sm text-slate-500 mt-1">Cập nhật giá nhanh chóng với quy tắc tính toán tự động</p>
      </div>

      {/* Stepper */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center sm:items-start relative z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isActive ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110" : 
                    isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : 
                    "bg-slate-50 border-slate-200 text-slate-400"
                  )}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="mt-3 text-center sm:text-left">
                    <div className={cn(
                      "text-sm font-bold",
                      isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-slate-500"
                    )}>{step.title}</div>
                    <div className="text-xs text-slate-400 hidden md:block mt-0.5">{step.description}</div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "hidden sm:block flex-1 h-0.5 mx-4 transition-colors duration-300",
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[400px]">
        
        {/* Step 1: Select Price List */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Chọn bảng giá để điều chỉnh</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {priceLists.map(list => (
                <div 
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={cn(
                    "cursor-pointer p-5 rounded-xl border-2 transition-all hover:shadow-md",
                    selectedListId === list.id 
                      ? "border-blue-500 bg-blue-50/30 shadow-sm shadow-blue-100" 
                      : "border-slate-100 hover:border-blue-200"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-slate-800">{list.tenBangGia}</div>
                    {selectedListId === list.id && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div className="text-sm text-slate-500 font-mono mb-3">{list.maBangGia}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                      {list.loaiBangGia}
                    </span>
                    <span className="text-slate-400">Từ: {list.apDungTu}</span>
                  </div>
                </div>
              ))}
              {priceLists.length === 0 && <div className="text-slate-500 italic p-4">Không có bảng giá nào. Hãy tạo bảng giá ở tab "Quản Lý Bảng Giá" trước.</div>}
            </div>
          </div>
        )}

        {/* Step 2: Define Adjustment */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 text-center">Thiết lập quy tắc điều chỉnh</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Loại điều chỉnh</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'PERCENT_UP', label: 'Tăng %', icon: TrendingUp, color: 'text-rose-500' },
                    { val: 'PERCENT_DOWN', label: 'Giảm %', icon: TrendingDown, color: 'text-emerald-500' },
                    { val: 'FIXED_UP', label: 'Tăng Tiền', icon: TrendingUp, color: 'text-rose-500' },
                    { val: 'FIXED_DOWN', label: 'Giảm Tiền', icon: TrendingDown, color: 'text-emerald-500' },
                    { val: 'SET_PRICE', label: 'Đặt Giá Mới', icon: DollarSign, color: 'text-blue-500' },
                    { val: 'SET_MARGIN', label: 'Đặt % Lãi Gộp', icon: Percent, color: 'text-indigo-500' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setAdjustment({...adjustment, kieuDieuChinh: opt.val as AdjustmentType})}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                        adjustment.kieuDieuChinh === opt.val ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100" : "border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <opt.icon className={cn("w-5 h-5", opt.color)} />
                      <span className="font-medium text-slate-700">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phạm vi áp dụng</label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { val: 'GLOBAL', label: 'Tất cả sản phẩm' },
                    { val: 'CATEGORY', label: 'Theo danh mục' },
                    { val: 'PRODUCT', label: 'Từng sản phẩm' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setAdjustment({...adjustment, scope: opt.val as any, targetValue: ''})}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all text-center",
                        adjustment.scope === opt.val ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100 text-indigo-700 font-bold" : "border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {adjustment.scope !== 'GLOBAL' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <input 
                      type="number" 
                      placeholder={adjustment.scope === 'CATEGORY' ? 'Nhập ID danh mục...' : 'Nhập ID sản phẩm...'}
                      value={adjustment.targetValue || ''}
                      onChange={e => setAdjustment({...adjustment, targetValue: e.target.value})}
                      className="w-full px-4 py-3 bg-white border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Giá trị áp dụng</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={adjustment.giaTri}
                    onChange={e => setAdjustment({...adjustment, giaTri: Number(e.target.value)})}
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold text-lg"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {adjustment.kieuDieuChinh.includes('PERCENT') || adjustment.kieuDieuChinh.includes('MARGIN') ? <Percent className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Làm tròn giá</label>
                <select 
                  value={adjustment.lamTron}
                  onChange={e => setAdjustment({...adjustment, lamTron: e.target.value as RoundingType})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NONE">Không làm tròn</option>
                  <option value="THOUSAND">Làm tròn đến hàng Nghìn (VD: 1,234đ -{'>'} 1,000đ)</option>
                  <option value="TEN_THOUSAND">Làm tròn đến hàng Chục Nghìn (VD: 12,345đ -{'>'} 10,000đ)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Kết quả xem trước ({previewItems.length} sản phẩm)</h3>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Áp dụng quy tắc: {adjustment.kieuDieuChinh} {adjustment.giaTri}{adjustment.kieuDieuChinh.includes('PERCENT') || adjustment.kieuDieuChinh.includes('MARGIN') ? '%' : 'đ'}
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                    <th className="px-4 py-3 font-medium">Sản phẩm</th>
                    <th className="px-4 py-3 font-medium text-right">Giá cũ</th>
                    <th className="px-4 py-3 font-medium text-right">Giá mới</th>
                    <th className="px-4 py-3 font-medium text-right">Chênh lệch</th>
                    <th className="px-4 py-3 font-medium text-right">Lãi gộp (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{item.tenSanPham}</div>
                        <div className="text-xs text-slate-500">{item.maSanPham}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 line-through">
                        {formatCurrency(item.giaCu)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        {formatCurrency(item.giaMoi)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full",
                          item.chenhLech > 0 ? "bg-emerald-100 text-emerald-700" : item.chenhLech < 0 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                        )}>
                          {item.chenhLech > 0 ? '+' : ''}{formatCurrency(item.chenhLech)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {item.tyLeLaiGopMoi != null ? `${item.tyLeLaiGopMoi}%` : '-'}
                      </td>
                    </tr>
                  ))}
                  {previewItems.length === 0 && (
                     <tr><td colSpan={5} className="p-4 text-center text-slate-500">Không có dữ liệu xem trước hoặc không tìm thấy sản phẩm.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Thành công!</h3>
            <p className="text-slate-500 max-w-md">
              Bảng giá đã được điều chỉnh thành công. Các sản phẩm sẽ áp dụng mức giá mới theo thời gian đã cấu hình.
            </p>
            <button 
              onClick={() => {
                setCurrentStep(1);
                setSelectedListId('');
                setPreviewItems([]);
              }}
              className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 hover:scale-[1.02] transition-all"
            >
              Điều chỉnh bảng giá khác
            </button>
          </div>
        )}

      </div>

      {/* Footer Actions */}
      {currentStep < 4 && (
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-200">
          <button 
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <button 
            onClick={handleNext}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-200 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Đang xử lý...' : (currentStep === 3 ? 'Áp dụng ngay' : 'Tiếp tục')}
            {!isSubmitting && currentStep < 3 && <ArrowRight className="w-4 h-4" />}
            {!isSubmitting && currentStep === 3 && <Check className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
