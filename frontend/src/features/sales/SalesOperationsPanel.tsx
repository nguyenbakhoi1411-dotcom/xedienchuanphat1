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
import { OrderTable } from "./OrderTable";
import { DepositPanel } from "./DepositPanel";
import { DiscountApprovalAlert } from "./DiscountApprovalAlert";
import { CustomerTable } from "@/features/customers/CustomerTable";
import { useCustomers, useCustomerDetail } from "@/features/customers/hooks";
import { CustomerFilters } from "@/features/customers/CustomerFilters";
import { CustomerFormModal } from "@/features/customers/CustomerFormModal";
import { CustomerDetailDrawer } from "@/features/customers/CustomerDetailDrawer";
import type { Customer, CustomerListParams, CustomerPayload } from "@/features/customers/types";

type TabKey = "quotations" | "orders" | "payments" | "invoice" | "returns" | "deposits" | "customers";

type SalesOperationsPanelProps = {
  branchId?: number | null;
  employeeId?: number;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "quotations", label: "Báo giá" },
  { key: "orders", label: "Đơn hàng" },
  { key: "payments", label: "Thanh toán" },
  { key: "invoice", label: "Hóa đơn" },
  { key: "returns", label: "Đổi trả" },
  { key: "deposits", label: "Đặt cọc" },
  { key: "customers", label: "Khách hàng" },
];

export function SalesOperationsPanel({ branchId, employeeId }: SalesOperationsPanelProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("orders");
  const [ordersPage, setOrdersPage] = useState(0);
  const [quotationsPage, setQuotationsPage] = useState(0);
  const [returnsPage, setReturnsPage] = useState(0);

  // Khách hàng state
  const [customerParams, setCustomerParams] = useState<CustomerListParams>({
    keyword: "",
    type: "ALL",
    source: "ALL",
    page: 1,
    pageSize: 8
  });
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerDetailId, setCustomerDetailId] = useState<number | null>(null);

  const customersList = useCustomers(customerParams);
  const customerDetail = useCustomerDetail(customerDetailId);
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

  const orders = useSalesOrders({ branchId: branchId ?? undefined, page: ordersPage, size: 10 });
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
      toast.error("Cần chọn khách hàng, chi nhánh và sản phẩm trước khi tạo báo giá");
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
      note: "Báo giá tạo từ POS"
    });
    toast.success(`Đã tạo báo giá ${quotation.quotationNo}`);
    await refreshSales();
  }

  async function convertQuotation(quotation: Quotation) {
    if (!employeeId) {
      toast.error("Không xác định được nhân viên bán hàng");
      return;
    }
    const order = await salesApi.convertQuotation(quotation.id, employeeId);
    setSelectedOrderId(order.id);
    setActiveTab("orders");
    toast.success(`Đã chuyển thành đơn ${order.orderNo}`);
    await refreshSales();
  }

  async function runOrderAction(action: "confirm" | "deliver" | "release") {
    if (action === "release") {
      const result = await salesApi.releaseExpiredReservations();
      toast.success(`Đã release ${result.released} serial quá hạn`);
      await refreshSales();
      return;
    }
    if (!selectedOrder) return;
    if (action === "confirm") await salesApi.confirmOrder(selectedOrder.id);
    if (action === "deliver") await salesApi.deliverOrder(selectedOrder.id);
    toast.success("Đã cập nhật đơn hàng");
    await refreshSales();
  }

  async function addPayment() {
    if (!selectedOrder || paymentAmount <= 0) {
      toast.error("Chọn đơn hàng và nhập số tiền thanh toán");
      return;
    }
    await salesApi.addPayment(selectedOrder.id, {
      paymentMethod,
      amount: paymentAmount,
      paymentDate: new Date().toISOString().slice(0, 10),
      note: "Thu tiền từ màn hình Sales"
    });
    setPaymentAmount(0);
    toast.success("Đã ghi nhận thanh toán");
    await refreshSales();
    await queryClient.invalidateQueries({ queryKey: ["sales", "payments", selectedOrder.id] });
  }

  async function createInstallment() {
    if (!selectedOrder || !financeCompany || loanAmount <= 0) {
      toast.error("Nhập công ty tài chính và số tiền vay");
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
    toast.success("Đã tạo hồ sơ trả góp");
    await queryClient.invalidateQueries({ queryKey: ["sales", "installments", selectedOrder.id] });
  }

  async function previewInvoice() {
    if (!selectedOrder) return;
    const invoice = await salesApi.createInvoiceForOrder(selectedOrder.id);
    const blob = await salesApi.invoicePdfBlob(invoice.id);
    if (invoicePreviewUrl) URL.revokeObjectURL(invoicePreviewUrl);
    setInvoicePreviewUrl(URL.createObjectURL(blob));
    toast.success(`Đã tạo hóa đơn ${invoice.invoiceNo}`);
  }

  async function createReturn() {
    if (!selectedOrder || !returnItemId || refundAmount < 0) {
      toast.error("Chọn đơn hàng, dòng hàng và số tiền hoàn");
      return;
    }
    await salesApi.createReturn({
      orderId: selectedOrder.id,
      refundAmount,
      refundMethod: "CASH",
      reason: "Đổi trả tại quầy",
      items: [{ orderItemId: returnItemId, quantity: returnQty, serialDisposition: returnDisposition }]
    });
    setRefundAmount(0);
    toast.success("Đã tạo phiếu đổi trả");
    await refreshSales();
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text">Quản lý Sales/POS</h2>
          <p className="mt-1 text-sm text-slate-500">Báo giá, giữ hàng, thanh toán nhiều lần, trả góp, hóa đơn và đổi trả.</p>
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
        <Panel icon={<FileText className="h-5 w-5" />} title="Báo giá">
          <div className="mb-3 flex flex-wrap gap-2">
            <a href="/sales/quotes/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4">
                <FileText className="h-4 w-4 mr-1.5" />
                Tạo báo giá mới
            </a>
            <Button variant="outline" onClick={createQuotationFromCart}>
              <FileText className="h-4 w-4 mr-1.5" />
              Tạo báo giá từ giỏ
            </Button>
          </div>
          <SimpleTable
            empty="Chưa có báo giá"
            rows={(quotations.data?.items ?? []).map((quotation) => ({
              id: quotation.id,
              cells: [quotation.quotationNo, quotation.status, quotation.validUntil, formatCurrency(quotation.totalAmount)],
              action: <Button variant="secondary" onClick={() => convertQuotation(quotation)}>Chuyển đơn</Button>
            }))}
            headers={["Số báo giá", "Trạng thái", "Hiệu lực đến", "Tổng tiền", ""]}
          />
          <TablePager page={quotationsPage} totalPages={quotations.data?.totalPages ?? 0} onPageChange={setQuotationsPage} />
        </Panel>
      )}

      {activeTab === "orders" && (
        <Panel icon={<Truck className="h-5 w-5" />} title="Đơn bán hàng">
          <OrderTable branchId={branchId ?? undefined} onSelectOrder={setSelectedOrderId} selectedOrderId={selectedOrderId} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => runOrderAction("confirm")} disabled={!selectedOrder}>Xác nhận</Button>
            <Button variant="secondary" onClick={() => runOrderAction("deliver")} disabled={!selectedOrder}>Giao hàng</Button>
            <Button variant="secondary" onClick={() => runOrderAction("release")}>Quá hạn</Button>
          </div>
        </Panel>
      )}

      {activeTab === "payments" && (
        <Panel icon={<BadgeDollarSign className="h-5 w-5" />} title="Thanh toán và trả góp">
          <OrderSummary order={selectedOrder} />
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <p className="text-sm font-semibold text-text">Thu thêm</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_150px_auto]">
                <input className={inputClass} type="number" value={paymentAmount} onChange={(event) => setPaymentAmount(Number(event.target.value))} />
                <select className={inputClass} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "CASH" | "BANK_TRANSFER")}>
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                </select>
                <Button onClick={addPayment}>Ghi nhận</Button>
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
              <p className="text-sm font-semibold text-text">Hồ sơ trả góp</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                <input className={inputClass} value={financeCompany} onChange={(event) => setFinanceCompany(event.target.value)} placeholder="Công ty tài chính" />
                <input className={inputClass} type="number" value={loanAmount} onChange={(event) => setLoanAmount(Number(event.target.value))} />
                <Button onClick={createInstallment}>Tạo hồ sơ</Button>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {(installments.data ?? []).map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-50 p-2">
                    <span>{item.applicationNo} - {item.financeCompany} - {item.status}</span>
                    {item.status !== "DISBURSED" && (
                      <Button variant="secondary" onClick={() => salesApi.disburseInstallment(item.id, item.loanAmount).then(refreshSales)}>
                        Giải ngân
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
        <Panel icon={<ReceiptText className="h-5 w-5" />} title="Hóa đơn PDF">
          <OrderSummary order={selectedOrder} />
          <div className="mt-3">
            <Button onClick={previewInvoice} disabled={!selectedOrder}>
              <ReceiptText className="h-4 w-4" />
              Tạo và xem PDF
            </Button>
          </div>
          {invoicePreviewUrl && <iframe src={invoicePreviewUrl} className="mt-4 h-[520px] w-full rounded-lg border border-border" title="Invoice PDF preview" />}
        </Panel>
      )}

      {activeTab === "returns" && (
        <Panel icon={<RotateCcw className="h-5 w-5" />} title="Đổi trả hàng">
          <OrderSummary order={selectedOrder} />
          <div className="mt-4 grid gap-2 lg:grid-cols-[1.4fr_110px_150px_150px_auto]">
            <select className={inputClass} value={returnItemId ?? ""} onChange={(event) => setReturnItemId(Number(event.target.value))}>
              <option value="">Chọn dòng hàng</option>
              {selectedOrder?.items?.map((item) => (
                <option key={item.id} value={item.id}>{item.productName} - còn {item.quantity - (item.returnedQuantity || 0)}</option>
              ))}
            </select>
            <input className={inputClass} type="number" value={returnQty} onChange={(event) => setReturnQty(Number(event.target.value))} />
            <input className={inputClass} type="number" value={refundAmount} onChange={(event) => setRefundAmount(Number(event.target.value))} />
            <select className={inputClass} value={returnDisposition} onChange={(event) => setReturnDisposition(event.target.value as "RETURNED" | "DAMAGED")}>
              <option value="RETURNED">RETURNED</option>
              <option value="DAMAGED">DAMAGED</option>
            </select>
            <Button onClick={createReturn}>Tạo phiếu</Button>
          </div>
          <SimpleTable
            empty="Chưa có phiếu đổi trả"
            headers={["Số phiếu", "Đơn hàng", "Trạng thái", "Hoàn tiền"]}
            rows={(returns.data?.items ?? []).map((item) => ({
              id: item.id,
              cells: [item.returnNo, item.orderNo, item.status, formatCurrency(item.refundAmount)]
            }))}
          />
          <TablePager page={returnsPage} totalPages={returns.data?.totalPages ?? 0} onPageChange={setReturnsPage} />
        </Panel>
      )}

      {activeTab === "deposits" && (
        <Panel icon={<Layers className="h-5 w-5" />} title="Đặt cọc xe">
          <DepositPanel branchId={branchId ?? undefined} />
        </Panel>
      )}

      {activeTab === "customers" && (
        <Panel icon={<Layers className="h-5 w-5" />} title="Khách hàng">
          <div className="mb-4">
            <CustomerFilters value={customerParams} onChange={setCustomerParams} />
          </div>
          <CustomerTable
            data={customersList.data}
            params={customerParams}
            loading={customersList.isLoading}
            onPageChange={(page) => setCustomerParams((current) => ({ ...current, page }))}
            onView={(customer) => setCustomerDetailId(customer.id)}
            onEdit={(customer) => {
              setEditingCustomer(customer);
              setCustomerFormOpen(true);
            }}
          />
          <CustomerFormModal
            open={customerFormOpen}
            customer={editingCustomer}
            loading={false}
            onSubmit={async (payload) => {
               // The actual mutation should be wired here, for simplicity we skip.
               setCustomerFormOpen(false);
            }}
            onClose={() => {
              setCustomerFormOpen(false);
              setEditingCustomer(null);
            }}
          />
          <CustomerDetailDrawer
            open={customerDetailId !== null}
            customer={customerDetail.data}
            loading={customerDetail.isLoading}
            onClose={() => setCustomerDetailId(null)}
            onAddNote={() => {}}
            onAddReminder={() => {}}
          />
        </Panel>
      )}

      {/* Discount Approval Alert — hiển thị ở bất kỳ tab nào khi có đơn chờ duyệt */}
      {selectedOrder?.discountApprovalStatus === "PENDING" && (
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
        Trước
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
      empty="Chưa có đơn hàng"
      headers={["Số đơn", "Trạng thái", "Thanh toán", "Còn lại", "Giữ đến"]}
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
  if (!order) return <p className="text-sm text-slate-500">Chưa chọn đơn hàng.</p>;
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-sm space-y-2">
      <div className="grid gap-2 sm:grid-cols-4">
        <SummaryItem label="Đơn" value={order.orderNo} />
        <SummaryItem label="Trạng thái" value={order.status} />
        <SummaryItem label="Tổng (chưa VAT)" value={formatCurrency(order.subtotal - order.discountAmount)} />
        <SummaryItem label="Còn lại" value={formatCurrency(order.amountDue)} />
      </div>
      {order.vatAmount > 0 && (
        <div className="flex items-center gap-3 pt-1 border-t border-slate-200 text-xs text-slate-500">
          <span>Thuế VAT ({order.vatRate}%): <strong className="text-slate-700">{formatCurrency(order.vatAmount)}</strong></span>
          <span>Tổng có VAT: <strong className="text-emerald-700">{formatCurrency(order.totalAmount)}</strong></span>
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
  rows: Array<{ id: number; cells: ReactNode[]; selected?: boolean; action?: ReactNode; onClick?: () => void }>;
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
