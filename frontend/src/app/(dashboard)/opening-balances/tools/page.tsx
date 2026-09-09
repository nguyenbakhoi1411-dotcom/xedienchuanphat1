"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Search, FileDown, HelpCircle, X, Trash2 } from "lucide-react";
import { NumberInput, GenericCombobox, TextInput } from "../components";

const MOCK_TOOLS = [
  { code: "CCDC001", name: "Máy tính xách tay Dell XPS" },
  { code: "CCDC002", name: "Máy in Canon 2900" },
  { code: "CCDC003", name: "Bàn làm việc nhân viên" },
  { code: "CCDC004", name: "Ghế xoay văn phòng" },
  { code: "CCDC005", name: "Máy chiếu Panasonic" }
];

export default function OBToolsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState<any[]>([]);

  // For the Grid in the Modal
  const [gridItems, setGridItems] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/opening-balances/tools?namKeToan=2026");
      const data = await res.json();
      setTools(data || []);
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
    if (tools.length > 0) {
      setGridItems(tools.map((c, idx) => ({ ...c, id: idx.toString() })));
    } else {
      handleAddRow();
    }
    setIsModalOpen(true);
  };

  const handleCellChange = (id: string, field: string, value: any) => {
    setGridItems(prev => prev.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        // Auto calculate
        if (field === 'soLuong' || field === 'donGia') {
           newItem.giaTri = (newItem.soLuong || 0) * (newItem.donGia || 0);
        }
        return newItem;
      }
      return item;
    }));
  };

  const handleAddRow = () => {
    setGridItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        maCcdc: "CCDC001",
        tenCcdc: "Máy tính xách tay Dell XPS",
        phongBan: "Phòng IT",
        soLuong: 0,
        donGia: 0,
        giaTri: 0
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
          maCcdc: item.maCcdc,
          tenCcdc: item.tenCcdc,
          phongBan: item.phongBan,
          soLuong: item.soLuong || 0,
          donGia: item.donGia || 0,
          giaTri: item.giaTri || 0,
          toolId: Date.now() + Math.floor(Math.random() * 1000)
        }))
      };

      const res = await fetch("http://localhost:3001/api/opening-balances/tools/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Lưu CCDC thành công!");
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

  const mainTotalValue = tools.reduce((sum, item) => sum + Number(item.giaTri || 0), 0);
  const gridTotalValue = gridItems.reduce((sum, item) => sum + Number(item.giaTri || 0), 0);

  return (
    <div className="bg-[#f4f7f6] min-h-[calc(100vh-4rem)] pb-32">
      {/* MAIN PAGE UI */}
      <div className="px-6 py-4 flex flex-col gap-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">Công cụ dụng cụ đang sử dụng</h1>
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
              Nhập CCDC | <ChevronDown className="w-4 h-4" />
            </button>
            <button className="px-6 py-1.5 bg-white border border-slate-300 text-slate-700 rounded font-semibold hover:bg-slate-50 shadow-sm">
              Nhập CCDC từ Excel
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
                <th className="px-3 py-2 border-r border-[#a8dbd9] font-bold">Mã CCDC</th>
                <th className="px-3 py-2 border-r border-[#a8dbd9] font-bold">Tên CCDC</th>
                <th className="px-3 py-2 border-r border-[#a8dbd9] font-bold">Phòng ban</th>
                <th className="px-3 py-2 border-r border-[#a8dbd9] font-bold text-right">Số lượng</th>
                <th className="px-3 py-2 font-bold text-right">Giá trị còn lại</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-4">Đang tải...</td></tr>
              ) : tools.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4 text-slate-500">Chưa có dữ liệu...</td></tr>
              ) : (
                tools.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-emerald-50/30">
                    <td className="px-3 py-2 border-r border-slate-200 text-center"><input type="checkbox" className="w-4 h-4 accent-[#008f89]" /></td>
                    <td className="px-3 py-2 border-r border-slate-200 text-slate-700 font-semibold">{item.maCcdc}</td>
                    <td className="px-3 py-2 border-r border-slate-200 text-slate-700">{item.tenCcdc}</td>
                    <td className="px-3 py-2 border-r border-slate-200 text-slate-700">{item.phongBan}</td>
                    <td className="px-3 py-2 border-r border-slate-200 text-right font-semibold">{formatNum(Number(item.soLuong))}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatNum(Number(item.giaTri))}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-[#f0f0f0]">
              <tr>
                <td colSpan={5} className="px-3 py-2 font-bold border-r border-slate-300 text-center uppercase">Tổng</td>
                <td className="px-3 py-2 font-bold text-right text-emerald-700">{formatNum(mainTotalValue)}</td>
              </tr>
            </tfoot>
          </table>
          <div className="p-3 border-t border-slate-200 text-sm flex justify-between items-center text-slate-500">
            <div>Tổng số: <span className="font-bold text-slate-700">{tools.length}</span> bản ghi</div>
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
            <h1 className="text-xl font-bold text-slate-800">Nhập công cụ dụng cụ đang sử dụng</h1>
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
                      <th className="px-4 py-2 font-bold border-r border-[#a8dbd9] w-48">Mã CCDC</th>
                      <th className="px-4 py-2 font-bold border-r border-[#a8dbd9] w-64">Tên CCDC</th>
                      <th className="px-4 py-2 font-bold border-r border-[#a8dbd9] w-48">Phòng ban</th>
                      <th className="px-4 py-2 font-bold border-r border-[#a8dbd9] w-32 text-right">Số lượng</th>
                      <th className="px-4 py-2 font-bold border-r border-[#a8dbd9] w-48 text-right">Đơn giá</th>
                      <th className="px-4 py-2 font-bold border-r border-[#a8dbd9] w-48 text-right">Giá trị còn lại</th>
                      <th className="px-4 py-2 font-bold w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridItems.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 hover:bg-emerald-50/30">
                        <td className="px-2 py-1 border-r border-slate-200 bg-white">
                          <GenericCombobox 
                            value={item.maCcdc} 
                            items={MOCK_TOOLS}
                            codeLabel="Mã CCDC"
                            nameLabel="Tên CCDC"
                            onChange={(code) => handleCellChange(item.id, 'maCcdc', code)} 
                            onNameChange={(name) => handleCellChange(item.id, 'tenCcdc', name)}
                          />
                        </td>
                        <td className="px-4 py-2 border-r border-slate-200 text-slate-700">{item.tenCcdc}</td>
                        <td className="px-2 py-1 border-r border-slate-200 bg-white">
                          <TextInput value={item.phongBan} onChange={(val) => handleCellChange(item.id, 'phongBan', val)} placeholder="Tên phòng ban" />
                        </td>
                        <td className="px-2 py-1 border-r border-slate-200 bg-white">
                          <NumberInput value={item.soLuong} onChange={(val) => handleCellChange(item.id, 'soLuong', val)} />
                        </td>
                        <td className="px-2 py-1 border-r border-slate-200 bg-white">
                          <NumberInput value={item.donGia} onChange={(val) => handleCellChange(item.id, 'donGia', val)} />
                        </td>
                        <td className="px-2 py-1 border-r border-slate-200 bg-white">
                          <NumberInput value={item.giaTri} onChange={(val) => handleCellChange(item.id, 'giaTri', val)} />
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
                      <td colSpan={5} className="px-4 py-2 font-bold text-center border-r border-slate-300 uppercase">Tổng</td>
                      <td className="px-4 py-2 font-bold text-right border-r border-slate-300 text-lg text-emerald-700">{formatNum(gridTotalValue)}</td>
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
