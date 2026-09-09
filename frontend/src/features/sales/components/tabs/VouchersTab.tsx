"use client";
import React, { useState, useEffect, useCallback } from "react";
import { MasterDetailTable } from "../shared/MasterDetailTable";
import { BulkActionBar } from "../shared/BulkActionBar";
import { DateRangePreset } from "../shared/DateRangePreset";
import { StatusBadge } from "../shared/StatusBadge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + " d";
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("vi-VN") : "";

const MASTER_COLS = [
  { key: "voucherDate", label: "Ngay hach toan" },
  { key: "voucherNo", label: "So chung tu" },
  { key: "voucherType", label: "Loai" },
  { key: "customerName", label: "Khach hang" },
  { key: "salespersonName", label: "NV ban hang" },
  { key: "description", label: "Dien giai" },
  { key: "totalAmount", label: "Tong tien" },
  { key: "recordStatus", label: "TT ghi so" },
  { key: "invoiceStatus", label: "TT phat hanh HD" },
];

const DETAIL_COLS = [
  { key: "productCode", label: "Ma hang" },
  { key: "productName", label: "Ten hang" },
  { key: "warehouseName", label: "Kho" },
  { key: "accountReceivable", label: "TK tien" },
  { key: "revenueAccount", label: "TK doanh thu" },
  { key: "unit", label: "DVT" },
  { key: "quantity", label: "So luong" },
  { key: "unitPrice", label: "Don gia sau thue" },
  { key: "discountRate", label: "% CK" },
  { key: "discountAmount", label: "Tien CK" },
  { key: "vatRate", label: "% GTGT" },
  { key: "vatAmount", label: "Tien GTGT" },
  { key: "totalPrice", label: "Thanh tien" },
];

export function VouchersTab() {
  const [masterData, setMasterData] = useState<any[]>([]);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetch_data = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/sales/module/vouchers?size=50&search=${search}`);
      if (!res.ok) throw new Error("Loi tai chung tu ban hang");
      const data = await res.json();
      setMasterData((data.content ?? data).map((v: any) => ({
        ...v,
        voucherDate: fmtDate(v.voucherDate ?? v.accountingDate),
        customerName: v.customer?.fullName ?? v.customerName ?? "",
        salespersonName: v.salesperson ?? v.salespersonName ?? "",
        totalAmount: fmt(v.totalPayment ?? v.totalAmount ?? 0),
        recordStatus: <StatusBadge status={v.status ?? "DRAFT"} />,
        invoiceStatus: <StatusBadge status={v.invoiceIssueStatus ?? "NOT_ISSUED"} />,
        voucherType: v.voucherType === "RECEIPT" ? "Phieu thu" : "Ban hang",
      })));
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch_data(); }, [fetch_data]);

  const handleRowClick = async (row: any) => {
    setSelectedRow(row);
    try {
      const res = await fetch(`${API_BASE}/api/sales/module/vouchers/${row.id}`);
      const data = await res.json();
      setDetailData((data.items ?? data.salesVoucherItems ?? []).map((it: any) => ({
        ...it,
        productCode: it.productCode ?? "",
        productName: it.productName ?? "",
        unitPrice: fmt(it.unitPrice ?? 0),
        discountRate: `${it.discountRate ?? 0}%`,
        discountAmount: fmt(it.discountAmount ?? 0),
        vatRate: `${it.vatRate ?? it.taxRate ?? 0}%`,
        vatAmount: fmt(it.vatAmount ?? it.taxAmount ?? 0),
        totalPrice: fmt(it.totalPrice ?? it.amount ?? 0),
        accountReceivable: it.accountReceivable ?? it.debitAccount ?? "131",
        revenueAccount: it.revenueAccount ?? it.creditAccount ?? "511",
      })));
    } catch { setDetailData([]); }
  };

  return (
    <div className="flex flex-col h-full bg-white p-3 gap-3">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <DateRangePreset />
          <input type="text" placeholder="Tim so CT, khach hang..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">+ Them chung tu</button>
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
            detailTitle={`Chi tiet chung tu: ${selectedRow?.voucherNo ?? ""}`} />
        </div>
      )}
    </div>
  );
}
