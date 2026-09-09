"use client";

import Image from "next/image";
import { Bike, PackagePlus, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/format";
import type { PosProduct } from "./types";

type ProductGridProps = {
  keyword: string;
  products?: PosProduct[];
  loading: boolean;
  onKeywordChange: (keyword: string) => void;
  onAdd: (product: PosProduct) => void;
};

export function ProductGrid({ keyword, products, loading, onKeywordChange, onAdd }: ProductGridProps) {
  return (
    <section className="flex min-h-0 flex-col rounded-lg border border-border bg-white shadow-soft">
      <div className="border-b border-border p-4">
        <label className="flex h-11 items-center gap-2 rounded-lg border border-border bg-slate-50 px-3 transition focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Tìm nhanh sản phẩm, mã SKU, serial"
            aria-label="Tìm nhanh sản phẩm POS"
            className="w-full border-0 bg-transparent text-sm outline-none"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-48" />)}
          </div>
        ) : !products || products.length === 0 ? (
          <EmptyState title="Không tìm thấy sản phẩm" description="Thử nhập tên hoặc mã sản phẩm khác." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onAdd(product)}
                className="group overflow-hidden rounded-lg border border-border bg-white text-left shadow-sm transition hover:border-primary hover:shadow-soft focus-visible:outline-primary"
              >
                <div className="relative flex h-28 items-center justify-center bg-orange-50">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.productName} fill className="object-cover" sizes="240px" />
                  ) : (
                    <Bike className="h-10 w-10 text-primary" />
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">{product.productName}</p>
                      <p className="mt-1 text-xs text-slate-500">{product.productCode}</p>
                    </div>
                    <PackagePlus className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-primary" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">{formatCurrency(product.salePrice)}</span>
                    <span className="erp-badge border-slate-200 bg-slate-100 text-slate-600">Tồn {product.stockQuantity}</span>
                  </div>
                  {product.pricePolicyName && (
                    <div className="mt-2 rounded-md bg-orange-50 px-2 py-1 text-xs text-primary">
                      {product.listPrice && product.listPrice !== product.salePrice && <span className="mr-2 line-through text-slate-400">{formatCurrency(product.listPrice)}</span>}
                      {product.pricePolicyName}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
