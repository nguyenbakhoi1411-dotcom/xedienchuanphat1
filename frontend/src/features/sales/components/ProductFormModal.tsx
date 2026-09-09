import React, { useState, useEffect } from 'react';
import { X, Save, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductType } from './ProductTypeSelector';
import axios from '@/lib/api/axios';

export interface ComboItem {
  id?: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
}

export interface Product {
  id?: number | string;
  type: ProductType;
  code: string;
  name: string;
  productGroup: string;
  discountTax: boolean;
  mainUnit: string;
  warrantyPeriod?: number;
  warrantyUnit?: string;
  origin?: string;
  minStock?: number;
  description?: string;
  buyDescription?: string;
  sellDescription?: string;
  specificType?: string;
  comboItems?: ComboItem[];
}

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  productType: ProductType;
  initialData?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  productType,
  initialData,
}) => {
  const [formData, setFormData] = useState<Product>({
    type: productType,
    code: '',
    name: '',
    productGroup: '',
    discountTax: false,
    mainUnit: '',
    warrantyPeriod: 0,
    warrantyUnit: 'Tháng',
    origin: '',
    minStock: 0,
    description: '',
    buyDescription: '',
    sellDescription: '',
    specificType: 'Không',
    comboItems: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        ...initialData,
        type: productType, // Ensure it matches the requested or loaded type
        comboItems: initialData.comboItems || [],
      });
    } else if (isOpen) {
      setFormData({
        type: productType,
        code: '',
        name: '',
        productGroup: '',
        discountTax: false,
        mainUnit: '',
        warrantyPeriod: 0,
        warrantyUnit: 'Tháng',
        origin: '',
        minStock: 0,
        description: '',
        buyDescription: '',
        sellDescription: '',
        specificType: 'Không',
        comboItems: [],
      });
    }
  }, [initialData, isOpen, productType]);

  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    'thong-tin-ngam-dinh': true,
  });

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddComboItem = () => {
    setFormData((prev) => ({
      ...prev,
      comboItems: [
        ...(prev.comboItems || []),
        { id: Math.random().toString(36).substring(7), code: '', name: '', unit: '', quantity: 1 }
      ]
    }));
  };

  const handleRemoveComboItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      comboItems: prev.comboItems?.filter((_, i) => i !== index)
    }));
  };

  const handleComboItemChange = (index: number, field: keyof ComboItem, value: any) => {
    setFormData((prev) => {
      const newItems = [...(prev.comboItems || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, comboItems: newItems };
    });
  };

  const handleSave = async (closeAfterSave: boolean) => {
    if (!formData.code || !formData.name || !formData.mainUnit) {
      alert("Vui lòng nhập đầy đủ các trường bắt buộc (*)");
      return;
    }

    try {
      setIsSubmitting(true);
      if (formData.id) {
        await axios.put(`/api/products/${formData.id}`, formData);
      } else {
        await axios.post('/api/products', formData);
      }
      
      onSaveSuccess();
      
      if (closeAfterSave) {
        onClose();
      } else {
        // Reset form for "Save & Add"
        setFormData({
          type: productType,
          code: '',
          name: '',
          productGroup: '',
          discountTax: false,
          mainUnit: '',
          warrantyPeriod: 0,
          warrantyUnit: 'Tháng',
          origin: '',
          minStock: 0,
          description: '',
          buyDescription: '',
          sellDescription: '',
          specificType: 'Không',
          comboItems: [],
        });
      }
    } catch (error) {
      console.error("Error saving product", error);
      alert("Có lỗi xảy ra khi lưu sản phẩm!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isService = productType === 'Dịch vụ';
  const isCombo = productType === 'Combo sản phẩm';
  const isProductOrMaterial = productType === 'Hàng hóa' || productType === 'Nguyên vật liệu';
  const isFinishedGood = productType === 'Thành phẩm';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col w-full max-w-5xl max-h-[95vh] bg-gray-100 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-semibold text-gray-800">
                {formData.id ? `Sửa ${productType}` : `Thêm ${productType}`}
              </h2>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 transition-colors hover:text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {/* Master Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                    {/* Col 1 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã <span className="text-red-500">*</span></label>
                        <input type="text" name="code" value={formData.code || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên <span className="text-red-500">*</span></label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm VTHH</label>
                        <select name="productGroup" value={formData.productGroup || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white">
                          <option value="">Chọn nhóm...</option>
                          <option value="Nhóm 1">Nhóm 1</option>
                          <option value="Nhóm 2">Nhóm 2</option>
                        </select>
                      </div>
                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="discountTax" checked={formData.discountTax} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          <span className="text-sm font-medium text-gray-700">Giảm thuế theo quy định</span>
                        </label>
                      </div>
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ĐVT chính <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                           <input type="text" name="mainUnit" value={formData.mainUnit || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="VD: Cái, Hộp..." />
                           <button className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                             <Plus className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn bảo hành</label>
                        <div className="flex gap-2">
                          <input type="number" name="warrantyPeriod" value={formData.warrantyPeriod || 0} onChange={handleChange} className="w-2/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                          <select name="warrantyUnit" value={formData.warrantyUnit || 'Tháng'} onChange={handleChange} className="w-1/3 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white">
                            <option value="Tháng">Tháng</option>
                            <option value="Năm">Năm</option>
                          </select>
                        </div>
                      </div>
                      
                      {!isService && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nguồn gốc</label>
                          <input type="text" name="origin" value={formData.origin || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                      )}

                      {!isService && !isCombo && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn tối thiểu</label>
                          <input type="number" name="minStock" value={formData.minStock || 0} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-right" />
                        </div>
                      )}
                    </div>

                    {/* Col 3 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diễn giải khi mua</label>
                        <input type="text" name="buyDescription" value={formData.buyDescription || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diễn giải khi bán</label>
                        <input type="text" name="sellDescription" value={formData.sellDescription || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại hàng hóa đặc trưng</label>
                        <select name="specificType" value={formData.specificType || 'Không'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white">
                          <option value="Không">Không</option>
                          <option value="Hàng hóa có tem mác">Hàng hóa có tem mác</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Combo detail grid if isCombo */}
                {isCombo && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                     <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Mặt hàng chi tiết</h3>
                        <button onClick={handleAddComboItem} className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1 focus:outline-none">
                          <Plus className="w-4 h-4" /> Thêm dòng
                        </button>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="text-xs text-gray-700 bg-gray-50">
                              <tr>
                                 <th className="px-4 py-3 border-b w-10">STT</th>
                                 <th className="px-4 py-3 border-b">Mã hàng</th>
                                 <th className="px-4 py-3 border-b">Tên hàng</th>
                                 <th className="px-4 py-3 border-b w-24">ĐVT</th>
                                 <th className="px-4 py-3 border-b text-right w-32">Số lượng</th>
                                 <th className="px-4 py-3 border-b text-center w-16"></th>
                              </tr>
                           </thead>
                           <tbody>
                              {formData.comboItems && formData.comboItems.length > 0 ? (
                                formData.comboItems.map((item, index) => (
                                  <tr key={item.id || index} className="border-b">
                                     <td className="px-4 py-2 text-center text-gray-500">{index + 1}</td>
                                     <td className="px-4 py-2">
                                       <input type="text" value={item.code} onChange={(e) => handleComboItemChange(index, 'code', e.target.value)} className="w-full p-1 border rounded focus:outline-none focus:border-blue-500" />
                                     </td>
                                     <td className="px-4 py-2">
                                       <input type="text" value={item.name} onChange={(e) => handleComboItemChange(index, 'name', e.target.value)} className="w-full p-1 border rounded focus:outline-none focus:border-blue-500" />
                                     </td>
                                     <td className="px-4 py-2">
                                       <input type="text" value={item.unit} onChange={(e) => handleComboItemChange(index, 'unit', e.target.value)} className="w-full p-1 border rounded focus:outline-none focus:border-blue-500" />
                                     </td>
                                     <td className="px-4 py-2">
                                       <input type="number" min="1" value={item.quantity} onChange={(e) => handleComboItemChange(index, 'quantity', parseInt(e.target.value) || 0)} className="w-full p-1 border rounded text-right focus:outline-none focus:border-blue-500" />
                                     </td>
                                     <td className="px-4 py-2 text-center">
                                        <button onClick={() => handleRemoveComboItem(index)} className="text-red-500 hover:text-red-700 focus:outline-none"><Trash2 className="w-4 h-4" /></button>
                                     </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                                    Chưa có mặt hàng nào. Bấm "Thêm dòng" để chọn mặt hàng.
                                  </td>
                                </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
                )}

                {/* Accordions */}
                <div className="space-y-3">
                   {[
                     { id: 'thong-tin-ngam-dinh', label: 'Thông tin ngầm định' },
                     { id: 'chiet-khau-ban-hang', label: 'Chiết khấu bán hàng' },
                     { id: 'don-vi-chuyen-doi', label: 'Đơn vị chuyển đổi' },
                     { id: 'ma-quy-cach', label: 'Mã quy cách' },
                     { id: 'thong-tin-bo-sung', label: 'Thông tin bổ sung' },
                     ...(isFinishedGood ? [{ id: 'dinh-muc-nvl', label: 'Định mức nguyên vật liệu' }] : []),
                     ...(isProductOrMaterial ? [{ id: 'cong-thuc-so-luong', label: 'Công thức tính số lượng' }] : []),
                   ].map((accordion) => (
                      <div key={accordion.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                         <button
                           onClick={() => toggleAccordion(accordion.id)}
                           className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between focus:outline-none hover:bg-gray-100 transition-colors"
                         >
                           <span className="font-semibold text-gray-700">{accordion.label}</span>
                           {openAccordions[accordion.id] ? (
                             <ChevronDown className="w-5 h-5 text-gray-500" />
                           ) : (
                             <ChevronRight className="w-5 h-5 text-gray-500" />
                           )}
                         </button>
                         <AnimatePresence>
                           {openAccordions[accordion.id] && (
                             <motion.div
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: 'auto', opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               className="overflow-hidden"
                             >
                               <div className="p-4 text-gray-500 italic text-sm">
                                 Nội dung cấu hình cho {accordion.label}
                               </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                      </div>
                   ))}
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-white space-x-3">
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
