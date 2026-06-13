"use client";

import { Search, Plus, ScanLine, Filter, RefreshCw } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCurrentUser } from "@/lib/auth/token";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { serialsApi } from "@/features/serials/api";
import { SerialDetailModal } from "@/features/serials/SerialDetailModal";
import { SerialStatusBadge } from "@/features/serials/SerialStatusBadge";
import type { ProductSerial, SerialStatus } from "@/features/serials/types";
import { SERIAL_STATUS_LABELS } from "@/features/serials/types";

const STATUS_FILTER_OPTIONS: Array<{ value: SerialStatus | ""; label: string }> = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "IN_STOCK", label: "Có hàng" },
  { value: "RESERVED", label: "Đang giữ" },
  { value: "SOLD", label: "Đã bán" },
  { value: "WARRANTY", label: "Bảo hành" },
  { value: "REPAIRING", label: "Đang sửa" },
  { value: "DEFECTIVE", label: "Bị lỗi" },
  { value: "TRANSFERRED", label: "Đã chuyển kho" },
  { value: "RETURNED", label: "Hoàn trả" },
  { value: "RETURNED_TO_SUPPLIER", label: "Trả NCC" },
];

const VND = (n?: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

export default function SerialsPage() {
  const router = useRouter();
  const currentUser = getCurrentUser();

  const [keyword, setKeyword] = useState("");
  const [branchId, setBranchId] = useState<number | undefined>(currentUser?.branchId ?? undefined);
  const [status, setStatus] = useState<SerialStatus | "">("");
  const [productId, setProductId] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [selectedSerial, setSelectedSerial] = useState<ProductSerial | null>(null);
  const [lookupValue, setLookupValue] = useState("");

  const debouncedKeyword = useDebouncedValue(keyword, 300);

  useEffect(() => {
    if (!currentUser) router.replace("/login");
  }, [currentUser, router]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["serials", debouncedKeyword, branchId, status, productId, page],
    queryFn: () => serialsApi.search({
      keyword: debouncedKeyword || undefined,
      branchId,
      status: (status as SerialStatus) || undefined,
      productId,
      page,
      pageSize: 30,
    }),
  });

  const handleLookup = useCallback(async () => {
    if (!lookupValue.trim()) return;
    try {
      const serial = await serialsApi.lookup(lookupValue.trim());
      setSelectedSerial(serial);
    } catch {
      toast.error("Không tìm thấy serial: " + lookupValue.trim());
    }
  }, [lookupValue]);

  const serials = data?.items ?? [];
  const totalItems = data?.totalItems ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Stats
  const inStockCount = serials.filter((s) => s.status === "IN_STOCK").length;
  const soldCount = serials.filter((s) => s.status === "SOLD").length;
  const defectiveCount = serials.filter((s) => ["DEFECTIVE", "DAMAGED"].includes(s.status)).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Quản lý Serial Xe Điện</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi từng xe theo số khung, số pin, số máy. Lịch sử đầy đủ.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 shadow-soft transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </button>
        </div>
      </section>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Tổng serial" value={totalItems} color="slate" />
        <KpiCard label="Còn hàng" value={inStockCount} color="emerald" />
        <KpiCard label="Đã bán" value={soldCount} color="blue" />
        <KpiCard label="Bị lỗi" value={defectiveCount} color="red" />
      </div>

      {/* Quick Lookup */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-soft">
        <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <ScanLine className="inline mr-1.5 h-3.5 w-3.5" />
          Tra cứu nhanh (số khung / số pin / số máy / serial)
        </p>
        <div className="flex gap-2">
          <input
            value={lookupValue}
            onChange={(e) => setLookupValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            className="erp-input flex-1"
            placeholder="Nhập bất kỳ số định danh..."
          />
          <button
            onClick={handleLookup}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Tra cứu
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-white p-4 shadow-soft">
        <div className="flex flex-1 min-w-48 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
            className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
            placeholder="Tìm serial, số khung, số pin..."
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as SerialStatus | ""); setPage(0); }}
          className="erp-input min-w-40"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {currentUser?.role === "ADMIN" && (
          <select
            value={branchId ?? ""}
            onChange={(e) => { setBranchId(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}
            className="erp-input min-w-44"
          >
            <option value="">Tất cả chi nhánh</option>
            <option value={1}>Chi nhánh Gò Vấp</option>
            <option value={2}>Chi nhánh Thủ Đức</option>
            <option value={3}>Chi nhánh Quận 7</option>
            <option value={4}>Chi nhánh Tân Bình</option>
            <option value={5}>Chi nhánh Bình Dương</option>
            <option value={6}>Chi nhánh Đồng Nai</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Serial / Số khung</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Sản phẩm</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden md:table-cell">Màu / Phiên bản</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden lg:table-cell">Số pin</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden lg:table-cell">Giá vốn</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Trạng thái</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 hidden sm:table-cell">Ngày nhập</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-4 py-3">
                      <div className="h-4 rounded bg-slate-100 w-3/4" />
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && serials.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                    Không có serial nào phù hợp
                  </td>
                </tr>
              )}
              {serials.map((s) => (
                <tr
                  key={s.id}
                  className="group hover:bg-indigo-50/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedSerial(s)}
                >
                  <td className="px-4 py-3">
                    <p className="font-mono font-medium text-slate-800">{s.serialNumber}</p>
                    {s.frameNumber && (
                      <p className="mt-0.5 font-mono text-xs text-slate-500">{s.frameNumber}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{s.productName}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                    {[s.color, s.version].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 hidden lg:table-cell">
                    {s.batterySerial ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">
                    {VND(s.purchaseCost)}
                  </td>
                  <td className="px-4 py-3">
                    <SerialStatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">
                    {s.importDate ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedSerial(s); }}
                      className="rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-500">
              {totalItems.toLocaleString("vi-VN")} kết quả — Trang {page + 1}/{totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSerial && (
        <SerialDetailModal
          serial={selectedSerial}
          onClose={() => setSelectedSerial(null)}
          onUpdated={(updated) => setSelectedSerial(updated)}
        />
      )}
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-xl border border-border p-4 shadow-soft ${colors[color] || colors.slate}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value.toLocaleString("vi-VN")}</p>
    </div>
  );
}
