import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, XCircle } from 'lucide-react';
import axios from 'axios';

interface SalesVoucherFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DetailItem {
  id: string;
  itemCode: string;
  itemName: string;
  warehouse: string;
  isPromo: boolean;
  commercialDiscount: number;
  debtAccount: string;
  revenueAccount: string;
  unit: string;
  quantity: number;
  specification: string;
  unitPrice: number;
  totalAmount: number;
  inventoryAccount: string;
}

interface CostItem {
  id: string;
  itemCode: string;
  itemName: string;
  inventoryAccount: string;
  cogsAccount: string; // Cost of Goods Sold Account
  costPrice: number;
  totalCost: number;
}

export function SalesVoucherForm({ isOpen, onClose, onSuccess }: SalesVoucherFormProps) {
  const [activeTab, setActiveTab] = useState<'hang-tien' | 'gia-von'>('hang-tien');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Top Header
  const [paymentStatus, setPaymentStatus] = useState<'Chưa thu tiền' | 'Thu tiền ngay'>('Chưa thu tiền');
  const [isExportVoucher, setIsExportVoucher] = useState(false);
  const [isInvoiceIncluded, setIsInvoiceIncluded] = useState(false);

  // Master Fields
  const [masterData, setMasterData] = useState({
    customerCode: '',
    customerName: '',
    taxCode: '',
    contactPerson: '',
    address: '',
    salesperson: '',
    description: '',
    paymentTerms: '',
    accountingDate: new Date().toISOString().split('T')[0],
    voucherDate: new Date().toISOString().split('T')[0],
    voucherNumber: 'CTBH-0001',
  });

  // E-commerce Fields
  const [ecommerceData, setEcommerceData] = useState({
    platform: '',
    shopName: '',
    storeCode: '',
    storeName: '',
    deliveryDate: '',
    invoiceLookupCode: '',
  });

  // Detail Grids
  const [items, setItems] = useState<DetailItem[]>([]);
  const [costItems, setCostItems] = useState<CostItem[]>([]);

  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMasterData({ ...masterData, [e.target.name]: e.target.value });
  };

  const handleEcommerceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEcommerceData({ ...ecommerceData, [e.target.name]: e.target.value });
  };

  const handleAddItem = () => {
    const newItem: DetailItem = {
      id: Math.random().toString(36).substr(2, 9),
      itemCode: '',
      itemName: '',
      warehouse: '',
      isPromo: false,
      commercialDiscount: 0,
      debtAccount: '131',
      revenueAccount: '5111',
      unit: '',
      quantity: 1,
      specification: '',
      unitPrice: 0,
      totalAmount: 0,
      inventoryAccount: '1561',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof DetailItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Auto-calculate total amount
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.totalAmount = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleAddCostItem = () => {
    const newItem: CostItem = {
      id: Math.random().toString(36).substr(2, 9),
      itemCode: '',
      itemName: '',
      inventoryAccount: '1561',
      cogsAccount: '632',
      costPrice: 0,
      totalCost: 0,
    };
    setCostItems([...costItems, newItem]);
  };

  const handleRemoveCostItem = (id: string) => {
    setCostItems(costItems.filter((item) => item.id !== id));
  };

  const handleCostItemChange = (id: string, field: keyof CostItem, value: any) => {
    setCostItems(
      costItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        paymentStatus,
        isExportVoucher,
        isInvoiceIncluded,
        ...masterData,
        ...ecommerceData,
        items,
        costItems,
      };
      
      await axios.post('/api/sales', payload);
      alert('Chứng từ bán hàng đã được lưu thành công!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting sales voucher:', error);
      alert('Lỗi khi lưu chứng từ. Vui lòng thử lại.');
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden"
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-xl font-semibold text-gray-800">Chứng từ bán hàng</h2>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Top Options */}
            <div className="flex flex-wrap gap-6 items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="Chưa thu tiền"
                    checked={paymentStatus === 'Chưa thu tiền'}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Chưa thu tiền</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentStatus"
                    value="Thu tiền ngay"
                    checked={paymentStatus === 'Thu tiền ngay'}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Thu tiền ngay</span>
                </label>
              </div>
              <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
              <div className="flex gap-6 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isExportVoucher}
                    onChange={(e) => setIsExportVoucher(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Kiêm phiếu xuất kho</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInvoiceIncluded}
                    onChange={(e) => setIsInvoiceIncluded(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Lập kèm hóa đơn</span>
                </label>
              </div>
            </div>

            {/* Master Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b pb-2">Thông tin chung</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mã KH</label>
                    <input type="text" name="customerCode" value={masterData.customerCode} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tên khách hàng</label>
                    <input type="text" name="customerName" value={masterData.customerName} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mã số thuế</label>
                    <input type="text" name="taxCode" value={masterData.taxCode} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Người liên hệ</label>
                    <input type="text" name="contactPerson" value={masterData.contactPerson} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Địa chỉ</label>
                    <input type="text" name="address" value={masterData.address} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nhân viên bán hàng</label>
                    <input type="text" name="salesperson" value={masterData.salesperson} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Điều khoản thanh toán</label>
                    <input type="text" name="paymentTerms" value={masterData.paymentTerms} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Diễn giải</label>
                    <textarea name="description" value={masterData.description} onChange={handleMasterChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none resize-none"></textarea>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2 border-b pb-2">Chứng từ</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ngày hạch toán</label>
                    <input type="date" name="accountingDate" value={masterData.accountingDate} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ngày chứng từ</label>
                    <input type="date" name="voucherDate" value={masterData.voucherDate} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Số chứng từ</label>
                    <input type="text" name="voucherNumber" value={masterData.voucherNumber} onChange={handleMasterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none font-semibold text-blue-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* E-commerce Information */}
            <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                Thông tin TMĐT
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sàn TMĐT</label>
                  <input type="text" name="platform" value={ecommerceData.platform} onChange={handleEcommerceChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 sm:text-sm outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tên shop</label>
                  <input type="text" name="shopName" value={ecommerceData.shopName} onChange={handleEcommerceChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 sm:text-sm outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mã cửa hàng</label>
                  <input type="text" name="storeCode" value={ecommerceData.storeCode} onChange={handleEcommerceChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 sm:text-sm outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tên cửa hàng</label>
                  <input type="text" name="storeName" value={ecommerceData.storeName} onChange={handleEcommerceChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 sm:text-sm outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ngày giao thành công</label>
                  <input type="date" name="deliveryDate" value={ecommerceData.deliveryDate} onChange={handleEcommerceChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 sm:text-sm outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mã tra cứu HĐĐT</label>
                  <input type="text" name="invoiceLookupCode" value={ecommerceData.invoiceLookupCode} onChange={handleEcommerceChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 sm:text-sm outline-none bg-white" />
                </div>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
              <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                  className={`px-6 py-3 text-sm font-semibold transition-colors ${
                    activeTab === 'hang-tien' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600 border-r border-r-gray-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-t-2 border-t-transparent'
                  }`}
                  onClick={() => setActiveTab('hang-tien')}
                >
                  Hàng tiền
                </button>
                <button
                  className={`px-6 py-3 text-sm font-semibold transition-colors ${
                    activeTab === 'gia-von' ? 'bg-white text-blue-600 border-t-2 border-t-blue-600 border-r border-r-gray-200 border-l border-l-gray-200' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-t-2 border-t-transparent'
                  }`}
                  onClick={() => setActiveTab('gia-von')}
                >
                  Giá vốn
                </button>
              </div>

              <div className="bg-white overflow-x-auto min-h-[250px]">
                {activeTab === 'hang-tien' && (
                  <table className="min-w-[1500px] w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-10 text-center">#</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32">Mã hàng</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-48">Tên hàng</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-24">Kho</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-24 text-center">Hàng KM</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-28">CK TM (%)</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-24">TK công nợ</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-24">TK doanh thu</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-20">ĐVT</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-24 text-right">Số lượng</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32">Quy cách</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32 text-right">Đơn giá</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32 text-right">Thành tiền</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-24">TK kho</th>
                        <th className="px-3 py-2 border border-gray-200 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 focus-within:bg-blue-50/20">
                          <td className="px-3 py-1 border border-gray-200 text-xs text-center text-gray-500">{index + 1}</td>
                          <td className="px-0 border border-gray-200"><input type="text" value={item.itemCode} onChange={(e) => handleItemChange(item.id, 'itemCode', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="text" value={item.itemName} onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="text" value={item.warehouse} onChange={(e) => handleItemChange(item.id, 'warehouse', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200 text-center"><input type="checkbox" checked={item.isPromo} onChange={(e) => handleItemChange(item.id, 'isPromo', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" /></td>
                          <td className="px-0 border border-gray-200"><input type="number" value={item.commercialDiscount} onChange={(e) => handleItemChange(item.id, 'commercialDiscount', Number(e.target.value))} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="text" value={item.debtAccount} onChange={(e) => handleItemChange(item.id, 'debtAccount', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="text" value={item.revenueAccount} onChange={(e) => handleItemChange(item.id, 'revenueAccount', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="text" value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))} className="w-full h-8 px-2 text-sm border-0 bg-transparent text-right outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="text" value={item.specification} onChange={(e) => handleItemChange(item.id, 'specification', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))} className="w-full h-8 px-2 text-sm border-0 bg-transparent text-right outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="number" value={item.totalAmount} readOnly className="w-full h-8 px-2 text-sm border-0 bg-gray-50 text-right outline-none font-medium text-gray-700" /></td>
                          <td className="px-0 border border-gray-200"><input type="text" value={item.inventoryAccount} onChange={(e) => handleItemChange(item.id, 'inventoryAccount', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200 text-center">
                            <button onClick={() => handleRemoveItem(item.id)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded mx-auto transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr>
                          <td colSpan={15} className="px-6 py-8 text-center text-gray-500 text-sm">
                            Chưa có dữ liệu chi tiết. Nhấn "Thêm dòng" để bắt đầu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === 'gia-von' && (
                  <table className="min-w-[800px] w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-10 text-center">#</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32">Mã hàng</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600">Tên hàng</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32">TK Kho</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32">TK Giá vốn</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32 text-right">Đơn giá vốn</th>
                        <th className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-600 w-32 text-right">Tiền vốn</th>
                        <th className="px-3 py-2 border border-gray-200 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {costItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 focus-within:bg-blue-50/20">
                          <td className="px-3 py-1 border border-gray-200 text-xs text-center text-gray-500">{index + 1}</td>
                          <td className="px-0 border border-gray-200"><input type="text" value={item.itemCode} onChange={(e) => handleCostItemChange(item.id, 'itemCode', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="text" value={item.itemName} onChange={(e) => handleCostItemChange(item.id, 'itemName', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="text" value={item.inventoryAccount} onChange={(e) => handleCostItemChange(item.id, 'inventoryAccount', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="text" value={item.cogsAccount} onChange={(e) => handleCostItemChange(item.id, 'cogsAccount', e.target.value)} className="w-full h-8 px-2 text-sm border-0 bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="number" value={item.costPrice} onChange={(e) => handleCostItemChange(item.id, 'costPrice', Number(e.target.value))} className="w-full h-8 px-2 text-sm border-0 bg-transparent text-right outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200"><input type="number" value={item.totalCost} onChange={(e) => handleCostItemChange(item.id, 'totalCost', Number(e.target.value))} className="w-full h-8 px-2 text-sm border-0 bg-transparent text-right outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500" /></td>
                          <td className="px-0 border border-gray-200 text-center">
                            <button onClick={() => handleRemoveCostItem(item.id)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded mx-auto transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {costItems.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center text-gray-500 text-sm">
                            Chưa có dữ liệu giá vốn. Nhấn "Thêm dòng" để bắt đầu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Grid Actions */}
              <div className="bg-gray-50 p-2 border-t border-gray-200 flex">
                <button
                  type="button"
                  onClick={activeTab === 'hang-tien' ? handleAddItem : handleAddCostItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
