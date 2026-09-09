"use client";

import React, { useState } from 'react';
import { Gift, Percent, DollarSign, Package, Truck, Zap, Plus, Save, X, Calendar, Hash } from 'lucide-react';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';
import { Promotion, PromotionType } from './types';

const PROMO_TYPES: { type: PromotionType; label: string; icon: any; color: string; bg: string }[] = [
  { type: 'PERCENT_DISCOUNT', label: 'Giảm phần trăm', icon: Percent, color: 'text-rose-500', bg: 'bg-rose-100' },
  { type: 'FIXED_DISCOUNT', label: 'Giảm số tiền', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  { type: 'BUY_X_GET_Y', label: 'Mua X tặng Y', icon: Gift, color: 'text-violet-500', bg: 'bg-violet-100' },
  { type: 'FREE_SHIPPING', label: 'Miễn phí vận chuyển', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100' },
  { type: 'BUNDLE_DISCOUNT', label: 'Giảm giá combo', icon: Package, color: 'text-amber-500', bg: 'bg-amber-100' },
  { type: 'POINTS_MULTIPLIER', label: 'Nhân điểm thưởng', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
];

export function PromotionForm() {
  const [formData, setFormData] = useState<Partial<Promotion>>({
    type: 'PERCENT_DISCOUNT',
    name: '',
    value: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Vui lòng nhập tên chương trình khuyến mãi');
      return;
    }
    if (!formData.value || formData.value <= 0) {
      toast.error('Vui lòng nhập giá trị ưu đãi hợp lệ');
      return;
    }
    toast.success('Đã lưu chương trình khuyến mãi thành công!');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-slate-50/50 min-h-full rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
            Tạo Khuyến Mãi Mới
          </h2>
          <p className="text-sm text-slate-500 mt-1">Thiết lập các chương trình ưu đãi để thu hút khách hàng</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
            Hủy bỏ
          </button>
          <button 
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-rose-200 hover:scale-[1.02] transition-all"
          >
            <Save className="w-4 h-4" />
            Lưu khuyến mãi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Types */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Loại Khuyến Mãi</h3>
          <div className="flex flex-col gap-3">
            {PROMO_TYPES.map(promo => {
              const Icon = promo.icon;
              const isActive = formData.type === promo.type;
              return (
                <button
                  key={promo.type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: promo.type, value: 0 })}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-xl border-2 text-left transition-all duration-200 group",
                    isActive 
                      ? "border-rose-500 bg-white shadow-md shadow-rose-100/50 scale-[1.02]" 
                      : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <div className={cn("p-2.5 rounded-lg transition-colors", isActive ? promo.bg : "bg-slate-100 group-hover:bg-slate-200")}>
                    <Icon className={cn("w-5 h-5", isActive ? promo.color : "text-slate-500")} />
                  </div>
                  <span className={cn("font-medium", isActive ? "text-slate-900" : "text-slate-600")}>
                    {promo.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Form Settings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Chi tiết cấu hình</h3>
            
            <div className="space-y-6">
              {/* Tên CTKM */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tên chương trình khuyến mãi <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="VD: Mừng sinh nhật - Giảm 20% toàn bộ cửa hàng"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Giá trị khuyến mãi */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {formData.type === 'PERCENT_DISCOUNT' ? 'Mức giảm (%)' : 
                     formData.type === 'FIXED_DISCOUNT' ? 'Số tiền giảm' : 'Giá trị ưu đãi'}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={formData.value || ''}
                      onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {formData.type === 'PERCENT_DISCOUNT' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Giới hạn sử dụng */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Giới hạn số lần dùng</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="Không giới hạn"
                      value={formData.maxUses || ''}
                      onChange={e => setFormData({...formData, maxUses: Number(e.target.value)})}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Hash className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Điều kiện áp dụng */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Điều kiện áp dụng</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Giá trị đơn hàng tối thiểu</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="0"
                        value={formData.minOrderValue || ''}
                        onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₫</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Số lượng SP tối thiểu</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={formData.minQuantity || ''}
                      onChange={e => setFormData({...formData, minQuantity: Number(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {formData.type === 'BUY_X_GET_Y' && (
                <div className="pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <h4 className="text-sm font-bold text-slate-800 mb-4">Sản phẩm tặng kèm</h4>
                  <button type="button" className="w-full flex items-center justify-center gap-2 py-8 border-2 border-dashed border-rose-200 bg-rose-50/50 rounded-xl text-rose-600 font-medium hover:bg-rose-50 hover:border-rose-300 transition-colors">
                    <Plus className="w-5 h-5" />
                    Chọn sản phẩm quà tặng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
