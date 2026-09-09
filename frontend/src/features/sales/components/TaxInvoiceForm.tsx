"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, Receipt } from 'lucide-react';
import axios from 'axios';

export interface TaxInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TaxInvoiceDetail {
  id: string;
  itemCode: string;
  itemName: string;
  isTradeDiscount: boolean;
  specification: string;
  unit: string;
  quantity: number;
  price: number;
  amount: number;
  taxPercentage: number;
  taxAmount: number;
}

export function TaxInvoiceForm({ isOpen, onClose, onSuccess }: TaxInvoiceFormProps) {
  const [master, setMaster] = useState({
    customerCode: '',
    customerName: '',
    invoiceFormTemplate: '',
    invoiceSymbol: '',
    invoiceNumber: '',
    invoiceDate: '',
  });

  const [details, setDetails] = useState<TaxInvoiceDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMaster(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRow = () => {
    setDetails([
      ...details,
      {
        id: Math.random().toString(36).substring(7),
        itemCode: '',
        itemName: '',
        isTradeDiscount: false,
        specification: '',
        unit: '',
        quantity: 1,
        price: 0,
        amount: 0,
        taxPercentage: 0,
        taxAmount: 0,
      }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setDetails(details.filter(d => d.id !== id));
  };

  const handleDetailChange = (id: string, field: keyof TaxInvoiceDetail, value: any) => {
    setDetails(details.map(d => {
      if (d.id === id) {
        const updated = { ...d, [field]: value };
        
        if (['quantity', 'price'].includes(field)) {
          // If it's trade discount, amount might be negative, we'll keep it absolute here, handle logic if needed
          updated.amount = (Number(updated.quantity) || 0) * (Number(updated.price) || 0);
        }
        
        if (['quantity', 'price', 'taxPercentage', 'isTradeDiscount'].includes(field) || field === 'amount') {
          updated.taxAmount = updated.amount * ((Number(updated.taxPercentage) || 0) / 100);
        }
        
        return updated;
      }
      return d;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/sales/tax-invoices', { master, details });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Submit failed', error);
      alert('Đã có lỗi xảy ra khi xuất hóa đơn.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-2 text-rose-600">
              <Receipt size={24} />
              <h2 className="text-xl font-semibold">Xuất Hóa Đơn Bán Hàng Hóa</h2>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <form id="tax-invoice-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Master Data */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider border-b pb-2">Thông Tin Hóa Đơn</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mã khách hàng <span className="text-red-500">*</span></label>
                    <input type="text" name="customerCode" value={master.customerCode} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-rose-500 outline-none" required />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tên khách hàng <span className="text-red-500">*</span></label>
                    <input type="text" name="customerName" value={master.customerName} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-rose-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mẫu số HĐ</label>
                    <input type="text" name="invoiceFormTemplate" value={master.invoiceFormTemplate} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ký hiệu HĐ</label>
                    <input type="text" name="invoiceSymbol" value={master.invoiceSymbol} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Số hóa đơn <span className="text-red-500">*</span></label>
                    <input type="text" name="invoiceNumber" value={master.invoiceNumber} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-rose-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ngày HĐ <span className="text-red-500">*</span></label>
                    <input type="date" name="invoiceDate" value={master.invoiceDate} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-rose-500 outline-none" required />
                  </div>
                </div>
              </div>

              {/* Detail Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Chi Tiết Hóa Đơn</h3>
                  <button type="button" onClick={handleAddRow} className="flex items-center space-x-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 transition-colors text-sm font-medium">
                    <Plus size={16} />
                    <span>Thêm Dòng</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-700 font-medium">
                      <tr>
                        <th className="px-3 py-3 w-12 text-center border-b">#</th>
                        <th className="px-3 py-3 border-b min-w-[120px]">Mã hàng</th>
                        <th className="px-3 py-3 border-b min-w-[180px]">Tên hàng</th>
                        <th className="px-3 py-3 border-b text-center" title="Chiết khấu thương mại">CKTM</th>
                        <th className="px-3 py-3 border-b min-w-[120px]">Quy cách</th>
                        <th className="px-3 py-3 border-b w-20">ĐVT</th>
                        <th className="px-3 py-3 border-b w-24 text-right">Số lượng</th>
                        <th className="px-3 py-3 border-b w-32 text-right">Đơn giá</th>
                        <th className="px-3 py-3 border-b w-32 text-right">Thành tiền</th>
                        <th className="px-3 py-3 border-b w-20 text-right">% Thuế</th>
                        <th className="px-3 py-3 border-b w-28 text-right">Tiền thuế</th>
                        <th className="px-3 py-3 border-b w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {details.length === 0 ? (
                        <tr>
                          <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
                            Chưa có chi tiết nào. Bấm "Thêm Dòng" để bắt đầu.
                          </td>
                        </tr>
                      ) : details.map((row, index) => (
                        <tr key={row.id} className="bg-white hover:bg-gray-50/50 transition-colors focus-within:bg-rose-50/30">
                          <td className="px-3 py-2 text-center text-gray-500 font-medium">{index + 1}</td>
                          <td className="px-3 py-2"><input type="text" value={row.itemCode} onChange={e => handleDetailChange(row.id, 'itemCode', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-rose-500 rounded bg-transparent focus:bg-white outline-none" required /></td>
                          <td className="px-3 py-2"><input type="text" value={row.itemName} onChange={e => handleDetailChange(row.id, 'itemName', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-rose-500 rounded bg-transparent focus:bg-white outline-none" required /></td>
                          <td className="px-3 py-2 text-center">
                            <input type="checkbox" checked={row.isTradeDiscount} onChange={e => handleDetailChange(row.id, 'isTradeDiscount', e.target.checked)} className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500" />
                          </td>
                          <td className="px-3 py-2"><input type="text" value={row.specification} onChange={e => handleDetailChange(row.id, 'specification', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-rose-500 rounded bg-transparent focus:bg-white outline-none" /></td>
                          <td className="px-3 py-2"><input type="text" value={row.unit} onChange={e => handleDetailChange(row.id, 'unit', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-rose-500 rounded bg-transparent focus:bg-white outline-none text-center" /></td>
                          <td className="px-3 py-2"><input type="number" value={row.quantity} onChange={e => handleDetailChange(row.id, 'quantity', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-rose-500 rounded bg-transparent focus:bg-white outline-none text-right" min="0" step="any" required /></td>
                          <td className="px-3 py-2"><input type="number" value={row.price} onChange={e => handleDetailChange(row.id, 'price', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-rose-500 rounded bg-transparent focus:bg-white outline-none text-right" min="0" step="any" required /></td>
                          <td className="px-3 py-2">
                            <div className={`px-2 py-1 text-right font-medium ${row.isTradeDiscount ? 'text-red-600' : 'text-gray-700'}`}>
                              {row.isTradeDiscount ? '-' : ''}{row.amount.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-3 py-2"><input type="number" value={row.taxPercentage} onChange={e => handleDetailChange(row.id, 'taxPercentage', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-rose-500 rounded bg-transparent focus:bg-white outline-none text-right" min="0" max="100" step="any" /></td>
                          <td className="px-3 py-2">
                            <div className={`px-2 py-1 text-right font-medium ${row.isTradeDiscount ? 'text-red-600' : 'text-gray-700'}`}>
                              {row.isTradeDiscount ? '-' : ''}{row.taxAmount.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button type="button" onClick={() => handleRemoveRow(row.id)} className="text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {details.length > 0 && (
                      <tfoot className="bg-gray-50 border-t border-gray-200 font-semibold text-gray-700">
                        <tr>
                          <td colSpan={8} className="px-4 py-3 text-right">Tổng cộng:</td>
                          <td className="px-3 py-3 text-right text-rose-600">
                            {details.reduce((sum, row) => sum + (row.isTradeDiscount ? -row.amount : row.amount), 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-3"></td>
                          <td className="px-3 py-3 text-right text-orange-600">
                            {details.reduce((sum, row) => sum + (row.isTradeDiscount ? -row.taxAmount : row.taxAmount), 0).toLocaleString()}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </form>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Hủy Bỏ
            </button>
            <button type="submit" form="tax-invoice-form" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors flex items-center space-x-2 disabled:opacity-70">
              <Save size={16} />
              <span>{loading ? 'Đang xuất...' : 'Xuất Hóa Đơn'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
