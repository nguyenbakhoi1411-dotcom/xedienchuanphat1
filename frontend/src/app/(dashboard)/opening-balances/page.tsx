"use client";

import React, { useState } from "react";
import { 
  BookOpen, Landmark, UserCog, Building2, Users, 
  PackageSearch, PenTool, Car, CalendarClock, Receipt, Lock
} from "lucide-react";
import { OBCard, OBCardStatus } from "@/features/opening-balances/components/OBCard";
import { OBBalanceChecker } from "@/features/opening-balances/components/OBBalanceChecker";

export default function OpeningBalancesDashboard() {
  // Mock data to simulate the MISA AMIS dashboard
  const [config] = useState({
    ngayBatDauSuDung: "2026-01-01",
    namKeToan: 2026,
    trangThai: "DRAFT" as "DRAFT" | "LOCKED",
  });

  const [balances] = useState({
    tongDuNo: 150000000,
    tongDuCo: 145000000,
  });

  const cards = [
    { title: "Số dư tài khoản", icon: BookOpen, status: "DONE" as OBCardStatus, summaryValue: "150.000.000 đ", summaryLabel: "Nợ", href: "/opening-balances/accounts" },
    { title: "Số dư TK ngân hàng", icon: Landmark, status: "DONE" as OBCardStatus, summaryValue: "50.000.000 đ", href: "/opening-balances/bank" },
    { title: "Công nợ khách hàng", icon: UserCog, status: "EMPTY" as OBCardStatus, href: "/opening-balances/customer-debt" },
    { title: "Công nợ nhà cung cấp", icon: Building2, status: "EMPTY" as OBCardStatus, href: "/opening-balances/supplier-debt" },
    { title: "Công nợ nhân viên", icon: Users, status: "EMPTY" as OBCardStatus, href: "/opening-balances/employee-debt" },
    { title: "Tồn kho vật tư, hàng hóa và CCDC", icon: PackageSearch, status: "EMPTY" as OBCardStatus, href: "/opening-balances/inventory" },
    { title: "CCDC đang sử dụng đầu kỳ", icon: PenTool, status: "EMPTY" as OBCardStatus, href: "/opening-balances/tools" },
    { title: "Tài sản cố định đầu kỳ", icon: Car, status: "EMPTY" as OBCardStatus, href: "/opening-balances/fixed-assets" },
    { title: "Chi phí trả trước đầu kỳ", icon: CalendarClock, status: "EMPTY" as OBCardStatus, href: "/opening-balances/prepaid" },
    { title: "Chi phí dở dang", icon: Receipt, status: "EMPTY" as OBCardStatus, href: "/opening-balances/wip" },
  ];

  const completedCount = cards.filter(c => c.status === "DONE").length;
  const progressPercent = Math.round((completedCount / cards.length) * 100);
  const diff = Math.abs(balances.tongDuNo - balances.tongDuCo);
  const isBalanced = diff === 0;

  return (
    <div className="bg-[#f4f7f6] min-h-[calc(100vh-4rem)] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-800">Nhập số dư ban đầu</h1>
        <p className="text-sm text-slate-500 mt-1">
          Nhập số liệu kế toán tại thời điểm bắt đầu sử dụng phần mềm
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
        
        {/* Progress Bar & Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-bold text-slate-700">Tiến độ nhập số dư ban đầu</p>
              <p className="text-xs text-slate-500 mt-1">Đã nhập {completedCount}/{cards.length} loại số dư</p>
            </div>
            <div className="text-xl font-bold text-emerald-600">{progressPercent}%</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className={`p-3 rounded-lg border text-sm font-medium flex items-center gap-2 ${isBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            {isBalanced ? (
              <>✅ Cân đối (Tổng dư Nợ = Tổng dư Có)</>
            ) : (
              <>⚠ Chênh lệch cân đối: {new Intl.NumberFormat('vi-VN').format(diff)} đ (chưa cân bằng)</>
            )}
          </div>
        </div>

        {/* Configuration Box */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-8">
            <div>
              <span className="text-xs text-slate-500 block mb-1">Năm kế toán:</span>
              <select className="border border-slate-300 rounded px-2 py-1 text-sm font-semibold outline-none focus:border-emerald-500" defaultValue={config.namKeToan}>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-1">Ngày bắt đầu sử dụng:</span>
              <span className="text-sm font-bold text-slate-800">{config.ngayBatDauSuDung}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block mb-1">Trạng thái:</span>
              {config.trangThai === "DRAFT" ? (
                <span className="text-sm font-bold text-blue-600 flex items-center gap-1">🔓 Đang nhập</span>
              ) : (
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">🔒 Đã khóa</span>
              )}
            </div>
          </div>
          
          <button 
            disabled={!isBalanced || progressPercent < 100}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              (!isBalanced || progressPercent < 100) 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" /> Khóa số dư ban đầu
          </button>
        </div>

        {/* 10 Cards Grid */}
        <div className="grid grid-cols-5 gap-4">
          {cards.map((card, idx) => (
            <div key={idx}>
              <OBCard {...card} />
            </div>
          ))}
        </div>

      </div>

      <OBBalanceChecker totalDebit={balances.tongDuNo} totalCredit={balances.tongDuCo} />
    </div>
  );
}
