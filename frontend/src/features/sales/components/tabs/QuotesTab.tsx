"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Download, Settings, ChevronDown, Plus, Trash2, X } from 'lucide-react';
import { salesApi } from '@/features/sales/api';
import type { Quotation, QuotationLine, CreateQuotationDto } from '@/features/sales/types';
import { toast } from 'sonner';

function fmt(n: number | null | undefined) {
  if (n == null) return '0';
  return new Intl.NumberFormat('vi-VN').format(n);
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN');
}

export function QuotesTab() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Quotation | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateQuotationDto>({
    quotationDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], // +30 days
    customerName: '',
    customerCode: '',
    taxCode: '',
    contactPerson: '',
    paymentTerm: '',
    note: '',
    lines: [
      {
        productCode: '', productName: '', unit: '',
        quantity: 1, unitPrice: 0, discountRate: 0, vatRate: 10, warrantyMonths: 12
      }
    ]
  });

  const loadData = () => {
    setLoading(true);
    salesApi.listQuotations({ keyword, size: 20 })
      .then(res => {
        setQuotations(res.content || []);
        setTotalElements(res.totalElements || 0);
      })
      .catch(err => toast.error('Lỗi tải báo giá: ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') loadData();
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, {
        productCode: '', productName: '', unit: '',
        quantity: 1, unitPrice: 0, discountRate: 0, vatRate: 10, warrantyMonths: 12
      }]
    });
  };

  const removeLine = (index: number) => {
    if (formData.lines.length <= 1) return;
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  const calculateLineTotal = (line: any) => {
    const q = Number(line.quantity) || 0;
    const p = Number(line.unitPrice) || 0;
    const dr = Number(line.discountRate) || 0;
    const vr = Number(line.vatRate) || 0;

    const tienCK = (q * p * dr) / 100;
    const tienVAT = ((q * p - tienCK) * vr) / 100;
    return q * p - tienCK + tienVAT;
  };

  const calculateLineCK = (line: any) => {
    const q = Number(line.quantity) || 0;
    const p = Number(line.unitPrice) || 0;
    const dr = Number(line.discountRate) || 0;
    return (q * p * dr) / 100;
  };

  const calculateLineVAT = (line: any) => {
    const q = Number(line.quantity) || 0;
    const p = Number(line.unitPrice) || 0;
    const dr = Number(line.discountRate) || 0;
    const vr = Number(line.vatRate) || 0;
    const tienCK = (q * p * dr) / 100;
    return ((q * p - tienCK) * vr) / 100;
  };

  const summary = useMemo(() => {
    let totalHang = 0;
    let totalCK = 0;
    let totalVAT = 0;
    formData.lines.forEach(l => {
      const q = Number(l.quantity) || 0;
      const p = Number(l.unitPrice) || 0;
      totalHang += q * p;
      totalCK += calculateLineCK(l);
      totalVAT += calculateLineVAT(l);
    });
    return {
      totalHang,
      totalCK,
      totalVAT,
      grandTotal: totalHang - totalCK + totalVAT
    };
  }, [formData.lines]);

  const handleSave = async (send: boolean = false) => {
    try {
      setSaving(true);
      const res = await salesApi.createQuotation(formData);
      toast.success(send ? 'Đã lưu và gửi báo giá!' : 'Đã lưu báo giá!');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Lỗi khi lưu: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Tổng cộng cho Footer Table Chính
  const totalGridTienHang = quotations.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalGridTienCK = quotations.reduce((acc, curr) => acc + (curr.totalDiscount || 0), 0);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium text-gray-700 transition-colors">
            ↓ Thực hiện hàng loạt <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-sm font-medium text-gray-700 transition-colors">
            Lọc <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          <span className="text-sm font-medium text-gray-600 px-2 border-r border-gray-300">Đầu năm tới hiện tại</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm số BG, tên KH..." 
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm w-64 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
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
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-300" title="Tùy chỉnh giao diện">
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm transition-colors shadow-sm"
          >
            Thêm báo giá <ChevronDown className="w-4 h-4 ml-1 border-l border-green-500 pl-1" />
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium text-sm transition-colors shadow-sm">
            Thêm bằng AI
          </button>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="flex-1 overflow-auto flex flex-col">
        <div className="min-w-max border-b flex-1 relative">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-700 bg-gray-100 sticky top-0 z-10 shadow-sm border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-center w-10"><input type="checkbox" className="rounded text-green-600 focus:ring-green-500" /></th>
                <th className="px-3 py-2 font-semibold">Ngày báo giá</th>
                <th className="px-3 py-2 font-semibold">Số báo giá</th>
                <th className="px-3 py-2 font-semibold">Mã khách hàng</th>
                <th className="px-3 py-2 font-semibold">Khách hàng</th>
                <th className="px-3 py-2 font-semibold">Địa chỉ</th>
                <th className="px-3 py-2 font-semibold">Mã số thuế</th>
                <th className="px-3 py-2 font-semibold">Người liên hệ</th>
                <th className="px-3 py-2 font-semibold">Ghi chú</th>
                <th className="px-3 py-2 font-semibold text-right">Tổng tiền hàng</th>
                <th className="px-3 py-2 font-semibold text-right">Tổng tiền CK</th>
                <th className="px-3 py-2 font-semibold text-center sticky right-0 bg-gray-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l">Chức năng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotations.map((q, idx) => (
                <tr 
                  key={q.id || idx} 
                  className={`hover:bg-blue-50 cursor-pointer transition-colors ${selectedRow?.id === q.id ? 'bg-blue-50' : 'bg-white'}`}
                  onClick={() => setSelectedRow(q)}
                >
                  <td className="px-3 py-2 text-center" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded text-green-600 focus:ring-green-500" /></td>
                  <td className="px-3 py-2">{fmtDate(q.quotationDate)}</td>
                  <td className="px-3 py-2 text-blue-600 hover:underline font-medium">{q.quotationNo}</td>
                  <td className="px-3 py-2 text-gray-600">{q.customerCode}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">{q.customerName}</td>
                  <td className="px-3 py-2 text-gray-600 truncate max-w-[150px]" title={q.note}>{q.note || ''}</td>
                  <td className="px-3 py-2 text-gray-600">{q.taxCode}</td>
                  <td className="px-3 py-2 text-gray-600">{q.contactPerson}</td>
                  <td className="px-3 py-2">
                    {q.note?.includes('CÔNG NỢ') && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-sm text-xs font-medium mr-1">CÔNG NỢ</span>}
                    {q.note?.includes('BẢO HÀNH') && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-sm text-xs font-medium">BẢO HÀNH</span>}
                    {!q.note?.includes('CÔNG NỢ') && !q.note?.includes('BẢO HÀNH') && q.note}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">{fmt(q.totalAmount)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{fmt(q.totalDiscount)}</td>
                  <td className="px-3 py-2 text-center sticky right-0 bg-white group-hover:bg-blue-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l" onClick={e => e.stopPropagation()}>
                    <button className="text-blue-600 font-medium hover:underline flex items-center justify-center w-full gap-1">
                      Lập chứng từ từ bán hàng <ChevronDown className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
              {quotations.length === 0 && !loading && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
            {/* Table Footer */}
            {quotations.length > 0 && (
              <tfoot className="bg-gray-50 font-bold sticky bottom-0 z-10 border-t border-gray-300">
                <tr>
                  <td colSpan={9} className="px-3 py-2">Tổng</td>
                  <td className="px-3 py-2 text-right">{fmt(totalGridTienHang)}</td>
                  <td className="px-3 py-2 text-right">{fmt(totalGridTienCK)}</td>
                  <td className="px-3 py-2 sticky right-0 bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between p-3 border-t bg-white shrink-0">
          <div className="text-sm text-gray-600">Tổng số: <span className="font-bold text-gray-800">{totalElements}</span> bản ghi</div>
          <div className="flex items-center gap-4">
            <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-green-500">
              <option>20 bản ghi trên 1 trang</option>
              <option>50 bản ghi trên 1 trang</option>
              <option>100 bản ghi trên 1 trang</option>
            </select>
            <div className="flex items-center gap-1 text-sm">
              <button className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50">Trước</button>
              <button className="px-2 py-1 border border-green-600 bg-green-50 text-green-700 font-medium rounded">1</button>
              <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-700">2</button>
              <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-700">3</button>
              <span className="px-1 text-gray-400">...</span>
              <button className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50">Sau</button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL PANEL */}
      {selectedRow && (
        <div className="h-64 border-t-2 border-green-500 flex flex-col bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex border-b bg-gray-50">
            <div className="px-4 py-2 bg-amber-50 text-amber-700 font-medium border-t-2 border-amber-500 -mt-[2px] cursor-pointer">
              Chi tiết
            </div>
            <div className="flex-1 flex justify-end px-2">
              <button onClick={() => setSelectedRow(null)} className="text-gray-400 hover:text-gray-600 p-2"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-700 bg-white sticky top-0 border-b">
                <tr>
                  <th className="px-3 py-2 font-semibold">#</th>
                  <th className="px-3 py-2 font-semibold">Mã hàng</th>
                  <th className="px-3 py-2 font-semibold">Tên hàng</th>
                  <th className="px-3 py-2 font-semibold">ĐVT</th>
                  <th className="px-3 py-2 font-semibold text-right">Số lượng</th>
                  <th className="px-3 py-2 font-semibold text-right">Đơn giá sau thuế</th>
                  <th className="px-3 py-2 font-semibold text-right">Đơn giá</th>
                  <th className="px-3 py-2 font-semibold text-right">Thành tiền</th>
                  <th className="px-3 py-2 font-semibold text-right">Tiền thuế GTGT</th>
                  <th className="px-3 py-2 font-semibold text-right">Thời hạn BH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedRow.lines?.map((l, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2 text-gray-800">{l.productCode}</td>
                    <td className="px-3 py-2 text-gray-800">{l.productName}</td>
                    <td className="px-3 py-2 text-gray-600">{l.unit}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.quantity)}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.unitPrice)}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.unitPriceBeforeTax)}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.totalPrice)}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.vatAmount)}</td>
                    <td className="px-3 py-2 text-right text-gray-600">{l.warrantyMonths || ''}</td>
                  </tr>
                ))}
                {(!selectedRow.lines || selectedRow.lines.length === 0) && (
                  <tr>
                    <td colSpan={10} className="px-4 py-6 text-center text-gray-500">Không có chi tiết</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t text-sm text-gray-600 bg-white shrink-0">
            Tổng số: <span className="font-bold text-gray-800">{selectedRow.lines?.length || 0}</span> bản ghi
          </div>
        </div>
      )}

      {/* CREATE QUOTATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-800">Thêm Báo giá</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-auto flex-1 bg-white space-y-6">
              {/* HEADER SECTION */}
              <div className="grid grid-cols-3 gap-8">
                {/* Cột 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số báo giá <span className="text-red-500">*</span></label>
                    <input type="text" value="BG250625001" disabled className="w-full border border-gray-300 rounded px-3 py-1.5 bg-gray-100 text-gray-600 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày báo giá <span className="text-red-500">*</span></label>
                    <input type="date" value={formData.quotationDate} onChange={e => setFormData({...formData, quotationDate: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hạn hiệu lực</label>
                    <input type="date" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
                  </div>
                </div>
                
                {/* Cột 2 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Tìm tên, mã KH..." value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value, customerCode: 'KH00'+Math.floor(Math.random()*10)})} className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
                      <button className="px-3 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"><Search className="w-4 h-4 text-gray-600" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã KH</label>
                      <input type="text" value={formData.customerCode} disabled className="w-full border border-gray-300 rounded px-3 py-1.5 bg-gray-50 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                      <input type="text" value={formData.taxCode} onChange={e => setFormData({...formData, taxCode: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Người liên hệ</label>
                    <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none" />
                  </div>
                </div>

                {/* Cột 3 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kho</label>
                    <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
                      <option>Kho hàng hóa</option>
                      <option>Kho bảo hành</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điều khoản thanh toán</label>
                    <input type="text" value={formData.paymentTerm} onChange={e => setFormData({...formData, paymentTerm: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea rows={2} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none"></textarea>
                  </div>
                </div>
              </div>

              {/* TABLE SẢN PHẨM */}
              <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-gray-700 bg-gray-50 border-b">
                      <tr>
                        <th className="px-2 py-2 w-10 text-center">#</th>
                        <th className="px-2 py-2 min-w-[150px]">Mã hàng</th>
                        <th className="px-2 py-2 min-w-[200px]">Tên hàng</th>
                        <th className="px-2 py-2 w-20">ĐVT</th>
                        <th className="px-2 py-2 w-24 text-right">SL</th>
                        <th className="px-2 py-2 w-32 text-right">Đơn giá sau thuế</th>
                        <th className="px-2 py-2 w-32 text-right">Đơn giá</th>
                        <th className="px-2 py-2 w-20 text-right">% CK</th>
                        <th className="px-2 py-2 w-28 text-right">Tiền CK</th>
                        <th className="px-2 py-2 w-20 text-right">% VAT</th>
                        <th className="px-2 py-2 w-28 text-right">Tiền VAT</th>
                        <th className="px-2 py-2 w-32 text-right font-bold">Thành tiền</th>
                        <th className="px-2 py-2 w-24">Bảo hành (th)</th>
                        <th className="px-2 py-2 w-24">Đơn vị</th>
                        <th className="px-2 py-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {formData.lines.map((line, index) => (
                        <tr key={index} className="hover:bg-gray-50 bg-white">
                          <td className="px-2 py-2 text-center text-gray-500">{index + 1}</td>
                          <td className="px-2 py-2">
                            <input type="text" value={line.productCode} onChange={e => handleLineChange(index, 'productCode', e.target.value)} placeholder="Tìm mã..." className="w-full border-none bg-transparent focus:ring-0 p-0 text-sm" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="text" value={line.productName} onChange={e => handleLineChange(index, 'productName', e.target.value)} className="w-full border-none bg-transparent focus:ring-0 p-0 text-sm font-medium" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="text" value={line.unit} onChange={e => handleLineChange(index, 'unit', e.target.value)} className="w-full border-none bg-transparent focus:ring-0 p-0 text-sm" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="number" min="1" value={line.quantity} onChange={e => handleLineChange(index, 'quantity', Number(e.target.value))} className="w-full border border-gray-200 rounded px-2 py-1 text-right text-sm focus:border-green-500 focus:outline-none" />
                          </td>
                          <td className="px-2 py-2 text-right text-gray-500 bg-gray-50">
                            {fmt(line.unitPrice)}
                          </td>
                          <td className="px-2 py-2">
                            <input type="number" value={line.unitPrice} onChange={e => handleLineChange(index, 'unitPrice', Number(e.target.value))} className="w-full border border-gray-200 rounded px-2 py-1 text-right text-sm focus:border-green-500 focus:outline-none" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="number" value={line.discountRate} onChange={e => handleLineChange(index, 'discountRate', Number(e.target.value))} className="w-full border border-gray-200 rounded px-2 py-1 text-right text-sm focus:border-green-500 focus:outline-none" />
                          </td>
                          <td className="px-2 py-2 text-right text-gray-500 bg-gray-50">
                            {fmt(calculateLineCK(line))}
                          </td>
                          <td className="px-2 py-2">
                            <select value={line.vatRate} onChange={e => handleLineChange(index, 'vatRate', Number(e.target.value))} className="w-full border border-gray-200 rounded px-1 py-1 text-right text-sm focus:border-green-500 focus:outline-none">
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="8">8%</option>
                              <option value="10">10%</option>
                            </select>
                          </td>
                          <td className="px-2 py-2 text-right text-gray-500 bg-gray-50">
                            {fmt(calculateLineVAT(line))}
                          </td>
                          <td className="px-2 py-2 text-right font-bold text-gray-800 bg-gray-50">
                            {fmt(calculateLineTotal(line))}
                          </td>
                          <td className="px-2 py-2">
                            <input type="number" value={line.warrantyMonths} onChange={e => handleLineChange(index, 'warrantyMonths', Number(e.target.value))} className="w-full border border-gray-200 rounded px-2 py-1 text-center text-sm focus:border-green-500 focus:outline-none" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="text" value={line.unitName} onChange={e => handleLineChange(index, 'unitName', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:border-green-500 focus:outline-none" />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button onClick={() => removeLine(index)} disabled={formData.lines.length <= 1} className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400">
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 p-2 border-t">
                  <button onClick={addLine} className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50">
                    <Plus className="w-4 h-4" /> Thêm dòng
                  </button>
                </div>
              </div>

              {/* SUMMARY */}
              <div className="flex justify-end pt-4">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-gray-600 text-sm font-medium">
                    <span>Tổng tiền hàng:</span>
                    <span>{fmt(summary.totalHang)} đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm font-medium">
                    <span>Tổng tiền CK:</span>
                    <span>-{fmt(summary.totalCK)} đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm font-medium">
                    <span>Thuế GTGT:</span>
                    <span>+{fmt(summary.totalVAT)} đ</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between items-center">
                    <span className="font-bold text-gray-800">TỔNG THANH TOÁN:</span>
                    <span className="text-xl font-bold text-green-700">{fmt(summary.grandTotal)} đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-between items-center shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                Hủy
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleSave(false)} 
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Lưu
                </button>
                <button 
                  onClick={() => handleSave(true)} 
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu & Gửi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
