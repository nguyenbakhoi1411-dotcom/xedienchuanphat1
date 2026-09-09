"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { canViewAllBranches, getCurrentUser } from "@/lib/auth/token";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { CartPanel } from "@/features/sales/CartPanel";
import { CustomerSelectModal } from "@/features/sales/CustomerSelectModal";
import { Customer360Sidebar } from "@/features/sales/Customer360Sidebar";
import { PaymentForm } from "@/features/sales/PaymentForm";
import { ProductGrid } from "@/features/sales/ProductGrid";
import { salesApi } from "@/features/sales/api";
import {
  calculatePaidAmount,
  calculatePaymentStatus,
  calculateSubtotal,
  useCartStore
} from "@/features/sales/cartStore";
import { useCreateInvoice, usePosCustomers, usePosProducts } from "@/features/sales/hooks";
import type { CreateInvoicePayload, InvoiceResponse, PosProduct } from "@/features/sales/types";

const SalesOperationsPanel = dynamic(
  () => import("@/features/sales/SalesOperationsPanel").then((module) => module.SalesOperationsPanel),
  { loading: () => <div className="rounded-lg border border-border bg-white p-4 text-sm text-slate-500 shadow-soft">Dang tai module sales...</div> }
);

export default function SalesPage() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [productKeyword, setProductKeyword] = useState("");
  const [customerKeyword, setCustomerKeyword] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(currentUser?.branchId ?? 1);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customer360Open, setCustomer360Open] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<InvoiceResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"pos" | "operations">("pos");
  const debouncedProductKeyword = useDebouncedValue(productKeyword, 300);
  const debouncedCustomerKeyword = useDebouncedValue(customerKeyword, 300);

  const addProduct = useCartStore((state) => state.addProduct);
  const setCustomer = useCartStore((state) => state.setCustomer);
  const clearCart = useCartStore((state) => state.clearCart);
  const customer = useCartStore((state) => state.customer);
  const items = useCartStore((state) => state.items);
  const payment = useCartStore((state) => state.payment);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
    }
  }, [currentUser, router]);

  const canSelectBranch = canViewAllBranches(currentUser);
  const activeBranchId = canSelectBranch ? selectedBranchId : currentUser?.branchId ?? null;
  const products = usePosProducts(debouncedProductKeyword, activeBranchId ?? 0);
  const customers = usePosCustomers(debouncedCustomerKeyword);
  const createInvoice = useCreateInvoice();

  function handleAddProduct(product: PosProduct) {
    if (product.category === "ELECTRIC_MOTORBIKE") {
      const firstSerial = product.serials.find((serial) => serial.status === "IN_STOCK");
      addProduct(product, firstSerial ? String(firstSerial.id ?? firstSerial.serialNumber) : undefined);
      toast.info(firstSerial ? "Da them xe va chon serial dau tien" : "San pham xe can chon serial");
      return;
    }
    addProduct(product);
    toast.success("Da them san pham vao gio");
  }

  async function handleCreateInvoice(payload: CreateInvoicePayload) {
    if (!currentUser || !activeBranchId || !currentUser.id) {
      toast.error("Vui long dang nhap va chon chi nhanh truoc khi tao hoa don");
      return;
    }
    try {
      const invoice = await createInvoice.mutateAsync(payload);
      setLastInvoice(invoice);
      clearCart();
    } catch {
      // Toast is handled in mutation hook.
    }
  }

  async function handleCreateQuotation(payload: CreateInvoicePayload) {
    if (!currentUser || !activeBranchId || !currentUser.id) {
      toast.error("Vui long dang nhap va chon chi nhanh truoc khi tao bao gia");
      return;
    }
    try {
      const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const quotation = await salesApi.createQuotation({
        ...payload,
        branchId: activeBranchId,
        employeeId: currentUser.id,
        validUntil,
        note: "Tao tu POS"
      });
      toast.success(`Da tao bao gia ${quotation.quotationNo}`);
      setActiveTab("operations");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the tao bao gia");
    }
  }

  function handlePrint() {
    if (!lastInvoice) return;
    window.print();
  }

  const subtotal = calculateSubtotal(items);
  const total = Math.max(0, subtotal - payment.discountAmount);
  const paid = calculatePaidAmount(payment);
  const paymentStatus = calculatePaymentStatus(total, payment);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-text">Sales / POS</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ban xe dien, chon serial, thanh toan va tao hoa don tai quay.
          </p>
        </div>
        {canSelectBranch && (
          <select
            value={selectedBranchId}
            onChange={(event) => setSelectedBranchId(Number(event.target.value))}
            className="erp-input max-w-xs"
          >
            <option value={1}>Chi nhanh Go Vap</option>
            <option value={2}>Chi nhanh Thu Duc</option>
            <option value={3}>Chi nhanh Quan 7</option>
            <option value={4}>Chi nhanh Tan Binh</option>
            <option value={5}>Chi nhanh Binh Duong</option>
            <option value={6}>Chi nhanh Dong Nai</option>
          </select>
        )}
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-white p-2 text-center shadow-soft">
          <MiniStat label="Tong" value={formatShort(total)} />
          <MiniStat label="Da tra" value={formatShort(paid)} />
          <MiniStat label="Trang thai" value={statusLabel(paymentStatus)} />
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("pos")}
          className={`h-10 rounded-lg border px-4 text-sm font-semibold shadow-sm ${activeTab === "pos" ? "border-primary bg-orange-50 text-primary" : "border-border bg-white text-slate-600 hover:bg-slate-50"}`}
        >
          POS nhanh
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("operations")}
          className={`h-10 rounded-lg border px-4 text-sm font-semibold shadow-sm ${activeTab === "operations" ? "border-primary bg-orange-50 text-primary" : "border-border bg-white text-slate-600 hover:bg-slate-50"}`}
        >
          Bao gia / Don hang / Doi tra
        </button>
      </section>

      {activeTab === "pos" ? (
        <section className="relative grid min-h-[calc(100vh-250px)] gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.75fr)]">
          <ProductGrid
            keyword={productKeyword}
            products={products.data}
            loading={products.isLoading}
            onKeywordChange={setProductKeyword}
            onAdd={handleAddProduct}
          />

          <div className="grid min-h-0 gap-4 xl:grid-rows-[minmax(0,1fr)_auto]">
            <CartPanel
              onSelectCustomer={() => setCustomerModalOpen(true)}
              onOpenCustomer360={customer ? () => setCustomer360Open(true) : undefined}
            />
            <PaymentForm
              loading={createInvoice.isPending}
              branchId={activeBranchId ?? undefined}
              lastInvoice={lastInvoice}
              onCreateInvoice={(payload) =>
                handleCreateInvoice({
                  ...payload,
                  branchId: activeBranchId ?? undefined,
                  employeeId: currentUser?.id
                })
              }
              onCreateQuotation={(payload) =>
                handleCreateQuotation({
                  ...payload,
                  branchId: activeBranchId ?? undefined,
                  employeeId: currentUser?.id
                })
              }
              onPrint={handlePrint}
            />
          </div>

          {/* Customer 360 sidebar */}
          {customer360Open && customer && (
            <div className="fixed inset-y-0 right-0 z-40 flex">
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setCustomer360Open(false)} />
              <div className="relative ml-auto">
                <Customer360Sidebar customer={customer} onClose={() => setCustomer360Open(false)} />
              </div>
            </div>
          )}
        </section>
      ) : (
        <SalesOperationsPanel branchId={activeBranchId ?? undefined} employeeId={currentUser?.id} />
      )}

      <CustomerSelectModal
        open={customerModalOpen}
        keyword={customerKeyword}
        customers={customers.data}
        loading={customers.isLoading}
        onKeywordChange={setCustomerKeyword}
        onSelect={(customer) => {
          setCustomer(customer);
          setCustomerModalOpen(false);
          toast.success(`Da chon ${customer.name}`);
        }}
        onClose={() => setCustomerModalOpen(false)}
      />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-24 rounded-md px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-text">{value}</p>
    </div>
  );
}

function formatShort(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return String(value);
}

function statusLabel(status: string) {
  return {
    UNPAID: "Chua tra",
    PARTIAL: "Mot phan",
    PAID: "Da tra"
  }[status] ?? status;
}
