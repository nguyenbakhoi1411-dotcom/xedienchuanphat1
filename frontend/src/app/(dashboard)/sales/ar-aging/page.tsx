"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { useARaging, useCreatePayment } from "@/features/sales/hooks";
import type { ARAgingRow } from "@/features/sales/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Users,
  Calendar,
  Filter,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

// Formats currency: eg 1.000.000 đ
function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

// Formats date: dd/MM/yyyy
function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

const defaultAgingRows: ARAgingRow[] = [
  {
    customerId: 1,
    customerName: "Nguyễn Văn A",
    total: 15800000,
    current: 15800000,
    days1_30: 0,
    days31_60: 0,
    days61_90: 0,
    daysOver90: 0,
    invoices: [
      { invoiceNo: "HD-202606-0001", invoiceDate: "2026-06-10", dueDate: "2026-06-20", amount: 15800000, remainingAmount: 15800000, overdueDays: 0 }
    ]
  },
  {
    customerId: 2,
    customerName: "Trần Thị B",
    total: 12000000,
    current: 0,
    days1_30: 12000000,
    days31_60: 0,
    days61_90: 0,
    daysOver90: 0,
    invoices: [
      { invoiceNo: "HD-202605-0012", invoiceDate: "2026-05-12", dueDate: "2026-05-22", amount: 12000000, remainingAmount: 12000000, overdueDays: 23 }
    ]
  },
  {
    customerId: 3,
    customerName: "Phạm Quốc C",
    total: 6500000,
    current: 0,
    days1_30: 0,
    days31_60: 6500000,
    days61_90: 0,
    daysOver90: 0,
    invoices: [
      { invoiceNo: "HD-202604-0009", invoiceDate: "2026-04-15", dueDate: "2026-04-25", amount: 6500000, remainingAmount: 6500000, overdueDays: 50 }
    ]
  },
  {
    customerId: 4,
    customerName: "Công ty TNHH Hoàng Phát",
    total: 28000000,
    current: 0,
    days1_30: 0,
    days31_60: 0,
    days61_90: 10000000,
    daysOver90: 18000000,
    invoices: [
      { invoiceNo: "HD-202603-0005", invoiceDate: "2026-03-02", dueDate: "2026-03-12", amount: 10000000, remainingAmount: 10000000, overdueDays: 94 },
      { invoiceNo: "HD-202602-0021", invoiceDate: "2026-02-10", dueDate: "2026-02-20", amount: 18000000, remainingAmount: 18000000, overdueDays: 114 }
    ]
  }
];

export default function ARAgingPage() {
  const user = useCurrentUser();
  const currentBranchId = user?.branchId ? Number(user.branchId) : undefined;

  const createPaymentMutation = useCreatePayment();

  // Filters state
  const todayStr = new Date().toISOString().split("T")[0];
  const [asOfDate, setAsOfDate] = useState(todayStr);
  const [branchFilter, setBranchFilter] = useState<string>("All");

  // Fetch AR aging data
  const { data: agingData, isLoading: loadingAging, refetch: refetchAging } = useARaging({
    asOfDate,
    branchId: branchFilter === "All" ? undefined : Number(branchFilter)
  });

  // Expandable invoice sub-rows state
  const [expandedCustomerIds, setExpandedCustomerIds] = useState<number[]>([]);

  // Payment Collector States
  const [paymentInvoice, setPaymentInvoice] = useState<{ invoiceNo: string; customerId: number; remainingAmount: number } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER">("BANK_TRANSFER");
  const [paymentNote, setPaymentNote] = useState("");

  const activeRows = agingData || defaultAgingRows;

  // Toggle row expansion
  const toggleExpand = (customerId: number) => {
    if (expandedCustomerIds.includes(customerId)) {
      setExpandedCustomerIds(prev => prev.filter(id => id !== customerId));
    } else {
      setExpandedCustomerIds(prev => [...prev, customerId]);
    }
  };

  // Summarize aging data into categories
  const summary = useMemo(() => {
    let total = 0;
    let current = 0;
    let days1_30 = 0;
    let days31_60 = 0;
    let days61_90 = 0;
    let daysOver90 = 0;

    activeRows.forEach(row => {
      total += row.total;
      current += row.current;
      days1_30 += row.days1_30;
      days31_60 += row.days31_60;
      days61_90 += row.days61_90;
      daysOver90 += row.daysOver90;
    });

    const overdueSum = days1_30 + days31_60 + days61_90 + daysOver90;

    return {
      total,
      current,
      days1_30,
      days31_60,
      days61_90,
      daysOver90,
      overdue: overdueSum,
      days30Plus: days31_60 + days61_90 + daysOver90
    };
  }, [activeRows]);

  const openPaymentCollector = (invoiceNo: string, customerId: number, amt: number) => {
    setPaymentInvoice({ invoiceNo, customerId, remainingAmount: amt });
    setPaymentAmount(amt);
    setPaymentMethod("BANK_TRANSFER");
    setPaymentNote(`Thu nợ hóa đơn ${invoiceNo}`);
  };

  const executePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice || paymentAmount <= 0) {
      toast.error("Số tiền thu không hợp lệ");
      return;
    }

    createPaymentMutation.mutate({
      customerId: paymentInvoice.customerId,
      invoiceNo: paymentInvoice.invoiceNo,
      amount: paymentAmount,
      paymentMethod,
      paymentDate: todayStr,
      note: paymentNote
    }, {
      onSuccess: () => {
        setPaymentInvoice(null);
        setPaymentAmount(0);
        setPaymentNote("");
        refetchAging();
      }
    });
  };

  return (
    <div className="flex flex-col space-y-6 w-full pb-10">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Báo cáo Phân tích Tuổi nợ (AR Aging)</h1>
          <p className="text-xs text-gray-400">Theo dõi nợ phải thu của khách hàng theo các khoảng thời gian quá hạn.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-200 text-gray-600"
          onClick={() => {
            refetchAging();
            toast.success("Đã làm mới báo cáo");
          }}
        >
          <RefreshCw className="mr-1 h-3.5 w-3.5" /> Làm mới
        </Button>
      </div>

      {/* Filter Options */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row items-end gap-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-500 uppercase mb-1">Tính nợ đến ngày</label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-500 uppercase mb-1">Chi nhánh</label>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">Tất cả chi nhánh</option>
            <option value="1">Chi nhánh Gò Vấp</option>
            <option value="2">Chi nhánh Thủ Đức</option>
            <option value="3">Chi nhánh Quận 7</option>
          </select>
        </div>

        <Button
          onClick={() => {
            refetchAging();
            toast.success("Đã tải báo cáo tuổi nợ");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-9"
        >
          <Filter className="mr-1.5 h-3.5 w-3.5" /> Xem báo cáo
        </Button>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loadingAging ? (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng công nợ</span>
              <h3 className="text-xl font-extrabold text-gray-800 mt-1">{fmt(summary.total)}</h3>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between border-l-4 border-l-emerald-500">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trong hạn (Current)</span>
              <h3 className="text-xl font-extrabold text-emerald-600 mt-1">{fmt(summary.current)}</h3>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between border-l-4 border-l-amber-500">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quá hạn ngắn (1-30 ngày)</span>
              <h3 className="text-xl font-extrabold text-amber-600 mt-1">{fmt(summary.days1_30)}</h3>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between border-l-4 border-l-rose-500">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quá hạn dài (&gt;30 ngày)</span>
              <h3 className="text-xl font-extrabold text-rose-600 mt-1">{fmt(summary.days30Plus)}</h3>
            </div>
          </>
        )}
      </div>

      {/* Aging Analysis Table Accordion */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {loadingAging ? (
          <div className="space-y-2 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : activeRows.length === 0 ? (
          <div className="py-16 text-center">
            <EmptyState
              title="Không có dữ liệu tuổi nợ"
              description="Hiện tại không có khoản nợ phải thu nào cần phân tích."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase">
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4 text-right">Tổng nợ</th>
                  <th className="py-3 px-4 text-right">Trong hạn</th>
                  <th className="py-3 px-4 text-right">1-30 ngày</th>
                  <th className="py-3 px-4 text-right">31-60 ngày</th>
                  <th className="py-3 px-4 text-right">61-90 ngày</th>
                  <th className="py-3 px-4 text-right">&gt;90 ngày</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {activeRows.map((row) => {
                  const isExpanded = expandedCustomerIds.includes(row.customerId);
                  return (
                    <>
                      {/* Main Accordion Row */}
                      <tr key={row.customerId} className="hover:bg-gray-50/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900 cursor-pointer" onClick={() => toggleExpand(row.customerId)}>
                          <span className="flex items-center gap-1.5 hover:text-indigo-600">
                            {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
                            {row.customerName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-gray-950">{fmt(row.total)}</td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-medium">{fmt(row.current)}</td>
                        <td className="py-3 px-4 text-right text-amber-600 font-medium">{fmt(row.days1_30)}</td>
                        <td className="py-3 px-4 text-right text-orange-500 font-medium">{fmt(row.days31_60)}</td>
                        <td className="py-3 px-4 text-right text-rose-500 font-medium">{fmt(row.days61_90)}</td>
                        <td className="py-3 px-4 text-right text-rose-700 font-black">{fmt(row.daysOver90)}</td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            onClick={() => toggleExpand(row.customerId)}
                          >
                            Chi tiết
                          </Button>
                        </td>
                      </tr>

                      {/* Expandable sub-row showing overdue invoices */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="bg-gray-50/50 p-4 border-t border-b border-gray-100">
                            <div className="flex flex-col space-y-3 pl-6">
                              <h4 className="font-bold text-gray-700 flex items-center gap-1.5">
                                <FileText className="h-4 w-4 text-indigo-500" /> Danh sách hóa đơn của {row.customerName}
                              </h4>
                              
                              {!row.invoices || row.invoices.length === 0 ? (
                                <p className="text-gray-400 italic">Không có hóa đơn cụ thể nào quá hạn.</p>
                              ) : (
                                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white max-w-4xl shadow-sm">
                                  <table className="w-full text-left border-collapse text-[11px]">
                                    <thead>
                                      <tr className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                                        <th className="py-2 px-3">Số HĐ</th>
                                        <th className="py-2 px-3">Ngày lập</th>
                                        <th className="py-2 px-3">Hạn thanh toán</th>
                                        <th className="py-2 px-3 text-right">Số tiền gốc</th>
                                        <th className="py-2 px-3 text-right">Còn lại</th>
                                        <th className="py-2 px-3 text-center">Quá hạn</th>
                                        <th className="py-2 px-3 text-center">Thao tác</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-600">
                                      {row.invoices.map((inv) => (
                                        <tr key={inv.invoiceNo} className="hover:bg-gray-50/40">
                                          <td className="py-2 px-3 font-mono font-bold text-gray-800">{inv.invoiceNo}</td>
                                          <td className="py-2 px-3">{fmtDate(inv.invoiceDate)}</td>
                                          <td className="py-2 px-3">{fmtDate(inv.dueDate)}</td>
                                          <td className="py-2 px-3 text-right font-medium">{fmt(inv.amount)}</td>
                                          <td className="py-2 px-3 text-right font-extrabold text-gray-900">{fmt(inv.remainingAmount)}</td>
                                          <td className="py-2 px-3 text-center whitespace-nowrap">
                                            {inv.overdueDays > 0 ? (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold">
                                                <Clock className="h-3 w-3" /> {inv.overdueDays} ngày
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">
                                                <CheckCircle2 className="h-3 w-3" /> Trong hạn
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 px-3 text-center">
                                            {inv.remainingAmount > 0 && (
                                              <Button
                                                size="sm"
                                                className="h-6 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                                onClick={() => openPaymentCollector(inv.invoiceNo, row.customerId, inv.remainingAmount)}
                                              >
                                                Thu tiền ngay
                                              </Button>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer aggregate summaries */}
        {!loadingAging && activeRows.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-100 p-4 font-bold text-gray-900 text-xs flex flex-wrap items-center gap-6">
            <span className="text-gray-500 font-semibold uppercase">Tổng cộng:</span>
            <span>Tổng nợ: <strong className="text-gray-950 text-sm">{fmt(summary.total)}</strong></span>
            <span>Trong hạn: <strong className="text-emerald-600">{fmt(summary.current)}</strong></span>
            <span>1-30 ngày: <strong className="text-amber-600">{fmt(summary.days1_30)}</strong></span>
            <span>31-60 ngày: <strong className="text-orange-500">{fmt(summary.days31_60)}</strong></span>
            <span>61-90 ngày: <strong className="text-rose-500">{fmt(summary.days61_90)}</strong></span>
            <span>&gt;90 ngày: <strong className="text-rose-700 text-sm">{fmt(summary.daysOver90)}</strong></span>
          </div>
        )}
      </div>

      {/* ==================== MODAL: RECEIVE INVOICE DEBT PAYMENT ==================== */}
      {paymentInvoice !== null && (
        <Modal
          isOpen={paymentInvoice !== null}
          onClose={() => setPaymentInvoice(null)}
          title={`Ghi nhận thu nợ hóa đơn ${paymentInvoice.invoiceNo}`}
          size="md"
        >
          <form onSubmit={executePaymentSubmit} className="flex flex-col space-y-4 py-2 text-xs">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số tiền thu nợ (đ) <span className="text-red-500">*</span></label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  required
                  min="1"
                  max={paymentInvoice.remainingAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full h-10 pl-8 pr-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phương thức thanh toán <span className="text-red-500">*</span></label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                <option value="CASH">Tiền mặt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ghi chú thu nợ</label>
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Ví dụ: Khách thanh toán nợ quá hạn qua Momo..."
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setPaymentInvoice(null)}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" disabled={createPaymentMutation.isPending}>
                Xác nhận thu nợ
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
