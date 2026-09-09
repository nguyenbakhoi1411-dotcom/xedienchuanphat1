"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import {
  useSalesOrders,
  useConfirmOrder,
  useDeliverOrder,
  useCancelOrder,
  useCreatePayment,
  useUpdateOrder
} from "@/features/sales/hooks";
import {
  SALES_STATUS_LABELS,
  SALES_STATUS_BADGE_TONE
} from "@/features/sales/types";
import type { SalesOrder, SalesOrderStatus } from "@/features/sales/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ShoppingCart,
  Search,
  Calendar,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  Truck,
  DollarSign,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";

// Formats currency: eg 1.000.000 đ
function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

export default function SalesOrdersPage() {
  const user = useCurrentUser();
  const currentBranchId = user?.branchId ? Number(user.branchId) : undefined;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dialog parameters from query search
  const orderIdFromUrl = searchParams?.get("id");

  // Filters state
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(lastDayOfMonth);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [customerSearch, setCustomerSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // Quick filter status pills: Tất cả, Chờ xác nhận (CONFIRMED/DRAFT), Đang giao (DELIVERING), Hoàn thành (COMPLETED/PAID), Đã hủy (CANCELLED)
  const quickPills = [
    { value: "All", label: "Tất cả" },
    { value: "DRAFT", label: "Nháp" },
    { value: "CONFIRMED", label: "Chờ xuất kho" },
    { value: "DELIVERING", label: "Đang giao" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" }
  ];

  // Request parameters
  const queryParams = useMemo(() => ({
    branchId: currentBranchId,
    page: currentPage,
    size: 10,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    status: statusFilter === "All" ? undefined : statusFilter,
    customerId: customerSearch || undefined
  }), [currentBranchId, currentPage, fromDate, toDate, statusFilter, customerSearch]);

  // Fetch orders
  const { data: ordersData, isLoading: loadingOrders } = useSalesOrders(queryParams);
  const ordersList = ordersData?.items || [];
  const totalItems = ordersData?.totalItems || 0;
  const totalPages = ordersData?.totalPages || 0;

  // Mutations
  const confirmMutation = useConfirmOrder();
  const deliverMutation = useDeliverOrder();
  const cancelMutation = useCancelOrder();
  const createPaymentMutation = useCreatePayment();
  const updateOrderMutation = useUpdateOrder();

  // Interactive States
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  
  // Confirm actions dialogs
  const [confirmingAction, setConfirmingAction] = useState<{ type: 'confirm' | 'deliver' | 'complete'; id: number } | null>(null);
  
  // Cancel Dialog
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Payment Dialog
  const [paymentOrderId, setPaymentOrderId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER">("BANK_TRANSFER");
  const [paymentNote, setPaymentNote] = useState("");

  // Trigger modal display from URL
  useEffect(() => {
    if (orderIdFromUrl && ordersList.length > 0) {
      const order = ordersList.find(o => String(o.id) === orderIdFromUrl);
      if (order) setSelectedOrder(order);
    }
  }, [orderIdFromUrl, ordersList]);

  // Aggregate stats in footer
  const stats = useMemo(() => {
    let count = ordersList.length;
    let total = 0;
    let paid = 0;
    
    ordersList.forEach(o => {
      total += o.totalAmount;
      paid += o.paidAmount;
    });

    return {
      count,
      total,
      paid,
      remaining: total - paid
    };
  }, [ordersList]);

  // Clean trigger for details modal
  const openOrderDetails = (order: SalesOrder) => {
    setSelectedOrder(order);
    router.push(`/sales/orders?id=${order.id}`, { scroll: false });
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    router.push(`/sales/orders`, { scroll: false });
  };

  // --- Confirm Action Executer ---
  const executeConfirmAction = () => {
    if (!confirmingAction) return;
    const { type, id } = confirmingAction;

    if (type === 'confirm') {
      confirmMutation.mutate(id, {
        onSuccess: () => setConfirmingAction(null)
      });
    } else if (type === 'deliver') {
      deliverMutation.mutate(id, {
        onSuccess: () => setConfirmingAction(null)
      });
    } else if (type === 'complete') {
      updateOrderMutation.mutate({
        id,
        data: { status: 'COMPLETED' }
      }, {
        onSuccess: () => {
          setConfirmingAction(null);
          toast.success("Hoàn thành đơn hàng");
        }
      });
    }
  };

  // --- Cancel Action Executer ---
  const executeCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrderId || !cancelReason.trim()) {
      toast.error("Vui lòng điền lý do hủy đơn");
      return;
    }
    cancelMutation.mutate({
      id: cancellingOrderId,
      reason: cancelReason
    }, {
      onSuccess: () => {
        setCancellingOrderId(null);
        setCancelReason("");
      }
    });
  };

  // --- Payment Action Executer ---
  const executePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentOrderId || paymentAmount <= 0) {
      toast.error("Vui lòng điền số tiền thanh toán hợp lệ");
      return;
    }
    createPaymentMutation.mutate({
      orderId: paymentOrderId,
      amount: paymentAmount,
      paymentMethod,
      paymentDate: new Date().toISOString().split('T')[0],
      note: paymentNote
    }, {
      onSuccess: () => {
        setPaymentOrderId(null);
        setPaymentAmount(0);
        setPaymentNote("");
      }
    });
  };

  const openPaymentCollector = (order: SalesOrder) => {
    setPaymentOrderId(order.id);
    setPaymentAmount(order.amountDue || (order.totalAmount - order.paidAmount));
    setPaymentMethod("BANK_TRANSFER");
    setPaymentNote(`Thanh toán đơn hàng ${order.orderNo}`);
  };

  const openCancelCollector = (order: SalesOrder) => {
    setCancellingOrderId(order.id);
    setCancelReason("");
  };

  return (
    <div className="flex flex-col space-y-6 w-full pb-10">
      {/* Top Bar with Gradient */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-700 to-indigo-900 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" /> Quản lý Đơn Bán Hàng
            </h1>
            <p className="text-indigo-200 mt-1 text-xs md:text-sm">
              Xem danh sách đơn hàng, duyệt đơn, xuất kho giao hàng và nhận đặt cọc thanh toán.
            </p>
          </div>
          <Link href="/sales/orders/new">
            <Button className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-md font-bold text-xs h-9">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Tạo đơn mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Status Pills Filters */}
      <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 ml-1">Lọc nhanh:</span>
        {quickPills.map(pill => {
          const isActive = statusFilter === pill.value;
          return (
            <button
              key={pill.value}
              onClick={() => {
                setStatusFilter(pill.value);
                setCurrentPage(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Từ ngày</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đến ngày</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tìm khách hàng / Số điện thoại</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Nhập tên khách hàng hoặc số điện thoại..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Table Panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {loadingOrders ? (
          <div className="space-y-2 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : ordersList.length === 0 ? (
          <div className="py-16 text-center">
            <EmptyState
              title="Không tìm thấy đơn hàng"
              description="Không có đơn hàng nào khớp với điều kiện lọc."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase">
                  <th className="py-3 px-4">Số đơn</th>
                  <th className="py-3 px-4">Ngày</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">SĐT</th>
                  <th className="py-3 px-4 text-right">Tổng tiền</th>
                  <th className="py-3 px-4 text-right">Đặt cọc</th>
                  <th className="py-3 px-4 text-right">Còn lại</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {ordersList.map((order) => {
                  const remaining = order.totalAmount - order.paidAmount;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {order.orderNo}
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {order.customerName || `KH #${order.customerId}`}
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {order.customerPhone || "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold whitespace-nowrap text-gray-950">
                        {fmt(order.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-semibold whitespace-nowrap">
                        {fmt(order.paidAmount)}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${remaining > 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                        {fmt(remaining)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <Badge tone={SALES_STATUS_BADGE_TONE[order.status]}>
                          {SALES_STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 border-gray-200 text-gray-500 hover:text-indigo-600"
                            onClick={() => openOrderDetails(order)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> Xem
                          </Button>

                          {/* Contextual Actions based on status */}
                          {order.status === "DRAFT" && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                                onClick={() => setConfirmingAction({ type: 'confirm', id: order.id })}
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Xác nhận
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => openCancelCollector(order)}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Hủy
                              </Button>
                            </>
                          )}

                          {order.status === "CONFIRMED" && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                onClick={() => setConfirmingAction({ type: 'deliver', id: order.id })}
                              >
                                <Truck className="h-3.5 w-3.5 mr-1" /> Xuất kho
                              </Button>
                              {remaining > 0 && (
                                <Button
                                  size="sm"
                                  className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                  onClick={() => openPaymentCollector(order)}
                                >
                                  <DollarSign className="h-3.5 w-3.5 mr-1" /> Thu tiền
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => openCancelCollector(order)}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Hủy
                              </Button>
                            </>
                          )}

                          {order.status === "DELIVERING" && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white font-semibold"
                                onClick={() => setConfirmingAction({ type: 'complete', id: order.id })}
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Hoàn thành
                              </Button>
                              {remaining > 0 && (
                                <Button
                                  size="sm"
                                  className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                  onClick={() => openPaymentCollector(order)}
                                >
                                  <DollarSign className="h-3.5 w-3.5 mr-1" /> Thu tiền
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer aggregate summary */}
        {!loadingOrders && ordersList.length > 0 && (
          <div className="bg-gray-50/70 border-t border-gray-100 p-4 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <span>Tổng đơn: <strong>{stats.count} đơn</strong></span>
              <span>Tổng cộng: <strong className="text-gray-900 text-sm">{fmt(stats.total)}</strong></span>
              <span>Đã thu: <strong className="text-emerald-600 text-sm">{fmt(stats.paid)}</strong></span>
              <span>Còn lại: <strong className="text-rose-500 text-sm">{fmt(stats.remaining)}</strong></span>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>Trang {currentPage + 1} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== MODAL: DETAILS LOOKUP ==================== */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={closeOrderDetails}
          title={`Chi tiết đơn hàng ${selectedOrder.orderNo}`}
          size="lg"
        >
          <div className="flex flex-col space-y-6 py-2 text-xs">
            {/* General Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-400 font-medium block">Ngày đặt đơn</span>
                <span className="text-gray-800 font-bold block mt-0.5">{new Date(selectedOrder.orderDate).toLocaleDateString("vi-VN")}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Khách hàng</span>
                <span className="text-gray-800 font-bold block mt-0.5">{selectedOrder.customerName || `Khách #${selectedOrder.customerId}`}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Số điện thoại</span>
                <span className="text-gray-800 font-mono block mt-0.5">{selectedOrder.customerPhone || "—"}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Trạng thái hạch toán</span>
                <span className="block mt-0.5">
                  <Badge tone={selectedOrder.accountingRecorded ? "green" : "slate"}>
                    {selectedOrder.accountingRecorded ? "Đã ghi sổ" : "Chưa ghi sổ"}
                  </Badge>
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Trạng thái kho</span>
                <span className="block mt-0.5">
                  <Badge tone={selectedOrder.stockIssued ? "green" : "slate"}>
                    {selectedOrder.stockIssued ? "Đã xuất kho" : "Chưa xuất kho"}
                  </Badge>
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Ghi chú</span>
                <span className="text-gray-600 block mt-0.5 truncate" title={selectedOrder.note || ""}>
                  {selectedOrder.note || "—"}
                </span>
              </div>
            </div>

            {/* Items table */}
            <div className="flex flex-col space-y-2">
              <h4 className="font-bold text-gray-800 text-sm">Danh mục sản phẩm</h4>
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                      <th className="py-2.5 px-3">Sản phẩm</th>
                      <th className="py-2.5 px-3">Số Serial</th>
                      <th className="py-2.5 px-3 text-right">SL</th>
                      <th className="py-2.5 px-3 text-right">Đơn giá</th>
                      <th className="py-2.5 px-3 text-right">Chiết khấu</th>
                      <th className="py-2.5 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {selectedOrder.items.map((item, i) => (
                      <tr key={item.id || i}>
                        <td className="py-2.5 px-3 font-semibold">{item.productName}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-500">{item.serialNo || item.serialNumber || "—"}</td>
                        <td className="py-2.5 px-3 text-right">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right">{fmt(item.unitPrice)}</td>
                        <td className="py-2.5 px-3 text-right text-rose-500">-{fmt(item.discountAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">{fmt(item.totalPrice || item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="flex flex-col items-end space-y-1.5 border-t border-gray-100 pt-4 pr-3">
              <div className="flex justify-between w-64">
                <span className="text-gray-400 font-medium">Cộng tiền hàng:</span>
                <span className="text-gray-800 font-semibold">{fmt(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between w-64">
                <span className="text-gray-400 font-medium">Chiết khấu thương mại:</span>
                <span className="text-rose-500 font-semibold">-{fmt(selectedOrder.discountAmount)}</span>
              </div>
              <div className="flex justify-between w-64">
                <span className="text-gray-400 font-medium">Thuế GTGT (VND):</span>
                <span className="text-gray-800 font-semibold">+{fmt(selectedOrder.vatAmount)}</span>
              </div>
              <div className="flex justify-between w-64 border-t border-dashed border-gray-200 pt-1.5">
                <span className="text-gray-900 font-bold text-sm">Tổng cộng:</span>
                <span className="text-indigo-700 font-black text-sm">{fmt(selectedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between w-64">
                <span className="text-emerald-600 font-bold">Đã thanh toán:</span>
                <span className="text-emerald-600 font-bold">{fmt(selectedOrder.paidAmount)}</span>
              </div>
              <div className="flex justify-between w-64">
                <span className="text-rose-500 font-bold">Còn phải thu:</span>
                <span className="text-rose-500 font-bold">{fmt(selectedOrder.totalAmount - selectedOrder.paidAmount)}</span>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button onClick={closeOrderDetails}>Đóng</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================== CONFIRM ACTION DIALOG ==================== */}
      {confirmingAction && (
        <ConfirmDialog
          isOpen={!!confirmingAction}
          onClose={() => setConfirmingAction(null)}
          title="Xác nhận thao tác"
          description={
            confirmingAction.type === 'confirm'
              ? "Bạn có chắc chắn muốn duyệt và xác nhận đơn hàng này? Thao tác này sẽ ghi nhận đặt hàng vào hệ thống."
              : confirmingAction.type === 'deliver'
              ? "Bạn có chắc chắn xuất kho giao hàng cho đơn hàng này?"
              : "Hoàn thành đơn hàng và kết thúc giao hàng?"
          }
          onConfirm={executeConfirmAction}
        />
      )}

      {/* ==================== MODAL: CANCEL ORDER ==================== */}
      {cancellingOrderId !== null && (
        <Modal
          isOpen={cancellingOrderId !== null}
          onClose={() => setCancellingOrderId(null)}
          title="Hủy đơn bán hàng"
          size="md"
        >
          <form onSubmit={executeCancel} className="flex flex-col space-y-4 py-2 text-xs">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Thao tác hủy đơn hàng sẽ đảo ngược lượng giữ chỗ sản phẩm và không thể khôi phục dễ dàng.</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lý do hủy đơn <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do chi tiết..."
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setCancellingOrderId(null)}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold" disabled={cancelMutation.isPending}>
                Xác nhận hủy
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ==================== MODAL: COLLECT PAYMENT ==================== */}
      {paymentOrderId !== null && (
        <Modal
          isOpen={paymentOrderId !== null}
          onClose={() => setPaymentOrderId(null)}
          title="Thu tiền thanh toán đơn hàng"
          size="md"
        >
          <form onSubmit={executePaymentSubmit} className="flex flex-col space-y-4 py-2 text-xs">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số tiền thu (đ) <span className="text-red-500">*</span></label>
              <input
                type="number"
                required
                min="1"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phương thức thanh toán <span className="text-red-500">*</span></label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                <option value="CASH">Tiền mặt</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ghi chú thanh toán</label>
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Ví dụ: Đã nhận chuyển khoản qua app..."
                className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setPaymentOrderId(null)}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold" disabled={createPaymentMutation.isPending}>
                Xác nhận thu
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
