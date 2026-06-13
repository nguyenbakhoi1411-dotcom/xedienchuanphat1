"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { ZodTypeAny } from "zod";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { branchOptions, inventoryProductOptions } from "./inventoryOptions";
import {
  exportStockSchema,
  importStockSchema,
  stockCountSchema,
  transferStockSchema
} from "./schemas";
import type {
  ExportStockPayload,
  ImportStockPayload,
  StockCountPayload,
  TransferStockPayload
} from "./types";

export type StockActionType = "import" | "export" | "transfer" | "count";

type StockActionValues = {
  transactionNo: string;
  transactionDate: string;
  branchId: number;
  fromBranchId: number;
  toBranchId: number;
  productId: number;
  quantity: number;
  unitCost: number;
  countedQuantity: number;
  note: string;
};

type StockActionModalProps = {
  open: boolean;
  action: StockActionType;
  loading?: boolean;
  onClose: () => void;
  onImport: (payload: ImportStockPayload) => void;
  onExport: (payload: ExportStockPayload) => void;
  onTransfer: (payload: TransferStockPayload) => void;
  onCount: (payload: StockCountPayload) => void;
};

const actionConfig = {
  import: { title: "Nhap kho", prefix: "NK", schema: importStockSchema },
  export: { title: "Xuat kho", prefix: "XK", schema: exportStockSchema },
  transfer: { title: "Chuyen kho", prefix: "CK", schema: transferStockSchema },
  count: { title: "Kiem kho", prefix: "KK", schema: stockCountSchema }
};

export function StockActionModal({
  open,
  action,
  loading = false,
  onClose,
  onImport,
  onExport,
  onTransfer,
  onCount
}: StockActionModalProps) {
  const config = actionConfig[action];
  const form = useForm<StockActionValues>({
    resolver: zodResolver(config.schema as ZodTypeAny),
    defaultValues: getDefaultValues(config.prefix)
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(config.prefix));
    }
  }, [config.prefix, form, open]);

  function submit(values: StockActionValues) {
    if (action === "import") {
      onImport(toImportPayload(values));
      return;
    }
    if (action === "export") {
      onExport(toExportPayload(values));
      return;
    }
    if (action === "transfer") {
      onTransfer(toTransferPayload(values));
      return;
    }
    onCount(toCountPayload(values));
  }

  return (
    <Modal open={open} title={config.title} description="Tao giao dich kho va cap nhat ton kho theo chi nhanh." size="lg" onClose={onClose}>
      <form className="space-y-5" onSubmit={form.handleSubmit(submit)} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="So phieu" error={form.formState.errors.transactionNo?.message}>
            <input className={inputClass} {...form.register("transactionNo")} />
          </Field>
          <Field label="Ngay giao dich" error={form.formState.errors.transactionDate?.message}>
            <input className={inputClass} type="date" {...form.register("transactionDate")} />
          </Field>
          <Field label="San pham" error={form.formState.errors.productId?.message}>
            <select className={inputClass} {...form.register("productId")}>
              {inventoryProductOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </Field>

          {action === "transfer" ? (
            <>
              <Field label="Kho xuat" error={form.formState.errors.fromBranchId?.message}>
                <BranchSelect register={form.register("fromBranchId")} />
              </Field>
              <Field label="Kho nhan" error={form.formState.errors.toBranchId?.message}>
                <BranchSelect register={form.register("toBranchId")} />
              </Field>
            </>
          ) : (
            <Field label="Chi nhanh" error={form.formState.errors.branchId?.message}>
              <BranchSelect register={form.register("branchId")} />
            </Field>
          )}

          {action === "count" ? (
            <Field label="So luong kiem thuc te" error={form.formState.errors.countedQuantity?.message}>
              <input className={inputClass} type="number" {...form.register("countedQuantity")} />
            </Field>
          ) : (
            <Field label="So luong" error={form.formState.errors.quantity?.message}>
              <input className={inputClass} type="number" {...form.register("quantity")} />
            </Field>
          )}

          {action === "import" && (
            <Field label="Don gia nhap" error={form.formState.errors.unitCost?.message}>
              <input className={inputClass} type="number" {...form.register("unitCost")} />
            </Field>
          )}
        </div>

        <Field label="Ghi chu" error={form.formState.errors.note?.message}>
          <textarea className={`${inputClass} min-h-24 py-2`} {...form.register("note")} />
        </Field>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Huy</Button>
          <Button type="submit" disabled={loading}>{loading ? "Dang luu" : "Luu giao dich"}</Button>
        </div>
      </form>
    </Modal>
  );
}

const inputClass = "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-orange-100";

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function BranchSelect({ register }: { register: UseFormRegisterReturn }) {
  return (
    <select className={inputClass} {...register}>
      {branchOptions.map((item) => (
        <option key={item.value} value={item.value}>{item.label}</option>
      ))}
    </select>
  );
}

function getDefaultValues(prefix: string): StockActionValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    transactionNo: `${prefix}-${Date.now().toString().slice(-6)}`,
    transactionDate: today,
    branchId: 1,
    fromBranchId: 1,
    toBranchId: 2,
    productId: 1,
    quantity: 1,
    unitCost: 0,
    countedQuantity: 0,
    note: ""
  };
}

function toImportPayload(values: StockActionValues): ImportStockPayload {
  return {
    transactionNo: values.transactionNo,
    transactionDate: values.transactionDate,
    branchId: Number(values.branchId),
    productId: Number(values.productId),
    quantity: Number(values.quantity),
    unitCost: Number(values.unitCost),
    note: values.note
  };
}

function toExportPayload(values: StockActionValues): ExportStockPayload {
  return {
    transactionNo: values.transactionNo,
    transactionDate: values.transactionDate,
    branchId: Number(values.branchId),
    productId: Number(values.productId),
    quantity: Number(values.quantity),
    note: values.note
  };
}

function toTransferPayload(values: StockActionValues): TransferStockPayload {
  return {
    transactionNo: values.transactionNo,
    transactionDate: values.transactionDate,
    fromBranchId: Number(values.fromBranchId),
    toBranchId: Number(values.toBranchId),
    productId: Number(values.productId),
    quantity: Number(values.quantity),
    note: values.note
  };
}

function toCountPayload(values: StockActionValues): StockCountPayload {
  return {
    transactionNo: values.transactionNo,
    transactionDate: values.transactionDate,
    branchId: Number(values.branchId),
    productId: Number(values.productId),
    countedQuantity: Number(values.countedQuantity),
    note: values.note
  };
}
