"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useInventoryTransfers } from "@/features/inventory/hooks";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Search,
  Eye,
  Plus,
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { TransferForm } from "@/features/inventory/components/TransferForm";
import { inventoryApi } from "@/features/inventory/api";
import { toast } from "sonner";

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return format(new Date(d), "dd/MM/yyyy");
}

export default function InventoryTransfersPage() {
  const [statusFilter, setStatusFilter] = useState<string | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showTransferForm, setShowTransferForm] = useState(false);

  const { data: transfersData, isLoading, refetch } = useInventoryTransfers({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    size: 20
  });

  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const handleConfirmTransfer = async (id: number) => {
    try {
      await inventoryApi.confirmTransfer(id);
      toast.success("Duyệt phiếu chuyển kho thành công!");
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi duyệt phiếu (Yêu cầu quyền Checker).");
    } finally {
      setConfirmingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge tone="slate">Nháp</Badge>;
      case "CONFIRMED":
        return <Badge tone="blue">Đã xác nhận</Badge>;
      case "CANCELLED":
        return <Badge tone="red">Đã hủy</Badge>;
      default:
        return <Badge tone="slate">{status}</Badge>;
    }
  };

  const filteredItems = useMemo(() => {
    if (!transfersData?.items) return [];
    return transfersData.items.filter(item => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        (item.transferNo && item.transferNo.toLowerCase().includes(q))
      );
    });
  }, [transfersData?.items, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#f4f5f8] min-h-[calc(100vh-60px)]">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-blue-600" />
              Phiếu Chuyển Kho
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý các giao dịch chuyển đổi giữa các kho</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">
             Tiện ích <span className="ml-2">▼</span>
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
            onClick={() => setShowTransferForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm phiếu chuyển
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[300px]">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo số phiếu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white min-w-[160px]"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="DRAFT">Nháp</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center">
                 <EmptyState
                   title="Không có phiếu chuyển kho"
                   description="Chưa có dữ liệu hoặc không tìm thấy kết quả phù hợp với bộ lọc."
                 />
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-[13px]">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="text-gray-500 font-bold uppercase border-b border-gray-100">
                    <th className="py-3 px-4 font-semibold">Ngày hạch toán</th>
                    <th className="py-3 px-4 font-semibold">Số chứng từ</th>
                    <th className="py-3 px-4 font-semibold">Kho xuất</th>
                    <th className="py-3 px-4 font-semibold">Kho nhập</th>
                    <th className="py-3 px-4 font-semibold">Diễn giải</th>
                    <th className="py-3 px-4 font-semibold">Trạng thái</th>
                    <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-3.5 px-4 font-medium text-gray-700">
                        {formatDate(item.accountingDate)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-blue-700 font-medium">
                        {item.transferNo}
                      </td>
                      <td className="py-3.5 px-4 text-gray-800">
                        {item.fromWarehouseName || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-gray-800">
                        {item.toWarehouseName || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {item.description}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right flex justify-end gap-2">
                        {item.status === 'DRAFT' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmingId(item.id)}
                            className="text-green-600 hover:text-white hover:bg-green-600 border-green-200 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Duyệt
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-500 hover:text-blue-700 border-gray-200 bg-white"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Xem
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          {transfersData && transfersData.totalPages > 1 && (
             <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
               <span>Hiển thị trang {page + 1} / {transfersData.totalPages}</span>
               <div className="flex items-center gap-2">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   disabled={page === 0}
                   onClick={() => setPage(p => p - 1)}
                 >
                   Trước
                 </Button>
                 <Button 
                   variant="outline" 
                   size="sm"
                   disabled={page >= transfersData.totalPages - 1}
                   onClick={() => setPage(p => p + 1)}
                 >
                   Sau
                 </Button>
               </div>
             </div>
          )}

        </div>
      </div>

      {showTransferForm && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden animate-[scaleIn_0.2s_ease-out]">
          <TransferForm 
            onCancel={() => setShowTransferForm(false)} 
            onSuccess={() => {
              setShowTransferForm(false);
              refetch();
            }} 
          />
        </div>
      )}

      {/* Confirmation Modal cho Maker/Checker */}
      {confirmingId !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px]">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Xác nhận duyệt phiếu</h3>
            <p className="text-gray-600 mb-6">
              Bạn đang thực hiện quyền <strong>Checker</strong> để duyệt phiếu chuyển kho này.
              Hệ thống sẽ thực hiện giao dịch Atomic trừ tồn kho gốc và cộng tồn kho đích. 
              Bạn có chắc chắn tiếp tục?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmingId(null)}>Hủy bỏ</Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleConfirmTransfer(confirmingId)}>
                Đồng ý Duyệt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
