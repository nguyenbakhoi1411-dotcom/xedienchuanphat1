"use client";

import type { ReactNode } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { formatCurrency } from "@/lib/format";
import { getCategoryLabel, getStatusLabel } from "./productOptions";
import type { PageResponse, Product, ProductListParams, ProductStatus } from "./types";

type ProductTableProps = {
  data?: PageResponse<Product>;
  params: ProductListParams;
  loading: boolean;
  onPageChange: (page: number) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

const statusTone: Record<ProductStatus, "green" | "slate" | "amber" | "red"> = {
  ACTIVE: "green",
  INACTIVE: "slate",
  DISCONTINUED: "amber",
  DELETED: "red"
};

export function ProductTable({
  data,
  params,
  loading,
  onPageChange,
  onView,
  onEdit,
  onDelete
}: ProductTableProps) {
  const user = useCurrentUser();
  const canViewCost = Boolean(user?.permissions.includes("VIEW_COST_PRICE"));

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12" />
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="p-4">
        <EmptyState title="Khong co san pham" description="Thu thay doi bo loc hoac them san pham moi." />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="erp-table min-w-[1120px]">
          <thead>
            <tr>
              <th className="px-4 py-3 font-semibold">San pham</th>
              <th className="px-4 py-3 font-semibold">Loai</th>
              <th className="px-4 py-3 font-semibold">Thuong hieu</th>
              <th className="px-4 py-3 font-semibold">Thong so</th>
              {canViewCost && <th className="px-4 py-3 text-right font-semibold">Gia nhap</th>}
              <th className="px-4 py-3 text-right font-semibold">Gia ban</th>
              <th className="px-4 py-3 text-center font-semibold">Serial</th>
              <th className="px-4 py-3 font-semibold">Trang thai</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((product) => (
              <tr key={product.id} className="hover:bg-orange-50/60">
                <td className="px-4 py-3">
                  <div className="font-semibold text-text">{product.productName}</div>
                  <div className="mt-1 text-xs text-slate-500">{product.productCode} · {product.model}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{getCategoryLabel(product.category)}</td>
                <td className="px-4 py-3 text-slate-700">{product.brand}</td>
                <td className="px-4 py-3 text-slate-600">
                  <div>{product.color}</div>
                  <div className="mt-1 text-xs text-slate-500">{product.batteryCapacity} · {product.motorPower}</div>
                </td>
                {canViewCost && <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(product.importPrice)}</td>}
                <td className="px-4 py-3 text-right font-semibold text-text">{formatCurrency(product.salePrice)}</td>
                <td className="px-4 py-3 text-center text-slate-700">{product.serials.length}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone[product.status]}>{getStatusLabel(product.status)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconButton label="Xem chi tiet" onClick={() => onView(product)}>
                      <Eye className="h-4 w-4" />
                    </IconButton>
                    <IconButton label="Sua" onClick={() => onEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton label="Xoa mem" danger onClick={() => onDelete(product)}>
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Trang {data.page} / {data.totalPages} · {data.totalItems} san pham
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="h-9 px-3"
            disabled={params.page <= 1}
            onClick={() => onPageChange(params.page - 1)}
          >
            Truoc
          </Button>
          <Button
            variant="secondary"
            className="h-9 px-3"
            disabled={params.page >= data.totalPages}
            onClick={() => onPageChange(params.page + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </>
  );
}

function IconButton({
  label,
  danger,
  children,
  onClick
}: {
  label: string;
  danger?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        danger ? "text-red-600 hover:bg-red-50" : "text-slate-500 hover:bg-orange-50 hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}
