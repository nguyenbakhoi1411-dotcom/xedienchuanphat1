"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useInventoryCounts } from "@/features/inventory/hooks";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Search,
  Eye,
  Plus,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { StocktakeForm } from "@/features/inventory/components/StocktakeForm";

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return format(new Date(d), "dd/MM/yyyy");
}

export default function InventoryStocktakePage() {
  const [statusFilter, setStatusFilter] = useState<string | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showStocktakeForm, setShowStocktakeForm] = useState(false);

  const { data: countsData, isLoading } = useInventoryCounts({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    pageSize: 20
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge tone="slate">Nháp</Badge>;
      case "CONFIRMED":
        return <Badge tone="purple">Đã xác nhận</Badge>;
      case "CANCELLED":
        return <Badge tone="red">Đã hủy</Badge>;
      default:
        return <Badge tone="slate">{status}</Badge>;
    }
  };

  const filteredItems = useMemo(() => {
    if (!countsData?.items) return [];
    return countsData.items.filter((item: any) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        (item.countNo && item.countNo.toLowerCase().includes(q))
      );
    });
  }, [countsData?.items, searchQuery]);

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
              <ClipboardList className="w-6 h-6 text-purple-600" />
              Kiểm kê kho
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Đối chiếu số lượng thực tế với phần mềm</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">
             Tiện ích <span className="ml-2">▼</span>
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm"
            onClick={() => setShowStocktakeForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm phiếu kiểm kê
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
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-white min-w-[160px]"
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
                   title="Không có phiếu kiểm kê"
                   description="Chưa có dữ liệu hoặc không tìm thấy kết quả phù hợp với bộ lọc."
                 />
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-[13px]">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="text-gray-500 font-bold uppercase border-b border-gray-100">
                    <th className="py-3 px-4 font-semibold">Ngày kiểm kê</th>
                    <th className="py-3 px-4 font-semibold">Số chứng từ</th>
                    <th className="py-3 px-4 font-semibold">Kho kiểm kê</th>
                    <th className="py-3 px-4 font-semibold">Diễn giải</th>
                    <th className="py-3 px-4 font-semibold">Trạng thái</th>
                    <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="py-3.5 px-4 font-medium text-gray-700">
                        {formatDate(item.countDate)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-purple-700 font-medium">
                        {item.countNo}
                      </td>
                      <td className="py-3.5 px-4 text-gray-800">
                        {item.warehouseName || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {item.description}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-500 hover:text-purple-700 border-gray-200 bg-white"
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
          {countsData && countsData.totalPages > 1 && (
             <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
               <span>Hiển thị trang {page + 1} / {countsData.totalPages}</span>
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
                   disabled={page >= countsData.totalPages - 1}
                   onClick={() => setPage(p => p + 1)}
                 >
                   Sau
                 </Button>
               </div>
             </div>
          )}

        </div>
      </div>

      {showStocktakeForm && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden animate-[scaleIn_0.2s_ease-out]">
          <StocktakeForm 
            onCancel={() => setShowStocktakeForm(false)} 
            onSuccess={() => {
              setShowStocktakeForm(false);
            }} 
          />
        </div>
      )}
    </div>
  );
}
