"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Download, Settings, ChevronDown, Plus, Trash2, X } from 'lucide-react';
import { salesApi } from '@/features/sales/api';
import { toast } from 'sonner';

function fmt(n: number | null | undefined) {
  if (n == null) return '0';
  return new Intl.NumberFormat('vi-VN').format(n);
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('vi-VN');
}

export function DiscountsTab() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    discountDate: new Date().toISOString().split('T')[0],
    customerName: '',
    invoiceNo: '',
    lines: [
      {
        productCode: '', productName: '', discountAccount: '51114', receivableAccount: '131',
        unit: 'Chiếc', quantity: 1, unitPriceBeforeTax: 0, unitPrice: 0,
        vatRate: 0, vatAccount: '33311', salesVoucherNo: ''
      }
    ]
  });

  const loadData = () => {
    setLoading(true);
    salesApi.listDiscounts({ size: 50 })
      .then(res => {
        setDiscounts(res.content || []);
        setTotalElements(res.totalElements || 0);
      })
      .catch(err => toast.error('Lỗi tải chứng từ giảm giá: ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...formData.lines] as any[];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, {
        productCode: '', productName: '', discountAccount: '51114', receivableAccount: '131',
        unit: '', quantity: 1, unitPriceBeforeTax: 0, unitPrice: 0,
        vatRate: 0, vatAccount: '33311', salesVoucherNo: ''
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
    return q * p;
  };

  const calculateLineVAT = (line: any) => {
    const total = calculateLineTotal(line);
    const vr = Number(line.vatRate) || 0;
    return (total * vr) / 100;
  };

  const summary = useMemo(() => {
    let grandTotal = 0;
    formData.lines.forEach(l => {
      grandTotal += calculateLineTotal(l) + calculateLineVAT(l);
    });
    return { grandTotal };
  }, [formData.lines]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await salesApi.createDiscount(formData);
      toast.success('Đã lưu chứng từ giảm giá hàng bán!');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Lỗi khi lưu: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between p-3 border-b bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-sm font-medium text-gray-700 transition-colors">
            Lọc <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          <span className="text-sm font-medium text-gray-600 px-2 border-r border-gray-300">Đầu năm tới hiện tại</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-300" title="Nạp">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-300" title="Xuất khẩu">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-300" title="Tùy chỉnh">
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm transition-colors shadow-sm"
          >
            Thêm
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
                <th className="px-3 py-2 font-semibold">Ngày hạch toán</th>
                <th className="px-3 py-2 font-semibold">Số chứng từ</th>
                <th className="px-3 py-2 font-semibold">Số hóa đơn</th>
                <th className="px-3 py-2 font-semibold">Khách hàng</th>
                <th className="px-3 py-2 font-semibold text-right">Tổng tiền thanh toán</th>
                <th className="px-3 py-2 font-semibold text-center sticky right-0 bg-gray-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l">Chức năng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {discounts.map((d) => (
                <tr 
                  key={d.id} 
                  className={`hover:bg-blue-50 cursor-pointer transition-colors ${selectedRow?.id === d.id ? 'bg-blue-50' : 'bg-white'}`}
                  onClick={() => setSelectedRow(d)}
                >
                  <td className="px-3 py-2 text-center" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded text-green-600 focus:ring-green-500" /></td>
                  <td className="px-3 py-2">{fmtDate(d.discountDate)}</td>
                  <td className="px-3 py-2 text-blue-600 hover:underline font-medium">{d.discountNo}</td>
                  <td className="px-3 py-2">{d.invoiceNo}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">{d.customerName}</td>
                  <td className="px-3 py-2 text-right font-bold text-gray-700">{fmt(d.totalAmount)}</td>
                  <td className="px-3 py-2 text-center sticky right-0 bg-white group-hover:bg-blue-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l" onClick={e => e.stopPropagation()}>
                    <button className="text-blue-600 font-medium hover:underline flex items-center justify-center w-full gap-1">
                      Phát hành hóa đơn <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
              {discounts.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
            {discounts.length > 0 && (
              <tfoot className="bg-gray-50 font-bold sticky bottom-0 z-10 border-t border-gray-300">
                <tr>
                  <td colSpan={5} className="px-3 py-2 text-center">Tổng</td>
                  <td className="px-3 py-2 text-right">{fmt(discounts.reduce((a,c)=>a+c.totalAmount,0))}</td>
                  <td className="px-3 py-2 sticky right-0 bg-gray-50 border-l shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]"></td>
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

      {/* INLINE DETAIL PANEL */}
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
                  <th className="px-3 py-2 font-semibold">TK Giảm giá</th>
                  <th className="px-3 py-2 font-semibold">TK công nợ</th>
                  <th className="px-3 py-2 font-semibold">ĐVT</th>
                  <th className="px-3 py-2 font-semibold text-right">Số lượng</th>
                  <th className="px-3 py-2 font-semibold text-right">Đơn giá sau thuế</th>
                  <th className="px-3 py-2 font-semibold text-right">Đơn giá</th>
                  <th className="px-3 py-2 font-semibold text-right">Thành tiền</th>
                  <th className="px-3 py-2 font-semibold text-right">% thuế GTGT</th>
                  <th className="px-3 py-2 font-semibold text-right">Tiền thuế GTGT</th>
                  <th className="px-3 py-2 font-semibold">TK Thuế GTGT</th>
                  <th className="px-3 py-2 font-semibold">Số CT bán hàng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedRow.lines?.map((l: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2 text-gray-800">{l.productCode}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{l.productName}</td>
                    <td className="px-3 py-2 text-gray-600">{l.discountAccount}</td>
                    <td className="px-3 py-2 text-gray-600">{l.receivableAccount}</td>
                    <td className="px-3 py-2 text-gray-600">{l.unit}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.quantity)}</td>
                    <td className="px-3 py-2 text-right text-gray-500">{fmt(l.unitPriceBeforeTax)}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.unitPrice)}</td>
                    <td className="px-3 py-2 text-right font-medium">{fmt(l.totalPrice)}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.vatRate)}</td>
                    <td className="px-3 py-2 text-right">{fmt(l.vatAmount)}</td>
                    <td className="px-3 py-2 text-gray-600">{l.vatAccount}</td>
                    <td className="px-3 py-2 text-gray-500">{l.salesVoucherNo || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-800">Thêm Giảm giá hàng bán</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-auto flex-1 bg-white space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số chứng từ</label>
                      <input type="text" value="BGG00001" disabled className="w-full border border-gray-300 rounded px-3 py-1.5 bg-gray-100 text-gray-600 text-sm focus:outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hạch toán</label>
                      <input type="date" value={formData.discountDate} onChange={e => setFormData({...formData, discountDate: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số hóa đơn</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Tìm số HĐ..." value={formData.invoiceNo} onChange={e => setFormData({...formData, invoiceNo: e.target.value})} className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
                      <button className="px-3 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"><Search className="w-4 h-4 text-gray-600" /></button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Tìm tên KH..." value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
                      <button className="px-3 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"><Search className="w-4 h-4 text-gray-600" /></button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-gray-700 bg-gray-50 border-b">
                      <tr>
                        <th className="px-2 py-2 w-10 text-center">#</th>
                        <th className="px-2 py-2 min-w-[150px]">Mã hàng</th>
                        <th className="px-2 py-2 min-w-[200px]">Tên hàng</th>
                        <th className="px-2 py-2 w-24">TK Giảm giá</th>
                        <th className="px-2 py-2 w-24">TK công nợ</th>
                        <th className="px-2 py-2 w-20">ĐVT</th>
                        <th className="px-2 py-2 w-24 text-right">SL</th>
                        <th className="px-2 py-2 w-32 text-right">Đơn giá sau thuế</th>
                        <th className="px-2 py-2 w-32 text-right">Đơn giá</th>
                        <th className="px-2 py-2 w-32 text-right font-bold">Thành tiền</th>
                        <th className="px-2 py-2 w-20 text-right">% VAT</th>
                        <th className="px-2 py-2 w-28 text-right">Tiền VAT</th>
                        <th className="px-2 py-2 w-24">TK Thuế GTGT</th>
                        <th className="px-2 py-2 w-32">Số CT bán hàng</th>
                        <th className="px-2 py-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {formData.lines.map((line, index) => (
                        <tr key={index} className="hover:bg-gray-50 bg-white">
                          <td className="px-2 py-2 text-center text-gray-500">{index + 1}</td>
                          <td className="px-2 py-2">
                            <input type="text" value={line.productCode} onChange={e => handleLineChange(index, 'productCode', e.target.value)} placeholder="Tìm..." className="w-full border border-gray-200 rounded p-1 text-sm" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="text" value={line.productName} onChange={e => handleLineChange(index, 'productName', e.target.value)} className="w-full border border-gray-200 rounded p-1 text-sm font-medium" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="text" value={line.discountAccount} onChange={e => handleLineChange(index, 'discountAccount', e.target.value)} className="w-full border border-gray-200 rounded p-1 text-sm" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="text" value={line.receivableAccount} onChange={e => handleLineChange(index, 'receivableAccount', e.target.value)} className="w-full border border-gray-200 rounded p-1 text-sm" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="text" value={line.unit} onChange={e => handleLineChange(index, 'unit', e.target.value)} className="w-full border border-gray-200 rounded p-1 text-sm" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="number" min="1" value={line.quantity} onChange={e => handleLineChange(index, 'quantity', Number(e.target.value))} className="w-full border border-gray-200 rounded p-1 text-right text-sm" />
                          </td>
                          <td className="px-2 py-2 text-right bg-gray-50 text-gray-500">{fmt(line.unitPriceBeforeTax)}</td>
                          <td className="px-2 py-2">
                            <input type="number" value={line.unitPrice} onChange={e => handleLineChange(index, 'unitPrice', Number(e.target.value))} className="w-full border border-gray-200 rounded p-1 text-right text-sm" />
                          </td>
                          <td className="px-2 py-2 text-right font-bold text-gray-800 bg-gray-50">
                            {fmt(calculateLineTotal(line))}
                          </td>
                          <td className="px-2 py-2">
                            <select value={line.vatRate} onChange={e => handleLineChange(index, 'vatRate', Number(e.target.value))} className="w-full border border-gray-200 rounded p-1 text-right text-sm">
                              <option value="0">0%</option><option value="5">5%</option><option value="8">8%</option><option value="10">10%</option>
                            </select>
                          </td>
                          <td className="px-2 py-2 text-right bg-gray-50 text-gray-500">{fmt(calculateLineVAT(line))}</td>
                          <td className="px-2 py-2">
                            <input type="text" value={line.vatAccount} onChange={e => handleLineChange(index, 'vatAccount', e.target.value)} className="w-full border border-gray-200 rounded p-1 text-sm" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="text" value={line.salesVoucherNo} onChange={e => handleLineChange(index, 'salesVoucherNo', e.target.value)} className="w-full border border-gray-200 rounded p-1 text-sm" />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button onClick={() => removeLine(index)} disabled={formData.lines.length <= 1} className="text-gray-400 hover:text-red-500 disabled:opacity-30">
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

              <div className="flex justify-end pt-4">
                <div className="text-lg flex justify-between items-center w-80">
                  <span className="font-bold text-gray-800">Tổng tiền thanh toán:</span>
                  <span className="text-xl font-bold text-green-700">{fmt(summary.grandTotal)} đ</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-between items-center shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                Hủy
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Lưu
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu & Phát hành HĐ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
