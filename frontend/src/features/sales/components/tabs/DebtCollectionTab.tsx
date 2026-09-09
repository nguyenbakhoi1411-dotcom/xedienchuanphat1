"use client";
import React, { useState, useEffect, useCallback } from "react";
import { DateRangePreset } from "../shared/DateRangePreset";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + " d";
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("vi-VN") : "";

export function DebtCollectionTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetch_data = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/sales/receivables?size=50&search=${search}&hasDebt=true`);
      if (!res.ok) throw new Error("Loi tai danh sach thu no");
      const data = await res.json();
      setCustomers((data.content ?? data).map((b: any) => ({
        ...b,
        amountByInvoice: fmt(b.amountByInvoice ?? 0),
        advanceReceived: fmt(b.advanceReceived ?? 0),
        remainingAmount: fmt(b.remainingAmount ?? 0),
        asOfDate: fmtDate(b.asOfDate),
      })));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch_data(); }, [fetch_data]);

  return (
    <div className="flex flex-col h-full bg-white p-3 gap-3">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <DateRangePreset />
          <input type="text" placeholder="Tim khach hang co no..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">Gui nhac no</button>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">+ Tao dot thu no</button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">{error}</div>}
      {loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="flex-1 overflow-auto rounded border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-2 border-b w-10 text-center">#</th>
                <th className="p-2 border-b">Ma KH</th>
                <th className="p-2 border-b">Ten khach hang</th>
                <th className="p-2 border-b">Nhom KH</th>
                <th className="p-2 border-b">MST</th>
                <th className="p-2 border-b text-right">Con phai thu</th>
                <th className="p-2 border-b">Tinh trang</th>
                <th className="p-2 border-b">Hanh dong</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400">Khong co khach hang nao co no qua han</td></tr>
              ) : customers.map((c, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-center">{idx + 1}</td>
                  <td className="p-2">{c.customerCode}</td>
                  <td className="p-2 font-medium">{c.customerName}</td>
                  <td className="p-2">{c.customerGroup}</td>
                  <td className="p-2">{c.taxCode}</td>
                  <td className="p-2 text-right font-semibold text-red-600">{c.remainingAmount}</td>
                  <td className="p-2"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">Qua han</span></td>
                  <td className="p-2">
                    <button className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs hover:bg-blue-100">Thu tien</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
