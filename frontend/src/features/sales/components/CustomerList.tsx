import React, { useEffect, useState } from 'react';
import axios from '@/lib/api/axios';
import { CustomerFormModal, Customer } from './CustomerFormModal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      // Fallback if API doesn't exist
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id?: number | string) => {
    if (!id) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await axios.delete(`/api/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        console.error('Failed to delete customer:', error);
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Danh sách Khách hàng</h2>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="px-4 py-3 border-b">Mã KH</th>
              <th className="px-4 py-3 border-b">Tên KH</th>
              <th className="px-4 py-3 border-b">Điện thoại</th>
              <th className="px-4 py-3 border-b">Nhóm KH</th>
              <th className="px-4 py-3 border-b">Địa chỉ</th>
              <th className="px-4 py-3 border-b text-center w-24">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Chưa có dữ liệu.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{customer.code}</td>
                  <td className="px-4 py-3">{customer.name}</td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">{customer.customerGroup}</td>
                  <td className="px-4 py-3 truncate max-w-xs">{customer.address}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(customer)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
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

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={() => {
          fetchCustomers();
        }}
        initialData={editingCustomer}
      />
    </div>
  );
};
