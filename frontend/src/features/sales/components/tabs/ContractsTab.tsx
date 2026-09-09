"use client";
import React, { useState, useEffect, useCallback } from "react";
import { MasterDetailTable } from "../shared/MasterDetailTable";
import { DateRangePreset } from "../shared/DateRangePreset";
import { StatusBadge } from "../shared/StatusBadge";
import { BulkActionBar } from "../shared/BulkActionBar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + " đ";
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("vi-VN") : "";

const MASTER_COLS = [
  { key: "contractNo", label: "Số hợp đồng" },
  { key: "contractDate", label: "Ngày HĐ" },
  { key: "startDate", label: "Từ ngày" },
  { key: "endDate", label: "Đến ngày" },
  { key: "customerName", label: "Khách hàng" },
  { key: "taxCode", label: "MST" },
  { key: "revenue", label: "Doanh số" },
  { key: "invoicedAmount", label: "Đã xuất HĐ" },
  { key: "actualCollected", label: "Thực thu" },
  { key: "remaining", label: "Còn phải thu" },
  { key: "statusBadge", label: "Trạng thái" },
];
const DETAIL_COLS = [
  { key: "productCode", label: "Mã hàng" },
  { key: "productName", label: "Tên hàng" },
  { key: "unit", label: "ĐVT" },
  { key: "requiredQuantity", label: "Số lượng" },
  { key: "unitPrice", label: "Đơn giá" },
  { key: "amount", label: "Thành tiền" },
  { key: "taxRate", label: "% GTGT" },
  { key: "taxAmount", label: "Tiền GTGT" },
];

export function ContractsTab() {
  const [masterData, setMasterData] = useState<any[]>([]);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/sales/contracts?size=50&search=${search}`);
      if (!res.ok) throw new Error("Loi tai hop dong");
      const data = await res.json();
      setMasterData((data.content ?? data).map((c: any) => ({
        ...c,
        contractDate: fmtDate(c.contractDate),
        startDate: fmtDate(c.startDate),
        endDate: fmtDate(c.endDate),
        revenue: fmt(c.revenue ?? c.totalAmount ?? 0),
        invoicedAmount: fmt(c.invoicedAmount ?? 0),
        actualCollected: fmt(c.actualCollected ?? 0),
        remaining: fmt((c.revenue ?? c.totalAmount ?? 0) - (c.actualCollected ?? 0)),
        statusBadge: <StatusBadge status={c.status} />,
      })));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const handleRowClick = async (row: any) => {
    setSelectedRow(row);
    try {
      const res = await fetch(`${API_BASE}/api/sales/contracts/${row.id}`);
      const data = await res.json();
      setDetailData((data.items ?? []).map((it: any) => ({
        ...it,
        unitPrice: fmt(it.unitPrice ?? 0),
        amount: fmt(it.amount ?? 0),
        taxAmount: fmt(it.taxAmount ?? 0),
        taxRate: `${it.taxRate ?? 0}%`,
      })));
    } catch { setDetailData([]); }
  };

  return (
    <div className="flex flex-col h-full bg-white p-3 gap-3">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <DateRangePreset />
          <input type="text" placeholder="Tim hop dong, khach hang..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-60 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">+ Them hop dong</button>
          <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">Tien ich ▼</button>
        </div>
      </div>
      <BulkActionBar selectedCount={0} onAction={() => {}} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">{error}</div>}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden rounded border border-gray-200">
          <MasterDetailTable masterColumns={MASTER_COLS} masterData={masterData} onRowClick={handleRowClick}
            selectedRowId={selectedRow?.id} detailColumns={DETAIL_COLS} detailData={detailData}
            detailTitle={`Chi tiet hop dong: ${selectedRow?.contractNo ?? ""}`} />
        </div>
      )}
    </div>
  );
}
