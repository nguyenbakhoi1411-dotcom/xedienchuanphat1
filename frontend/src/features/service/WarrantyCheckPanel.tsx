"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { warrantyCheckSchema, type WarrantyCheckFormValues } from "./schemas";
import { getComponentTypeLabel } from "./serviceOptions";
import type { WarrantyCheck } from "./types";

export function WarrantyCheckPanel({
  result,
  loading,
  onCheck
}: {
  result?: WarrantyCheck;
  loading: boolean;
  onCheck: (serialNumber: string) => void;
}) {
  const form = useForm<WarrantyCheckFormValues>({
    resolver: zodResolver(warrantyCheckSchema),
    defaultValues: { serialNumber: "" }
  });

  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <h2 className="text-base font-semibold text-text">Kiem tra bao hanh</h2>
      <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={form.handleSubmit((values) => onCheck(values.serialNumber))}>
        <div className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-border px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="w-full border-0 bg-transparent text-sm outline-none" placeholder="Nhap serial xe" {...form.register("serialNumber")} />
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Dang kiem tra" : "Kiem tra"}</Button>
      </form>
      {form.formState.errors.serialNumber && <p className="mt-2 text-xs text-red-600">{form.formState.errors.serialNumber.message}</p>}
      {result && (
        <div className={`mt-3 rounded-lg border p-3 text-sm ${result.valid ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          <p className="font-semibold">{result.valid ? "Con bao hanh" : "Khong con bao hanh"}</p>
          <p className="mt-1">{result.customerName} - {result.serialNumber}</p>
          <p className="mt-1">Hieu luc: {result.startDate} den {result.endDate}</p>
          {result.components && result.components.length > 0 && (
            <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
              {result.components.map((component) => (
                <div key={component.id} className="rounded-md bg-white/70 p-2">
                  <p className="font-medium">{getComponentTypeLabel(component.componentType)}</p>
                  <p className="text-xs">{component.startDate} - {component.endDate}</p>
                  <p className="text-xs">{component.valid ? "Con han" : "Het han"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
