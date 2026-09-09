"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, FileText } from 'lucide-react';
import axios from 'axios';

export interface QuotationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface QuotationDetail {
  id: string;
  itemCode: string;
  itemName: string;
  specification: string;
  unit: string;
  quantity: number;
  price: number;
  amount: number;
  vatAmount: number;
  warrantyPeriod: string;
  department: string;
}

export function QuotationForm({ isOpen, onClose, onSuccess }: QuotationFormProps) {
  const [master, setMaster] = useState({
    customerCode: '',
    customerName: '',
    taxId: '',
    address: '',
    contactPerson: '',
    notes: '',
    salesperson: '',
    reference: '',
    quotationNumber: '',
    quotationDate: '',
    validUntil: '',
  });

  const [details, setDetails] = useState<QuotationDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        specification: '',
        unit: '',
        quantity: 1,
        price: 0,
        amount: 0,
        vatAmount: 0,
        warrantyPeriod: '',
        department: '',
      }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setDetails(details.filter(d => d.id !== id));
  };

  const handleDetailChange = (id: string, field: keyof QuotationDetail, value: any) => {
    setDetails(details.map(d => {
      if (d.id === id) {
        const updated = { ...d, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updated.amount = (Number(updated.quantity) || 0) * (Number(updated.price) || 0);
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
      await axios.post('/api/sales/quotations', { master, details });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Submit failed', error);
      alert('Đã có lỗi xảy ra khi lưu báo giá.');
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-2 text-blue-600">
              <FileText size={24} />
              <h2 className="text-xl font-semibold">Thêm Mới Báo Giá</h2>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <form id="quotation-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Master Data */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider">Thông Tin Chung</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mã khách hàng <span className="text-red-500">*</span></label>
                    <input type="text" name="customerCode" value={master.customerCode} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tên khách hàng <span className="text-red-500">*</span></label>
                    <input type="text" name="customerName" value={master.customerName} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">MST</label>
                    <input type="text" name="taxId" value={master.taxId} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Người liên hệ</label>
                    <input type="text" name="contactPerson" value={master.contactPerson} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Địa chỉ</label>
                    <input type="text" name="address" value={master.address} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ghi chú</label>
                    <input type="text" name="notes" value={master.notes} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">NV Bán hàng</label>
                    <input type="text" name="salesperson" value={master.salesperson} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tham chiếu</label>
                    <input type="text" name="reference" value={master.reference} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Số báo giá <span className="text-red-500">*</span></label>
                    <input type="text" name="quotationNumber" value={master.quotationNumber} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ngày báo giá <span className="text-red-500">*</span></label>
                    <input type="date" name="quotationDate" value={master.quotationDate} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hiệu lực đến</label>
                    <input type="date" name="validUntil" value={master.validUntil} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Detail Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Chi Tiết Hàng Tiền</h3>
                  <button type="button" onClick={handleAddRow} className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium">
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
                        <th className="px-3 py-3 border-b min-w-[200px]">Tên hàng</th>
                        <th className="px-3 py-3 border-b min-w-[150px]">Quy cách</th>
                        <th className="px-3 py-3 border-b w-24">ĐVT</th>
                        <th className="px-3 py-3 border-b w-32 text-right">Số lượng</th>
                        <th className="px-3 py-3 border-b w-32 text-right">Đơn giá</th>
                        <th className="px-3 py-3 border-b w-32 text-right">Thành tiền</th>
                        <th className="px-3 py-3 border-b w-32 text-right">Tiền thuế GTGT</th>
                        <th className="px-3 py-3 border-b min-w-[120px]">Thời hạn BH</th>
                        <th className="px-3 py-3 border-b min-w-[120px]">Đơn vị</th>
                        <th className="px-3 py-3 border-b w-16 text-center">Xóa</th>
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
                        <tr key={row.id} className="bg-white hover:bg-gray-50/50 transition-colors focus-within:bg-blue-50/30">
                          <td className="px-3 py-2 text-center text-gray-500 font-medium">{index + 1}</td>
                          <td className="px-3 py-2"><input type="text" value={row.itemCode} onChange={e => handleDetailChange(row.id, 'itemCode', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none transition-all" required /></td>
                          <td className="px-3 py-2"><input type="text" value={row.itemName} onChange={e => handleDetailChange(row.id, 'itemName', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none transition-all" required /></td>
                          <td className="px-3 py-2"><input type="text" value={row.specification} onChange={e => handleDetailChange(row.id, 'specification', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none transition-all" /></td>
                          <td className="px-3 py-2"><input type="text" value={row.unit} onChange={e => handleDetailChange(row.id, 'unit', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none transition-all text-center" /></td>
                          <td className="px-3 py-2"><input type="number" value={row.quantity} onChange={e => handleDetailChange(row.id, 'quantity', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none transition-all text-right" min="0" step="any" required /></td>
                          <td className="px-3 py-2"><input type="number" value={row.price} onChange={e => handleDetailChange(row.id, 'price', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none transition-all text-right" min="0" step="any" required /></td>
                          <td className="px-3 py-2">
                            <div className="px-2 py-1.5 text-right font-medium text-gray-700 bg-gray-50 rounded">
                              {row.amount.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-3 py-2"><input type="number" value={row.vatAmount} onChange={e => handleDetailChange(row.id, 'vatAmount', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none transition-all text-right" min="0" step="any" /></td>
                          <td className="px-3 py-2"><input type="text" value={row.warrantyPeriod} onChange={e => handleDetailChange(row.id, 'warrantyPeriod', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none transition-all" /></td>
                          <td className="px-3 py-2"><input type="text" value={row.department} onChange={e => handleDetailChange(row.id, 'department', e.target.value)} className="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none transition-all" /></td>
                          <td className="px-3 py-2 text-center">
                            <button type="button" onClick={() => handleRemoveRow(row.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors inline-flex items-center justify-center">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {details.length > 0 && (
                      <tfoot className="bg-gray-50 border-t border-gray-200 font-semibold text-gray-700">
                        <tr>
                          <td colSpan={7} className="px-4 py-3 text-right">Tổng cộng:</td>
                          <td className="px-3 py-3 text-right text-blue-600">{details.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}</td>
                          <td className="px-3 py-3 text-right text-orange-600">{details.reduce((sum, row) => sum + (Number(row.vatAmount) || 0), 0).toLocaleString()}</td>
                          <td colSpan={3}></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </form>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
              Hủy Bỏ
            </button>
            <button type="submit" form="quotation-form" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed">
              <Save size={16} />
              <span>{loading ? 'Đang lưu...' : 'Lưu Báo Giá'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
