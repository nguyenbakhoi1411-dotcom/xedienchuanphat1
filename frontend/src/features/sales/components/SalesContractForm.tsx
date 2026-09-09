"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, Briefcase } from 'lucide-react';
import axios from 'axios';

export interface SalesContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SalesContractDetail {
  id: string;
  itemCode: string;
  itemName: string;
  unit: string;
  requestedQuantity: number;
  deliveredQuantity: number;
  price: number;
  amount: number;
  discountRate: number;
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  licensePlate: string;
}

export function SalesContractForm({ isOpen, onClose, onSuccess }: SalesContractFormProps) {
  const [master, setMaster] = useState({
    contractNumber: '',
    signingDate: '',
    project: '',
    contractValue: 0,
    contractStatus: 'Active',
    deliveryStatus: 'Pending',
    customerCode: '',
    customerName: '',
    address: '',
    contactPerson: '',
    deliveryDeadline: '',
    paymentDeadline: '',
  });

  const [details, setDetails] = useState<SalesContractDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        unit: '',
        requestedQuantity: 1,
        deliveredQuantity: 0,
        price: 0,
        amount: 0,
        discountRate: 0,
        discountAmount: 0,
        taxPercentage: 0,
        taxAmount: 0,
        licensePlate: ''
      }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setDetails(details.filter(d => d.id !== id));
  };

  const handleDetailChange = (id: string, field: keyof SalesContractDetail, value: any) => {
    setDetails(details.map(d => {
      if (d.id === id) {
        const updated = { ...d, [field]: value };
        
        // Recalculate amounts
        if (['requestedQuantity', 'price'].includes(field)) {
          updated.amount = (Number(updated.requestedQuantity) || 0) * (Number(updated.price) || 0);
        }
        
        if (['discountRate', 'amount'].includes(field) && field !== 'discountAmount') {
          updated.discountAmount = updated.amount * ((Number(updated.discountRate) || 0) / 100);
        } else if (field === 'discountAmount') {
          updated.discountRate = updated.amount > 0 ? (Number(value) / updated.amount) * 100 : 0;
        }

        const baseForTax = updated.amount - updated.discountAmount;
        if (['taxPercentage', 'amount', 'discountAmount', 'discountRate'].includes(field)) {
          updated.taxAmount = baseForTax * ((Number(updated.taxPercentage) || 0) / 100);
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
      await axios.post('/api/sales/contracts', { master, details });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Submit failed', error);
      alert('Đã có lỗi xảy ra khi lưu hợp đồng bán.');
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-2 text-teal-600">
              <Briefcase size={24} />
              <h2 className="text-xl font-semibold">Thêm Mới Hợp Đồng Bán</h2>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <form id="sales-contract-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Master Data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider border-b pb-2">Thông Tin Hợp Đồng</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Số hợp đồng <span className="text-red-500">*</span></label>
                      <input type="text" name="contractNumber" value={master.contractNumber} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Ngày ký <span className="text-red-500">*</span></label>
                      <input type="date" name="signingDate" value={master.signingDate} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Thuộc dự án</label>
                      <input type="text" name="project" value={master.project} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tình trạng HĐ</label>
                      <select name="contractStatus" value={master.contractStatus} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                        <option value="Active">Đang thực hiện</option>
                        <option value="Completed">Đã hoàn thành</option>
                        <option value="Cancelled">Đã hủy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tình trạng giao hàng</label>
                      <select name="deliveryStatus" value={master.deliveryStatus} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                        <option value="Pending">Chưa giao</option>
                        <option value="Partial">Đang giao</option>
                        <option value="Done">Đã giao xong</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Hạn giao hàng</label>
                      <input type="date" name="deliveryDeadline" value={master.deliveryDeadline} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Hạn thanh toán</label>
                      <input type="date" name="paymentDeadline" value={master.paymentDeadline} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider border-b pb-2">Thông Tin Khách Hàng</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Mã khách hàng <span className="text-red-500">*</span></label>
                      <input type="text" name="customerCode" value={master.customerCode} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tên khách hàng <span className="text-red-500">*</span></label>
                      <input type="text" name="customerName" value={master.customerName} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 outline-none" required />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Địa chỉ</label>
                      <input type="text" name="address" value={master.address} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Người liên hệ</label>
                      <input type="text" name="contactPerson" value={master.contactPerson} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Giá trị hợp đồng (Dự kiến)</label>
                      <input type="number" name="contractValue" value={master.contractValue} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Chi Tiết Hàng Hóa Dịch Vụ</h3>
                  <button type="button" onClick={handleAddRow} className="flex items-center space-x-1 px-3 py-1.5 bg-teal-50 text-teal-600 rounded-md hover:bg-teal-100 transition-colors text-sm font-medium">
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
                        <th className="px-3 py-3 border-b w-20">ĐVT</th>
                        <th className="px-3 py-3 border-b w-28 text-right">SL Yêu cầu</th>
                        <th className="px-3 py-3 border-b w-28 text-right">SL Đã giao</th>
                        <th className="px-3 py-3 border-b w-32 text-right">Đơn giá</th>
                        <th className="px-3 py-3 border-b w-32 text-right">Thành tiền</th>
                        <th className="px-3 py-3 border-b w-20 text-right">% CK</th>
                        <th className="px-3 py-3 border-b w-28 text-right">Tiền CK</th>
                        <th className="px-3 py-3 border-b w-20 text-right">% Thuế</th>
                        <th className="px-3 py-3 border-b w-28 text-right">Tiền thuế</th>
                        <th className="px-3 py-3 border-b min-w-[120px]">Biển KS</th>
                        <th className="px-3 py-3 border-b w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {details.length === 0 ? (
                        <tr>
                          <td colSpan={14} className="px-4 py-8 text-center text-gray-400">
                            Chưa có chi tiết nào. Bấm "Thêm Dòng" để bắt đầu.
                          </td>
                        </tr>
                      ) : details.map((row, index) => (
                        <tr key={row.id} className="bg-white hover:bg-gray-50/50 transition-colors focus-within:bg-teal-50/30">
                          <td className="px-3 py-2 text-center text-gray-500 font-medium">{index + 1}</td>
                          <td className="px-3 py-2"><input type="text" value={row.itemCode} onChange={e => handleDetailChange(row.id, 'itemCode', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-teal-500 rounded bg-transparent focus:bg-white outline-none" required /></td>
                          <td className="px-3 py-2"><input type="text" value={row.itemName} onChange={e => handleDetailChange(row.id, 'itemName', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-teal-500 rounded bg-transparent focus:bg-white outline-none" required /></td>
                          <td className="px-3 py-2"><input type="text" value={row.unit} onChange={e => handleDetailChange(row.id, 'unit', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-teal-500 rounded bg-transparent focus:bg-white outline-none text-center" /></td>
                          <td className="px-3 py-2"><input type="number" value={row.requestedQuantity} onChange={e => handleDetailChange(row.id, 'requestedQuantity', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-teal-500 rounded bg-transparent focus:bg-white outline-none text-right" min="0" step="any" required /></td>
                          <td className="px-3 py-2"><input type="number" value={row.deliveredQuantity} onChange={e => handleDetailChange(row.id, 'deliveredQuantity', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-teal-500 rounded bg-transparent focus:bg-white outline-none text-right" min="0" step="any" /></td>
                          <td className="px-3 py-2"><input type="number" value={row.price} onChange={e => handleDetailChange(row.id, 'price', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-teal-500 rounded bg-transparent focus:bg-white outline-none text-right" min="0" step="any" required /></td>
                          <td className="px-3 py-2"><div className="px-2 py-1 text-right font-medium text-gray-700">{row.amount.toLocaleString()}</div></td>
                          <td className="px-3 py-2"><input type="number" value={row.discountRate} onChange={e => handleDetailChange(row.id, 'discountRate', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-teal-500 rounded bg-transparent focus:bg-white outline-none text-right" min="0" max="100" step="any" /></td>
                          <td className="px-3 py-2"><input type="number" value={row.discountAmount} onChange={e => handleDetailChange(row.id, 'discountAmount', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-teal-500 rounded bg-transparent focus:bg-white outline-none text-right" min="0" step="any" /></td>
                          <td className="px-3 py-2"><input type="number" value={row.taxPercentage} onChange={e => handleDetailChange(row.id, 'taxPercentage', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-teal-500 rounded bg-transparent focus:bg-white outline-none text-right" min="0" max="100" step="any" /></td>
                          <td className="px-3 py-2"><div className="px-2 py-1 text-right font-medium text-gray-700">{row.taxAmount.toLocaleString()}</div></td>
                          <td className="px-3 py-2"><input type="text" value={row.licensePlate} onChange={e => handleDetailChange(row.id, 'licensePlate', e.target.value)} className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-teal-500 rounded bg-transparent focus:bg-white outline-none" /></td>
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
                          <td colSpan={7} className="px-4 py-3 text-right">Tổng cộng:</td>
                          <td className="px-3 py-3 text-right text-teal-600">{details.reduce((sum, row) => sum + row.amount, 0).toLocaleString()}</td>
                          <td className="px-3 py-3"></td>
                          <td className="px-3 py-3 text-right text-red-500">{details.reduce((sum, row) => sum + row.discountAmount, 0).toLocaleString()}</td>
                          <td className="px-3 py-3"></td>
                          <td className="px-3 py-3 text-right text-orange-600">{details.reduce((sum, row) => sum + row.taxAmount, 0).toLocaleString()}</td>
                          <td colSpan={2}></td>
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
            <button type="submit" form="sales-contract-form" disabled={loading} className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 disabled:opacity-70">
              <Save size={16} />
              <span>{loading ? 'Đang lưu...' : 'Lưu Hợp Đồng'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
