import React, { useState, useEffect } from 'react';
import { X, Save, Building2, User, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/lib/api/axios';

export interface Customer {
  id?: number | string;
  type?: 'organization' | 'individual';
  isSupplier?: boolean;
  taxCode?: string;
  code?: string;
  name?: string;
  phone?: string;
  website?: string;
  address?: string;
  customerGroup?: string;
  salesperson?: string;
  isInternal?: boolean;
  contactTitle?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  invoiceReceiverName?: string;
  invoiceReceiverEmail?: string;
  invoiceReceiverPhone?: string;
  legalRepresentative?: string;
}

export interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  initialData?: Customer | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  initialData,
}) => {
  const [formData, setFormData] = useState<Customer>({
    type: 'organization',
    isSupplier: false,
    taxCode: '',
    code: '',
    name: '',
    phone: '',
    website: '',
    address: '',
    customerGroup: '',
    salesperson: '',
    isInternal: false,
    contactTitle: 'Ông',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    invoiceReceiverName: '',
    invoiceReceiverEmail: '',
    invoiceReceiverPhone: '',
    legalRepresentative: '',
  });

  const [activeTab, setActiveTab] = useState('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        ...formData,
        ...initialData,
      });
    } else if (isOpen) {
      setFormData({
        type: 'organization',
        isSupplier: false,
        taxCode: '',
        code: '',
        name: '',
        phone: '',
        website: '',
        address: '',
        customerGroup: '',
        salesperson: '',
        isInternal: false,
        contactTitle: 'Ông',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        invoiceReceiverName: '',
        invoiceReceiverEmail: '',
        invoiceReceiverPhone: '',
        legalRepresentative: '',
      });
    }
  }, [initialData, isOpen]);

  const tabs = [
    { id: 'contact', label: 'Thông tin liên hệ' },
    { id: 'payment', label: 'Điều khoản thanh toán' },
    { id: 'bank', label: 'Tài khoản ngân hàng' },
    { id: 'address', label: 'Địa chỉ khác' },
    { id: 'notes', label: 'Ghi chú' },
    { id: 'additional', label: 'Thông tin bổ sung' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (closeAfterSave: boolean) => {
    if (!formData.code || !formData.name) {
      alert("Vui lòng nhập Mã KH và Tên KH");
      return;
    }

    try {
      setIsSubmitting(true);
      if (formData.id) {
        await axios.put(`/api/customers/${formData.id}`, formData);
      } else {
        await axios.post('/api/customers', formData);
      }
      
      onSaveSuccess();
      
      if (closeAfterSave) {
        onClose();
      } else {
        setFormData({
          type: 'organization',
          isSupplier: false,
          taxCode: '',
          code: '',
          name: '',
          phone: '',
          website: '',
          address: '',
          customerGroup: '',
          salesperson: '',
          isInternal: false,
          contactTitle: 'Ông',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          invoiceReceiverName: '',
          invoiceReceiverEmail: '',
          invoiceReceiverPhone: '',
          legalRepresentative: '',
        });
      }
    } catch (error) {
      console.error("Error saving customer", error);
      alert("Có lỗi xảy ra khi lưu khách hàng!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">
                {formData.id ? 'Sửa Khách hàng' : 'Thêm Khách hàng'}
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="organization"
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={formData.type === 'organization'}
                      onChange={handleChange}
                    />
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Tổ chức</span>
                  </label>
                  <label className="flex items-center gap-2 ml-4 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="individual"
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={formData.type === 'individual'}
                      onChange={handleChange}
                    />
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Cá nhân</span>
                  </label>
                </div>
                <div className="w-px h-6 bg-gray-300"></div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isSupplier"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData.isSupplier}
                    onChange={handleChange}
                  />
                  <span className="text-sm font-medium text-gray-700">Là nhà cung cấp</span>
                </label>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 transition-colors hover:text-gray-600 hover:bg-gray-200 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {/* Master Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Col 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                    <input type="text" name="taxCode" value={formData.taxCode || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã KH <span className="text-red-500">*</span></label>
                    <input type="text" name="code" value={formData.code || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                    <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input type="text" name="website" value={formData.website || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>

                {/* Col 2 */}
                <div className="space-y-4 lg:col-span-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên KH <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm KH</label>
                      <select name="customerGroup" value={formData.customerGroup || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="">Chọn nhóm KH...</option>
                        <option value="Khách lẻ">Khách lẻ</option>
                        <option value="Khách sỉ">Khách sỉ</option>
                        <option value="Đại lý">Đại lý</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NV Bán hàng</label>
                      <select name="salesperson" value={formData.salesperson || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="">Chọn nhân viên...</option>
                        <option value="Nguyễn Văn A">Nguyễn Văn A</option>
                        <option value="Trần Thị B">Trần Thị B</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isInternal"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={formData.isInternal}
                        onChange={handleChange}
                      />
                      <span className="text-sm font-medium text-gray-700">Là đối tượng nội bộ</span>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="mt-6 border-t border-gray-200">
                <div className="flex space-x-1 border-b border-gray-200 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="py-4">
                  {activeTab === 'contact' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Người liên hệ */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-800 border-b pb-2">Người liên hệ</h3>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-1">
                            <label className="block text-xs text-gray-500 mb-1">Xưng hô</label>
                            <select name="contactTitle" value={formData.contactTitle || ''} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                              <option value="Ông">Ông</option>
                              <option value="Bà">Bà</option>
                              <option value="Anh">Anh</option>
                              <option value="Chị">Chị</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Họ tên</label>
                            <input type="text" name="contactName" value={formData.contactName || ''} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Email</label>
                          <input type="email" name="contactEmail" value={formData.contactEmail || ''} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Điện thoại</label>
                          <input type="text" name="contactPhone" value={formData.contactPhone || ''} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                      </div>

                      {/* Người nhận HĐĐT */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-800 border-b pb-2">Người nhận HĐĐT</h3>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Họ tên</label>
                          <input type="text" name="invoiceReceiverName" value={formData.invoiceReceiverName || ''} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Email</label>
                          <input type="email" name="invoiceReceiverEmail" value={formData.invoiceReceiverEmail || ''} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Điện thoại</label>
                          <input type="text" name="invoiceReceiverPhone" value={formData.invoiceReceiverPhone || ''} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                      </div>

                      {/* Đại diện theo PL */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-800 border-b pb-2">Đại diện theo pháp luật</h3>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Họ tên</label>
                          <input type="text" name="legalRepresentative" value={formData.legalRepresentative || ''} onChange={handleChange} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab !== 'contact' && (
                    <div className="py-12 text-center">
                      <p className="text-gray-500">Nội dung tab {tabs.find(t => t.id === activeTab)?.label} (Đang xây dựng...)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm disabled:opacity-70"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Đang lưu...' : 'Cất'}
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm disabled:opacity-70"
              >
                <Save className="w-4 h-4 mr-2" />
                Cất & Thêm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
