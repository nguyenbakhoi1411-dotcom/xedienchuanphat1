"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import {
  useCreatePurchaseOrder,
  useSuppliers,
  useSupplier
} from "@/features/purchasing/hooks";
import { useProducts } from "@/features/products/hooks";
import { useBranches } from "@/features/branches/hooks";
import type { PurchaseOrderItem, PurchaseOrderRequest } from "@/features/purchasing/types";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Search,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowLeft,
  DollarSign,
  ClipboardPaste
} from "lucide-react";
import { ExcelPasteModal } from "@/components/ui/ExcelPasteModal";

// Formats currency: eg 1.000.000 đ
function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

export default function NewPurchaseOrderPage() {
  const currentUser = useCurrentUser();
  const router = useRouter();

  // Form states
  const [prBranchId, setPrBranchId] = useState<number>(1);
  const [prDate, setPrDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [note, setNote] = useState("");
  const [depositAmount, setDepositAmount] = useState(0);

  // Supplier Search
  const [supplierSearch, setSupplierSearch] = useState("");
  const [debouncedSupplierSearch, setDebouncedSupplierSearch] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  // Product Search
  const [productSearch, setProductSearch] = useState("");
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Items
  const [poItems, setPoItems] = useState<{
    productId: number;
    productName: string;
    productCode: string;
    quantity: number;
    unitCost: number;
  }[]>([]);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);

  // Debounces
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSupplierSearch(supplierSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [supplierSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProductSearch(productSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  // Queries
  const { data: branchesData } = useBranches({ keyword: "", page: 0, pageSize: 100 });
  const { data: suppliersData, isFetching: searchingSuppliers } = useSuppliers(
    debouncedSupplierSearch || undefined,
    0,
    30
  );
  const { data: productsData, isFetching: searchingProducts } = useProducts({
    keyword: debouncedProductSearch,
    category: "ALL",
    status: "ALL",
    page: 1,
    pageSize: 30
  });

  const { data: supplierDetail } = useSupplier(selectedSupplierId ?? undefined);

  // Mutations
  const createMutation = useCreatePurchaseOrder();

  // Initialize defaults
  useEffect(() => {
    if (currentUser?.branchId) {
      setPrBranchId(Number(currentUser.branchId));
    } else if (branchesData?.items && branchesData.items.length > 0) {
      setPrBranchId(branchesData.items[0].id);
    }
  }, [currentUser, branchesData]);

  // Supplier Selection
  const handleSelectSupplier = (supplier: any) => {
    setSelectedSupplierId(supplier.id);
    setSupplierSearch(supplier.name);
    setShowSupplierDropdown(false);
  };

  // Add Product Item
  const handleAddProduct = (prod: any) => {
    const exists = poItems.find(item => item.productId === prod.id);
    if (exists) {
      setPoItems(
        poItems.map(item =>
          item.productId === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setPoItems([
        ...poItems,
        {
          productId: prod.id,
          productName: prod.productName,
          productCode: prod.productCode,
          quantity: 1,
          unitCost: prod.importPrice ?? 0
        }
      ]);
    }
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const handleUpdateItemQty = (productId: number, qty: number) => {
    setPoItems(
      poItems.map(item =>
        item.productId === productId ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  };

  const handleUpdateItemCost = (productId: number, cost: number) => {
    setPoItems(
      poItems.map(item =>
        item.productId === productId ? { ...item, unitCost: Math.max(0, cost) } : item
      )
    );
  };

  const handleRemoveItem = (productId: number) => {
    setPoItems(poItems.filter(item => item.productId !== productId));
  };

  const handlePasteExcelData = (rows: string[][]) => {
    if (!productsData?.items) {
      alert("Đang tải dữ liệu sản phẩm, vui lòng thử lại sau.");
      return;
    }
    const currentProducts = productsData.items;
    const newItems: typeof poItems = [];

    rows.forEach(row => {
      // Expected columns: Mã sản phẩm (0), Tên sản phẩm (1), Số lượng (2), Giá nhập (3)
      const codeOrName = row[0]?.trim() || row[1]?.trim();
      const qtyStr = row[2] || row[1];
      const costStr = row[3] || row[2];

      const quantity = Math.max(1, parseInt(qtyStr?.replace(/[^0-9]/g, "")) || 1);
      const unitCost = Math.max(0, parseInt(costStr?.replace(/[^0-9]/g, "")) || 0);

      if (!codeOrName) return;

      const foundProduct = currentProducts.find(
        p => p.productCode.toLowerCase() === codeOrName.toLowerCase() || p.productName.toLowerCase() === codeOrName.toLowerCase()
      );

      if (foundProduct) {
        newItems.push({
          productId: foundProduct.id,
          productCode: foundProduct.productCode,
          productName: foundProduct.productName,
          quantity,
          unitCost: unitCost > 0 ? unitCost : (foundProduct.importPrice ?? 0)
        });
      }
    });

    if (newItems.length > 0) {
      // Merge with existing avoiding duplicates
      setPoItems(prev => {
        const merged = [...prev];
        newItems.forEach(ni => {
          const ex = merged.find(m => m.productId === ni.productId);
          if (ex) {
            ex.quantity += ni.quantity;
          } else {
            merged.push(ni);
          }
        });
        return merged;
      });
      alert(`Đã thêm thành công ${newItems.length} sản phẩm từ Excel.`);
    } else {
      alert("Không tìm thấy sản phẩm nào khớp mã trong hệ thống từ dữ liệu Excel.");
    }
  };

  // Calculations
  const totalAmount = useMemo(() => {
    return poItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  }, [poItems]);

  const isDepositValid = totalAmount >= depositAmount;

  // Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      alert("Vui lòng chọn Nhà cung cấp");
      return;
    }
    if (poItems.length === 0) {
      alert("Vui lòng thêm ít nhất 1 sản phẩm đặt mua");
      return;
    }
    if (!isDepositValid) {
      alert("Số tiền đặt cọc không được lớn hơn tổng giá trị đơn hàng");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    const payload: PurchaseOrderRequest = {
      supplierId: selectedSupplierId as number,
      branchId: prBranchId,
      purchaseDate: prDate,
      expectedDelivery: expectedDelivery || undefined,
      note: note || undefined,
      items: poItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost
      }))
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setConfirmOpen(false);
        router.push("/purchasing/orders");
      }
    });
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center gap-3">
        <Link href="/purchasing/orders" className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Danh sách đơn PO
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lập Đơn Đặt Hàng Mới (PO)</h1>
        <p className="text-sm text-slate-500">
          Tạo đơn hàng đặt mua sản phẩm, phụ tùng từ các đối tác liên kết.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="grid gap-6 md:grid-cols-3">
        {/* Left Form Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Thông tin chung</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Chi nhánh mua hàng</label>
                <select
                  value={prBranchId}
                  onChange={(e) => setPrBranchId(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {branchesData?.items.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Ngày lập đơn</label>
                <input
                  type="date"
                  value={prDate}
                  onChange={(e) => setPrDate(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Supplier debounced search */}
              <div className="relative sm:col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Nhà cung cấp đối tác</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Gõ để tìm kiếm nhà cung cấp..."
                    value={supplierSearch}
                    onChange={(e) => {
                      setSupplierSearch(e.target.value);
                      setSelectedSupplierId(null);
                      setShowSupplierDropdown(true);
                    }}
                    onFocus={() => setShowSupplierDropdown(true)}
                    className="h-9 w-full rounded-lg border border-slate-200 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  {searchingSuppliers && (
                    <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-slate-400" />
                  )}
                </div>

                {showSupplierDropdown && suppliersData?.items && (
                  <div className="absolute left-0 right-0 top-16 z-[100] max-h-[220px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    {suppliersData.items.length > 0 ? (
                      suppliersData.items.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectSupplier(s)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0 text-sm"
                        >
                          <span className="font-semibold text-slate-800">{s.name}</span>
                          <span className="block text-xs text-slate-400">Mã: {s.code} | ĐT: {s.phone || "—"}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-slate-400 text-sm">Không tìm thấy nhà cung cấp</div>
                    )}
                  </div>
                )}
              </div>

              {/* Expected delivery date */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Hạn nhận hàng dự kiến</label>
                <input
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Supplier terms info preview */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Hạn mức & Kỳ hạn nợ NCC</label>
                <div className="h-9 rounded-lg border border-slate-100 bg-slate-50 px-3 flex items-center text-xs text-slate-500">
                  {supplierDetail
                    ? `Thanh toán: ${supplierDetail.paymentTermsDays} ngày | Dư nợ hiện tại: ${fmt(supplierDetail.currentDebt)}`
                    : "Chọn NCC để xem hạn mức nợ"}
                </div>
              </div>

              {/* Note */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Ghi chú đơn đặt hàng</label>
                <textarea
                  placeholder="Ghi chú yêu cầu giao nhận hàng, chứng từ đi kèm..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-800">Chi tiết sản phẩm đặt mua</h2>
                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-md border border-orange-200 transition-colors"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" /> Dán từ Excel
                </button>
              </div>
              
              {/* Product search box */}
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Gõ tên/mã sản phẩm..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  className="h-9 w-[240px] rounded-lg border border-slate-200 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchingProducts && (
                  <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-slate-400" />
                )}
                
                {showProductDropdown && productSearch.length > 0 && productsData?.items && (
                  <div className="absolute right-0 top-10 z-[100] w-[320px] max-h-[220px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    {productsData.items.length > 0 ? (
                      productsData.items.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleAddProduct(p)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-xs border-b border-slate-100 last:border-0"
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
            </div>

            {/* Selected Items List */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700">
                  <tr>
                    <th className="px-4 py-2">Sản phẩm / Quy cách</th>
                    <th className="px-4 py-2 w-[110px] text-right">Số lượng</th>
                    <th className="px-4 py-2 w-[160px] text-right">Giá mua dự kiến</th>
                    <th className="px-4 py-2 text-right w-[155px]">Thành tiền</th>
                    <th className="px-4 py-2 w-[50px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {poItems.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50/25">
                      <td className="px-4 py-2">
                        <span className="font-semibold text-slate-900">{item.productName}</span>
                        <span className="block text-[10px] text-slate-400">Mã: {item.productCode}</span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          min={1}
                          required
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemQty(item.productId, parseInt(e.target.value) || 1)}
                          className="h-8 w-full rounded border border-slate-200 px-2 text-right text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          required
                          value={item.unitCost}
                          onChange={(e) => handleUpdateItemCost(item.productId, parseFloat(e.target.value) || 0)}
                          className="h-8 w-full rounded border border-slate-200 px-2 text-right text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-slate-950">
                        {fmt(item.quantity * item.unitCost)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {poItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center p-6 text-slate-400 text-xs italic">
                        Chưa chọn sản phẩm nào. Hãy dùng thanh tìm kiếm sản phẩm phía trên để chọn mặt hàng.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Payment / Calculation Summary Panel */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Giá trị thanh toán</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Cộng tiền hàng:</span>
                <span className="font-semibold text-slate-700">{fmt(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Thuế giá trị gia tăng (VAT):</span>
                <span className="font-semibold text-slate-700">Đã gồm thuế</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-800">TỔNG CỘNG:</span>
                <span className="font-bold text-primary text-base">{fmt(totalAmount)}</span>
              </div>
            </div>

            {/* Deposit amount input */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <label className="block text-xs font-semibold uppercase text-slate-500">Tiền đặt cọc/ứng trước (đ)</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {!isDepositValid && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-100 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Cọc không được vượt quá Tổng giá trị đơn hàng ({fmt(totalAmount)})</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between text-xs text-slate-500">
              <span>Còn lại phải trả:</span>
              <span className="font-bold text-slate-900">
                {fmt(Math.max(0, totalAmount - depositAmount))}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={createMutation.isPending || poItems.length === 0 || !isDepositValid || !selectedSupplierId}
              className="w-full"
            >
              {createMutation.isPending ? "Đang xử lý..." : "Lập đơn đặt hàng (PO)"}
            </Button>
            
            <Link href="/purchasing/orders">
              <Button variant="secondary" className="w-full">
                Hủy bỏ
              </Button>
            </Link>
          </div>
        </div>
      </form>

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận lập đơn mua hàng?"
        description="Đơn đặt hàng sẽ được tạo dưới dạng bản nháp (DRAFT). Bạn có thể tiếp tục xem và gửi duyệt gửi nhà cung cấp sau đó."
        confirmText="Xác nhận tạo đơn"
        loading={createMutation.isPending}
        onConfirm={handleConfirmSubmit}
        onClose={() => setConfirmOpen(false)}
      />

      <ExcelPasteModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onPasteData={handlePasteExcelData}
        expectedColumns={["Mã/Tên SP", "Số lượng", "Giá nhập"]}
      />
    </div>
  );
}
