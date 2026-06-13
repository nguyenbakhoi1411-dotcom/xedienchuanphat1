"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PurchaseOrderModal } from "@/features/suppliers/PurchaseOrderModal";
import { SupplierFormModal } from "@/features/suppliers/SupplierFormModal";
import { SupplierTable } from "@/features/suppliers/SupplierTable";
import { useCreatePurchaseOrder, useCreateSupplier, useSoftDeleteSupplier, useSuppliers, useUpdateSupplier } from "@/features/suppliers/hooks";
import type { PurchaseOrderPayload, Supplier, SupplierPayload } from "@/features/suppliers/types";

const pageSize = 10;

export default function SuppliersPage() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [purchaseSupplier, setPurchaseSupplier] = useState<Supplier | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const suppliers = useSuppliers({ keyword, page, pageSize });
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useSoftDeleteSupplier();
  const createPurchaseOrder = useCreatePurchaseOrder();

  async function handleSupplierSubmit(payload: SupplierPayload) {
    if (editingSupplier) {
      await updateSupplier.mutateAsync({ id: editingSupplier.id, payload });
    } else {
      await createSupplier.mutateAsync(payload);
    }
    setFormOpen(false);
    setEditingSupplier(null);
  }

  async function handlePurchaseSubmit(payload: PurchaseOrderPayload) {
    await createPurchaseOrder.mutateAsync(payload);
    setPurchaseSupplier(null);
  }

  async function handleDelete() {
    if (!deletingSupplier) return;
    await deleteSupplier.mutateAsync(deletingSupplier.id);
    setDeletingSupplier(null);
  }

  const data = suppliers.data;

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-text">Nha cung cap</h1>
          <p className="mt-1 text-sm text-slate-500">Quan ly nha cung cap, cong no phai tra va lich su nhap hang.</p>
        </div>
        <Button onClick={() => { setEditingSupplier(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" />
          Them nha cung cap
        </Button>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 shadow-soft md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={keyword}
            onChange={(event) => { setKeyword(event.target.value); setPage(1); }}
            placeholder="Tim theo ma, ten, MST, so dien thoai"
            className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
          />
        </div>
        <p className="text-sm text-slate-500">{data ? `${data.totalItems} nha cung cap` : "Dang tai du lieu"}</p>
      </section>

      <SupplierTable
        suppliers={data?.items ?? []}
        loading={suppliers.isLoading}
        onEdit={(supplier) => { setEditingSupplier(supplier); setFormOpen(true); }}
        onDelete={setDeletingSupplier}
        onPurchase={setPurchaseSupplier}
      />

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Truoc</Button>
          <span className="text-sm text-slate-500">Trang {data.page}/{data.totalPages}</span>
          <Button variant="secondary" disabled={page >= data.totalPages} onClick={() => setPage((current) => current + 1)}>Sau</Button>
        </div>
      )}

      <SupplierFormModal
        open={formOpen}
        supplier={editingSupplier}
        loading={createSupplier.isPending || updateSupplier.isPending}
        onSubmit={handleSupplierSubmit}
        onClose={() => { setFormOpen(false); setEditingSupplier(null); }}
      />

      <PurchaseOrderModal
        open={Boolean(purchaseSupplier)}
        supplier={purchaseSupplier}
        loading={createPurchaseOrder.isPending}
        onSubmit={handlePurchaseSubmit}
        onClose={() => setPurchaseSupplier(null)}
      />

      <ConfirmDialog
        open={Boolean(deletingSupplier)}
        title="Xoa mem nha cung cap"
        description={`Nha cung cap ${deletingSupplier?.name ?? ""} se khong con hien trong danh sach mac dinh.`}
        confirmText="Xoa nha cung cap"
        loading={deleteSupplier.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeletingSupplier(null)}
      />
    </div>
  );
}
