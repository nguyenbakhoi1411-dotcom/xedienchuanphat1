import React from 'react';
import { Package, Wrench, Box, Layers, Archive, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ProductType = 'Hàng hóa' | 'Dịch vụ' | 'Nguyên vật liệu' | 'Thành phẩm' | 'Công cụ dụng cụ' | 'Combo sản phẩm';

export interface ProductTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: ProductType) => void;
}

export const ProductTypeSelector: React.FC<ProductTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const types: { id: ProductType; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
    { id: 'Hàng hóa', label: 'Hàng hóa', icon: <Package className="w-8 h-8" />, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'Dịch vụ', label: 'Dịch vụ', icon: <Wrench className="w-8 h-8" />, color: 'text-purple-600', bg: 'bg-purple-100' },
    { id: 'Nguyên vật liệu', label: 'Nguyên vật liệu', icon: <Box className="w-8 h-8" />, color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 'Thành phẩm', label: 'Thành phẩm', icon: <Layers className="w-8 h-8" />, color: 'text-green-600', bg: 'bg-green-100' },
    { id: 'Công cụ dụng cụ', label: 'Công cụ dụng cụ', icon: <Settings className="w-8 h-8" />, color: 'text-teal-600', bg: 'bg-teal-100' },
    { id: 'Combo sản phẩm', label: 'Combo sản phẩm', icon: <Archive className="w-8 h-8" />, color: 'text-pink-600', bg: 'bg-pink-100' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 transition-colors hover:text-gray-600 hover:bg-gray-100 rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="px-8 py-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Thêm Vật tư, Hàng hóa, Dịch vụ</h2>
                <p className="text-gray-500 mt-2">Vui lòng chọn loại để tiếp tục</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {types.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(type.id)}
                    className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
                  >
                    <div className={`w-20 h-20 flex items-center justify-center rounded-full ${type.bg} ${type.color} mb-4 group-hover:ring-4 ring-opacity-30 ring-current transition-all`}>
                      {type.icon}
                    </div>
                    <span className="font-semibold text-gray-700 text-lg">{type.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
