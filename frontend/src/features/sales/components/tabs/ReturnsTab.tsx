"use client";
import React, { useState, useEffect, useCallback } from "react";
import { MasterDetailTable } from "../shared/MasterDetailTable";
import { DateRangePreset } from "../shared/DateRangePreset";
import { StatusBadge } from "../shared/StatusBadge";
import { BulkActionBar } from "../shared/BulkActionBar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + " d";
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("vi-VN") : "";

const MASTER_COLS = [
  { key: "returnDate", label: "Ngay tra hang" },
  { key: "returnNo", label: "So chung tu" },
  { key: "customerName", label: "Khach hang" },
  { key: "originalOrderNo", label: "Don hang goc" },
  { key: "returnAmount", label: "Tong tien tra" },
  { key: "refundAmount", label: "Tien hoan lai" },
  { key: "refundMethod", label: "Phuong thuc hoan" },
  { key: "reason", label: "Ly do tra" },
  { key: "statusBadge", label: "Trang thai" },
];

const DETAIL_COLS = [
  { key: "productName", label: "Ten hang" },
  { key: "unit", label: "DVT" },
  { key: "quantity", label: "So luong" },
  { key: "unitPrice", label: "Don gia" },
  { key: "totalPrice", label: "Thanh tien" },
  { key: "vatRate", label: "% GTGT" },
  { key: "vatAmount", label: "Tien GTGT" },
];

export function ReturnsTab() {
  const [masterData, setMasterData] = useState<any[]>([]);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetch_data = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/sales/returns?size=50&search=${search}`);
      if (!res.ok) throw new Error("Loi tai phieu tra hang");
      const data = await res.json();
      setMasterData((data.content ?? data).map((r: any) => ({
        ...r,
        returnDate: fmtDate(r.returnDate),
        returnAmount: fmt(r.returnAmount ?? r.totalAmount ?? 0),
        refundAmount: fmt(r.refundAmount ?? 0),
        originalOrderNo: r.order?.orderNo ?? "",
        statusBadge: <StatusBadge status={r.status} />,
      })));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch_data(); }, [fetch_data]);

  const handleRowClick = async (row: any) => {
    setSelectedRow(row);
    try {
      const res = await fetch(`${API_BASE}/api/sales/returns/${row.id}`);
      const data = await res.json();
      setDetailData((data.items ?? []).map((it: any) => ({
        ...it,
        unitPrice: fmt(it.unitPrice ?? 0),
        totalPrice: fmt(it.totalPrice ?? 0),
        vatRate: `${it.vatRate ?? 0}%`,
        vatAmount: fmt(it.vatAmount ?? 0),
      })));
    } catch { setDetailData([]); }
  };

  return (
    <div className="flex flex-col h-full bg-white p-3 gap-3">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <DateRangePreset />
          <input type="text" placeholder="Tim so CT, khach hang..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-60 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">+ Them phieu tra hang</button>
          <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">Tien ich ▼</button>
        </div>
      </div>
      <BulkActionBar selectedCount={0} onAction={() => {}} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">{error}</div>}
      {loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="flex-1 overflow-hidden rounded border border-gray-200">
          <MasterDetailTable masterColumns={MASTER_COLS} masterData={masterData} onRowClick={handleRowClick}
            selectedRowId={selectedRow?.id} detailColumns={DETAIL_COLS} detailData={detailData}
            detailTitle={`Chi tiet tra hang: ${selectedRow?.returnNo ?? ""}`} />
        </div>
      )}
    </div>
  );
}
