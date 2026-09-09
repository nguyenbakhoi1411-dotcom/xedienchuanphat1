"use client";

import { useState, useMemo } from "react";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import {
  useAPAging,
  usePayables,
  usePayPayable
} from "@/features/purchasing/hooks";
import { useBranches } from "@/features/branches/hooks";
import type { Payable, PayableStatus } from "@/features/purchasing/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Search,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  Eye,
  CheckCircle,
  Loader2
} from "lucide-react";

// Formatting helper
function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

export default function APAgingPage() {
  const currentUser = useCurrentUser();

  // Filters
  const [selectedBranchId, setSelectedBranchId] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: branchesData } = useBranches({ keyword: "", page: 0, pageSize: 100 });
  const { data: agingData, isLoading: loadingAging, refetch: refetchAging } = useAPAging(
    selectedBranchId === "ALL" ? undefined : selectedBranchId
  );

  // Expanded suppliers list
  const [expandedSupplierId, setExpandedSupplierId] = useState<number | null>(null);

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null);
  
  // Payment Form fields
  const [payAmount, setPayAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [bankRef, setBankRef] = useState("");
  const [note, setNote] = useState("");

  // Confirmation Dialogue trigger
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Mutations
  const payMutation = usePayPayable();

  const handleToggleExpand = (supplierId: number) => {
    if (expandedSupplierId === supplierId) {
      setExpandedSupplierId(null);
    } else {
      setExpandedSupplierId(supplierId);
    }
  };

  const handleOpenPay = (payable: Payable) => {
    setSelectedPayable(payable);
    setPayAmount(payable.remainingAmount);
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("BANK_TRANSFER");
    setBankRef("");
    setNote("");
    setPaymentModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayable) return;
    if (payAmount <= 0) {
      alert("Số tiền thanh toán phải lớn hơn 0");
      return;
    }
    if (payAmount > selectedPayable.remainingAmount) {
      alert("Số tiền thanh toán vượt quá số nợ còn lại");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedPayable) return;
    payMutation.mutate({
      payableId: selectedPayable.id,
      amount: payAmount,
      paymentDate,
      paymentMethod,
      bankRef: bankRef || undefined,
      note: note || undefined
    }, {
      onSuccess: () => {
        setConfirmOpen(false);
        setPaymentModalOpen(false);
        refetchAging();
      }
    });
  };

  // Client side search
  const filteredAging = useMemo(() => {
    if (!agingData) return [];
    return agingData.filter(row => {
      const matchQuery =
        searchQuery.trim() === "" ||
        row.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    });
  }, [agingData, searchQuery]);

  return (
    <div className="space-y-6 p-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Báo Cáo Phân Tích Tuổi Nợ Phải Trả (AP Aging)</h1>
        <p className="text-sm text-slate-500">
          Phân tích các khoản công nợ quá hạn với nhà cung cấp theo các mốc thời gian (Chưa đến hạn, 1-30 ngày, 31-60 ngày, 61-90 ngày, &gt;90 ngày).
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <select
            value={selectedBranchId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedBranchId(val === "ALL" ? "ALL" : Number(val));
            }}
            className="h-9 w-[200px] rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">Tất cả chi nhánh</option>
            {branchesData?.items.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên nhà cung cấp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-[260px] rounded-lg border border-slate-200 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Aging table with accordions */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loadingAging ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredAging.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700">
                <tr>
                  <th className="px-6 py-3 w-[50px]"></th>
                  <th className="px-6 py-3">Nhà cung cấp</th>
                  <th className="px-6 py-3 text-right">Chưa đến hạn</th>
                  <th className="px-6 py-3 text-right">Từ 1 - 30 ngày</th>
                  <th className="px-6 py-3 text-right">Từ 31 - 60 ngày</th>
                  <th className="px-6 py-3 text-right">Từ 61 - 90 ngày</th>
                  <th className="px-6 py-3 text-right">Trên 90 ngày</th>
                  <th className="px-6 py-3 text-right font-bold text-slate-800">Tổng dư nợ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAging.map((row) => {
                  const isExpanded = expandedSupplierId === row.supplierId;
                  return (
                    <>
                      {/* Main Supplier Summary Row */}
                      <tr
                        key={row.supplierId}
                        onClick={() => handleToggleExpand(row.supplierId)}
                        className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{row.supplierName}</td>
                        <td className="px-6 py-4 text-right text-slate-700">{fmt(row.current)}</td>
                        <td className="px-6 py-4 text-right text-amber-600 font-medium">{fmt(row.days1_30)}</td>
                        <td className="px-6 py-4 text-right text-orange-600 font-medium">{fmt(row.days31_60)}</td>
                        <td className="px-6 py-4 text-right text-red-500 font-medium">{fmt(row.days61_90)}</td>
                        <td className="px-6 py-4 text-right text-red-700 font-bold">{fmt(row.over90)}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-950">{fmt(row.total)}</td>
                      </tr>

                      {/* Expandable Drilldown Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="bg-slate-50/50 p-4 border-t border-b border-slate-100">
                            <SupplierPayablesDrilldown
                              supplierId={row.supplierId}
                              branchId={selectedBranchId === "ALL" ? undefined : selectedBranchId}
                              onPay={handleOpenPay}
                            />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Không có công nợ quá hạn nào"
            description="Tuyệt vời! Hiện tại không có dư nợ hoặc hóa đơn quá hạn phải trả nào với các nhà cung cấp."
          />
        )}
      </div>

      {/* PAYMENT MODAL */}
      <Modal
        open={paymentModalOpen}
        title="Ghi nhận thanh toán công nợ (AP Payment)"
        onClose={() => setPaymentModalOpen(false)}
        size="md"
      >
        {selectedPayable && (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã chứng từ:</span>
                <span className="font-semibold text-slate-800">{selectedPayable.payableCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nhà cung cấp:</span>
                <span className="font-semibold text-slate-800">{selectedPayable.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nguồn gốc:</span>
                <span className="font-semibold text-slate-800">{selectedPayable.sourceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dư nợ hiện tại:</span>
                <span className="font-bold text-red-600">{fmt(selectedPayable.remainingAmount)}</span>
              </div>
            </div>

            {/* Payment amount */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Số tiền thanh toán (đ)</label>
              <input
                type="number"
                required
                min={1}
                max={selectedPayable.remainingAmount}
                value={payAmount}
                onChange={(e) => setPayAmount(Math.min(selectedPayable.remainingAmount, parseFloat(e.target.value) || 0))}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Ngày thanh toán</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Method */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Hình thức thanh toán</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                <option value="CASH">Tiền mặt</option>
                <option value="CARD">Thẻ thanh toán</option>
              </select>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Mã tham chiếu / Mã GD ngân hàng</label>
              <input
                type="text"
                placeholder="Ví dụ: FT2026156156..."
                value={bankRef}
                onChange={(e) => setBankRef(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Ghi chú thanh toán</label>
              <textarea
                placeholder="Ghi chú chi tiết giao dịch..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="secondary" onClick={() => setPaymentModalOpen(false)}>
                Đóng
              </Button>
              <Button type="submit">
                Thanh toán
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* CONFIRMATION */}
      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận ghi nhận thanh toán công nợ?"
        description={`Hệ thống sẽ ghi nhận số tiền ${fmt(payAmount)} đã chi trả cho nhà cung cấp, giảm số dư công nợ tương ứng.`}
        confirmText="Xác nhận chi trả"
        loading={payMutation.isPending}
        onConfirm={handleConfirmPayment}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

// ── SUB-COMPONENT DRILLDOWN: List of open payables for expanded supplier ─────
function SupplierPayablesDrilldown({
  supplierId,
  branchId,
  onPay
}: {
  supplierId: number;
  branchId?: number;
  onPay: (p: Payable) => void;
}) {
  const { data: payablesData, isLoading } = usePayables({
    supplierId,
    branchId,
    status: "OPEN"
  });

  const openInvoices = useMemo(() => {
    if (!payablesData?.items) return [];
    // Also include partially paid ones
    return payablesData.items.filter(p => p.status === "OPEN" || p.status === "PARTIAL");
  }, [payablesData]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-[80%]" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 shadow-inner">
      <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
        Bảng chi tiết các hóa đơn công nợ chưa tất toán
      </h4>

      {openInvoices.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500">
            <thead className="bg-slate-50 font-semibold text-slate-700">
              <tr>
                <th className="px-4 py-2">Mã công nợ</th>
                <th className="px-4 py-2">Phiếu nhập kho liên kết</th>
                <th className="px-4 py-2">Ngày hóa đơn</th>
                <th className="px-4 py-2">Ngày đáo hạn</th>
                <th className="px-4 py-2 text-right">Nguyên giá ban đầu</th>
                <th className="px-4 py-2 text-right">Đã thanh toán</th>
                <th className="px-4 py-2 text-right">Dư nợ còn lại</th>
                <th className="px-4 py-2 text-center">Ngày quá hạn</th>
                <th className="px-4 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {openInvoices.map((p) => {
                const isOverdue = p.daysOverdue > 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-800">{p.payableCode}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-600">{p.sourceNo}</td>
                    <td className="px-4 py-2.5">{p.invoiceDate}</td>
                    <td className="px-4 py-2.5">{p.dueDate || "—"}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-800">{fmt(p.originalAmount)}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-700">{fmt(p.paidAmount)}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-red-600">{fmt(p.remainingAmount)}</td>
                    <td className="px-4 py-2.5 text-center">
                      {isOverdue ? (
                        <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          Trễ {p.daysOverdue} ngày
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          Chưa quá hạn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        variant="ghost"
                        className="h-7 px-2 text-xs flex items-center gap-1.5"
                        onClick={() => onPay(p)}
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Thanh toán
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">Không có hóa đơn công nợ chưa tất toán nào cho nhà cung cấp này.</p>
      )}
    </div>
  );
}
