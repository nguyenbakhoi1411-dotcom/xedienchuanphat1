import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { useSalesOrders } from "./hooks";
import type { SalesOrder } from "./types";

type OrderTableProps = {
  branchId?: number;
  onSelectOrder: (orderId: number) => void;
  selectedOrderId: number | null;
};

export function OrderTable({ branchId, onSelectOrder, selectedOrderId }: OrderTableProps) {
  const [subTab, setSubTab] = useState<"CONFIRMED" | "DELIVERING" | "OVERDUE">("CONFIRMED");
  const [page, setPage] = useState(0);

  const { data: ordersData, isLoading } = useSalesOrders({
    branchId,
    page,
    size: 10,
    status: subTab === "OVERDUE" ? undefined : subTab,
    // Note: Quá hạn would need custom backend logic, but we assume UI filter for now or we filter client-side
  });

  const orders = ordersData?.items ?? [];
  const totalPages = ordersData?.totalPages ?? 0;

  const displayOrders = subTab === "OVERDUE" 
    ? orders.filter(o => o.reservationUntil && new Date(o.reservationUntil) < new Date() && o.status !== "COMPLETED" && o.status !== "CANCELLED")
    : orders;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => { setSubTab("CONFIRMED"); setPage(0); }}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${subTab === "CONFIRMED" ? "bg-amber-100 text-amber-800" : "text-slate-600 hover:bg-slate-50"}`}
        >
          Chờ xác nhận / Xuất kho
        </button>
        <button
          onClick={() => { setSubTab("DELIVERING"); setPage(0); }}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${subTab === "DELIVERING" ? "bg-blue-100 text-blue-800" : "text-slate-600 hover:bg-slate-50"}`}
        >
          Đang giao
        </button>
        <button
          onClick={() => { setSubTab("OVERDUE"); setPage(0); }}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${subTab === "OVERDUE" ? "bg-rose-100 text-rose-800" : "text-slate-600 hover:bg-slate-50"}`}
        >
          Quá hạn
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-slate-500">
              <th className="px-3 py-2 font-semibold">Số đơn</th>
              <th className="px-3 py-2 font-semibold">Trạng thái</th>
              <th className="px-3 py-2 font-semibold">Thanh toán</th>
              <th className="px-3 py-2 font-semibold">Còn lại</th>
              <th className="px-3 py-2 font-semibold">Giữ đến</th>
            </tr>
          </thead>
          <tbody>
            {displayOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  {isLoading ? "Đang tải..." : "Không có đơn hàng nào."}
                </td>
              </tr>
            ) : (
              displayOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className={`border-b border-border last:border-0 cursor-pointer ${
                    order.id === selectedOrderId ? "bg-emerald-50" : "hover:bg-slate-50"
                  }`}
                >
                  <td className="px-3 py-2 text-slate-700 font-medium">{order.orderNo}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-3 py-2 text-slate-700">{order.paymentStatus}</td>
                  <td className="px-3 py-2 text-slate-700">{formatCurrency(order.amountDue)}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {order.reservationUntil ? new Date(order.reservationUntil).toLocaleString("vi-VN") : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end gap-2 text-sm text-slate-500">
          <Button variant="secondary" disabled={page <= 0} onClick={() => setPage(page - 1)}>
            Trước
          </Button>
          <span className="self-center">
            Trang {page + 1}/{totalPages}
          </span>
          <Button variant="secondary" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color = "bg-slate-100 text-slate-800";
  let label = status;
  
  if (status === "DRAFT") { color = "bg-slate-100 text-slate-800"; label = "Nháp"; }
  if (status === "CONFIRMED") { color = "bg-amber-100 text-amber-800"; label = "Chờ xuất kho"; }
  if (status === "DELIVERING") { color = "bg-blue-100 text-blue-800"; label = "Đang giao"; }
  if (status === "DELIVERED") { color = "bg-emerald-100 text-emerald-800"; label = "Đã giao"; }
  if (status === "COMPLETED") { color = "bg-emerald-100 text-emerald-800"; label = "Hoàn thành"; }
  if (status === "CANCELLED") { color = "bg-rose-100 text-rose-800"; label = "Đã hủy"; }

  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}
