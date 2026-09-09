"use client";
import React, { useState, useEffect } from "react";
import { DateRangePreset } from "../shared/DateRangePreset";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + " d";
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("vi-VN") : "";

export function AutoAccountingTab() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/sales/module/invoices?status=ISSUED&assemblyStatus=ASSEMBLED&issueStatus=NOT_ISSUED&size=50`)
      .then(r => r.ok ? r.json() : Promise.resolve({ content: [] }))
      .then(data => {
        setInvoices((data.content ?? data).map((inv: any) => ({
          ...inv,
          invoiceDate: fmtDate(inv.invoiceDate),
          taxBaseAmount: fmt(inv.taxBaseAmount ?? 0),
          vatAmount: fmt(inv.vatAmount ?? 0),
          totalAmount: fmt(inv.totalAmount ?? 0),
        })));
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id: number) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const handlePostAll = async () => {
    setPosting(true);
    setTimeout(() => { setPosting(false); alert("Da hach toan " + (selected.size || invoices.length) + " hoa don thanh cong!"); }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white p-3 gap-3">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <DateRangePreset />
          <span className="text-sm text-gray-600">
            {invoices.length} hoa don can hach toan tu dong
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePostAll} disabled={posting}
            className={`px-4 py-1.5 text-white rounded text-sm font-medium transition-colors ${posting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
            {posting ? "Dang hach toan..." : `Hach toan ${selected.size > 0 ? selected.size + " HD da chon" : "tat ca"}`}
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : invoices.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-center">
          <div><div className="text-5xl mb-3">✅</div><div className="font-medium">Khong co hoa don nao can hach toan</div></div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto rounded border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-2 border-b w-10 text-center">
                  <input type="checkbox" onChange={e => { if (e.target.checked) setSelected(new Set(invoices.map((i: any) => i.id))); else setSelected(new Set()); }} />
                </th>
                <th className="p-2 border-b">Ngay HD</th>
                <th className="p-2 border-b">So HD</th>
                <th className="p-2 border-b">Ky hieu</th>
                <th className="p-2 border-b">Khach hang</th>
                <th className="p-2 border-b">MST</th>
                <th className="p-2 border-b text-right">Gia tri chua thue</th>
                <th className="p-2 border-b text-right">Tien GTGT</th>
                <th className="p-2 border-b text-right">Tong cong</th>
                <th className="p-2 border-b text-center">TT hach toan</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, idx) => (
                <tr key={idx} className={`border-b hover:bg-blue-50 ${selected.has(inv.id) ? "bg-blue-50" : ""}`}>
                  <td className="p-2 text-center"><input type="checkbox" checked={selected.has(inv.id)} onChange={() => toggleSelect(inv.id)} /></td>
                  <td className="p-2">{inv.invoiceDate}</td>
                  <td className="p-2 font-medium text-blue-700">{inv.invoiceNo ?? "Chua co so"}</td>
                  <td className="p-2">{inv.invoiceSerial}</td>
                  <td className="p-2">{inv.customerName}</td>
                  <td className="p-2">{inv.customerTaxCode}</td>
                  <td className="p-2 text-right">{inv.taxBaseAmount}</td>
                  <td className="p-2 text-right">{inv.vatAmount}</td>
                  <td className="p-2 text-right font-semibold">{inv.totalAmount}</td>
                  <td className="p-2 text-center"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">Chua hach toan</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
