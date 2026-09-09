"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BranchFormModal } from "@/features/branches/BranchFormModal";
import { BranchTable } from "@/features/branches/BranchTable";
import { useBranches, useCreateBranch, useSoftDeleteBranch, useUpdateBranch } from "@/features/branches/hooks";
import type { Branch, BranchPayload } from "@/features/branches/types";

const pageSize = 10;

export default function BranchesPage() {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const branches = useBranches({ keyword, page, pageSize });
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useSoftDeleteBranch();

  async function handleSubmit(payload: BranchPayload) {
    if (editingBranch) {
      await updateBranch.mutateAsync({ id: editingBranch.id, payload });
    } else {
      await createBranch.mutateAsync(payload);
    }
    setFormOpen(false);
    setEditingBranch(null);
  }

  async function handleDelete() {
    if (!deletingBranch) return;
    await deleteBranch.mutateAsync(deletingBranch.id);
    setDeletingBranch(null);
  }

  const data = branches.data;

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-text">Chi nhanh</h1>
          <p className="mt-1 text-sm text-slate-500">Quan ly danh sach chi nhanh, khu vuc phu trach va trang thai hoat dong.</p>
        </div>
        <Button
          onClick={() => {
            setEditingBranch(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Them chi nhanh
        </Button>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 shadow-soft md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            placeholder="Tim theo ma, ten, dia chi, dien thoai"
            className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
          />
        </div>
        <p className="text-sm text-slate-500">{data ? `${data.totalItems} chi nhanh` : "Đang tải dữ liệu"}</p>
      </section>

      <BranchTable
        branches={data?.items ?? []}
        loading={branches.isLoading}
        onEdit={(branch) => {
          setEditingBranch(branch);
          setFormOpen(true);
        }}
        onDelete={setDeletingBranch}
      />

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Truoc
          </Button>
          <span className="text-sm text-slate-500">
            Trang {data.page}/{data.totalPages}
          </span>
          <Button variant="secondary" disabled={page >= data.totalPages} onClick={() => setPage((current) => current + 1)}>
            Sau
          </Button>
        </div>
      )}

      <BranchFormModal
        open={formOpen}
        branch={editingBranch}
        loading={createBranch.isPending || updateBranch.isPending}
        onSubmit={handleSubmit}
        onClose={() => {
          setFormOpen(false);
          setEditingBranch(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingBranch)}
        title="Xoa mem chi nhanh"
        description={`Chi nhanh ${deletingBranch?.name ?? ""} se bi chuyen sang trang thai da xoa va khong hien trong danh sach mac dinh.`}
        confirmText="Xoa chi nhanh"
        loading={deleteBranch.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeletingBranch(null)}
      />
    </div>
  );
}
