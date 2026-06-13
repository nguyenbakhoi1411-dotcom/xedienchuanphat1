"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Printer, ReceiptText } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { formatCurrency } from "@/lib/format";
import {
  calculatePaidAmount,
  calculatePaymentStatus,
  calculateSubtotal,
  normalizePaymentForMethod,
  useCartStore
} from "./cartStore";
import { paymentSchema, type PaymentFormValues } from "./schemas";
import { salesApi } from "./api";
import type { CreateInvoicePayload, InvoiceResponse, PaymentMethod } from "./types";

type PaymentFormProps = {
  loading: boolean;
  branchId?: number;
  lastInvoice: InvoiceResponse | null;
  onCreateInvoice: (payload: CreateInvoicePayload) => void;
  onCreateQuotation?: (payload: CreateInvoicePayload) => void;
  onPrint: () => void;
};

export function PaymentForm({ loading, branchId, lastInvoice, onCreateInvoice, onCreateQuotation, onPrint }: PaymentFormProps) {
  const customer = useCartStore((state) => state.customer);
  const items = useCartStore((state) => state.items);
  const payment = useCartStore((state) => state.payment);
  const setPayment = useCartStore((state) => state.setPayment);
  const subtotal = calculateSubtotal(items);
  const total = Math.max(0, subtotal - payment.discountAmount);
  const paid = calculatePaidAmount(payment);
  const status = calculatePaymentStatus(total, payment);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: payment
  });

  useEffect(() => {
    form.reset(payment);
  }, [form, payment]);

  function changeMethod(method: PaymentMethod) {
    setPayment(normalizePaymentForMethod(payment, method, total));
  }

  async function applyVoucher() {
    const voucherCode = form.getValues("voucherCode").trim().toUpperCase();
    if (!voucherCode) return;
    if (!branchId) {
      toast.error("Vui long chon chi nhanh truoc khi ap dung voucher");
      return;
    }
    try {
      const preview = await salesApi.previewVoucher({
        voucherCode,
        branchId,
        subtotal,
        productIds: items.map((item) => item.productId)
      });
      const discountAmount = Math.round(preview.discountAmount);
      form.setValue("discountAmount", discountAmount);
      setPayment({ voucherCode, discountAmount });
      toast.success("Da ap dung voucher");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ma voucher khong hop le");
    }
  }

  function submit(values: PaymentFormValues) {
    setPayment(values);
    if (!customer) {
      form.setError("method", { message: "Vui long chon khach hang" });
      return;
    }
    if (items.some((item) => item.category === "ELECTRIC_MOTORBIKE" && item.selectedSerials.length !== item.quantity)) {
      form.setError("method", { message: "Vui long chon du serial xe" });
      return;
    }
    const normalizedTotal = Math.max(0, subtotal - values.discountAmount);
    const normalizedPaid = calculatePaidAmount(values);
    onCreateInvoice({
      customer,
      items,
      payment: values,
      subtotal,
      totalAmount: normalizedTotal,
      paidAmount: normalizedPaid,
      paymentStatus: calculatePaymentStatus(normalizedTotal, values)
    });
  }

  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-text">Thanh toan</h2>
        <Badge tone={status === "PAID" ? "green" : status === "PARTIAL" ? "amber" : "orange"}>{statusLabel(status)}</Badge>
      </div>

      <form className="mt-4 space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
        <div className="grid grid-cols-2 gap-2">
          {(["CASH", "BANK_TRANSFER", "INSTALLMENT", "MIXED"] as PaymentMethod[]).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => changeMethod(method)}
              className={`h-10 rounded-lg border px-3 text-sm font-medium ${
                payment.method === method ? "border-primary bg-orange-50 text-primary" : "border-border text-slate-600"
              }`}
            >
              {methodLabel(method)}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Ma voucher">
            <div className="flex gap-2">
              <input className={inputClass} {...form.register("voucherCode")} onBlur={(event) => setPayment({ voucherCode: event.target.value })} />
              <Button
                variant="secondary"
                type="button"
                onClick={applyVoucher}
                className="shrink-0 px-3"
              >
                Ap dung
              </Button>
            </div>
          </FormField>
          <FormField label="Giam gia">
            <input className={inputClass} type="number" {...form.register("discountAmount")} onBlur={(event) => setPayment({ discountAmount: Number(event.target.value) })} />
          </FormField>
          {(payment.method === "CASH" || payment.method === "MIXED") && (
            <FormField label="Tien mat">
              <input className={inputClass} type="number" {...form.register("cashAmount")} onBlur={(event) => setPayment({ cashAmount: Number(event.target.value) })} />
            </FormField>
          )}
          {(payment.method === "BANK_TRANSFER" || payment.method === "MIXED") && (
            <FormField label="Chuyen khoan">
              <input className={inputClass} type="number" {...form.register("bankAmount")} onBlur={(event) => setPayment({ bankAmount: Number(event.target.value) })} />
            </FormField>
          )}
          {payment.method === "INSTALLMENT" && (
            <FormField label="Gia tri tra gop">
              <input className={inputClass} type="number" {...form.register("installmentAmount")} onBlur={(event) => setPayment({ installmentAmount: Number(event.target.value) })} />
            </FormField>
          )}
        </div>

        {form.formState.errors.method?.message && (
          <p className="text-sm text-red-600">{form.formState.errors.method.message}</p>
        )}

        <div className="space-y-2 rounded-lg border border-orange-200 bg-orange-50/40 p-3 text-sm">
          <Row label="Tam tinh" value={formatCurrency(subtotal)} />
          <Row label="Giam gia" value={`-${formatCurrency(payment.discountAmount)}`} />
          <Row label="Da thanh toan" value={formatCurrency(paid)} />
          <Row label="Con lai" value={formatCurrency(Math.max(0, total - paid))} />
          <div className="border-t border-border pt-2">
            <Row label="Tong tien" value={formatCurrency(total)} strong />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" type="submit" disabled={loading || items.length === 0}>
            <ReceiptText className="h-4 w-4" />
            {loading ? "Dang tao hoa don" : "Tao hoa don"}
          </Button>
          <Button
            variant="secondary"
            type="button"
            disabled={loading || items.length === 0 || !onCreateQuotation}
            onClick={form.handleSubmit((values) => {
              setPayment(values);
              if (!customer) {
                form.setError("method", { message: "Vui long chon khach hang" });
                return;
              }
              const normalizedTotal = Math.max(0, subtotal - values.discountAmount);
              onCreateQuotation?.({
                customer,
                items,
                payment: values,
                subtotal,
                totalAmount: normalizedTotal,
                paidAmount: calculatePaidAmount(values),
                paymentStatus: calculatePaymentStatus(normalizedTotal, values)
              });
            })}
          >
            Bao gia
          </Button>
          <Button variant="secondary" type="button" onClick={onPrint} disabled={!lastInvoice}>
            <Printer className="h-4 w-4" />
            In
          </Button>
        </div>

        {lastInvoice && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Hoa don {lastInvoice.invoiceNo} - {statusLabel(lastInvoice.paymentStatus)}
          </div>
        )}
      </form>
    </section>
  );
}

const inputClass = "erp-input";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? "text-base font-semibold text-text" : "text-slate-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function methodLabel(method: PaymentMethod) {
  return {
    CASH: "Tien mat",
    BANK_TRANSFER: "Chuyen khoan",
    INSTALLMENT: "Tra gop",
    MIXED: "Ket hop"
  }[method];
}

function statusLabel(status: string) {
  return {
    UNPAID: "Chua thanh toan",
    PARTIAL: "Thanh toan mot phan",
    PAID: "Da thanh toan"
  }[status] ?? status;
}
