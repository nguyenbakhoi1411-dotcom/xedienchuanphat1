"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { PurchaseOrderPayload, Supplier } from "./types";

type PurchaseOrderModalProps = {
  open: boolean;
  supplier: Supplier | null;
  loading?: boolean;
  onSubmit: (payload: PurchaseOrderPayload) => void;
  onClose: () => void;
};

const today = new Date().toISOString().slice(0, 10);

export function PurchaseOrderModal({ open, supplier, loading = false, onSubmit, onClose }: PurchaseOrderModalProps) {
  const [branchId, setBranchId] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState(today);
  const [paidAmount, setPaidAmount] = useState(0);
  const [items, setItems] = useState([{ productId: 1, quantity: 1, unitCost: 10000000 }]);

  if (!supplier) return null;

  return (
    <Modal open={open} title={`Tao don nhap - ${supplier.name}`} size="lg" onClose={onClose}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ supplierId: supplier.id, branchId, purchaseDate, paidAmount, items });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-1.5 text-sm font-medium text-slate-600">
            Chi nhanh
            <select value={branchId} onChange={(event) => setBranchId(Number(event.target.value))} className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100">
              <option value={1}>Go Vap</option>
              <option value={2}>Thu Duc</option>
              <option value={3}>Quan 7</option>
              <option value={4}>Tan Binh</option>
              <option value={5}>Binh Duong</option>
              <option value={6}>Dong Nai</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-600">
            Ngay nhap
            <input type="date" value={purchaseDate} onChange={(event) => setPurchaseDate(event.target.value)} className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-600">
            Da thanh toan
            <input type="number" min={0} value={paidAmount} onChange={(event) => setPaidAmount(Number(event.target.value))} className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100" />
          </label>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_120px_160px_40px]">
              <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                Product ID
                <input type="number" min={1} value={item.productId} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, productId: Number(event.target.value) } : row))} className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                So luong
                <input type="number" min={1} value={item.quantity} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, quantity: Number(event.target.value) } : row))} className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-600">
                Gia nhap
                <input type="number" min={0} value={item.unitCost} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, unitCost: Number(event.target.value) } : row))} className="h-10 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100" />
              </label>
              <button type="button" onClick={() => setItems((current) => current.filter((_, rowIndex) => rowIndex !== index))} className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-50" aria-label="Xoa dong">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" onClick={() => setItems((current) => [...current, { productId: 1, quantity: 1, unitCost: 10000000 }])}>
            <Plus className="h-4 w-4" />
            Them dong
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>Huy</Button>
            <Button type="submit" disabled={loading || items.length === 0}>{loading ? "Dang tao" : "Tao don nhap"}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
