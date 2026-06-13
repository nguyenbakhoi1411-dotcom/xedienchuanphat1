"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProductFilters } from "@/features/products/ProductFilters";
import { ProductFormModal } from "@/features/products/ProductFormModal";
import { ProductTable } from "@/features/products/ProductTable";
import {
  useCreateProduct,
  useProducts,
  useSoftDeleteProduct,
  useUpdateProduct
} from "@/features/products/hooks";
import type { Product, ProductListParams, ProductPayload } from "@/features/products/types";

const initialParams: ProductListParams = {
  keyword: "",
  category: "ALL",
  status: "ALL",
  page: 1,
  pageSize: 8
};

export default function ProductsPage() {
  const [params, setParams] = useState<ProductListParams>(initialParams);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data, isLoading } = useProducts(params);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useSoftDeleteProduct();

  const formLoading = createProduct.isPending || updateProduct.isPending;

  function openCreate() {
    setSelectedProduct(null);
    setModalMode("create");
  }

  function openView(product: Product) {
    setSelectedProduct(product);
    setModalMode("view");
  }

  function openEdit(product: Product) {
    setSelectedProduct(product);
    setModalMode("edit");
  }

  async function handleSubmit(payload: ProductPayload) {
    if (modalMode === "create") {
      await createProduct.mutateAsync(payload);
    }
    if (modalMode === "edit" && selectedProduct) {
      await updateProduct.mutateAsync({ id: selectedProduct.id, payload });
    }
    setModalMode(null);
    setSelectedProduct(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteProduct.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    if (data && params.page > data.totalPages) {
      setParams((current) => ({ ...current, page: Math.max(1, current.page - 1) }));
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-text">Quan ly san pham</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quan ly xe may dien, phu tung, gia ban, bao hanh va serial xe.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Them san pham
        </Button>
      </section>

      <section className="rounded-lg border border-border bg-white shadow-soft">
        <div className="border-b border-border p-4">
          <ProductFilters value={params} onChange={setParams} />
        </div>
        <ProductTable
          data={data}
          params={params}
          loading={isLoading}
          onPageChange={(page) => setParams((current) => ({ ...current, page }))}
          onView={openView}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      </section>

      <ProductFormModal
        open={modalMode !== null}
        mode={modalMode ?? "create"}
        product={selectedProduct}
        loading={formLoading}
        onSubmit={(payload) => void handleSubmit(payload)}
        onClose={() => {
          setModalMode(null);
          setSelectedProduct(null);
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Xoa mem san pham?"
        description={`San pham ${deleteTarget?.productName ?? ""} se duoc chuyen sang trang thai da xoa va khong hien thi trong danh sach.`}
        confirmText="Xoa mem"
        loading={deleteProduct.isPending}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
