import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import type { WarrantyTicket } from "./types";

const statusLabel = {
  ASSIGNED: "Đã gán",
  IN_PROGRESS: "Đang xử lý",
  WAITING_PARTS: "Chờ linh kiện"
};

const statusClass = {
  ASSIGNED: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-orange-50 text-primary",
  WAITING_PARTS: "bg-amber-50 text-amber-700"
};

export function WarrantyTicketsTable({ data }: { data: WarrantyTicket[] }) {
  return (
    <section className="rounded-lg border border-border bg-white shadow-soft">
      <div className="border-b border-border p-4">
        <h2 className="text-base font-semibold text-text">Phiếu bảo hành đang xử lý</h2>
        <p className="mt-1 text-sm text-slate-500">Theo dõi các phiếu sửa chữa chưa hoàn tất.</p>
      </div>

      {data.length === 0 ? (
        <div className="p-4">
          <EmptyState title="Không có phiếu đang xử lý" description="Tất cả phiếu bảo hành đã được hoàn tất." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-background text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Số phiếu</th>
                <th className="px-4 py-3 font-semibold">Khách hàng</th>
                <th className="px-4 py-3 font-semibold">Serial</th>
                <th className="px-4 py-3 font-semibold">Kỹ thuật viên</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-orange-50/60">
                  <td className="px-4 py-3 font-medium text-text">{ticket.ticketNo}</td>
                  <td className="px-4 py-3 text-slate-700">{ticket.customerName}</td>
                  <td className="px-4 py-3 text-slate-500">{ticket.serialNumber}</td>
                  <td className="px-4 py-3 text-slate-700">{ticket.technicianName}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusClass[ticket.status])}>
                      {statusLabel[ticket.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{ticket.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
