"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { formatCurrency } from "@/lib/format";
import { productsApi } from "./api";
import { categoryOptions, statusOptions } from "./productOptions";
import { productSchema, type ProductFormValues } from "./schemas";
import type { Product, ProductPayload } from "./types";

type ProductFormModalProps = {
  open: boolean;
  mode: "create" | "edit" | "view";
  product?: Product | null;
  loading?: boolean;
  onSubmit: (payload: ProductPayload) => void;
  onClose: () => void;
};

const defaultValues: ProductFormValues = {
  productCode: "",
  productName: "",
  category: "ELECTRIC_MOTORBIKE",
  brand: "",
  model: "",
  color: "",
  batteryCapacity: "",
  motorPower: "",
  importPrice: 0,
  salePrice: 0,
  warrantyMonths: 12,
  imageUrl: "",
  description: "",
  status: "ACTIVE"
};

export function ProductFormModal({
  open,
  mode,
  product,
  loading = false,
  onSubmit,
  onClose
}: ProductFormModalProps) {
  const readOnly = mode === "view";
  const user = useCurrentUser();
  const canViewCost = Boolean(user?.permissions.includes("VIEW_COST_PRICE"));
  const canEditCost = Boolean(user?.permissions.includes("EDIT_COST_PRICE") || user?.permissions.includes("EDIT_BASE_PRICE"));
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues
  });
  const effectivePriceQuery = useQuery({
    queryKey: ["product-effective-price", product?.id],
    queryFn: () => productsApi.effectivePrice(product!.id),
    enabled: open && readOnly && Boolean(product)
  });
  const priceHistoryQuery = useQuery({
    queryKey: ["product-price-history", product?.id],
    queryFn: () => productsApi.priceHistory(product!.id),
    enabled: open && readOnly && Boolean(product)
  });

  useEffect(() => {
    if (!open) return;
    form.reset(product ? toFormValues(product) : defaultValues);
  }, [form, open, product]);

  function handleSubmit(values: ProductFormValues) {
    onSubmit(values);
  }

  function requestClose() {
    if (!readOnly && form.formState.isDirty && !loading) {
      const confirmed = window.confirm("Form co du lieu chua luu. Ban co chac muon thoat?");
      if (!confirmed) return;
    }
    onClose();
  }

  const title = mode === "create" ? "Them san pham" : mode === "edit" ? "Sua san pham" : "Chi tiet san pham";

  return (
    <Modal
      open={open}
      title={title}
      description="Quan ly thong tin san pham, gia ban, bao hanh va thong so xe."
      size="xl"
      onClose={requestClose}
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <section className="rounded-lg border border-border bg-slate-50/60 p-4">
          <h3 className="text-sm font-semibold text-text">Thong tin san pham</h3>
          <p className="mt-1 text-sm text-slate-500">Cac truong bat buoc can du thong tin de ban hang, bao hanh va kiem kho.</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FormField label="Ma san pham" required error={form.formState.errors.productCode?.message}>
            <input className={inputClass} readOnly={readOnly} {...form.register("productCode")} />
          </FormField>

          <FormField label="Ten san pham" required error={form.formState.errors.productName?.message}>
            <input className={inputClass} readOnly={readOnly} {...form.register("productName")} />
          </FormField>

          <FormField label="Loai san pham" required error={form.formState.errors.category?.message}>
            <select className={inputClass} disabled={readOnly} {...form.register("category")}>
              {categoryOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Thuong hieu" required error={form.formState.errors.brand?.message}>
            <input className={inputClass} readOnly={readOnly} {...form.register("brand")} />
          </FormField>

          <FormField label="Model" required error={form.formState.errors.model?.message}>
            <input className={inputClass} readOnly={readOnly} {...form.register("model")} />
          </FormField>

          <FormField label="Mau sac" error={form.formState.errors.color?.message}>
            <input className={inputClass} readOnly={readOnly} {...form.register("color")} />
          </FormField>

          <FormField label="Dung luong pin" error={form.formState.errors.batteryCapacity?.message}>
            <input className={inputClass} readOnly={readOnly} placeholder="72V 40Ah" {...form.register("batteryCapacity")} />
          </FormField>

          <FormField label="Cong suat dong co" error={form.formState.errors.motorPower?.message}>
            <input className={inputClass} readOnly={readOnly} placeholder="1500W" {...form.register("motorPower")} />
          </FormField>

          <FormField label="Thoi gian bao hanh (thang)" required error={form.formState.errors.warrantyMonths?.message}>
            <input className={inputClass} readOnly={readOnly} type="number" {...form.register("warrantyMonths")} />
          </FormField>

          {canViewCost && (
            <FormField label="Gia nhap" required error={form.formState.errors.importPrice?.message}>
              <input className={inputClass} readOnly={readOnly || !canEditCost} type="number" {...form.register("importPrice")} />
            </FormField>
          )}

          <FormField label="Gia ban" required error={form.formState.errors.salePrice?.message}>
            <input className={inputClass} readOnly={readOnly} type="number" {...form.register("salePrice")} />
          </FormField>

          <FormField label="Trang thai" required error={form.formState.errors.status?.message}>
            <select className={inputClass} disabled={readOnly} {...form.register("status")}>
              {statusOptions.filter((item) => item.value !== "DELETED").map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="URL hinh anh" error={form.formState.errors.imageUrl?.message}>
          <input className={inputClass} readOnly={readOnly} placeholder="https://..." {...form.register("imageUrl")} />
        </FormField>

        <FormField label="Mo ta" error={form.formState.errors.description?.message}>
          <textarea className={`${inputClass} min-h-24 py-2`} readOnly={readOnly} {...form.register("description")} />
        </FormField>

        {readOnly && product && (
          <section className="rounded-lg border border-border">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-text">Gia hien tai va lich su gia</h3>
            </div>
            <div className="grid gap-3 p-4 md:grid-cols-3">
              <PriceMetric label="Gia goc" value={formatCurrency(effectivePriceQuery.data?.listPrice ?? product.salePrice)} />
              <PriceMetric label="Gia ban hien tai" value={formatCurrency(effectivePriceQuery.data?.effectivePrice ?? product.salePrice)} />
              <PriceMetric label="Chinh sach dang ap dung" value={effectivePriceQuery.data?.policyName ?? "Khong co"} />
            </div>
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-background text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Thoi gian</th>
                    <th className="px-4 py-3">Nguon</th>
                    <th className="px-4 py-3 text-right">Gia cu</th>
                    <th className="px-4 py-3 text-right">Gia moi</th>
                    <th className="px-4 py-3">Nguoi doi</th>
                    <th className="px-4 py-3">Ly do</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(priceHistoryQuery.data ?? []).slice(0, 6).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-slate-600">{item.changedAt?.slice(0, 16).replace("T", " ") ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{item.sourceType}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.oldSellingPrice ?? 0)}</td>
                      <td className="px-4 py-3 text-right font-medium text-text">{formatCurrency(item.newSellingPrice ?? 0)}</td>
                      <td className="px-4 py-3 text-slate-600">{item.changedBy ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{item.reason ?? "-"}</td>
                    </tr>
                  ))}
                  {!priceHistoryQuery.isLoading && (priceHistoryQuery.data ?? []).length === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-center text-slate-500" colSpan={6}>Chua co lich su thay doi gia.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {product && product.serials.length > 0 && (
          <section className="rounded-lg border border-border">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-text">Serial xe</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-background text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Serial</th>
                    <th className="px-4 py-3">Trang thai</th>
                    <th className="px-4 py-3">Chi nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {product.serials.map((serial) => (
                    <tr key={serial.id}>
                      <td className="px-4 py-3 font-medium text-text">{serial.serialNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{serial.status}</td>
                      <td className="px-4 py-3 text-slate-600">{serial.branchName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" onClick={requestClose} disabled={loading}>
            {readOnly ? "Dong" : "Huy"}
          </Button>
          {!readOnly && (
            <Button type="submit" disabled={loading}>
              {loading ? "Dang luu" : "Luu san pham"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}

const inputClass = "erp-input";

function PriceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-slate-50 px-3 py-2">
      <div className="text-xs font-medium uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-text">{value}</div>
    </div>
  );
}

function toFormValues(product: Product): ProductFormValues {
  return {
    productCode: product.productCode,
    productName: product.productName,
    category: product.category,
    brand: product.brand,
    model: product.model,
    color: product.color,
    batteryCapacity: product.batteryCapacity,
    motorPower: product.motorPower,
    importPrice: product.importPrice,
    salePrice: product.salePrice,
    warrantyMonths: product.warrantyMonths,
    imageUrl: product.imageUrl,
    description: product.description,
    status: product.status
  };
}
