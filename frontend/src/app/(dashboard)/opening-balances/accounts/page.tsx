"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Search, FileDown, HelpCircle, Check, AlertTriangle, ArrowDownToLine } from "lucide-react";

export default function OBAccountsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/opening-balances/accounts?namKeToan=2026")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const totalDuNo = data.filter(d => d.level === 1).reduce((sum, item) => sum + Number(item.debit || 0), 0);
  const totalDuCo = data.filter(d => d.level === 1).reduce((sum, item) => sum + Number(item.credit || 0), 0);
  const isBalanced = totalDuNo === totalDuCo;

  return (
    <div className="bg-[#f4f7f6] min-h-[calc(100vh-4rem)] pb-32">
      <div className="px-6 py-4 flex flex-col gap-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Số dư tài khoản kế toán</h1>
          <Link href="/opening-balances/accounts/input" className="px-6 py-2 bg-[#008f89] text-white rounded font-semibold hover:bg-[#007a75]">
            Nhập số dư | <ChevronDown className="w-4 h-4 inline" />
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded border border-slate-300 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#bce6e4] text-[#006b66]">
              <tr>
                <th className="px-3 py-2 border-r border-[#a8dbd9]">Số tài khoản</th>
                <th className="px-3 py-2 border-r border-[#a8dbd9]">Tên tài khoản</th>
                <th className="px-3 py-2 text-right">Dư Nợ</th>
                <th className="px-3 py-2 text-right">Dư Có</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-4">Đang tải...</td></tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className={`px-3 py-2 ${item.level === 1 ? 'font-bold' : 'pl-8'}`}>{item.code}</td>
                    <td className={`px-3 py-2 ${item.level === 1 ? 'font-bold' : ''}`}>
                      {item.isDetail ? (
                         <Link href={item.detailLink} className="text-blue-600 hover:underline">{item.name}</Link>
                      ) : item.name}
                    </td>
                    <td className="px-3 py-2 text-right">{item.debit ? Number(item.debit).toLocaleString('vi-VN') : ''}</td>
                    <td className="px-3 py-2 text-right">{item.credit ? Number(item.credit).toLocaleString('vi-VN') : ''}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-[#f0f0f0]">
              <tr>
                <td colSpan={2} className="px-3 py-2 font-bold text-center">Tổng</td>
                <td className="px-3 py-2 font-bold text-right text-emerald-600">{totalDuNo.toLocaleString('vi-VN')}</td>
                <td className="px-3 py-2 font-bold text-right text-emerald-600">{totalDuCo.toLocaleString('vi-VN')}</td>
              </tr>
            </tfoot>
          </table>
          <div className="p-4 bg-slate-50 flex items-center justify-between">
            <div className="font-semibold text-slate-700">Tình trạng cân đối:</div>
            <div className={`font-bold px-4 py-1.5 rounded ${isBalanced ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {isBalanced ? "✅ Đã cân đối" : `❌ Lệch ${Math.abs(totalDuNo - totalDuCo).toLocaleString('vi-VN')} đ`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
