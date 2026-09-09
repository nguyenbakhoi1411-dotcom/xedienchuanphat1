"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import {
  usePurchaseOrders,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useCancelPurchaseOrder
} from "@/features/purchasing/hooks";
import { useBranches } from "@/features/branches/hooks";
import { useSuppliers } from "@/features/purchasing/hooks";
import { PO_STATUS_LABELS, PO_STATUS_COLORS } from "@/features/purchasing/types";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/features/purchasing/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Search,
  Eye,
  Plus,
  Send,
  Check,
  X,
  Trash2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingDown
} from "lucide-react";

// Formatting helper
function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

export default function PurchaseOrdersPage() {
  const currentUser = useCurrentUser();
  const canApprove = currentUser?.permissions?.includes("APPROVE_PURCHASE_ORDER") ?? false;

  // Filter state
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "ALL">("ALL");
  const [selectedBranchId, setSelectedBranchId] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(0);

  // Queries
  const { data: branchesData } = useBranches({ keyword: "", page: 0, pageSize: 100 });
  const { data: posData, isLoading: loadingPOs, refetch: refetchPOs } = usePurchaseOrders({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    branchId: selectedBranchId === "ALL" ? undefined : selectedBranchId,
    page,
    size: 20
  });

  // Action states
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [actionPOId, setActionPOId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Dialog triggers
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  // Mutations
  const submitMutation = useSubmitPurchaseOrder();
  const approveMutation = useApprovePurchaseOrder();
  const rejectMutation = useRejectPurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();

  const handleOpenView = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setViewModalOpen(true);
  };

  const getReceivedPercent = (status: PurchaseOrderStatus) => {
    if (status === "RECEIVED") return 100;
    if (status === "PARTIALLY_RECEIVED") return 50;
    return 0;
  };

  // Client side query matching
  const filteredPOs = useMemo(() => {
    if (!posData?.items) return [];
    return posData.items.filter(po => {
      const matchQuery =
        searchQuery.trim() === "" ||
        po.purchaseOrderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.createdBy?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    });
  }, [posData, searchQuery]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản Lý Đơn Đặt Hàng (PO)</h1>
          <p className="text-sm text-slate-500">
            Theo dõi, xét duyệt đơn hàng mua sắm từ nhà cung cấp và giám sát tiến độ nhập kho hàng hóa.
          </p>
        </div>
        <Link href="/purchasing/orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Lập đơn đặt hàng (PO)
          </Button>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1">
          {(["ALL", "DRAFT", "PENDING_APPROVAL", "APPROVED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED", "REJECTED"] as const).map(status => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(0);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {status === "ALL" ? "Tất cả" : PO_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedBranchId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedBranchId(val === "ALL" ? "ALL" : Number(val));
              setPage(0);
            }}
            className="h-9 w-[180px] rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">Tất cả chi nhánh</option>
            {branchesData?.items.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Mã đơn hàng, nhà cung cấp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-[240px] rounded-lg border border-slate-200 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Grid table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loadingPOs ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredPOs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700">
                <tr>
                  <th className="px-6 py-3">Mã đơn PO</th>
                  <th className="px-6 py-3">Nhà cung cấp</th>
                  <th className="px-6 py-3">Ngày đặt</th>
                  <th className="px-6 py-3">Hạn giao dự kiến</th>
                  <th className="px-6 py-3 text-right">Tổng giá trị</th>
                  <th className="px-6 py-3">Tiến độ nhận</th>
                  <th className="px-6 py-3 text-center">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPOs.map(po => {
                  const percent = getReceivedPercent(po.status);
                  return (
                    <tr key={po.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{po.purchaseOrderNo}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{po.supplierName}</td>
                      <td className="px-6 py-4">{po.purchaseDate}</td>
                      <td className="px-6 py-4">{po.expectedDelivery || "—"}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-950">{fmt(po.totalAmount)}</td>
                      
                      {/* Received progress bar */}
                      <td className="px-6 py-4 w-[180px]">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600">{percent}%</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${PO_STATUS_COLORS[po.status]}`}>
                          {PO_STATUS_LABELS[po.status]}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenView(po)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Submit PO */}
                          {po.status === "DRAFT" && (
                            <button
                              onClick={() => {
                                setActionPOId(po.id);
                                setConfirmSubmitOpen(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                              title="Gửi duyệt"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}

                          {/* Approve (Approver & Pending only) */}
                          {po.status === "PENDING_APPROVAL" && canApprove && (
                            <button
                              onClick={() => {
                                setActionPOId(po.id);
                                setConfirmApproveOpen(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              title="Duyệt đơn"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}

                          {/* Reject (Approver & Pending only) */}
                          {po.status === "PENDING_APPROVAL" && canApprove && (
                            <button
                              onClick={() => {
                                setActionPOId(po.id);
                                setRejectReason("");
                                setConfirmRejectOpen(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              title="Từ chối"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}

                          {/* Cancel (Draft / Pending only) */}
                          {(po.status === "DRAFT" || po.status === "PENDING_APPROVAL") && (
                            <button
                              onClick={() => {
                                setActionPOId(po.id);
                                setRejectReason("");
                                setConfirmCancelOpen(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-slate-200 text-red-500 hover:bg-red-50"
                              title="Hủy đơn hàng"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Chưa có đơn đặt hàng PO nào"
            description="Hãy bắt đầu tạo đơn hàng đặt mua sản phẩm từ các đối tác nhà cung cấp."
          />
        )}
      </div>

      {/* PO DETAIL VIEW MODAL */}
      <Modal
        open={viewModalOpen}
        title={`Chi tiết đơn hàng mua: ${selectedPO?.purchaseOrderNo}`}
        onClose={() => setViewModalOpen(false)}
        size="lg"
      >
        {selectedPO && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-400">Nhà cung cấp</span>
                <span className="text-sm font-semibold text-slate-800">{selectedPO.supplierName}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-400">Ngày đặt hàng</span>
                <span className="text-sm text-slate-800">{selectedPO.purchaseDate}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-400">Hạn giao hàng dự kiến</span>
                <span className="text-sm text-slate-800">{selectedPO.expectedDelivery || "Chưa thiết lập"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-400">Người lập đơn</span>
                <span className="text-sm text-slate-800">{selectedPO.createdBy || "Hệ thống"}</span>
              </div>
              {selectedPO.note && (
                <div className="sm:col-span-2">
                  <span className="block text-xs font-semibold uppercase text-slate-400">Ghi chú đơn PO</span>
                  <span className="text-sm text-slate-800 italic">{selectedPO.note}</span>
                </div>
              )}
            </div>

            {/* Items list */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Chi tiết sản phẩm</h3>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 font-semibold uppercase text-slate-700">
                    <tr>
                      <th className="px-4 py-2">Sản phẩm</th>
                      <th className="px-4 py-2 w-[80px] text-right">Số lượng</th>
                      <th className="px-4 py-2 w-[120px] text-right">Đơn giá mua</th>
                      <th className="px-4 py-2 w-[140px] text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPO.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2 font-semibold text-slate-800">
                          {item.productName || item.productCode}
                        </td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{fmt(item.unitCost)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-slate-900">
                          {fmt(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400">TỔNG GIÁ TRỊ ĐƠN HÀNG:</span>
                  <span className="ml-3 text-base font-bold text-slate-900">{fmt(selectedPO.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Action buttons inside View detail */}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="secondary" onClick={() => setViewModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ACTION CONFIRMATION DIALOGS */}

      {/* 1. Submit PO */}
      <ConfirmDialog
        open={confirmSubmitOpen}
        title="Gửi duyệt đơn đặt hàng PO?"
        description="Đơn hàng sẽ chuyển sang trạng thái CHỜ DUYỆT. Các cấp phê duyệt sẽ nhận thông tin xét duyệt đơn đặt hàng này."
        confirmText="Gửi đơn"
        loading={submitMutation.isPending}
        onConfirm={() => {
          if (actionPOId) {
            submitMutation.mutate(actionPOId, {
              onSuccess: () => {
                setConfirmSubmitOpen(false);
                setActionPOId(null);
                refetchPOs();
              }
            });
          }
        }}
        onClose={() => setConfirmSubmitOpen(false)}
      />

      {/* 2. Approve PO */}
      <ConfirmDialog
        open={confirmApproveOpen}
        title="Duyệt đơn đặt hàng PO?"
        description="Đơn đặt hàng sẽ chuyển sang trạng thái ĐÃ DUYỆT. Nhà cung cấp và bộ phận kho sẽ tiếp nhận để nhập hàng."
        confirmText="Phê duyệt"
        loading={approveMutation.isPending}
        onConfirm={() => {
          if (actionPOId) {
            approveMutation.mutate(actionPOId, {
              onSuccess: () => {
                setConfirmApproveOpen(false);
                setActionPOId(null);
                refetchPOs();
              }
            });
          }
        }}
        onClose={() => setConfirmApproveOpen(false)}
      />

      {/* 3. Reject PO */}
      <ConfirmDialog
        open={confirmRejectOpen}
        title="Từ chối đơn đặt hàng PO?"
        description="Hãy cung cấp lý do từ chối đơn hàng đặt mua để chuyển trả người lập chỉnh sửa."
        confirmText="Từ chối"
        loading={rejectMutation.isPending}
        onConfirm={() => {
          if (!rejectReason.trim()) {
            alert("Vui lòng nhập lý do từ chối");
            return;
          }
          if (actionPOId) {
            rejectMutation.mutate(
              { id: actionPOId, reason: rejectReason },
              {
                onSuccess: () => {
                  setConfirmRejectOpen(false);
                  setActionPOId(null);
                  setRejectReason("");
                  refetchPOs();
                }
              }
            );
          }
        }}
        onClose={() => setConfirmRejectOpen(false)}
      >
        <div className="mt-3">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Lý do từ chối (bắt buộc)</label>
          <textarea
            required
            placeholder="Giá trị đơn quá lớn chưa qua so giá / Nhập thiếu thông tin..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full text-xs border border-slate-200 p-2 rounded focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </ConfirmDialog>

      {/* 4. Cancel PO */}
      <ConfirmDialog
        open={confirmCancelOpen}
        title="Hủy đơn đặt hàng PO?"
        description="Xác nhận hủy đơn hàng này? Bạn sẽ không thể phục hồi trạng thái sau khi đã hủy."
        confirmText="Hủy đơn"
        loading={cancelMutation.isPending}
        onConfirm={() => {
          if (!rejectReason.trim()) {
            alert("Vui lòng nhập lý do hủy đơn");
            return;
          }
          if (actionPOId) {
            cancelMutation.mutate(
              { id: actionPOId, reason: rejectReason },
              {
                onSuccess: () => {
                  setConfirmCancelOpen(false);
                  setActionPOId(null);
                  setRejectReason("");
                  refetchPOs();
                }
              }
            );
          }
        }}
        onClose={() => setConfirmCancelOpen(false)}
      >
        <div className="mt-3">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Lý do hủy đơn (bắt buộc)</label>
          <textarea
            required
            placeholder="Hủy do nhà cung cấp không giao hàng đúng hẹn / Nhập sai thông tin..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full text-xs border border-slate-200 p-2 rounded focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
