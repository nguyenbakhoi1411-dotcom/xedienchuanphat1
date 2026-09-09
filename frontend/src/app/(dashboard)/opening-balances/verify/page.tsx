"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Lock, CheckCircle2, AlertTriangle, Printer } from "lucide-react";

export default function OBVerifyPage() {
  const [isLocked, setIsLocked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // MOCK DATA for verifying
  const reportData = {
    debits: [
      { code: "111", name: "Tiền mặt", amount: 10000000 },
      { code: "112", name: "Tiền gửi NH", amount: 80000000 },
      { code: "131", name: "Phải thu KH", amount: 80000000 },
      { code: "156", name: "Hàng hóa", amount: 350000000 },
      { code: "152", name: "Vật tư NVL", amount: 80000000 },
      { code: "153", name: "CCDC kho", amount: 20000000 },
      { code: "142", name: "CCDC đang dùng", amount: 45000000 },
      { code: "211", name: "Tài sản cố định", amount: 500000000 },
      { code: "242", name: "Chi phí trả trước", amount: 96000000 },
      { code: "154", name: "Chi phí dở dang", amount: 120000000 },
      { code: "141", name: "Tạm ứng NV", amount: 15000000 },
    ],
    credits: [
      { code: "331", name: "Phải trả NCC", amount: 60000000 },
      { code: "214", name: "Hao mòn TSCD", amount: 120000000 },
      { code: "131 (Có)", name: "KH ứng trước", amount: 5000000 },
      { code: "334", name: "Lương NV", amount: 8000000 },
      { code: "411", name: "Vốn góp CSH", amount: 1203000000 }, // Balance figure
    ]
  };

  const totalDebit = reportData.debits.reduce((s, i) => s + i.amount, 0);
  const totalCredit = reportData.credits.reduce((s, i) => s + i.amount, 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff === 0;

  const handleLock = () => {
    setIsLocked(true);
    setShowConfirm(false);
  };

  return (
    <div className="bg-[#f4f7f6] min-h-[calc(100vh-4rem)] pb-24 relative">
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/opening-balances" className="p-2 -ml-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Kiểm tra & Khóa sổ số dư ban đầu</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Printer className="w-4 h-4" /> In báo cáo
          </button>
          {!isLocked ? (
            <button 
              disabled={!isBalanced}
              onClick={() => setShowConfirm(true)}
              className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg text-sm font-semibold shadow-sm transition-all ${isBalanced ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              <Lock className="w-4 h-4" /> Khóa số dư ban đầu
            </button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-2 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-bold">
              <Lock className="w-4 h-4" /> ĐÃ KHÓA SỔ
            </div>
          )}
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        
        {/* Verification Status */}
        <div className={`p-6 rounded-xl border shadow-sm text-center ${isBalanced ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          {isBalanced ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-emerald-800 mb-1">Đã cân đối (Tổng Nợ = Tổng Có)</h2>
              <p className="text-emerald-600 font-medium">Bạn có thể tiến hành Khóa số dư ban đầu để bắt đầu ghi nhận phát sinh.</p>
            </>
          ) : (
            <>
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-rose-800 mb-1">Chưa cân đối</h2>
              <p className="text-rose-600 font-medium mb-3">Chênh lệch: {new Intl.NumberFormat('vi-VN').format(diff)} đ</p>
              <div className="bg-white/50 inline-block px-4 py-2 rounded text-sm text-rose-800 font-semibold border border-rose-200">
                Gợi ý: Bạn có thể nhập phần chênh lệch vào TK 411 (Vốn góp CSH) hoặc kiểm tra lại từng mục.
              </div>
            </>
          )}
        </div>

        {/* Big Report Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="text-center py-6 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Báo Cáo Kiểm Tra Số Dư Ban Đầu</h3>
            <p className="text-slate-500 mt-1 font-medium">Ngày bắt đầu sử dụng: 01/01/2026</p>
          </div>

          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#bce6e4] text-[#006b66]">
              <tr>
                <th className="px-6 py-3 font-bold border-r border-[#a8dbd9]">Nguồn số dư</th>
                <th className="px-6 py-3 font-bold border-r border-[#a8dbd9] w-32 text-center">TK</th>
                <th className="px-6 py-3 font-bold w-48 text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {/* DEBITS */}
              <tr className="bg-slate-100">
                <td colSpan={3} className="px-6 py-2 font-bold text-slate-700">DƯ NỢ (TÀI SẢN / CHI PHÍ)</td>
              </tr>
              {reportData.debits.map((r, i) => (
                <tr key={'d'+i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-2 border-r border-slate-100">{r.name}</td>
                  <td className="px-6 py-2 border-r border-slate-100 text-center font-medium text-slate-500">{r.code}</td>
                  <td className="px-6 py-2 text-right font-medium text-slate-800">{new Intl.NumberFormat('vi-VN').format(r.amount)}</td>
                </tr>
              ))}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td colSpan={2} className="px-6 py-3 font-bold text-blue-900 border-r border-blue-200">TỔNG DƯ NỢ</td>
                <td className="px-6 py-3 text-right font-bold text-blue-900 text-lg">{new Intl.NumberFormat('vi-VN').format(totalDebit)} đ</td>
              </tr>

              {/* CREDITS */}
              <tr className="bg-slate-100 border-t-4 border-white">
                <td colSpan={3} className="px-6 py-2 font-bold text-slate-700">DƯ CÓ (NỢ PHẢI TRẢ / VỐN CSH)</td>
              </tr>
              {reportData.credits.map((r, i) => (
                <tr key={'c'+i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-2 border-r border-slate-100">{r.name}</td>
                  <td className="px-6 py-2 border-r border-slate-100 text-center font-medium text-slate-500">{r.code}</td>
                  <td className="px-6 py-2 text-right font-medium text-slate-800">{new Intl.NumberFormat('vi-VN').format(r.amount)}</td>
                </tr>
              ))}
              <tr className="bg-amber-50 border-t-2 border-amber-200">
                <td colSpan={2} className="px-6 py-3 font-bold text-amber-900 border-r border-amber-200">TỔNG DƯ CÓ</td>
                <td className="px-6 py-3 text-right font-bold text-amber-900 text-lg">{new Intl.NumberFormat('vi-VN').format(totalCredit)} đ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION DIALOG */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px] transform transition-all scale-100 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Xác nhận khóa sổ</h3>
            <p className="text-center text-slate-600 mb-6 text-sm">
              Sau khi khóa, bạn sẽ <strong>không thể sửa trực tiếp</strong> số dư ban đầu nữa.<br/>
              Mọi điều chỉnh sau này sẽ phải thực hiện qua bút toán kế toán.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                Hủy
              </button>
              <button onClick={handleLock} className="flex-1 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> Khóa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
