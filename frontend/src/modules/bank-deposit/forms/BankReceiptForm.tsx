'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBankReceipt, useBankAccounts } from '../hooks';
import { CreateBankTransactionRequest } from '../types';
import { ChevronDown, Plus, Search, HelpCircle, Settings, X, Upload, Trash2, Printer } from 'lucide-react';
import { toast } from 'sonner';

const bankReceiptSchema = z.object({
  bankAccountId: z.string().min(1, 'Vui lòng chọn tài khoản ngân hàng'),
  ngayGiaoDich: z.string().min(1, 'Ngày hạch toán không được để trống'),
  doiTuongId: z.number().nullable().optional(),
  loaiDoiTuong: z.string().nullable().optional(),
  tenDoiTuong: z.string().nullable().optional(),
  diaChi: z.string().nullable().optional(),
  lyDo: z.string().nullable().optional(),
  nhanVienId: z.number().nullable().optional(),
  soThamChieuNH: z.string().nullable().optional(),
});

type BankReceiptFormData = z.infer<typeof bankReceiptSchema>;

interface BankReceiptFormProps {
  accountId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function BankReceiptForm({ accountId, onSuccess, onError, onCancel }: BankReceiptFormProps) {
  const { data: bankAccounts = [] } = useBankAccounts();
  const { mutate: createReceipt, isPending } = useCreateBankReceipt();

  const [receiptType, setReceiptType] = useState('7. Thu khác');
  const [showReceiptTypeDropdown, setShowReceiptTypeDropdown] = useState(false);
  const [items, setItems] = useState<any[]>([{ id: Date.now(), dienGiai: 'Thu tiền của', tkNo: '11211', tkCo: '', soTien: 0, doiTuongId: '', tenDoiTuong: '', tenDonVi: '' }]);
  const [showAccounts, setShowAccounts] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<BankReceiptFormData>({
    resolver: zodResolver(bankReceiptSchema),
    defaultValues: {
      bankAccountId: accountId || '',
      ngayGiaoDich: new Date().toISOString().split('T')[0],
      lyDo: 'Thu tiền của',
    },
  });

  const tenDoiTuong = watch('tenDoiTuong');
  const lyDo = watch('lyDo');

  useEffect(() => {
    if (tenDoiTuong && lyDo === 'Thu tiền của') {
      setValue('lyDo', `Thu tiền của ${tenDoiTuong}`);
    }
  }, [tenDoiTuong, lyDo, setValue]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), dienGiai: watch('lyDo') || '', tkNo: '11211', tkCo: '', soTien: 0, doiTuongId: '', tenDoiTuong: '', tenDonVi: '' }]);
  };

  const removeAllItems = () => {
    setItems([{ id: Date.now(), dienGiai: watch('lyDo') || '', tkNo: '11211', tkCo: '', soTien: 0, doiTuongId: '', tenDoiTuong: '', tenDonVi: '' }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.soTien) || 0), 0);

  const onSubmit = (data: BankReceiptFormData) => {
    const validItems = items.filter(item => item.tkCo && item.soTien > 0);
    if (validItems.length === 0) {
      toast.error("Vui lòng nhập ít nhất một dòng hạch toán hợp lệ (có TK Có và Số tiền > 0)");
      return;
    }

    const payload: CreateBankTransactionRequest = {
      ...data,
      bankAccountId: Number(data.bankAccountId),
      tongTien: totalAmount,
      items: validItems.map(item => ({
        dienGiai: item.dienGiai || data.lyDo || '',
        tkNo: item.tkNo || '11211',
        tkCo: item.tkCo,
        soTien: Number(item.soTien) || 0,
        doiTuongId: item.doiTuongId ? Number(item.doiTuongId) : null,
        loaiDoiTuong: item.doiTuongId ? 'CUSTOMER' : null,
        tenDoiTuong: item.tenDoiTuong || null,
      })),
    };

    createReceipt(payload, {
      onSuccess: () => {
        toast.success("Tạo phiếu thu thành công!");
        onSuccess?.();
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Lỗi tạo phiếu thu';
        toast.error(message);
        onError?.(message);
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f5f8] text-[13px] text-gray-800">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
            <span className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Thu tiền gửi NTTK04183
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowReceiptTypeDropdown(!showReceiptTypeDropdown)}
              className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-sm font-semibold hover:bg-blue-100 transition-colors"
            >
              {receiptType} <ChevronDown className="h-4 w-4" />
            </button>
            {showReceiptTypeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 shadow-lg rounded-sm z-50">
                <ul className="py-1">
                  {['1. Thu tiền khách hàng (không theo hóa đơn)', '2. Thu hoàn ứng nhân viên', '3. Thu lãi đầu tư tài chính', '4. Thu tiền vay qua ngân hàng', '5. Thu hoàn thuế GTGT', '7. Thu khác'].map(t => (
                    <li 
                      key={t}
                      className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer"
                      onClick={() => { setReceiptType(t); setShowReceiptTypeDropdown(false); }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <button className="flex items-center gap-1 hover:text-gray-800"><HelpCircle className="h-4 w-4" /> Hướng dẫn sử dụng</button>
          <Settings className="h-4 w-4 cursor-pointer hover:text-gray-800" />
          <button onClick={onCancel} className="hover:text-red-500"><X className="h-5 w-5" /></button>
        </div>
      </div>

      {/* FORM CONTENT */}
      <div className="flex-1 overflow-auto">
        <form id="bank-receipt-form" onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          
          {/* GENERAL INFO */}
          <div className="bg-white border border-gray-200 rounded-sm p-4">
            <div className="flex gap-8">
              
              {/* LEFT COLUMN */}
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center">
                  <label className="w-32 font-medium shrink-0">Mã đối tượng</label>
                  <div className="flex-1 relative">
                    <Controller
                      name="doiTuongId"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          className="w-full h-7 px-2 border border-gray-300 rounded-sm focus:border-blue-500 focus:outline-none"
                        />
                      )}
                    />
                    <div className="absolute right-0 top-0 h-full flex">
                      <button type="button" className="px-1.5 bg-gray-50 border-l border-gray-300 text-green-600 hover:bg-gray-100"><Plus className="h-4 w-4" /></button>
                      <button type="button" className="px-1.5 bg-gray-50 border-l border-gray-300 text-gray-500 hover:bg-gray-100"><Search className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="flex-1 ml-2">
                    <Controller
                      name="tenDoiTuong"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          value={field.value || ''}
                          className="w-full h-7 px-2 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:bg-white focus:border-blue-500"
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <label className="w-32 font-medium shrink-0">Địa chỉ</label>
                  <Controller
                    name="diaChi"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        value={field.value || ''}
                        className="flex-1 h-7 px-2 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:bg-white focus:border-blue-500"
                      />
                    )}
                  />
                </div>

                <div className="flex items-center">
                  <label className="w-32 font-medium shrink-0">Nộp vào tài khoản <span className="text-red-500">*</span></label>
                  <div className="flex-1 relative">
                    <Controller
                      name="bankAccountId"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full h-7 px-2 border border-gray-300 rounded-sm focus:border-blue-500 focus:outline-none appearance-none"
                        >
                          <option value="">Chọn tài khoản...</option>
                          {bankAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.accountNumber} - {acc.bankName}</option>
                          ))}
                        </select>
                      )}
                    />
                    <div className="absolute right-0 top-0 h-full flex pointer-events-none">
                      <div className="px-1.5 bg-gray-50 border-l border-gray-300 flex items-center justify-center">
                        <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <label className="w-32 font-medium shrink-0">Nhân viên thu nợ</label>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      className="w-full h-7 px-2 border border-gray-300 rounded-sm focus:border-blue-500 focus:outline-none"
                    />
                    <div className="absolute right-0 top-0 h-full flex">
                      <button type="button" className="px-1.5 bg-gray-50 border-l border-gray-300 text-green-600 hover:bg-gray-100"><Plus className="h-4 w-4" /></button>
                      <button type="button" className="px-1.5 bg-gray-50 border-l border-gray-300 text-gray-500 hover:bg-gray-100"><ChevronDown className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start pt-1">
                  <label className="w-32 font-medium shrink-0">Lý do thu</label>
                  <Controller
                    name="lyDo"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        value={field.value || ''}
                        rows={2}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded-sm focus:border-blue-500 focus:outline-none resize-none"
                      />
                    )}
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="w-32 font-medium shrink-0 text-blue-600 cursor-pointer hover:underline">Tham chiếu ...</label>
                </div>
              </div>

              {/* RIGHT COLUMN (DATES) */}
              <div className="w-[300px] shrink-0 border-l border-gray-200 pl-8 space-y-2.5 bg-white relative">
                <div className="absolute right-0 top-0 text-right">
                  <span className="text-gray-500 text-xs">Tổng tiền</span>
                  <div className="font-bold text-2xl text-gray-800">{new Intl.NumberFormat("vi-VN").format(totalAmount)}</div>
                </div>

                <div className="pt-10">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-gray-700">Ngày hạch toán</label>
                  </div>
                  <Controller
                    name="ngayGiaoDich"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        {...field}
                        className="w-full h-7 px-2 border border-gray-300 rounded-sm focus:border-blue-500 focus:outline-none bg-white font-bold"
                      />
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-gray-700">Ngày chứng từ</label>
                  </div>
                  <Controller
                    name="ngayGiaoDich"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        {...field}
                        className="w-full h-7 px-2 border border-gray-300 rounded-sm focus:border-blue-500 focus:outline-none bg-white"
                      />
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-gray-700">Số chứng từ</label>
                  </div>
                  <input
                    type="text"
                    value="NTTK04183"
                    readOnly
                    className="w-full h-7 px-2 border border-gray-300 rounded-sm bg-gray-50 font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* GRID TABS */}
          <div className="bg-white border border-gray-200 rounded-sm">
            <div className="flex border-b border-gray-200 px-2">
              <div className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-semibold cursor-pointer">Hạch toán</div>
              <div className="px-4 py-2 text-gray-500 hover:text-gray-800 cursor-pointer">Thuế</div>
            </div>

            {/* DATA GRID */}
            <div className="overflow-x-auto min-h-[150px]">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                    <th className="py-1.5 px-2 w-8 text-center border-r border-white">#</th>
                    <th className="py-1.5 px-2 border-r border-white font-semibold">Diễn giải</th>
                    <th className="py-1.5 px-2 w-24 border-r border-white font-semibold">TK Nợ</th>
                    <th className="py-1.5 px-2 w-24 border-r border-white font-semibold">TK Có</th>
                    <th className="py-1.5 px-2 w-32 text-right border-r border-white font-semibold">Số tiền</th>
                    <th className="py-1.5 px-2 w-32 border-r border-white font-semibold">Đối tượng</th>
                    <th className="py-1.5 px-2 border-r border-white font-semibold">Tên đối tượng</th>
                    <th className="py-1.5 px-2 w-32 font-semibold">Tên đơn vị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 group">
                      <td className="py-1 px-2 text-center text-gray-400 relative">
                        {index + 1}
                        <button 
                          type="button" 
                          onClick={() => removeItem(index)} 
                          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 bg-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                      <td className="py-1 px-1 border-r border-gray-100">
                        <input
                          type="text"
                          value={item.dienGiai}
                          onChange={(e) => updateItem(index, 'dienGiai', e.target.value)}
                          className="w-full h-6 px-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none bg-transparent"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-gray-100">
                        <input
                          type="text"
                          value={item.tkNo}
                          onChange={(e) => updateItem(index, 'tkNo', e.target.value)}
                          className="w-full h-6 px-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none bg-transparent"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-gray-100">
                        <input
                          type="text"
                          value={item.tkCo}
                          onChange={(e) => updateItem(index, 'tkCo', e.target.value)}
                          placeholder="Nhập TK..."
                          className="w-full h-6 px-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none bg-transparent"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-gray-100 text-right">
                        <input
                          type="number"
                          value={item.soTien || ''}
                          onChange={(e) => updateItem(index, 'soTien', Number(e.target.value))}
                          className="w-full h-6 px-1 text-right border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none bg-transparent"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-gray-100">
                        <input
                          type="text"
                          value={item.doiTuongId}
                          onChange={(e) => updateItem(index, 'doiTuongId', e.target.value)}
                          className="w-full h-6 px-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none bg-transparent"
                        />
                      </td>
                      <td className="py-1 px-1 border-r border-gray-100">
                        <input
                          type="text"
                          value={item.tenDoiTuong}
                          onChange={(e) => updateItem(index, 'tenDoiTuong', e.target.value)}
                          className="w-full h-6 px-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none bg-transparent"
                        />
                      </td>
                      <td className="py-1 px-1">
                        <input
                          type="text"
                          value={item.tenDonVi}
                          onChange={(e) => updateItem(index, 'tenDonVi', e.target.value)}
                          className="w-full h-6 px-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:outline-none bg-transparent"
                        />
                      </td>
                    </tr>
                  ))}
                  {/* Empty row for aesthetics */}
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-2 border-r border-gray-100 text-center"></td>
                    <td className="py-2 px-1 border-r border-gray-100"></td>
                    <td className="py-2 px-1 border-r border-gray-100"></td>
                    <td className="py-2 px-1 border-r border-gray-100"></td>
                    <td className="py-2 px-1 border-r border-gray-100 bg-gray-50 text-right font-bold">
                      {totalAmount > 0 ? new Intl.NumberFormat("vi-VN").format(totalAmount) : ''}
                    </td>
                    <td className="py-2 px-1 border-r border-gray-100"></td>
                    <td className="py-2 px-1 border-r border-gray-100"></td>
                    <td className="py-2 px-1"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Grid Actions */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <button 
                  type="button" 
                  onClick={addItem}
                  className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-sm hover:bg-gray-50 text-gray-700 bg-white font-medium shadow-sm transition-colors"
                >
                  <Plus className="h-4 w-4" /> Thêm dòng
                </button>
                <button 
                  type="button"
                  onClick={removeAllItems}
                  className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 bg-white font-medium shadow-sm transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Xóa hết dòng
                </button>
              </div>

              {/* Attachments */}
              <div className="w-[400px]">
                <label className="flex items-center gap-1 text-green-600 font-medium mb-1 cursor-pointer">
                  <Upload className="h-4 w-4" /> Đính kèm <span className="text-gray-400 font-normal ml-1">Dung lượng tối đa 5MB</span>
                </label>
                <div className="border border-dashed border-gray-300 rounded-sm p-4 text-center hover:bg-gray-50 cursor-pointer">
                  <span className="text-blue-600 hover:underline">Chọn tệp</span> hoặc kéo và thả tệp vào đây
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* FOOTER */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-gray-700">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showAccounts ? 'bg-green-500' : 'bg-gray-300'}`} onClick={() => setShowAccounts(!showAccounts)}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${showAccounts ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
            Hiển thị tài khoản
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 border border-gray-300 rounded-sm text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button 
            type="button"
            className="px-4 py-1.5 border border-gray-300 rounded-sm text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cất
          </button>
          <button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="px-4 py-1.5 bg-green-600 text-white rounded-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <Printer className="h-4 w-4" /> Cất và In
          </button>
        </div>
      </div>
    </div>
  );
}
