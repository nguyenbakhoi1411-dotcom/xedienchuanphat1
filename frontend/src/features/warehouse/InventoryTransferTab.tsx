"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Plus, RefreshCw, Send, X } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/token";
import { serialsApi } from "@/features/serials/api";
import type { ProductSerial } from "@/features/serials/types";
import { inventoryTransferApi } from "./transfer-api";
import type { InventoryTransfer, InventoryTransferStatus } from "./transfer-api";
import type { InventoryStock, Warehouse } from "./types";

const statusLabels: Record<InventoryTransferStatus, string> = {
  DRAFT: "Nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

const statusStyles: Record<InventoryTransferStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export function InventoryTransferTab() {
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [stocks, setStocks] = useState<InventoryStock[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [serials, setSerials] = useState<ProductSerial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sourceStockId, setSourceStockId] = useState("");
  const [selectedSerialId, setSelectedSerialId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const user = getCurrentUser();
  const canApprove = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
    || user?.permissions.includes("INVENTORY_TRANSFER_APPROVE");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rows, sourceRows, warehouseRows] = await Promise.all([
        inventoryTransferApi.list(), inventoryTransferApi.sources(), inventoryTransferApi.warehouses(),
      ]);
      setTransfers(rows);
      setStocks(sourceRows);
      setWarehouses(warehouseRows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được phiếu chuyển kho");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selectedStock = stocks.find((item) => String(item.id) === sourceStockId);
  const destinations = warehouses.filter((item) => item.id !== selectedStock?.warehouseId && item.status === "ACTIVE");
  const canCreate = Boolean(user?.permissions.includes("INVENTORY_TRANSFER") || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN");

  const pendingCount = useMemo(() => transfers.filter((item) => item.status === "PENDING_APPROVAL").length, [transfers]);

  useEffect(() => {
    setSerials([]);
    if (!selectedStock?.warehouseId) return;
    let active = true;
    void serialsApi.search({
      warehouseId: selectedStock.warehouseId,
      productId: selectedStock.productId,
      status: "IN_STOCK",
      page: 0,
      pageSize: 100,
    }).then((response) => {
      if (active) setSerials(response.items);
    }).catch(() => {
      if (active) setSerials([]);
    });
    return () => { active = false; };
  }, [selectedStock?.id]);

  async function createTransfer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStock || !toWarehouseId || (serials.length > 0 && !selectedSerialId)) return;
    setSubmitting(true);
    setError("");
    try {
      await inventoryTransferApi.createAndSubmit({
        fromBranchId: selectedStock.branchId,
        fromWarehouseId: selectedStock.warehouseId ?? 0,
        toBranchId: Number(warehouses.find((item) => item.id === Number(toWarehouseId))?.branchId),
        toWarehouseId: Number(toWarehouseId),
        productId: selectedStock.productId,
        quantity: serials.length > 0 ? 1 : quantity,
        transactionDate: new Date().toISOString().slice(0, 10),
        note: note.trim() || undefined,
        serialId: serials.length > 0 ? Number(selectedSerialId) : undefined,
      });
      setShowForm(false);
      setSourceStockId("");
      setToWarehouseId("");
      setQuantity(1);
      setNote("");
      setSelectedSerialId("");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tạo được phiếu chuyển");
    } finally {
      setSubmitting(false);
    }
  }

  async function transition(action: () => Promise<unknown>) {
    setError("");
    try { await action(); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không thực hiện được thao tác"); }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Phiếu chuyển kho</h2>
          <p className="mt-1 text-sm text-slate-500">{pendingCount} phiếu đang chờ duyệt</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} aria-label="Làm mới" title="Làm mới" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" />
          </button>
          {canCreate && <button onClick={() => setShowForm((open) => !open)} className="inline-flex h-9 items-center gap-2 rounded-md bg-indigo-700 px-3 text-sm font-medium text-white hover:bg-indigo-600">
            <Plus className="h-4 w-4" /> Tạo phiếu
          </button>}
        </div>
      </div>

      {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {showForm && <form onSubmit={createTransfer} className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-6">
        <label className="text-sm text-slate-700">Hàng tại kho nguồn
          <select required value={sourceStockId} onChange={(event) => { setSourceStockId(event.target.value); setToWarehouseId(""); setSelectedSerialId(""); }} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2">
            <option value="">Chọn mặt hàng</option>
            {stocks.filter((item) => item.availableQuantity > 0 && item.warehouseId).map((item) => <option key={item.id} value={item.id}>{item.warehouseName} · {item.productName} · khả dụng {item.availableQuantity}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-700">Kho nhận
          <select required value={toWarehouseId} onChange={(event) => setToWarehouseId(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2">
            <option value="">Chọn kho nhận</option>
            {destinations.map((item) => <option key={item.id} value={item.id}>{item.warehouseName}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-700">Số lượng
          <input required min={1} max={serials.length > 0 ? 1 : selectedStock?.availableQuantity ?? 1} type="number" value={serials.length > 0 ? 1 : quantity} disabled={serials.length > 0} onChange={(event) => setQuantity(Number(event.target.value))} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2 disabled:bg-slate-100" />
        </label>
        {serials.length > 0 && <label className="text-sm text-slate-700">Serial xe
          <select required value={selectedSerialId} onChange={(event) => setSelectedSerialId(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2">
            <option value="">Chọn serial</option>
            {serials.map((serial) => <option key={serial.id} value={serial.id}>{serial.serialNumber}</option>)}
          </select>
        </label>}
        <label className="text-sm text-slate-700">Ghi chú
          <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2" />
        </label>
        <div className="flex items-end gap-2">
          <button disabled={submitting || !selectedStock || !toWarehouseId || (serials.length > 0 && !selectedSerialId)} className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-indigo-700 px-3 text-sm font-medium text-white disabled:opacity-50">
            <Send className="h-4 w-4" /> {submitting ? "Đang gửi..." : "Gửi duyệt"}
          </button>
          <button type="button" onClick={() => setShowForm(false)} aria-label="Đóng" title="Đóng" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600"><X className="h-4 w-4" /></button>
        </div>
      </form>}

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500"><tr>
            <th className="px-4 py-3">Phiếu</th><th className="px-4 py-3">Từ kho</th><th className="px-4 py-3">Đến kho</th><th className="px-4 py-3">Sản phẩm</th><th className="px-4 py-3 text-right">SL</th><th className="px-4 py-3">Người tạo</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Thao tác</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Đang tải...</td></tr>
              : transfers.length === 0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Chưa có phiếu chuyển kho</td></tr>
              : transfers.map((item) => <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{item.transferNo}<div className="mt-1 text-slate-400">{item.transferDate}</div></td>
                <td className="px-4 py-3">{item.fromWarehouseName}</td>
                <td className="px-4 py-3"><span className="flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5 text-slate-400" />{item.toWarehouseName}</span></td>
                <td className="px-4 py-3">{item.productName}<div className="text-xs text-slate-400">{item.productCode}{item.serialNumber ? ` · ${item.serialNumber}` : ""}</div></td>
                <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
                <td className="px-4 py-3">{item.createdBy ?? "—"}</td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusStyles[item.status]}`}>{statusLabels[item.status]}</span>{item.rejectionReason && <p className="mt-1 max-w-40 text-xs text-rose-700">{item.rejectionReason}</p>}</td>
                <td className="px-4 py-3">
                  {item.status === "PENDING_APPROVAL" && canApprove && item.createdBy !== user?.username ? <div className="flex gap-2">
                    <button onClick={() => void transition(() => inventoryTransferApi.approve(item.id))} title="Duyệt" aria-label="Duyệt" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50"><Check className="h-4 w-4" /></button>
                    <button onClick={() => { setRejectingId(item.id); setRejectReason(""); }} title="Từ chối" aria-label="Từ chối" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-300 text-rose-700 hover:bg-rose-50"><X className="h-4 w-4" /></button>
                  </div> : item.status === "PENDING_APPROVAL" && item.createdBy === user?.username ? <button onClick={() => void transition(() => inventoryTransferApi.cancel(item.id))} className="text-xs font-medium text-slate-600 hover:text-rose-700">Hủy phiếu</button> : <span className="text-xs text-slate-400">—</span>}
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      {rejectingId !== null && <form onSubmit={(event) => { event.preventDefault(); const id = rejectingId; void transition(() => inventoryTransferApi.reject(id, rejectReason)).then(() => setRejectingId(null)); }} className="flex flex-wrap items-end gap-3 rounded-md border border-rose-200 bg-white p-3">
        <label className="min-w-64 flex-1 text-sm text-slate-700">Lý do từ chối<input required maxLength={500} value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-2" /></label>
        <button disabled={!rejectReason.trim()} className="h-9 rounded-md bg-rose-700 px-3 text-sm font-medium text-white disabled:opacity-50">Xác nhận từ chối</button>
        <button type="button" onClick={() => setRejectingId(null)} className="h-9 rounded-md border border-slate-300 px-3 text-sm">Đóng</button>
      </form>}
    </section>
  );
}
