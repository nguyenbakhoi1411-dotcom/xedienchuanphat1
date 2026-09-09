import React, { useEffect, useState } from 'react';
import axios from '@/lib/api/axios';
import { ProductFormModal, Product } from './ProductFormModal';
import { ProductTypeSelector, ProductType } from './ProductTypeSelector';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const ProductInventoryList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<ProductType>('Hàng hóa');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Fallback if API doesn't exist
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id?: number | string) => {
    if (!id) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsTypeSelectorOpen(true);
  };

  const handleTypeSelect = (type: ProductType) => {
    setSelectedProductType(type);
    setIsTypeSelectorOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setSelectedProductType(product.type || 'Hàng hóa');
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Danh sách VTHH (Sản phẩm)</h2>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm VTHH
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="px-4 py-3 border-b">Mã</th>
              <th className="px-4 py-3 border-b">Tên</th>
              <th className="px-4 py-3 border-b">Loại</th>
              <th className="px-4 py-3 border-b">ĐVT</th>
              <th className="px-4 py-3 border-b text-center w-24">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Chưa có dữ liệu.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{product.code}</td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {product.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{product.mainUnit}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductTypeSelector
        isOpen={isTypeSelectorOpen}
        onClose={() => setIsTypeSelectorOpen(false)}
        onSelect={handleTypeSelect}
      />

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={() => {
          fetchProducts();
        }}
        productType={selectedProductType}
        initialData={editingProduct}
      />
    </div>
  );
};
