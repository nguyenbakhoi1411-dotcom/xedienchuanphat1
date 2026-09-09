"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { api } from '@/lib/api';
import { X, Upload, HelpCircle, Settings, ChevronDown, Plus, Trash2, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface StocktakeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StocktakeForm({ onSuccess, onCancel }: StocktakeFormProps) {
  const [items, setItems] = useState<any[]>([{ id: Date.now(), productId: '', productCode: '', productName: '', unitOfMeasure: '', systemQuantity: 0, actualQuantity: 0, difference: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, register, setValue } = useForm({
    defaultValues: {
      countNo: '',
      countDate: new Date().toISOString().split('T')[0],
      warehouseId: '',
      description: 'Kiểm kê định kỳ',
    },
  });

  const addItem = () => {
    setItems([...items, { id: Date.now(), productId: '', productCode: '', productName: '', unitOfMeasure: '', systemQuantity: 0, actualQuantity: 0, difference: 0 }]);
  };

  const removeAllItems = () => {
    setItems([{ id: Date.now(), productId: '', productCode: '', productName: '', unitOfMeasure: '', systemQuantity: 0, actualQuantity: 0, difference: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'systemQuantity' || field === 'actualQuantity') {
      const sys = Number(newItems[index].systemQuantity) || 0;
      const act = Number(newItems[index].actualQuantity) || 0;
      newItems[index].difference = act - sys;
    }
    
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const onSubmit = async (data: any) => {
    const validItems = items.filter(item => item.productCode || item.productId || item.productName);
    if (validItems.length === 0) {
      toast.error("Vui lòng nhập ít nhất một dòng hàng hóa!");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        items: validItems
      };
      await api.post("/api/inventory/v2/counts", payload);
      toast.success("Đã lưu Phiếu Kiểm Kê thành công!");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Lỗi khi lưu phiếu kiểm kê");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm z-10 shrink-0 h-[50px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 p-1.5 rounded-md transition-colors">
            <span className="font-bold text-gray-700 text-[15px]">Phiếu kiểm kê</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            <Upload className="w-4 h-4" /> Đính kèm
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><HelpCircle className="w-4 h-4" /></button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"><Settings className="w-4 h-4" /></button>
          <button className="p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors" onClick={onCancel}><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* FORM BODY */}
      <div className="flex-1 overflow-auto bg-[#f4f5f8] flex flex-col">
        <form id="stocktakeForm" onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
          <div className="flex p-3 gap-3 shrink-0 items-start">
            {/* LEFT PANEL */}
            <div className="flex-[3] bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="h-9 border-b border-gray-200 bg-purple-50 flex items-center px-3 gap-3">
                <span className="text-[13px] font-medium text-purple-800">Kiểm kê vật tư, hàng hóa</span>
              </div>

              <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-1">
                  <label className="text-[12px] text-gray-600 font-medium">Kho kiểm kê</label>
                  <input type="text" {...register('warehouseId')} className="w-full h-7 border-b border-gray-300 focus:border-purple-500 focus:outline-none text-[13px] bg-transparent" placeholder="Chọn kho..." />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[12px] text-gray-600 font-medium">Diễn giải</label>
                  <input type="text" {...register('description')} className="w-full h-7 border-b border-gray-300 focus:border-purple-500 focus:outline-none text-[13px] bg-transparent" />
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden flex flex-col min-w-[250px]">
              <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-4">
                <div className="space-y-1">
                  <label className="text-[12px] text-gray-600 font-medium">Ngày kiểm kê</label>
                  <input type="date" {...register('countDate')} className="w-full h-7 border-b border-gray-300 focus:border-purple-500 focus:outline-none text-[13px] bg-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] text-gray-600 font-medium">Số chứng từ</label>
                  <input type="text" {...register('countNo')} className="w-full h-7 border-b border-gray-300 focus:border-purple-500 focus:outline-none text-[13px] bg-transparent" placeholder="Tự động" />
                </div>
              </div>
            </div>
          </div>

          {/* DATAGRID */}
          <div className="flex-1 bg-white mx-3 mb-3 rounded-md border border-gray-200 shadow-sm flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between px-3 h-10 border-b border-gray-200 bg-gray-50/80">
               <h3 className="text-[13px] font-semibold text-gray-700">Chi tiết kiểm kê</h3>
            </div>
            
            <div className="flex-1 overflow-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <tr className="text-gray-500 border-b border-gray-200">
                    <th className="font-semibold py-2 px-3 text-center w-12">#</th>
                    <th className="font-semibold py-2 px-3 text-left w-32 border-l border-gray-200">Mã hàng</th>
                    <th className="font-semibold py-2 px-3 text-left border-l border-gray-200">Tên hàng</th>
                    <th className="font-semibold py-2 px-3 text-left w-24 border-l border-gray-200">ĐVT</th>
                    <th className="font-semibold py-2 px-3 text-right w-32 border-l border-gray-200 text-blue-600 bg-blue-50/30">SL Sổ sách</th>
                    <th className="font-semibold py-2 px-3 text-right w-32 border-l border-gray-200 text-green-600 bg-green-50/30">SL Thực tế</th>
                    <th className="font-semibold py-2 px-3 text-right w-32 border-l border-gray-200 text-purple-600 bg-purple-50/30">Chênh lệch</th>
                    <th className="font-semibold py-2 px-3 text-center w-12 border-l border-gray-200"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-purple-50/30 group">
                      <td className="py-2 px-3 text-center text-gray-400">{index + 1}</td>
                      <td className="p-0 border-l border-gray-100">
                        <input type="text" value={item.productCode} onChange={e => updateItem(index, 'productCode', e.target.value)} className="w-full h-8 px-3 text-[13px] bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-500" placeholder="Mã..." />
                      </td>
                      <td className="p-0 border-l border-gray-100">
                        <input type="text" value={item.productName} onChange={e => updateItem(index, 'productName', e.target.value)} className="w-full h-8 px-3 text-[13px] bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-500" placeholder="Tên hàng hóa..." />
                      </td>
                      <td className="p-0 border-l border-gray-100">
                        <input type="text" value={item.unitOfMeasure} onChange={e => updateItem(index, 'unitOfMeasure', e.target.value)} className="w-full h-8 px-3 text-[13px] bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-500" />
                      </td>
                      <td className="p-0 border-l border-gray-100 bg-blue-50/10">
                        <input type="number" value={item.systemQuantity} onChange={e => updateItem(index, 'systemQuantity', e.target.value)} className="w-full h-8 px-3 text-[13px] text-right bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500" />
                      </td>
                      <td className="p-0 border-l border-gray-100 bg-green-50/10">
                        <input type="number" value={item.actualQuantity} onChange={e => updateItem(index, 'actualQuantity', e.target.value)} className="w-full h-8 px-3 text-[13px] text-right bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-green-500 font-bold" />
                      </td>
                      <td className="p-0 border-l border-gray-100 bg-purple-50/10">
                        <input type="text" readOnly value={item.difference} className={`w-full h-8 px-3 text-[13px] text-right bg-transparent focus:outline-none font-bold ${item.difference < 0 ? 'text-red-500' : item.difference > 0 ? 'text-blue-500' : 'text-gray-500'}`} />
                      </td>
                      <td className="py-2 px-3 text-center border-l border-gray-100">
                        <button type="button" onClick={() => removeItem(index)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 p-2 border-t border-gray-200 bg-gray-50/50 rounded-b-md">
              <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-200 rounded transition-colors font-medium">
                <Plus className="w-3.5 h-3.5 text-gray-500" />
                Thêm dòng
              </button>
              <button type="button" onClick={removeAllItems} className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-200 rounded transition-colors font-medium">
                <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                Xóa hết dòng
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.05)] z-10 shrink-0 h-[60px]">
        <div className="flex items-center gap-3">
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-200">
            <Printer className="w-4 h-4" /> In
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="px-5 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors border border-gray-300">
            Hủy
          </button>
          <div className="flex border border-purple-600 rounded-md overflow-hidden">
            <button 
              type="button"
              form="stocktakeForm" 
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting} 
              className="px-6 py-2 text-[13px] font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-70"
            >
              {isSubmitting ? 'Đang lưu...' : 'Cất'}
            </button>
            <div className="w-px bg-purple-700"></div>
            <button type="button" className="px-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
