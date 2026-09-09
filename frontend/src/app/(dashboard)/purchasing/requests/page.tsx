"use client";

import { useState, useEffect, useMemo } from "react";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import {
  usePurchaseRequests,
  useCreatePurchaseRequest,
  useUpdatePurchaseRequest,
  useSubmitPurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
  useConvertToPO
} from "@/features/purchasing/hooks";
import { useProducts } from "@/features/products/hooks";
import { useBranches } from "@/features/branches/hooks";
import { PR_STATUS_LABELS, PR_STATUS_BADGE_TONE } from "@/features/purchasing/types";
import type { PurchaseRequest, PurchaseRequestItem, PurchaseRequestStatus, PurchaseRequestPriority } from "@/features/purchasing/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Send,
  Check,
  X,
  RefreshCw,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2
} from "lucide-react";

// Helper formatting
function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

const PRIORITY_TONES: Record<PurchaseRequestPriority, "slate" | "blue" | "amber" | "red"> = {
  LOW: "slate",
  NORMAL: "blue",
  HIGH: "amber",
  URGENT: "red"
};

const PRIORITY_LABELS: Record<PurchaseRequestPriority, string> = {
  LOW: "Thấp",
  NORMAL: "Thường",
  HIGH: "Cao",
  URGENT: "Khẩn cấp"
};

export default function PurchaseRequestsPage() {
  const currentUser = useCurrentUser();
  const canApprove = currentUser?.permissions?.includes("APPROVE_PURCHASE_ORDER") ?? false;

  // Filters
  const [statusFilter, setStatusFilter] = useState<PurchaseRequestStatus | "ALL">("ALL");
  const [selectedBranchId, setSelectedBranchId] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(0);

  // Queries
  const { data: branchesData } = useBranches({ keyword: "", page: 0, pageSize: 100 });
  const { data: prsData, isLoading: loadingPRs, refetch: refetchPRs } = usePurchaseRequests({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    branchId: selectedBranchId === "ALL" ? undefined : selectedBranchId,
    page,
    size: 20
  });

  // Create/Edit/View Form State
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [editingPR, setEditingPR] = useState<PurchaseRequest | null>(null);

  // Form Fields
  const [prBranchId, setPrBranchId] = useState<number>(1);
  const [prDate, setPrDate] = useState(new Date().toISOString().split("T")[0]);
  const [prPriority, setPrPriority] = useState<PurchaseRequestPriority>("NORMAL");
  const [prDepartment, setPrDepartment] = useState("");
  const [prExpectedDate, setPrExpectedDate] = useState("");
  const [prReason, setPrReason] = useState("");
  const [prItems, setPrItems] = useState<Omit<PurchaseRequestItem, "id">[]>([]);

  // Product search in Form
  const [productSearch, setProductSearch] = useState("");
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Debounce logic for product search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProductSearch(productSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const { data: productsData, isFetching: searchingProducts } = useProducts({
    keyword: debouncedProductSearch,
    category: "ALL",
    status: "ALL",
    page: 1,
    pageSize: 30
  });

  // Action Dialog States
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [confirmConvertOpen, setConfirmConvertOpen] = useState(false);
  const [actionPRId, setActionPRId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Mutations
  const createMutation = useCreatePurchaseRequest();
  const updateMutation = useUpdatePurchaseRequest();
  const submitMutation = useSubmitPurchaseRequest();
  const approveMutation = useApprovePurchaseRequest();
  const rejectMutation = useRejectPurchaseRequest();
  const convertMutation = useConvertToPO();

  // Initialize form default branch
  useEffect(() => {
    if (currentUser?.branchId) {
      setPrBranchId(Number(currentUser.branchId));
    } else if (branchesData?.items && branchesData.items.length > 0) {
      setPrBranchId(branchesData.items[0].id);
    }
  }, [currentUser, branchesData]);

  // Open Form
  const handleOpenCreate = () => {
    setFormMode("create");
    setEditingPR(null);
    setPrDate(new Date().toISOString().split("T")[0]);
    setPrPriority("NORMAL");
    setPrDepartment("");
    setPrExpectedDate("");
    setPrReason("");
    setPrItems([]);
    setFormOpen(true);
  };

  const handleOpenEdit = (pr: PurchaseRequest) => {
    setFormMode("edit");
    setEditingPR(pr);
    setPrBranchId(pr.branchId);
    setPrDate(pr.prDate);
    setPrPriority(pr.priority);
    setPrDepartment(pr.department ?? "");
    setPrExpectedDate(pr.expectedDate ?? "");
    setPrReason(pr.reason ?? "");
    setPrItems(pr.items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unit: i.unit,
      estimatedPrice: i.estimatedPrice,
      note: i.note
    })));
    setFormOpen(true);
  };

  const handleOpenView = (pr: PurchaseRequest) => {
    setFormMode("view");
    setEditingPR(pr);
    setPrBranchId(pr.branchId);
    setPrDate(pr.prDate);
    setPrPriority(pr.priority);
    setPrDepartment(pr.department ?? "");
    setPrExpectedDate(pr.expectedDate ?? "");
    setPrReason(pr.reason ?? "");
    setPrItems(pr.items);
    setFormOpen(true);
  };

  // Add Item to list
  const handleAddProduct = (prod: any) => {
    setPrItems([
      ...prItems,
      {
        productId: prod.id,
        productName: prod.productName,
        quantity: 1,
        unit: "Cái",
        estimatedPrice: prod.importPrice ?? 0,
        note: ""
      }
    ]);
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const handleAddCustomItem = () => {
    setPrItems([
      ...prItems,
      {
        productName: "",
        quantity: 1,
        unit: "Cái",
        estimatedPrice: 0,
        note: ""
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setPrItems(prItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof Omit<PurchaseRequestItem, "id">, value: any) => {
    const next = [...prItems];
    next[index] = { ...next[index], [field]: value };
    setPrItems(next);
  };

  // Form Submit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (prItems.length === 0) {
      alert("Vui lòng thêm ít nhất 1 mặt hàng");
      return;
    }
    const payload = {
      prDate,
      priority: prPriority,
      department: prDepartment || null,
      expectedDate: prExpectedDate || null,
      reason: prReason || null,
      items: prItems
    };

    if (formMode === "create") {
      createMutation.mutate(
        { req: payload, branchId: prBranchId },
        {
          onSuccess: () => {
            setFormOpen(false);
          }
        }
      );
    } else if (formMode === "edit" && editingPR) {
      updateMutation.mutate(
        { id: editingPR.id, req: payload },
        {
          onSuccess: () => {
            setFormOpen(false);
          }
        }
      );
    }
  };

  // Estimated PR Total
  const estimatedTotal = useMemo(() => {
    return prItems.reduce((sum, item) => sum + (item.quantity * item.estimatedPrice), 0);
  }, [prItems]);

  // Client side search filtering
  const filteredPRs = useMemo(() => {
    if (!prsData?.items) return [];
    return prsData.items.filter(pr => {
      const matchSearch =
        searchQuery.trim() === "" ||
        pr.prNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.requestedBy?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.requestedBy?.username?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [prsData, searchQuery]);

  return (
    <div className="space-y-6 p-6">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Yêu Cầu Đề Nghị Mua Hàng</h1>
          <p className="text-sm text-slate-500">
            Tạo và xét duyệt đề xuất mua sắm thiết bị, hàng hóa cho từng chi nhánh.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tạo đề nghị mua
        </Button>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1">
          {(["ALL", "DRAFT", "PENDING", "APPROVED", "REJECTED", "CONVERTED"] as const).map(status => (
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
              {status === "ALL" ? "Tất cả" : PR_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {/* Search & Branch Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch filter */}
          <div className="relative">
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
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã PR, lý do, người đề nghị..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-[260px] rounded-lg border border-slate-200 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Main List Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loadingPRs ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredPRs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700">
                <tr>
                  <th className="px-6 py-3">Mã đề xuất</th>
                  <th className="px-6 py-3">Ngày đề xuất</th>
                  <th className="px-6 py-3">Chi nhánh</th>
                  <th className="px-6 py-3">Người đề nghị</th>
                  <th className="px-6 py-3">Độ ưu tiên</th>
                  <th className="px-6 py-3 text-right">Tổng ước tính</th>
                  <th className="px-6 py-3 text-center">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPRs.map((pr) => {
                  const itemsSum = pr.items.reduce((sum, item) => sum + (item.quantity * item.estimatedPrice), 0);
                  const branchName = branchesData?.items.find(b => b.id === pr.branchId)?.name ?? `CN-${pr.branchId}`;
                  return (
                    <tr key={pr.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{pr.prNo}</td>
                      <td className="px-6 py-4">{pr.prDate}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{branchName}</td>
                      <td className="px-6 py-4">
                        {pr.requestedBy?.fullName || pr.requestedBy?.username || "Hệ thống"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={PRIORITY_TONES[pr.priority]}>
                          {PRIORITY_LABELS[pr.priority]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-950">{fmt(itemsSum)}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge tone={
                          pr.status === "APPROVED" ? "green" :
                          pr.status === "PENDING" ? "amber" :
                          pr.status === "CONVERTED" ? "blue" :
                          pr.status === "REJECTED" ? "red" : "slate"
                        }>
                          {PR_STATUS_LABELS[pr.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => handleOpenView(pr)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit (Draft only) */}
                          {pr.status === "DRAFT" && (
                            <button
                              onClick={() => handleOpenEdit(pr)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}

                          {/* Submit to PENDING (Draft only) */}
                          {pr.status === "DRAFT" && (
                            <button
                              onClick={() => {
                                setActionPRId(pr.id);
                                setConfirmSubmitOpen(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                              title="Gửi duyệt"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}

                          {/* Approve (Approver & Pending only) */}
                          {pr.status === "PENDING" && canApprove && (
                            <button
                              onClick={() => {
                                setActionPRId(pr.id);
                                setConfirmApproveOpen(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              title="Duyệt"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}

                          {/* Reject (Approver & Pending only) */}
                          {pr.status === "PENDING" && canApprove && (
                            <button
                              onClick={() => {
                                setActionPRId(pr.id);
                                setRejectReason("");
                                setConfirmRejectOpen(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              title="Từ chối"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}

                          {/* Convert to PO (Approved only) */}
                          {pr.status === "APPROVED" && (
                            <button
                              onClick={() => {
                                setActionPRId(pr.id);
                                setConfirmConvertOpen(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                              title="Chuyển đổi sang đơn đặt hàng (PO)"
                            >
                              <RefreshCw className="h-4 w-4" />
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
            title="Không tìm thấy đề nghị mua"
            description="Hãy tạo mới đề xuất mua hàng hoặc điều chỉnh bộ lọc tìm kiếm."
          />
        )}
      </div>

      {/* CREATE / EDIT / VIEW MODAL */}
      <Modal
        open={formOpen}
        title={
          formMode === "create"
            ? "Tạo mới đề nghị mua hàng"
            : formMode === "edit"
            ? `Chỉnh sửa đề nghị mua hàng: ${editingPR?.prNo}`
            : `Chi tiết đề nghị mua hàng: ${editingPR?.prNo}`
        }
        size="xl"
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          {/* General Metadata */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Chi nhánh đề xuất
              </label>
              <select
                disabled={formMode === "view" || formMode === "edit"}
                value={prBranchId}
                onChange={(e) => setPrBranchId(Number(e.target.value))}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-500"
              >
                {branchesData?.items.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Ngày đề nghị
              </label>
              <input
                type="date"
                disabled={formMode === "view"}
                value={prDate}
                onChange={(e) => setPrDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Độ ưu tiên
              </label>
              <select
                disabled={formMode === "view"}
                value={prPriority}
                onChange={(e) => setPrPriority(e.target.value as PurchaseRequestPriority)}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="LOW">Thấp</option>
                <option value="NORMAL">Thường</option>
                <option value="HIGH">Cao</option>
                <option value="URGENT">Khẩn cấp</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Bộ phận yêu cầu
              </label>
              <input
                type="text"
                disabled={formMode === "view"}
                placeholder="Ví dụ: Phòng Kỹ Thuật, Kho, Admin..."
                value={prDepartment}
                onChange={(e) => setPrDepartment(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Ngày mong muốn nhận
              </label>
              <input
                type="date"
                disabled={formMode === "view"}
                value={prExpectedDate}
                onChange={(e) => setPrExpectedDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Lý do đề xuất mua hàng
              </label>
              <textarea
                disabled={formMode === "view"}
                placeholder="Nêu lý do, tính cấp thiết của việc mua hàng..."
                value={prReason}
                onChange={(e) => setPrReason(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Rejected Reason info if any */}
          {formMode === "view" && editingPR?.rejectedReason && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-100">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> Lý do bị từ chối xét duyệt:
              </p>
              <p className="mt-1 font-medium">{editingPR.rejectedReason}</p>
            </div>
          )}

          {/* Items Section */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Danh sách mặt hàng đề xuất</h3>
              {formMode !== "view" && (
                <div className="flex items-center gap-2">
                  {/* Search bar for products catalog */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm hàng từ catalogue..."
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      className="h-9 w-[260px] rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {searchingProducts && (
                      <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-slate-400" />
                    )}
                    {showProductDropdown && productSearch.length > 0 && productsData?.items && (
                      <div className="absolute right-0 top-10 z-[100] w-[350px] max-h-[250px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                        {productsData.items.length > 0 ? (
                          productsData.items.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleAddProduct(p)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-semibold text-slate-800">{p.productName}</span>
                                <span className="block text-slate-400">{p.productCode}</span>
                              </div>
                              <span className="font-medium text-slate-600">{fmt(p.importPrice)}</span>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-slate-400 text-xs">Không tìm thấy sản phẩm</div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button variant="secondary" onClick={handleAddCustomItem}>
                    + Nhập ngoài catalogue
                  </Button>
                </div>
              )}
            </div>

            {/* Items table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Tên sản phẩm / Quy cách</th>
                    <th className="px-4 py-2.5 w-[110px]">Số lượng</th>
                    <th className="px-4 py-2.5 w-[110px]">Đơn vị tính</th>
                    <th className="px-4 py-2.5 w-[180px]">Giá dự kiến</th>
                    <th className="px-4 py-2.5">Ghi chú mặt hàng</th>
                    <th className="px-4 py-2.5 text-right w-[150px]">Thành tiền</th>
                    {formMode !== "view" && <th className="px-4 py-2.5 w-[50px]"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/20">
                      {/* Name */}
                      <td className="px-4 py-2">
                        {formMode === "view" || item.productId ? (
                          <span className="font-medium text-slate-800">{item.productName}</span>
                        ) : (
                          <input
                            type="text"
                            required
                            placeholder="Nhập tên mặt hàng, phụ tùng..."
                            value={item.productName}
                            onChange={(e) => handleUpdateItem(idx, "productName", e.target.value)}
                            className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                        {item.productId && (
                          <span className="ml-1 text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1 py-0.5 rounded">
                            Mã catalogue
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-2">
                        {formMode === "view" ? (
                          <span className="font-semibold text-slate-800">{item.quantity}</span>
                        ) : (
                          <input
                            type="number"
                            required
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                            className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                      </td>

                      {/* Unit */}
                      <td className="px-4 py-2">
                        {formMode === "view" ? (
                          <span>{item.unit || "Cái"}</span>
                        ) : (
                          <input
                            type="text"
                            placeholder="Cái, Chiếc..."
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(idx, "unit", e.target.value)}
                            className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                      </td>

                      {/* Estimated Price */}
                      <td className="px-4 py-2">
                        {formMode === "view" ? (
                          <span>{fmt(item.estimatedPrice)}</span>
                        ) : (
                          <input
                            type="number"
                            required
                            min={0}
                            value={item.estimatedPrice}
                            onChange={(e) => handleUpdateItem(idx, "estimatedPrice", Math.max(0, parseFloat(e.target.value) || 0))}
                            className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                      </td>

                      {/* Item Note */}
                      <td className="px-4 py-2">
                        {formMode === "view" ? (
                          <span className="text-xs text-slate-500 italic">{item.note || "—"}</span>
                        ) : (
                          <input
                            type="text"
                            placeholder="Màu sắc, kích thước..."
                            value={item.note}
                            onChange={(e) => handleUpdateItem(idx, "note", e.target.value)}
                            className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                      </td>

                      {/* Line total */}
                      <td className="px-4 py-2 text-right font-semibold text-slate-900">
                        {fmt(item.quantity * item.estimatedPrice)}
                      </td>

                      {/* Actions */}
                      {formMode !== "view" && (
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}

                  {prItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center p-4 text-slate-400 text-xs italic">
                        Chưa có sản phẩm nào được đề xuất. Hãy chọn từ catalogue hoặc nhập ngoài.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total summary */}
            <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500">TỔNG DỰ KIẾN:</span>
                <span className="ml-3 text-lg font-bold text-slate-950">{fmt(estimatedTotal)}</span>
              </div>
            </div>
          </div>

          {/* Form Actions footer */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Đóng
            </Button>
            {formMode !== "view" && (
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Đang lưu" : "Lưu đề xuất"}
              </Button>
            )}
          </div>
        </form>
      </Modal>

      {/* CONFIRM ACTION DIALOGS */}

      {/* 1. Submit PR */}
      <ConfirmDialog
        open={confirmSubmitOpen}
        title="Gửi duyệt đề nghị mua hàng?"
        description="Đề nghị mua hàng sẽ được chuyển sang trạng thái CHỜ DUYỆT và gửi tới cấp trên. Bạn sẽ không thể sửa thông tin cho tới khi được duyệt hoặc từ chối."
        confirmText="Gửi duyệt"
        loading={submitMutation.isPending}
        onConfirm={() => {
          if (actionPRId) {
            submitMutation.mutate(actionPRId, {
              onSuccess: () => {
                setConfirmSubmitOpen(false);
                setActionPRId(null);
                refetchPRs();
              }
            });
          }
        }}
        onClose={() => setConfirmSubmitOpen(false)}
      />

      {/* 2. Approve PR */}
      <ConfirmDialog
        open={confirmApproveOpen}
        title="Xác nhận duyệt đề xuất mua hàng?"
        description="Sau khi được duyệt, đề xuất này có thể chuyển sang bước lập đơn đặt hàng PO gửi nhà cung cấp."
        confirmText="Duyệt đề xuất"
        loading={approveMutation.isPending}
        onConfirm={() => {
          if (actionPRId) {
            approveMutation.mutate(actionPRId, {
              onSuccess: () => {
                setConfirmApproveOpen(false);
                setActionPRId(null);
                refetchPRs();
              }
            });
          }
        }}
        onClose={() => setConfirmApproveOpen(false)}
      />

      {/* 3. Reject PR */}
      <ConfirmDialog
        open={confirmRejectOpen}
        title="Từ chối đề xuất mua hàng?"
        description="Vui lòng cung cấp lý do từ chối để người lập có thể điều chỉnh và tạo lại yêu cầu."
        confirmText="Từ chối"
        loading={rejectMutation.isPending}
        onConfirm={() => {
          if (!rejectReason.trim()) {
            alert("Vui lòng nhập lý do từ chối");
            return;
          }
          if (actionPRId) {
            rejectMutation.mutate(
              { id: actionPRId, reason: rejectReason },
              {
                onSuccess: () => {
                  setConfirmRejectOpen(false);
                  setActionPRId(null);
                  setRejectReason("");
                  refetchPRs();
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
            placeholder="Mặt hàng này hiện tại chưa cần thiết / Vui lòng điều chỉnh đơn giá..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            className="w-full text-xs border border-slate-200 p-2 rounded focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </ConfirmDialog>

      {/* 4. Convert PR to PO */}
      <ConfirmDialog
        open={confirmConvertOpen}
        title="Chuyển đổi sang đơn mua hàng (PO)?"
        description="Hệ thống sẽ tự động tạo một đơn đặt hàng nháp (DRAFT PO) liên kết các mặt hàng từ đề xuất này. Bạn có thể thay đổi nhà cung cấp và xác nhận lại đơn đặt hàng."
        confirmText="Chuyển PO"
        loading={convertMutation.isPending}
        onConfirm={() => {
          if (actionPRId) {
            convertMutation.mutate(actionPRId, {
              onSuccess: () => {
                setConfirmConvertOpen(false);
                setActionPRId(null);
                refetchPRs();
              }
            });
          }
        }}
        onClose={() => setConfirmConvertOpen(false)}
      />
    </div>
  );
}
