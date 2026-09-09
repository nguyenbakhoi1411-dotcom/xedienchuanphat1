"use client";

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Download, Settings, ChevronDown, X } from 'lucide-react';
import { salesApi } from '@/features/sales/api';
import { toast } from 'sonner';

function fmt(n: number | null | undefined) {
  if (n == null) return '0';
  return new Intl.NumberFormat('vi-VN').format(n);
}

export function ReceivablesTab() {
  const [balances, setBalances] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [keyword, setKeyword] = useState('');
  
  // Modal Collection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collectionData, setCollectionData] = useState({
    customerId: 0, customerName: '', amount: 0, paymentMethod: 'CASH', account: '1111', note: ''
  });

  const loadData = () => {
    setLoading(true);
    salesApi.getARBalances({ keyword, size: 50 })
      .then(res => {
        setBalances(res.content || []);
        setTotalElements(res.totalElements || 0);
      })
      .catch(err => toast.error('Lỗi tải công nợ: ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') loadData();
  };

  const openCollectionModal = (b: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollectionData({
      customerId: b.customerId,
      customerName: b.customerName,
      amount: b.remainingAmount || 0,
      paymentMethod: 'CASH',
      account: '1111',
      note: `Thu tiền công nợ KH ${b.customerName}`
    });
    setIsModalOpen(true);
  };

  const submitCollection = () => {
    toast.success(`Đã thu ${fmt(collectionData.amount)} đ từ ${collectionData.customerName}`);
    setIsModalOpen(false);
    loadData();
  };

  const totalPhaiThu = balances.reduce((a,c) => a + (c.totalReceivable || 0), 0);
  const totalGiamTru = 0; // Chờ API cung cấp
  const totalConPhaiThu = balances.reduce((a,c) => a + (c.remainingAmount || 0), 0);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between p-3 border-b bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-sm font-medium text-gray-700 transition-colors">
            Lọc <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-sm font-medium">
            24/06/2026 <X className="w-3 h-3 ml-1 cursor-pointer" />
          </div>
          <button className="text-sm text-gray-500 hover:text-red-500 font-medium px-2">Xóa điều kiện lọc</button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm w-48 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={handleSearch}
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
          </div>
          <button onClick={loadData} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-300" title="Nạp">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-300" title="Xuất khẩu">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-300" title="Tùy chỉnh">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="flex-1 overflow-auto flex flex-col relative">
        <div className="min-w-max border-b flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-700 bg-gray-100 sticky top-0 z-10 shadow-sm border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-center w-10"><input type="checkbox" className="rounded text-green-600 focus:ring-green-500" /></th>
                <th className="px-3 py-2 font-semibold">Mã khách hàng</th>
                <th className="px-3 py-2 font-semibold">Tên khách hàng</th>
                <th className="px-3 py-2 font-semibold text-right">Số còn phải thu theo HĐ</th>
                <th className="px-3 py-2 font-semibold text-right">Số thu trước/Giảm trừ khác</th>
                <th className="px-3 py-2 font-semibold text-right">Số còn phải thu</th>
                <th className="px-3 py-2 font-semibold">Địa chỉ</th>
                <th className="px-3 py-2 font-semibold">Mã số thuế</th>
                <th className="px-3 py-2 font-semibold">Nhóm khách hàng</th>
                <th className="px-3 py-2 font-semibold text-center sticky right-0 bg-gray-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l">Chức năng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {balances.map((b) => (
                <tr 
                  key={b.id} 
                  className={`hover:bg-blue-50 cursor-pointer transition-colors ${selectedRow?.id === b.id ? 'bg-blue-50' : 'bg-white'}`}
                  onClick={() => setSelectedRow(b)}
                >
                  <td className="px-3 py-2 text-center" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded text-green-600 focus:ring-green-500" /></td>
                  <td className="px-3 py-2 text-orange-600 font-medium hover:underline cursor-pointer">{b.customerCode}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">{b.customerName}</td>
                  <td className="px-3 py-2 text-right">{fmt(b.totalReceivable)}</td>
                  <td className="px-3 py-2 text-right text-gray-500">0</td>
                  <td className={`px-3 py-2 text-right ${(b.remainingAmount || 0) > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{fmt(b.remainingAmount)}</td>
                  <td className="px-3 py-2 text-gray-600 truncate max-w-[200px]" title={b.address || ''}>{b.address || '-'}</td>
                  <td className="px-3 py-2 text-gray-600">{b.taxCode || '-'}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{b.customerGroup || 'SC-XDV'}</td>
                  <td className="px-3 py-2 text-center sticky right-0 bg-white group-hover:bg-blue-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l">
                    <button onClick={(e) => openCollectionModal(b, e)} className="text-blue-600 font-medium hover:underline flex items-center justify-center w-full gap-1">
                      Thu tiền <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
              {balances.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
            {balances.length > 0 && (
              <tfoot className="bg-gray-50 font-bold sticky bottom-0 z-10 border-t border-gray-300">
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-center">Tổng</td>
                  <td className="px-3 py-2 text-right">{fmt(totalPhaiThu)}</td>
                  <td className="px-3 py-2 text-right">{fmt(totalGiamTru)}</td>
                  <td className="px-3 py-2 text-right">{fmt(totalConPhaiThu)}</td>
                  <td colSpan={4} className="px-3 py-2 sticky right-0 bg-gray-50 border-l shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between p-3 border-t bg-white shrink-0">
          <div className="text-sm text-gray-600">Tổng số: <span className="font-bold text-gray-800">{totalElements}</span> bản ghi</div>
        </div>
      </div>

      {/* PANEL DƯỚI */}
      {selectedRow && (
        <div className="h-72 border-t-2 border-green-500 flex flex-col bg-gray-50 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex border-b bg-gray-100">
            <div className="px-4 py-2 bg-white text-gray-800 font-medium border-t-2 border-green-500 -mt-[2px] cursor-pointer">
              Phân tích nợ theo hóa đơn
            </div>
            <div className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer">
              Chi tiết
            </div>
            <div className="flex-1 flex justify-end px-2 bg-gray-50">
              <button onClick={() => setSelectedRow(null)} className="text-gray-400 hover:text-gray-600 p-2"><X className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-3 gap-6 h-full">
              {/* Panel Trái */}
              <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Phân tích nợ trước hạn</h3>
                <div className="space-y-3 text-sm flex-1">
                  <div className="flex justify-between text-gray-600"><span>Trước hạn 0 - 30 ngày:</span><span className="font-medium text-gray-800">0 đ</span></div>
                  <div className="flex justify-between text-gray-600"><span>Trước hạn 31 - 60 ngày:</span><span className="font-medium text-gray-800">0 đ</span></div>
                  <div className="flex justify-between text-gray-600"><span>Trước hạn 61 - 90 ngày:</span><span className="font-medium text-gray-800">0 đ</span></div>
                  <div className="flex justify-between text-gray-600"><span>Trước hạn 91 - 120 ngày:</span><span className="font-medium text-gray-800">0 đ</span></div>
                  <div className="flex justify-between text-gray-600"><span>Trước hạn trên 120 ngày:</span><span className="font-medium text-gray-800">0 đ</span></div>
                  <div className="flex justify-between text-gray-800 font-medium mt-2 pt-2 border-t"><span>Không có hạn nợ:</span><span className="text-green-700">{fmt(selectedRow.remainingAmount)} đ</span></div>
                </div>
              </div>

              {/* Panel Giữa */}
              <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Phân tích nợ quá hạn</h3>
                <div className="space-y-3 text-sm flex-1">
                  <div className="flex justify-between text-gray-600"><span>Quá hạn 1 - 30 ngày:</span><span className="font-medium text-gray-800">0 đ</span></div>
                  <div className="flex justify-between text-gray-600"><span>Quá hạn 31 - 60 ngày:</span><span className="font-medium text-gray-800">0 đ</span></div>
                  <div className="flex justify-between text-gray-600"><span>Quá hạn 61 - 90 ngày:</span><span className="font-medium text-gray-800">0 đ</span></div>
                  <div className="flex justify-between text-gray-600"><span>Quá hạn 91 - 120 ngày:</span><span className="font-medium text-gray-800">0 đ</span></div>
                  <div className="flex justify-between text-red-600 font-medium mt-2 pt-2 border-t"><span>Quá hạn trên 120 ngày:</span><span>0 đ</span></div>
                </div>
              </div>

              {/* Panel Phải */}
              <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Phân tích tình trạng nợ</h3>
                <div className="space-y-3 text-sm flex-1">
                  <div className="flex justify-between text-gray-800 font-medium"><span>Nợ bình thường:</span><span className="text-green-700">{fmt(selectedRow.remainingAmount)} đ</span></div>
                  <div className="flex justify-between text-orange-600"><span>Nợ khó đòi:</span><span className="font-medium">0 đ</span></div>
                  <div className="flex justify-between text-red-600"><span>Nợ không thể đòi:</span><span className="font-medium">0 đ</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COLLECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Thu tiền khách hàng</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
                <input type="text" value={collectionData.customerName} disabled className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-600 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền thu</label>
                <input type="number" value={collectionData.amount} onChange={e => setCollectionData({...collectionData, amount: Number(e.target.value)})} className="w-full border border-gray-300 rounded px-3 py-2 text-lg font-bold text-green-600 text-right focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức</label>
                  <select value={collectionData.paymentMethod} onChange={e => setCollectionData({...collectionData, paymentMethod: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:outline-none">
                    <option value="CASH">Tiền mặt</option>
                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TK Tiền</label>
                  <select value={collectionData.account} onChange={e => setCollectionData({...collectionData, account: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:outline-none">
                    <option value="1111">1111 - Tiền mặt</option>
                    <option value="1121">1121 - Tiền gửi ngân hàng</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea rows={2} value={collectionData.note} onChange={e => setCollectionData({...collectionData, note: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-green-500 focus:outline-none"></textarea>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-100 transition-colors">Hủy</button>
              <button onClick={submitCollection} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium shadow-sm transition-colors">Thu tiền</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
