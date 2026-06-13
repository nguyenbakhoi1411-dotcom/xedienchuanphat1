"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeDollarSign, FileText, Layers, ReceiptText, RotateCcw, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import { calculateSubtotal, useCartStore } from "./cartStore";
import { salesApi } from "./api";
import { useInstallments, usePaymentHistory, useQuotations, useSalesOrder, useSalesOrders, useSalesReturns } from "./hooks";
import type { Quotation, SalesOrder } from "./types";
import { DepositPanel } from "./DepositPanel";
import { DiscountApprovalAlert } from "./DiscountApprovalAlert";

type TabKey = "quotations" | "orders" | "payments" | "invoice" | "returns" | "deposits";

type SalesOperationsPanelProps = {
  branchId?: number | null;
  employeeId?: number;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "quotations", label: "Bao gia" },
  { key: "orders", label: "Don hang" },
  { key: "payments", label: "Thanh toan" },
  { key: "invoice", label: "Hoa don" },
  { key: "returns", label: "Doi tra" },
  { key: "deposits", label: "Dat Coc" },
];

export function SalesOperationsPanel({ branchId, employeeId }: SalesOperationsPanelProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("orders");
  const [ordersPage, setOrdersPage] = useState(0);
  const [quotationsPage, setQuotationsPage] = useState(0);
  const [returnsPage, setReturnsPage] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER">("CASH");
  const [financeCompany, setFinanceCompany] = useState("");
  const [loanAmount, setLoanAmount] = useState(0);
  const [invoicePreviewUrl, setInvoicePreviewUrl] = useState<string | null>(null);
  const [returnItemId, setReturnItemId] = useState<number | null>(null);
  const [returnQty, setReturnQty] = useState(1);
  const [refundAmount, setRefundAmount] = useState(0);
  const [returnDisposition, setReturnDisposition] = useState<"RETURNED" | "DAMAGED">("RETURNED");

  const customer = useCartStore((state) => state.customer);
  const items = useCartStore((state) => state.items);
  const payment = useCartStore((state) => state.payment);
  const subtotal = calculateSubtotal(items);

  const orders = useSalesOrders(branchId ?? undefined, ordersPage, 10);
  const quotations = useQuotations(branchId ?? undefined, quotationsPage, 10);
  const returns = useSalesReturns(branchId ?? undefined, returnsPage, 10);

  const selectedOrderSummary = useMemo(() => {
    const list = orders.data?.items ?? [];
    return list.find((order) => order.id === selectedOrderId) ?? list[0] ?? null;
  }, [orders.data, selectedOrderId]);
  const selectedOrderDetail = useSalesOrder(selectedOrderSummary?.id);
  const selectedOrder = selectedOrderDetail.data ?? selectedOrderSummary;

  const paymentHistory = usePaymentHistory(selectedOrder?.id);
  const installments = useInstallments(selectedOrder?.id);

  async function refreshSales() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["sales"] }),
      queryClient.invalidateQueries({ queryKey: ["pos", "products"] })
    ]);
  }

  async function createQuotationFromCart() {
    if (!branchId || !employeeId || !customer || items.length === 0) {
      toast.error("Can chon khach hang, chi nhanh va san pham truoc khi tao bao gia");
      return;
    }
    const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const quotation = await salesApi.createQuotation({
      branchId,
      employeeId,
      customer,
      items,
      payment,
      subtotal,
      totalAmount: Math.max(0, subtotal - payment.discountAmount),
      paidAmount: 0,
      paymentStatus: "UNPAID",
      validUntil,
      note: "Bao gia tao tu POS"
    });
    toast.success(`Da tao bao gia ${quotation.quotationNo}`);
    await refreshSales();
  }

  async function convertQuotation(quotation: Quotation) {
    if (!employeeId) {
      toast.error("Khong xac dinh duoc nhan vien ban hang");
      return;
    }
    const order = await salesApi.convertQuotation(quotation.id, employeeId);
    setSelectedOrderId(order.id);
    setActiveTab("orders");
    toast.success(`Da chuyen thanh don ${order.orderNo}`);
    await refreshSales();
  }

  async function runOrderAction(action: "confirm" | "deliver" | "release") {
    if (action === "release") {
      const result = await salesApi.releaseExpiredReservations();
      toast.success(`Da release ${result.released} serial qua han`);
      await refreshSales();
      return;
    }
    if (!selectedOrder) return;
    if (action === "confirm") await salesApi.confirmOrder(selectedOrder.id);
    if (action === "deliver") await salesApi.deliverOrder(selectedOrder.id);
    toast.success("Da cap nhat don hang");
    await refreshSales();
  }

  async function addPayment() {
    if (!selectedOrder || paymentAmount <= 0) {
      toast.error("Chon don hang va nhap so tien thanh toan");
      return;
    }
    await salesApi.addPayment(selectedOrder.id, {
      paymentMethod,
      amount: paymentAmount,
      paymentDate: new Date().toISOString().slice(0, 10),
      note: "Thu tien tu man hinh Sales"
    });
    setPaymentAmount(0);
    toast.success("Da ghi nhan thanh toan");
    await refreshSales();
    await queryClient.invalidateQueries({ queryKey: ["sales", "payments", selectedOrder.id] });
  }

  async function createInstallment() {
    if (!selectedOrder || !financeCompany || loanAmount <= 0) {
      toast.error("Nhap cong ty tai chinh va so tien vay");
      return;
    }
    await salesApi.createInstallment(selectedOrder.id, {
      financeCompany,
      downPaymentAmount: selectedOrder.paidAmount,
      loanAmount,
      termMonths: 12,
      interestRate: 0
    });
    setFinanceCompany("");
    setLoanAmount(0);
    toast.success("Da tao ho so tra gop");
    await queryClient.invalidateQueries({ queryKey: ["sales", "installments", selectedOrder.id] });
  }

  async function previewInvoice() {
    if (!selectedOrder) return;
    const invoice = await salesApi.createInvoiceForOrder(selectedOrder.id);
    const blob = await salesApi.invoicePdfBlob(invoice.id);
    if (invoicePreviewUrl) URL.revokeObjectURL(invoicePreviewUrl);
    setInvoicePreviewUrl(URL.createObjectURL(blob));
    toast.success(`Da tao hoa don ${invoice.invoiceNo}`);
  }

  async function createReturn() {
    if (!selectedOrder || !returnItemId || refundAmount < 0) {
      toast.error("Chon don hang, dong hang va so tien hoan");
      return;
    }
    await salesApi.createReturn({
      orderId: selectedOrder.id,
      refundAmount,
      refundMethod: "CASH",
      reason: "Doi tra tai quay",
      items: [{ orderItemId: returnItemId, quantity: returnQty, serialDisposition: returnDisposition }]
    });
    setRefundAmount(0);
    toast.success("Da tao phieu doi tra");
    await refreshSales();
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text">Quan ly Sales/POS</h2>
          <p className="mt-1 text-sm text-slate-500">Bao gia, giu hang, thanh toan nhieu lan, tra gop, hoa don va doi tra.</p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-white p-1 shadow-soft">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`h-9 rounded-md px-3 text-sm font-medium ${activeTab === tab.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "quotations" && (
        <Panel icon={<FileText className="h-5 w-5" />} title="Bao gia">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button onClick={createQuotationFromCart}>
              <FileText className="h-4 w-4" />
              Tao bao gia tu gio
            </Button>
          </div>
          <SimpleTable
            empty="Chua co bao gia"
            rows={(quotations.data?.items ?? []).map((quotation) => ({
              id: quotation.id,
              cells: [quotation.quotationNo, quotation.status, quotation.validUntil, formatCurrency(quotation.totalAmount)],
              action: <Button variant="secondary" onClick={() => convertQuotation(quotation)}>Chuyen don</Button>
            }))}
            headers={["So bao gia", "Trang thai", "Hieu luc den", "Tong tien", ""]}
          />
          <TablePager page={quotationsPage} totalPages={quotations.data?.totalPages ?? 0} onPageChange={setQuotationsPage} />
        </Panel>
      )}

      {activeTab === "orders" && (
        <Panel icon={<Truck className="h-5 w-5" />} title="Don ban hang">
          <OrderPicker orders={orders.data?.items ?? []} selectedOrderId={selectedOrder?.id ?? null} onSelect={setSelectedOrderId} />
          <TablePager page={ordersPage} totalPages={orders.data?.totalPages ?? 0} onPageChange={setOrdersPage} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => runOrderAction("confirm")} disabled={!selectedOrder}>Xac nhan</Button>
            <Button variant="secondary" onClick={() => runOrderAction("deliver")} disabled={!selectedOrder}>Giao hang</Button>
            <Button variant="secondary" onClick={() => runOrderAction("release")}>Release qua han</Button>
          </div>
        </Panel>
      )}

      {activeTab === "payments" && (
        <Panel icon={<BadgeDollarSign className="h-5 w-5" />} title="Thanh toan va tra gop">
          <OrderSummary order={selectedOrder} />
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <p className="text-sm font-semibold text-text">Thu them</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_150px_auto]">
                <input className={inputClass} type="number" value={paymentAmount} onChange={(event) => setPaymentAmount(Number(event.target.value))} />
                <select className={inputClass} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "CASH" | "BANK_TRANSFER")}>
                  <option value="CASH">Tien mat</option>
                  <option value="BANK_TRANSFER">Chuyen khoan</option>
                </select>
                <Button onClick={addPayment}>Ghi nhan</Button>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {(paymentHistory.data ?? []).map((item) => (
                  <div key={item.id} className="flex justify-between gap-3">
                    <span>{item.paymentDate} - {item.paymentMethod}</span>
                    <strong className="text-text">{formatCurrency(item.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-sm font-semibold text-text">Ho so tra gop</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                <input className={inputClass} value={financeCompany} onChange={(event) => setFinanceCompany(event.target.value)} placeholder="Cong ty tai chinh" />
                <input className={inputClass} type="number" value={loanAmount} onChange={(event) => setLoanAmount(Number(event.target.value))} />
                <Button onClick={createInstallment}>Tao ho so</Button>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {(installments.data ?? []).map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 p-2">
                    <span>{item.applicationNo} - {item.financeCompany} - {item.status}</span>
                    {item.status !== "DISBURSED" && (
                      <Button variant="secondary" onClick={() => salesApi.disburseInstallment(item.id, item.loanAmount).then(refreshSales)}>
                        Giai ngan
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      )}

      {activeTab === "invoice" && (
        <Panel icon={<ReceiptText className="h-5 w-5" />} title="Hoa don PDF">
          <OrderSummary order={selectedOrder} />
          <div className="mt-3">
            <Button onClick={previewInvoice} disabled={!selectedOrder}>
              <ReceiptText className="h-4 w-4" />
              Tao va xem PDF
            </Button>
          </div>
          {invoicePreviewUrl && <iframe src={invoicePreviewUrl} className="mt-4 h-[520px] w-full rounded-lg border border-border" title="Invoice PDF preview" />}
        </Panel>
      )}

      {activeTab === "returns" && (
        <Panel icon={<RotateCcw className="h-5 w-5" />} title="Doi tra hang">
          <OrderSummary order={selectedOrder} />
          <div className="mt-4 grid gap-2 lg:grid-cols-[1.4fr_110px_150px_150px_auto]">
            <select className={inputClass} value={returnItemId ?? ""} onChange={(event) => setReturnItemId(Number(event.target.value))}>
              <option value="">Chon dong hang</option>
              {selectedOrder?.items?.map((item) => (
                <option key={item.id} value={item.id}>{item.productName} - con {item.quantity - item.returnedQuantity}</option>
              ))}
            </select>
            <input className={inputClass} type="number" value={returnQty} onChange={(event) => setReturnQty(Number(event.target.value))} />
            <input className={inputClass} type="number" value={refundAmount} onChange={(event) => setRefundAmount(Number(event.target.value))} />
            <select className={inputClass} value={returnDisposition} onChange={(event) => setReturnDisposition(event.target.value as "RETURNED" | "DAMAGED")}>
              <option value="RETURNED">RETURNED</option>
              <option value="DAMAGED">DAMAGED</option>
            </select>
            <Button onClick={createReturn}>Tao phieu</Button>
          </div>
          <SimpleTable
            empty="Chua co phieu doi tra"
            headers={["So phieu", "Don hang", "Trang thai", "Hoan tien"]}
            rows={(returns.data?.items ?? []).map((item) => ({
              id: item.id,
              cells: [item.returnNo, item.orderNo, item.status, formatCurrency(item.refundAmount)]
            }))}
          />
          <TablePager page={returnsPage} totalPages={returns.data?.totalPages ?? 0} onPageChange={setReturnsPage} />
        </Panel>
      )}

      {activeTab === "deposits" && (
        <Panel icon={<Layers className="h-5 w-5" />} title="Dat coc xe">
          <DepositPanel branchId={branchId ?? undefined} />
        </Panel>
      )}

      {/* Discount Approval Alert — hien thi o bat ky tab nao khi co don cho duyet */}
      {selectedOrder?.status === "WAITING_DISCOUNT_APPROVAL" && (
        <DiscountApprovalAlert order={selectedOrder} onUpdated={() => queryClient.invalidateQueries({ queryKey: ["sales"] })} />
      )}
    </section>
  );
}

function TablePager({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-3 flex items-center justify-end gap-2 text-sm text-slate-500">
      <Button variant="secondary" disabled={page <= 0} onClick={() => onPageChange(Math.max(page - 1, 0))}>
        Truoc
      </Button>
      <span>
        Trang {page + 1}/{totalPages}
      </span>
      <Button variant="secondary" disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>
        Sau
      </Button>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2 text-text">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">{icon}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function OrderPicker({ orders, selectedOrderId, onSelect }: { orders: SalesOrder[]; selectedOrderId: number | null; onSelect: (id: number) => void }) {
  return (
    <SimpleTable
      empty="Chua co don hang"
      headers={["So don", "Trang thai", "Thanh toan", "Con lai", "Giu den"]}
      rows={orders.map((order) => ({
        id: order.id,
        selected: order.id === selectedOrderId,
        cells: [order.orderNo, order.status, order.paymentStatus, formatCurrency(order.amountDue), order.reservationUntil ? new Date(order.reservationUntil).toLocaleString("vi-VN") : "-"],
        onClick: () => onSelect(order.id)
      }))}
    />
  );
}

function OrderSummary({ order }: { order: SalesOrder | null }) {
  if (!order) return <p className="text-sm text-slate-500">Chua chon don hang.</p>;
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-sm space-y-2">
      <div className="grid gap-2 sm:grid-cols-4">
        <SummaryItem label="Don" value={order.orderNo} />
        <SummaryItem label="Trang thai" value={order.status} />
        <SummaryItem label="Tong (chua VAT)" value={formatCurrency(order.subtotal - order.discountAmount)} />
        <SummaryItem label="Con lai" value={formatCurrency(order.amountDue)} />
      </div>
      {order.vatAmount > 0 && (
        <div className="flex items-center gap-3 pt-1 border-t border-slate-200 text-xs text-slate-500">
          <span>Thue VAT ({order.vatRate}%): <strong className="text-slate-700">{formatCurrency(order.vatAmount)}</strong></span>
          <span>Tong co VAT: <strong className="text-emerald-700">{formatCurrency(order.totalAmount)}</strong></span>
        </div>
      )}
      {order.discountApprovalStatus === "PENDING" && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
          <span>⏳</span><span>Đang chờ duyệt giảm giá ({formatCurrency(order.discountAmount)})</span>
        </div>
      )}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-text">{value}</p>
    </div>
  );
}

function SimpleTable({
  headers,
  rows,
  empty
}: {
  headers: string[];
  empty: string;
  rows: Array<{ id: number; cells: Array<string | number>; selected?: boolean; action?: ReactNode; onClick?: () => void }>;
}) {
  if (rows.length === 0) return <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase text-slate-500">
            {headers.map((header) => <th key={header} className="px-3 py-2 font-semibold">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} onClick={row.onClick} className={`border-b border-border last:border-0 ${row.onClick ? "cursor-pointer" : ""} ${row.selected ? "bg-emerald-50" : "hover:bg-slate-50"}`}>
              {row.cells.map((cell, index) => <td key={`${row.id}-${index}`} className="px-3 py-2 text-slate-700">{cell}</td>)}
              {row.action && <td className="px-3 py-2 text-right">{row.action}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const inputClass = "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
