"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Search, FileDown, HelpCircle, X, Trash2 } from "lucide-react";
import { NumberInput, GenericCombobox } from "../components";

const MOCK_SUPPLIERS = [
  { code: "NCC001", name: "Công ty Cổ phần Thép HPG" },
  { code: "NCC002", name: "Công ty Xi măng Hà Tiên" },
  { code: "NCC003", name: "Công ty Vật liệu xây dựng ABC" },
  { code: "NCC004", name: "Công ty Điện máy xanh" },
  { code: "NCC005", name: "Trần Thị B" }
];

export default function OBSupplierDebtPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // For the Grid in the Modal
  const [gridItems, setGridItems] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/opening-balances/supplier-debt?namKeToan=2026");
      const data = await res.json();
      setSuppliers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = () => {
    if (suppliers.length > 0) {
      setGridItems(suppliers.map((c, idx) => ({ ...c, id: idx.toString() })));
    } else {
      handleAddRow();
    }
    setIsModalOpen(true);
  };

  const handleCellChange = (id: string, field: string, value: any) => {
    setGridItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddRow = () => {
    setGridItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        maNcc: "NCC001",
        tenNcc: "Công ty Cổ phần Thép HPG",
        soTienNccUng: 0,
        soTienPhaiTra: 0
      }
    ]);
  };

  const handleDeleteRow = (id: string) => {
    setGridItems(prev => prev.filter(item => item.id !== id));
  };

  const handleDeleteAllRows = () => {
    if (confirm("Bạn có chắc chắn muốn xóa hết dòng?")) {
      setGridItems([]);
    }
  };

  const handleSave = async (closeModal = true) => {
    try {
      const payload = {
        namKeToan: 2026,
        items: gridItems.map(item => ({
          maNcc: item.maNcc,
          tenNcc: item.tenNcc,
          soTienNccUng: item.soTienNccUng || 0,
          soTienPhaiTra: item.soTienPhaiTra || 0,
          supplierId: Date.now() + Math.floor(Math.random() * 1000)
        }))
      };

      const res = await fetch("http://localhost:3001/api/opening-balances/supplier-debt/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Lưu công nợ nhà cung cấp thành công!");
        fetchData();
        if (closeModal) setIsModalOpen(false);
      } else {
        alert("Có lỗi xảy ra khi lưu!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ");
    }
  };

  const formatNum = (num: number) => num === 0 ? "0" : new Intl.NumberFormat('vi-VN').format(num);

  const mainTotalDebit = suppliers.reduce((sum, item) => sum + Number(item.soTienNccUng || 0), 0);
  const mainTotalCredit = suppliers.reduce((sum, item) => sum + Number(item.soTienPhaiTra || 0), 0);
  
  const gridTotalDebit = gridItems.reduce((sum, item) => sum + Number(item.soTienNccUng || 0), 0);
  const gridTotalCredit = gridItems.reduce((sum, item) => sum + Number(item.soTienPhaiTra || 0), 0);

  return (
    <div className="bg-[#f4f7f6] min-h-[calc(100vh-4rem)] pb-32">
      {/* MAIN PAGE UI */}
      <div className="px-6 py-4 flex flex-col gap-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">Công nợ nhà cung cấp</h1>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs font-semibold hover:bg-emerald-200">
              <HelpCircle className="w-3 h-3" /> Hướng dẫn sử dụng <ChevronDown className="w-3 h-3" />
            </button>
            <button className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50">
            <span className="rotate-180 inline-block">↑</span> Thực hiện hàng loạt <ChevronDown className="w-3 h-3" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input type="text" placeholder="Tìm kiếm" className="pl-3 pr-8 py-1.5 text-sm border border-slate-300 rounded-full outline-none focus:border-emerald-500 w-48"/>
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button className="p-1.5 border border-slate-300 rounded hover:bg-slate-50"><FileDown className="w-4 h-4 text-emerald-600" /></button>
            <button className="px-4 py-1.5 border border-slate-800 text-slate-800 rounded font-semibold hover:bg-slate-50">Cập nhật số dư từ DL năm trước</button>
            <button onClick={openModal} className="flex items-center gap-2 px-6 py-1.5 bg-[#008f89] text-white rounded font-semibold hover:bg-[#007a75] shadow-sm">
              Nhập số dư | <ChevronDown className="w-4 h-4" />
            </button>
            <button className="px-6 py-1.5 bg-white border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50 shadow-sm">
              Nhập số dư từ Excel
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded border border-slate-300 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left border-collapse select-none">
            <thead className="bg-[#bce6e4] text-[#006b66]">
              <tr>
                <th className="px-3 py-2 border-r border-[#a8dbd9] w-12 text-center"><input type="checkbox" className="w-4 h-4 accent-[#008f89]" /></th>
                <th className="px-3 py-2 border-r border-[#a8dbd9] font-bold">Mã NCC</th>
                <th className="px-3 py-2 border-r border-[#a8dbd9] font-bold">Tên nhà cung cấp</th>
                <th className="px-3 py-2 border-r border-[#a8dbd9] font-bold text-right">Dư Nợ (NCC ứng)</th>
                <th className="px-3 py-2 font-bold text-right">Dư Có (Phải trả)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-4">Đang tải...</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4 text-slate-500">Chưa có dữ liệu...</td></tr>
              ) : (
                suppliers.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-emerald-50/30">
                    <td className="px-3 py-2 border-r border-slate-200 text-center"><input type="checkbox" className="w-4 h-4 accent-[#008f89]" /></td>
                    <td className="px-3 py-2 border-r border-slate-200 text-slate-700 font-semibold">{item.maNcc}</td>
                    <td className="px-3 py-2 border-r border-slate-200 text-slate-700">{item.tenNcc}</td>
                    <td className="px-3 py-2 border-r border-slate-200 text-right font-semibold">{formatNum(Number(item.soTienNccUng))}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatNum(Number(item.soTienPhaiTra))}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-[#f0f0f0]">
              <tr>
                <td colSpan={3} className="px-3 py-2 font-bold border-r border-slate-300 text-center uppercase">Tổng</td>
                <td className="px-3 py-2 font-bold text-right border-r border-slate-300 text-emerald-700">{formatNum(mainTotalDebit)}</td>
                <td className="px-3 py-2 font-bold text-right text-emerald-700">{formatNum(mainTotalCredit)}</td>
              </tr>
            </tfoot>
          </table>
          <div className="p-3 border-t border-slate-200 text-sm flex justify-between items-center text-slate-500">
            <div>Tổng số: <span className="font-bold text-slate-700">{suppliers.length}</span> bản ghi</div>
            <div className="flex gap-2 items-center">
              <select className="border border-slate-300 rounded px-2 py-1 outline-none"><option>20 bản ghi trên 1 trang</option></select>
              <span>Trước</span> <input type="text" value="1" readOnly className="w-8 text-center border border-slate-300 rounded" /> <span>Sau</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL GRID UI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#f4f7f6] flex flex-col h-screen animate-in fade-in">
          <div className="px-6 py-3 flex items-center justify-between border-b border-slate-200 bg-white shadow-sm">
            <h1 className="text-xl font-bold text-slate-800">Nhập công nợ nhà cung cấp</h1>
            <div className="flex items-center gap-4 text-sm">
              <button className="p-1 text-slate-400 hover:text-slate-600"><HelpCircle className="w-5 h-5" /></button>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-rose-500"><X className="w-6 h-6" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 relative">
            <div className="bg-white rounded border border-slate-300 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-2 border-b border-slate-200 bg-slate-50">
                <input type="text" placeholder="Nhập từ khóa tìm kiếm" className="border border-slate-300 rounded px-3 py-1.5 text-sm w-64 outline-none focus:border-emerald-500 bg-white" />
              </div>

              <div className="flex-1 overflow-y-auto relative">
                <table className="w-full text-sm text-left border-collapse select-none">
                  <thead className="bg-[#bce6e4] text-[#006b66] sticky top-0 z-10 border-b border-slate-300 shadow-sm">
                    <tr>
                      <th className="px-4 py-2 font-bold border-r border-[#a8dbd9] w-48">Mã NCC</th>
                      <th className="px-4 py-2 font-bold border-r border-[#a8dbd9]">Tên nhà cung cấp</th>
                      <th className="px-4 py-2 font-bold border-r border-[#a8dbd9] w-48 text-right">Dư Nợ</th>
                      <th className="px-4 py-2 font-bold border-r border-[#a8dbd9] w-48 text-right">Dư Có</th>
                      <th className="px-4 py-2 font-bold w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridItems.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 hover:bg-emerald-50/30">
                        <td className="px-2 py-1 border-r border-slate-200 bg-white">
                          <GenericCombobox 
                            value={item.maNcc} 
                            items={MOCK_SUPPLIERS}
                            codeLabel="Mã NCC"
                            nameLabel="Tên nhà cung cấp"
                            onChange={(code) => handleCellChange(item.id, 'maNcc', code)} 
                            onNameChange={(name) => handleCellChange(item.id, 'tenNcc', name)}
                          />
                        </td>
                        <td className="px-4 py-2 border-r border-slate-200 text-slate-700">{item.tenNcc}</td>
                        <td className="px-2 py-1 border-r border-slate-200 bg-white">
                          <NumberInput value={item.soTienNccUng} onChange={(val) => handleCellChange(item.id, 'soTienNccUng', val)} />
                        </td>
                        <td className="px-2 py-1 border-r border-slate-200 bg-white">
                          <NumberInput value={item.soTienPhaiTra} onChange={(val) => handleCellChange(item.id, 'soTienPhaiTra', val)} />
                        </td>
                        <td className="px-2 py-1 text-center">
                          <button onClick={() => handleDeleteRow(item.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  
                  <tfoot className="bg-[#f0f0f0] text-slate-800 sticky bottom-0 z-10 border-t border-slate-300 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
                    <tr>
                      <td colSpan={2} className="px-4 py-2 font-bold text-center border-r border-slate-300 uppercase">Tổng</td>
                      <td className="px-4 py-2 font-bold text-right border-r border-slate-300 text-lg text-emerald-700">{formatNum(gridTotalDebit)}</td>
                      <td className="px-4 py-2 font-bold text-right border-r border-slate-300 text-lg text-emerald-700">{formatNum(gridTotalCredit)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={handleAddRow} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded shadow-sm hover:bg-slate-50 text-sm">Thêm dòng</button>
              <button onClick={handleDeleteAllRows} className="px-6 py-2 bg-white border border-slate-300 text-rose-600 font-bold rounded shadow-sm hover:bg-rose-50 text-sm">Xóa hết dòng</button>
            </div>
          </div>

          <div className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between mt-auto">
            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-slate-500 rounded font-bold hover:bg-slate-800 text-sm">Đóng</button>
            <div className="flex gap-2">
              <button onClick={() => handleSave(true)} className="px-8 py-2 border border-slate-500 rounded font-bold hover:bg-slate-800 text-sm">Cất</button>
              <button onClick={() => handleSave(true)} className="px-8 py-2 bg-[#008f89] rounded font-bold hover:bg-[#007a75] text-sm">Cất và Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
