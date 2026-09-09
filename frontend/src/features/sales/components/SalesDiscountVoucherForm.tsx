import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, XCircle } from 'lucide-react';
import axios from 'axios';

interface SalesDiscountVoucherFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DiscountItem {
  id: string;
  itemCode: string;
  itemName: string;
  discountAccount: string;
  debtAccount: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  taxPercent: number;
  taxAmount: number;
  taxAccount: string;
  salesVoucherNumber: string;
}

export function SalesDiscountVoucherForm({ isOpen, onClose, onSuccess }: SalesDiscountVoucherFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Radio option
  const [discountType, setDiscountType] = useState<'Giảm trừ công nợ' | 'Trả lại tiền mặt'>('Giảm trừ công nợ');

  // Master Fields
  const [masterData, setMasterData] = useState({
    customerCode: '',
    customerName: '',
    address: '',
    reason: 'Giảm giá hàng bán',
    voucherDate: new Date().toISOString().split('T')[0],
    accountingDate: new Date().toISOString().split('T')[0],
    voucherNumber: 'CTGG-0001',
  });

  // Detail Grid
  const [items, setItems] = useState<DiscountItem[]>([]);

  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMasterData({ ...masterData, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    const newItem: DiscountItem = {
      id: Math.random().toString(36).substr(2, 9),
      itemCode: '',
      itemName: '',
      discountAccount: '5213',
      debtAccount: '131',
      unit: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
      taxPercent: 8,
      taxAmount: 0,
      taxAccount: '33311',
      salesVoucherNumber: '',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof DiscountItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Auto-calculate total amount and tax
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.totalAmount = updatedItem.quantity * updatedItem.unitPrice;
            updatedItem.taxAmount = (updatedItem.totalAmount * updatedItem.taxPercent) / 100;
          }
          if (field === 'taxPercent') {
            updatedItem.taxAmount = (updatedItem.totalAmount * updatedItem.taxPercent) / 100;
          }
          if (field === 'totalAmount') {
            updatedItem.taxAmount = (updatedItem.totalAmount * updatedItem.taxPercent) / 100;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        discountType,
        ...masterData,
        items,
      };
      
      await axios.post('/api/sales/discount', payload);
      alert('Chứng từ giảm giá đã được lưu thành công!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting sales discount voucher:', error);
      alert('Lỗi khi lưu chứng từ giảm giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-orange-50/50">
            <h2 className="text-xl font-semibold text-gray-800">Chứng từ giảm giá hàng bán</h2>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Top Options */}
            <div className="flex gap-6 items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
              <span className="text-sm font-semibold text-gray-700">Hình thức giảm:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="discountType"
                  value="Giảm trừ công nợ"
                  checked={discountType === 'Giảm trừ công nợ'}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Giảm trừ công nợ</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="discountType"
                  value="Trả lại tiền mặt"
                  checked={discountType === 'Trả lại tiền mặt'}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Trả lại tiền mặt</span>
              </label>
            </div>

            {/* Master Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b pb-2">Thông tin chung</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mã KH</label>
                    <input type="text" name="customerCode" value={masterData.customerCode} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tên khách hàng</label>
                    <input type="text" name="customerName" value={masterData.customerName} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Địa chỉ</label>
                    <input type="text" name="address" value={masterData.address} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lý do</label>
                    <input type="text" name="reason" value={masterData.reason} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b pb-2">Chứng từ</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ngày hạch toán</label>
                    <input type="date" name="accountingDate" value={masterData.accountingDate} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ngày chứng từ</label>
                    <input type="date" name="voucherDate" value={masterData.voucherDate} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Số chứng từ</label>
                    <input type="text" name="voucherNumber" value={masterData.voucherNumber} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-all outline-none font-semibold text-orange-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
              <div className="bg-white overflow-x-auto min-h-[250px]">
                <table className="min-w-[1300px] w-full text-left border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-10 text-center">#</th>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32">Mã hàng</th>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-48">Tên hàng</th>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-24">TK Giảm giá</th>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-24">TK công nợ</th>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-20">ĐVT</th>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-24 text-right">Số lượng</th>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32 text-right">Đơn giá</th>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32 text-right">Thành tiền</th>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-20 text-right">% thuế</th>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32 text-right">Tiền thuế</th>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-24">TK Thuế</th>
                      <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32">Số CT bán hàng</th>
                      <th className="px-3 py-2 border border-gray-200 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 focus-within:bg-orange-50/20">
                        <td className="px-3 py-1 border border-gray-200 text-xs text-center text-gray-500">{index + 1}</td>
                        <td className="px-0 border border-gray-200"><input type="text" value={item.itemCode} onChange={(e) => handleItemChange(item.id, 'itemCode', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-orange-500" /></td>
                        <td className="px-0 border border-gray-200"><input type="text" value={item.itemName} onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-orange-500" /></td>
                        <td className="px-0 border border-gray-200"><input type="text" value={item.discountAccount} onChange={(e) => handleItemChange(item.id, 'discountAccount', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-orange-500" /></td>
                        <td className="px-0 border border-gray-200"><input type="text" value={item.debtAccount} onChange={(e) => handleItemChange(item.id, 'debtAccount', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-orange-500" /></td>
                        <td className="px-0 border border-gray-200"><input type="text" value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-orange-500" /></td>
                        <td className="px-0 border border-gray-200"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))} className="w-full h-8 px-2 text-sm border-0 bg-transparent text-right outline-none focus:ring-1 focus:ring-inset focus:ring-orange-500" /></td>
                        <td className="px-0 border border-gray-200"><input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))} className="w-full h-8 px-2 text-sm border-0 bg-transparent text-right outline-none focus:ring-1 focus:ring-inset focus:ring-orange-500" /></td>
                        <td className="px-0 border border-gray-200"><input type="number" value={item.totalAmount} onChange={(e) => handleItemChange(item.id, 'totalAmount', Number(e.target.value))} className="w-full h-8 px-2 text-sm border-0 bg-gray-50 text-right outline-none font-medium text-gray-700" /></td>
                        <td className="px-0 border border-gray-200"><input type="number" value={item.taxPercent} onChange={(e) => handleItemChange(item.id, 'taxPercent', Number(e.target.value))} className="w-full h-8 px-2 text-sm border-0 bg-transparent text-right outline-none focus:ring-1 focus:ring-inset focus:ring-orange-500" /></td>
                        <td className="px-0 border border-gray-200"><input type="number" value={item.taxAmount} onChange={(e) => handleItemChange(item.id, 'taxAmount', Number(e.target.value))} className="w-full h-8 px-2 text-sm border-0 bg-gray-50 text-right outline-none font-medium text-gray-700" /></td>
                        <td className="px-0 border border-gray-200"><input type="text" value={item.taxAccount} onChange={(e) => handleItemChange(item.id, 'taxAccount', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-orange-500" /></td>
                        <td className="px-0 border border-gray-200"><input type="text" value={item.salesVoucherNumber} onChange={(e) => handleItemChange(item.id, 'salesVoucherNumber', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-orange-500" /></td>
                        <td className="px-0 border border-gray-200 text-center">
                          <button onClick={() => handleRemoveItem(item.id)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded mx-auto transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={14} className="px-6 py-8 text-center text-gray-500 text-sm">
                          Chưa có dữ liệu chi tiết. Nhấn "Thêm dòng" để bắt đầu.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Grid Actions */}
              <div className="bg-gray-50 p-2 border-t border-gray-200 flex">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Thêm dòng
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? 'Đang lưu...' : 'Cất (Lưu)'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
