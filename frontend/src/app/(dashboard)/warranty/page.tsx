"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CreateServiceTicketModal } from "@/features/service/CreateServiceTicketModal";
import { ServiceFilters } from "@/features/service/ServiceFilters";
import { ServiceTicketDetailDrawer } from "@/features/service/ServiceTicketDetailDrawer";
import { ServiceTicketTable } from "@/features/service/ServiceTicketTable";
import { WarrantyCheckPanel } from "@/features/service/WarrantyCheckPanel";
import {
  useAddTicketItem,
  useAssignTechnician,
  useApproveRepairQuotation,
  useCreateRepairQuotation,
  useCreateServiceTicket,
  useCreateServiceInvoice,
  useServiceReports,
  useServiceTicketDetail,
  useServiceTickets,
  useUpdateDiagnosis,
  useUpdateTicketStatus,
  useWarrantyCheck
} from "@/features/service/hooks";
import { ticketStatusOptions } from "@/features/service/serviceOptions";
import { formatCurrency } from "@/lib/format";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import type { CreateTicketPayload, ServiceTicket, TicketListParams } from "@/features/service/types";

const initialParams: TicketListParams = {
  keyword: "",
  status: "ALL",
  page: 1,
  pageSize: 8
};

export default function WarrantyPage() {
  const [params, setParams] = useState<TicketListParams>(initialParams);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const debouncedKeyword = useDebouncedValue(params.keyword, 300);
  const queryParams = useMemo(() => ({ ...params, keyword: debouncedKeyword }), [debouncedKeyword, params]);

  const tickets = useServiceTickets(queryParams);
  const reports = useServiceReports();
  const detail = useServiceTicketDetail(detailId);
  const createTicket = useCreateServiceTicket();
  const updateStatus = useUpdateTicketStatus(detailId);
  const assignTechnician = useAssignTechnician(detailId);
  const addItem = useAddTicketItem(detailId);
  const updateDiagnosis = useUpdateDiagnosis(detailId);
  const createQuotation = useCreateRepairQuotation(detailId);
  const approveQuotation = useApproveRepairQuotation(detailId);
  const createInvoice = useCreateServiceInvoice(detailId);
  const warrantyCheck = useWarrantyCheck();

  async function handleCreate(payload: CreateTicketPayload) {
    try {
      await createTicket.mutateAsync(payload);
      setCreateOpen(false);
    } catch {
      // Toast is handled in mutation hook.
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-text">Bảo hành và phiếu dịch vụ</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kiểm tra bảo hành, tạo phiếu sửa chữa, theo dõi tiến trình và chi phí.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Tạo phiếu sửa chữa
        </Button>
      </section>

      <WarrantyCheckPanel
        result={warrantyCheck.data}
        loading={warrantyCheck.isPending}
        onCheck={(serialNumber) => void warrantyCheck.mutateAsync(serialNumber).catch(() => undefined)}
      />

      <section className="rounded-lg border border-border bg-white shadow-soft">
        <div className="border-b border-border p-4">
          <ServiceFilters value={params} onChange={setParams} />
        </div>
        <ServiceTicketTable
          data={tickets.data}
          params={params}
          loading={tickets.isLoading}
          onPageChange={(page) => setParams((current) => ({ ...current, page }))}
          onView={(ticket) => setDetailId(ticket.id)}
        />
      </section>

      <ServiceKanban tickets={tickets.data?.items ?? []} />

      <section className="grid gap-4 lg:grid-cols-3">
        <ReportCard title="Thời gian xử lý TB" value={`${reports.data?.averageHandlingHours ?? 0}h`} />
        <ReportCard title="Chi phí bảo hành" value={formatCurrency(reports.data?.warrantyCost ?? 0)} />
        <ReportCard title="Doanh thu sửa chữa" value={formatCurrency(reports.data?.repairRevenue ?? 0)} />
        <ReportCard title="Tỷ lệ sửa lại" value={`${reports.data?.reworkRate ?? 0}%`} />
        <ReportCard title="Mẫu xe lỗi nhiều" value={reports.data?.topFaultyModels?.[0]?.issue ?? "-"} />
        <ReportCard title="Bộ phận lỗi nhiều" value={reports.data?.topFaultyComponents?.[0]?.issue ?? "-"} />
      </section>

      <CreateServiceTicketModal
        open={createOpen}
        loading={createTicket.isPending}
        onSubmit={(payload) => void handleCreate(payload)}
        onClose={() => setCreateOpen(false)}
      />

      <ServiceTicketDetailDrawer
        open={detailId !== null}
        ticket={detail.data}
        loading={detail.isLoading}
        actionLoading={updateStatus.isPending || assignTechnician.isPending || addItem.isPending || updateDiagnosis.isPending}
        onClose={() => setDetailId(null)}
        onUpdateStatus={(payload) => void updateStatus.mutateAsync(payload).catch(() => undefined)}
        onAssignTechnician={(payload) => void assignTechnician.mutateAsync(payload).catch(() => undefined)}
        onAddItem={(payload) => void addItem.mutateAsync(payload).catch(() => undefined)}
        onUpdateDiagnosis={(payload) => void updateDiagnosis.mutateAsync(payload).catch(() => undefined)}
        onCreateQuotation={(note) => void createQuotation.mutateAsync(note).catch(() => undefined)}
        onApproveQuotation={() => void approveQuotation.mutateAsync().catch(() => undefined)}
        onCreateInvoice={() => void createInvoice.mutateAsync().catch(() => undefined)}
      />
    </div>
  );
}

function ServiceKanban({ tickets }: { tickets: ServiceTicket[] }) {
  const columns = ticketStatusOptions.filter((status) => ["RECEIVED", "CHECKING", "WAITING_CUSTOMER_APPROVAL", "WAITING_PARTS", "REPAIRING", "QC_CHECK", "COMPLETED"].includes(status.value));
  return (
    <section className="grid gap-3 overflow-x-auto xl:grid-cols-7">
      {columns.map((column) => (
        <div key={column.value} className="min-h-40 rounded-lg border border-border bg-white p-3 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-text">{column.label}</p>
            <span className="rounded-full bg-background px-2 py-1 text-xs text-slate-500">{tickets.filter((ticket) => ticket.status === column.value).length}</span>
          </div>
          <div className="space-y-2">
            {tickets.filter((ticket) => ticket.status === column.value).map((ticket) => (
              <div key={ticket.id} className="rounded-lg border border-border bg-background p-3">
                <p className="font-medium text-text">{ticket.ticketNo}</p>
                <p className="mt-1 text-xs text-slate-500">{ticket.customerName} - {ticket.serialNumber}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function ReportCard({ title, value }: { title: string; value: string }) {
  return <div className="rounded-lg border border-border bg-white p-4 shadow-soft"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-xl font-semibold text-text">{value}</p></div>;
}
