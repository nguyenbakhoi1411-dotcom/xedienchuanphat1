"use client";

import { useState, useMemo, useEffect } from "react";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import {
  usePurchaseReceipts,
  useCreatePurchaseReceipt,
  useConfirmPurchaseReceipt,
  useCancelPurchaseReceipt,
  usePurchaseOrders,
  useSuppliers
} from "@/features/purchasing/hooks";
import { useProducts } from "@/features/products/hooks";
import { useBranches } from "@/features/branches/hooks";
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
  Check,
  X,
  Calendar,
  AlertCircle,
  Loader2,
  Trash2,
  FileCheck
} from "lucide-react";

// Formats currency
function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

export default function GoodsReceiptPage() {
  const currentUser = useCurrentUser();

  // Filter state
  const [selectedBranchId, setSelectedBranchId] = useState<number | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<string | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(0);

  // Queries
  const { data: branchesData } = useBranches({ keyword: "", page: 0, pageSize: 100 });
  const { data: receiptsData, isLoading: loadingReceipts, refetch: refetchReceipts } = usePurchaseReceipts({
    branchId: selectedBranchId === "ALL" ? undefined : selectedBranchId,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    pageSize: 30
  });

  // Active POs for matching
  const { data: posData } = usePurchaseOrders({
    status: "APPROVED" // can only match approved/confirmed POs
  });

  const { data: partialPOs } = usePurchaseOrders({
    status: "PARTIALLY_RECEIVED"
  });

  const activePOs = useMemo(() => {
    const arr = [];
    if (posData?.items) arr.push(...posData.items);
    if (partialPOs?.items) arr.push(...partialPOs.items);
    return arr;
  }, [posData, partialPOs]);

  // Form Modal States
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState<number | "DIRECT">("DIRECT");
  const [directSupplierId, setDirectSupplierId] = useState<number | "">("");
  const [receiptBranchId, setReceiptBranchId] = useState<number>(1);
  const [receiptWarehouseId, setReceiptWarehouseId] = useState<number>(1);
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [items, setItems] = useState<{
    productId: number;
    productName: string;
    orderedQty?: number;
    quantity: number;
    unitCost: number;
    frameNumber?: string;
    engineNumber?: string;
    batterySerial?: string;
    note?: string;
  }[]>([]);

  // Product search in manual creation
  const [productSearch, setProductSearch] = useState("");
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

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

  const { data: suppliersData } = useSuppliers(undefined, 0, 100);

  // View Modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Confirmation state
  const [confirmReceiptOpen, setConfirmReceiptOpen] = useState(false);
  const [cancelReceiptOpen, setCancelReceiptOpen] = useState(false);
  const [actionReceiptId, setActionReceiptId] = useState<number | null>(null);

  // Mutations
  const createMutation = useCreatePurchaseReceipt();
  const confirmMutation = useConfirmPurchaseReceipt();
  const cancelMutation = useCancelPurchaseReceipt();

  // Initialize branch
  useEffect(() => {
    if (currentUser?.branchId) {
      setReceiptBranchId(Number(currentUser.branchId));
    } else if (branchesData?.items && branchesData.items.length > 0) {
      setReceiptBranchId(branchesData.items[0].id);
    }
  }, [currentUser, branchesData]);

  // Handle PO match selection
  const handleSelectPO = (poId: number) => {
    const po = activePOs.find(o => o.id === poId);
    if (!po) return;
    setReceiptBranchId(po.branchId);
    setDirectSupplierId(po.supplierId);
    
    // map items
    setItems(
      po.items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        orderedQty: i.quantity,
        quantity: i.quantity, // default to receive full amount
        unitCost: i.unitCost,
        frameNumber: "",
        engineNumber: "",
        batterySerial: "",
        note: ""
      }))
    );
  };

  const handleAddProduct = (prod: any) => {
    const exists = items.find(i => i.productId === prod.id);
    if (exists) {
      setItems(items.map(i => i.productId === prod.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([
        ...items,
        {
          productId: prod.id,
          productName: prod.productName,
          quantity: 1,
          unitCost: prod.importPrice ?? 0,
          frameNumber: "",
          engineNumber: "",
          batterySerial: "",
          note: ""
        }
      ]);
    }
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const handleUpdateItemField = (productId: number, field: string, val: any) => {
    setItems(
      items.map(i => i.productId === productId ? { ...i, [field]: val } : i)
    );
  };

  const handleCreateOpen = () => {
    setSelectedPOId("DIRECT");
    setDirectSupplierId("");
    setNote("");
    setItems([]);
    setReceiptDate(new Date().toISOString().split("T")[0]);
    setCreateOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supId = selectedPOId === "DIRECT" ? directSupplierId : directSupplierId;
    if (!supId) {
      alert("Vui lòng chọn Nhà cung cấp");
      return;
    }
    if (items.length === 0) {
      alert("Vui lòng nhập ít nhất 1 mặt hàng nhập kho");
      return;
    }

    const payload = {
      purchaseOrderId: selectedPOId === "DIRECT" ? null : selectedPOId,
      supplierId: Number(supId),
      branchId: receiptBranchId,
      warehouseId: receiptWarehouseId,
      receiptDate,
      note: note || null,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitCost: i.unitCost,
        frameNumber: i.frameNumber || null,
        engineNumber: i.engineNumber || null,
        batterySerial: i.batterySerial || null,
        note: i.note || null
      }))
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setCreateOpen(false);
        refetchReceipts();
      }
    });
  };

  const filteredReceipts = useMemo(() => {
    if (!receiptsData?.items) return [];
    return receiptsData.items.filter(r => {
      const matchQuery =
        searchQuery.trim() === "" ||
        r.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.purchaseOrderNo?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    });
  }, [receiptsData, searchQuery]);

  return (
    <div className="space-y-6 p-6">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Phiếu Nhập Kho (Goods Receipt)</h1>
          <p className="text-sm text-slate-500">
            Quản lý phiếu thực nhập kho hàng hóa, đối chiếu số lượng thực tế với đơn đặt hàng PO và kích hoạt công nợ.
          </p>
        </div>
        <Button onClick={handleCreateOpen}>
          <Plus className="mr-2 h-4 w-4" /> Tạo phiếu nhập kho
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1">
          {(["ALL", "DRAFT", "CONFIRMED", "CANCELLED"] as const).map(status => (
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
              {status === "ALL" ? "Tất cả" : status === "DRAFT" ? "Nháp" : status === "CONFIRMED" ? "Đã nhập kho" : "Đã hủy"}
            </button>
          ))}
        </div>

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
              placeholder="Mã phiếu nhập, mã PO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-[240px] rounded-lg border border-slate-200 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loadingReceipts ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredReceipts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700">
                <tr>
                  <th className="px-6 py-3">Mã phiếu nhập</th>
                  <th className="px-6 py-3">Mã PO liên kết</th>
                  <th className="px-6 py-3">Ngày nhận</th>
                  <th className="px-6 py-3">Nhà cung cấp</th>
                  <th className="px-6 py-3">Người thực hiện</th>
                  <th className="px-6 py-3 text-right">Tổng giá trị</th>
                  <th className="px-6 py-3 text-center">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.map(r => {
                  const branch = branchesData?.items.find(b => b.id === r.branchId)?.name ?? `CN-${r.branchId}`;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{r.receiptNo}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{r.purchaseOrderNo || "Nhập trực tiếp"}</td>
                      <td className="px-6 py-4">{r.receiptDate}</td>
                      <td className="px-6 py-4">{r.supplierName || `ID: ${r.supplierId}`}</td>
                      <td className="px-6 py-4">{r.createdBy || "SYSTEM"}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-950">{fmt(r.totalAmount)}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge tone={
                          r.status === "CONFIRMED" ? "green" :
                          r.status === "DRAFT" ? "slate" : "red"
                        }>
                          {r.status === "CONFIRMED" ? "Đã nhập kho" : r.status === "DRAFT" ? "Nháp" : "Đã hủy"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedReceipt(r);
                              setViewOpen(true);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Confirm receipt */}
                          {r.status === "DRAFT" && (
                            <button
                              onClick={() => {
                                setActionReceiptId(r.id);
                                setConfirmReceiptOpen(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              title="Xác nhận nhập kho"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}

                          {/* Cancel receipt */}
                          {r.status === "DRAFT" && (
                            <button
                              onClick={() => {
                                setActionReceiptId(r.id);
                                setCancelReceiptOpen(true);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              title="Hủy phiếu nhập"
                            >
                              <X className="h-4 w-4" />
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
            title="Chưa có phiếu nhập kho nào"
            description="Lập phiếu nhập kho để ghi nhận thực tế xe máy, phụ tùng nhập kho từ các đơn đặt hàng PO."
          />
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        open={createOpen}
        title="Lập phiếu nhập kho mới (Goods Receipt)"
        onClose={() => setCreateOpen(false)}
        size="xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Choose matching PO or direct */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Đối chiếu theo đơn hàng PO</label>
              <select
                value={selectedPOId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedPOId(val === "DIRECT" ? "DIRECT" : Number(val));
                  if (val !== "DIRECT") {
                    handleSelectPO(Number(val));
                  } else {
                    setItems([]);
                    setDirectSupplierId("");
                  }
                }}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="DIRECT">Nhập trực tiếp (Không qua PO)</option>
                {activePOs.map(po => (
                  <option key={po.id} value={po.id}>
                    {po.purchaseOrderNo} - {po.supplierName} ({fmt(po.totalAmount)})
                  </option>
                ))}
              </select>
            </div>

            {/* If DIRECT, select supplier */}
            {selectedPOId === "DIRECT" ? (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Nhà cung cấp đối tác</label>
                <select
                  value={directSupplierId}
                  onChange={(e) => setDirectSupplierId(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">-- Chọn Nhà Cung Cấp --</option>
                  {suppliersData?.items.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Nhà cung cấp đối tác</label>
                <div className="h-9 rounded-lg border border-slate-100 bg-slate-50 px-3 flex items-center text-sm font-semibold text-slate-700">
                  {suppliersData?.items.find(s => s.id === directSupplierId)?.name || "NCC từ PO"}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Chi nhánh hạch toán</label>
              <select
                disabled={selectedPOId !== "DIRECT"}
                value={receiptBranchId}
                onChange={(e) => setReceiptBranchId(Number(e.target.value))}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-500"
              >
                {branchesData?.items.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Nhập vào kho</label>
              <select
                value={receiptWarehouseId}
                onChange={(e) => setReceiptWarehouseId(Number(e.target.value))}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={1}>Kho chính</option>
                <option value={2}>Kho xe máy</option>
                <option value={3}>Kho linh kiện</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Ngày thực nhập</label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Ghi chú phiếu nhập kho</label>
              <textarea
                placeholder="Ghi chú phiếu nhập..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Chi tiết sản phẩm thực nhập</h3>
              
              {selectedPOId === "DIRECT" && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm sản phẩm catalogue..."
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
                    <div className="absolute right-0 top-10 z-[100] w-[320px] max-h-[220px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                      {productsData.items.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleAddProduct(p)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-100 text-xs flex justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{p.productName}</span>
                            <span className="block text-slate-400">{p.productCode}</span>
                          </div>
                          <span>{fmt(p.importPrice)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Table of receipt items */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700">
                  <tr>
                    <th className="px-4 py-2">Sản phẩm</th>
                    {selectedPOId !== "DIRECT" && <th className="px-4 py-2 w-[110px] text-right">SL đặt mua</th>}
                    <th className="px-4 py-2 w-[110px] text-right">SL thực nhận</th>
                    <th className="px-4 py-2 w-[140px] text-right">Đơn giá nhập</th>
                    <th className="px-4 py-2">Số khung / Số máy / Số Serial xe máy</th>
                    <th className="px-4 py-2 text-right w-[140px]">Thành tiền</th>
                    {selectedPOId === "DIRECT" && <th className="px-4 py-2 w-[50px]"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={item.productId} className="hover:bg-slate-50/25">
                      <td className="px-4 py-2">
                        <span className="font-semibold text-slate-900">{item.productName}</span>
                      </td>

                      {/* PO Qty if applicable */}
                      {selectedPOId !== "DIRECT" && (
                        <td className="px-4 py-2 text-right font-medium text-slate-600">
                          {item.orderedQty}
                        </td>
                      )}

                      {/* Actual Qty */}
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          min={1}
                          required
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemField(item.productId, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                          className="h-8 w-full rounded border border-slate-200 px-2 text-right text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>

                      {/* Unit Cost */}
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          required
                          value={item.unitCost}
                          onChange={(e) => handleUpdateItemField(item.productId, "unitCost", Math.max(0, parseFloat(e.target.value) || 0))}
                          className="h-8 w-full rounded border border-slate-200 px-2 text-right text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>

                      {/* Serial details */}
                      <td className="px-4 py-2 gap-2 space-y-1">
                        <div className="grid grid-cols-2 gap-1">
                          <input
                            type="text"
                            placeholder="Số khung (Frame No)"
                            value={item.frameNumber || ""}
                            onChange={(e) => handleUpdateItemField(item.productId, "frameNumber", e.target.value)}
                            className="h-7 rounded border border-slate-200 px-2 text-[10px] focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Số máy (Engine No)"
                            value={item.engineNumber || ""}
                            onChange={(e) => handleUpdateItemField(item.productId, "engineNumber", e.target.value)}
                            className="h-7 rounded border border-slate-200 px-2 text-[10px] focus:outline-none"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Serial pin / ắc quy xe máy điện"
                          value={item.batterySerial || ""}
                          onChange={(e) => handleUpdateItemField(item.productId, "batterySerial", e.target.value)}
                          className="h-7 w-full rounded border border-slate-200 px-2 text-[10px] focus:outline-none"
                        />
                      </td>

                      <td className="px-4 py-2 text-right font-semibold text-slate-950">
                        {fmt(item.quantity * item.unitCost)}
                      </td>

                      {selectedPOId === "DIRECT" && (
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center p-6 text-slate-400 text-xs italic">
                        Chưa chọn sản phẩm nào để thực hiện nhập kho.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500">TỔNG GIÁ TRỊ NHẬP KHO:</span>
                <span className="ml-3 text-base font-bold text-slate-950">
                  {fmt(items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Đóng
            </Button>
            <Button type="submit" disabled={createMutation.isPending || items.length === 0}>
              {createMutation.isPending ? "Đang lập..." : "Lập phiếu nháp"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW RECEIPT MODAL */}
      <Modal
        open={viewOpen}
        title={`Chi tiết phiếu nhập kho: ${selectedReceipt?.receiptNo}`}
        onClose={() => setViewOpen(false)}
        size="lg"
      >
        {selectedReceipt && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-400">Nhà cung cấp</span>
                <span className="text-sm font-semibold text-slate-800">{selectedReceipt.supplierName || `ID: ${selectedReceipt.supplierId}`}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-400">Ngày nhập kho</span>
                <span className="text-sm text-slate-800">{selectedReceipt.receiptDate}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-400">Đơn PO đối chiếu</span>
                <span className="text-sm text-slate-800 font-semibold">{selectedReceipt.purchaseOrderNo || "Nhập trực tiếp"}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold uppercase text-slate-400">Thực hiện bởi</span>
                <span className="text-sm text-slate-800">{selectedReceipt.createdBy || "SYSTEM"}</span>
              </div>
              {selectedReceipt.note && (
                <div className="sm:col-span-2">
                  <span className="block text-xs font-semibold uppercase text-slate-400">Ghi chú phiếu nhập</span>
                  <span className="text-sm text-slate-800 italic">{selectedReceipt.note}</span>
                </div>
              )}
            </div>

            {/* Items detail list */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900 font-bold">Mặt hàng nhập kho</h3>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 font-semibold uppercase text-slate-700">
                    <tr>
                      <th className="px-4 py-2">Sản phẩm</th>
                      <th className="px-4 py-2 text-right w-[80px]">Số lượng</th>
                      <th className="px-4 py-2 text-right w-[120px]">Giá nhập</th>
                      <th className="px-4 py-2">Số khung / Số máy / Pin Serial</th>
                      <th className="px-4 py-2 text-right w-[140px]">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReceipt.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2 font-semibold text-slate-800">
                          {item.productName || `ID: ${item.productId}`}
                        </td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{fmt(item.unitCost)}</td>
                        <td className="px-4 py-2 text-slate-600 text-[10px]">
                          {item.frameNumber && <div className="font-mono">Số khung: {item.frameNumber}</div>}
                          {item.engineNumber && <div className="font-mono">Số máy: {item.engineNumber}</div>}
                          {item.batterySerial && <div className="font-mono">Serial Pin: {item.batterySerial}</div>}
                          {!item.frameNumber && !item.engineNumber && !item.batterySerial && "—"}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-slate-900">
                          {fmt(item.quantity * item.unitCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400">TỔNG TRỊ GIÁ PHIẾU:</span>
                  <span className="ml-3 text-base font-bold text-slate-900">{fmt(selectedReceipt.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setViewOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRMATION DIALOGS */}
      <ConfirmDialog
        open={confirmReceiptOpen}
        title="Xác nhận hàng hóa thực nhập vào kho?"
        description="Khi xác nhận: Hệ thống sẽ tự động cập nhật số lượng tồn kho của sản phẩm, đồng thời ghi nhận công nợ phải trả (AP Payable) gửi nhà cung cấp."
        confirmText="Xác nhận nhập kho"
        loading={confirmMutation.isPending}
        onConfirm={() => {
          if (actionReceiptId) {
            confirmMutation.mutate(actionReceiptId, {
              onSuccess: () => {
                setConfirmReceiptOpen(false);
                setActionReceiptId(null);
                refetchReceipts();
              }
            });
          }
        }}
        onClose={() => setConfirmReceiptOpen(false)}
      />

      <ConfirmDialog
        open={cancelReceiptOpen}
        title="Hủy phiếu nhập kho này?"
        description="Bạn chắc chắn muốn hủy phiếu nhập kho nháp này? Phiếu sẽ chuyển sang trạng thái đã hủy."
        confirmText="Hủy phiếu"
        loading={cancelMutation.isPending}
        onConfirm={() => {
          if (actionReceiptId) {
            cancelMutation.mutate(actionReceiptId, {
              onSuccess: () => {
                setCancelReceiptOpen(false);
                setActionReceiptId(null);
                refetchReceipts();
              }
            });
          }
        }}
        onClose={() => setCancelReceiptOpen(false)}
      />
    </div>
  );
}
