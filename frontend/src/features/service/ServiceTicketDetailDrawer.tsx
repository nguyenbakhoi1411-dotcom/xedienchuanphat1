"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { CheckCircle2, RotateCcw, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/format";
import { addTicketItemSchema, assignTechnicianSchema, updateStatusSchema } from "./schemas";
import { componentTypeOptions, getComponentTypeLabel, getItemTypeLabel, getServiceTypeLabel, serviceItemTypeOptions, technicianOptions, ticketStatusOptions } from "./serviceOptions";
import { ServiceStatusBadge } from "./ServiceStatusBadge";
import type {
  AddTicketItemFormValues,
  AssignTechnicianFormValues,
  UpdateStatusFormValues
} from "./schemas";
import type { AddTicketItemPayload, AssignTechnicianPayload, ServiceTicket, UpdateStatusPayload } from "./types";

export function ServiceTicketDetailDrawer({
  open,
  ticket,
  loading,
  actionLoading,
  onClose,
  onUpdateStatus,
  onAssignTechnician,
  onAddItem,
  onUpdateDiagnosis,
  onCreateQuotation,
  onApproveQuotation,
  onCreateInvoice
}: {
  open: boolean;
  ticket?: ServiceTicket;
  loading: boolean;
  actionLoading: boolean;
  onClose: () => void;
  onUpdateStatus: (payload: UpdateStatusPayload) => void;
  onAssignTechnician: (payload: AssignTechnicianPayload) => void;
  onAddItem: (payload: AddTicketItemPayload) => void;
  onUpdateDiagnosis?: (payload: { diagnosisNote?: string; predictedCause?: string; technicianDiagnosis?: string; warrantyRepair?: boolean; componentType?: ServiceTicket["componentType"] }) => void;
  onCreateQuotation?: (note: string) => void;
  onApproveQuotation?: () => void;
  onCreateInvoice?: () => void;
}) {
  const statusForm = useForm<UpdateStatusFormValues>({ resolver: zodResolver(updateStatusSchema), values: { status: ticket?.status ?? "CREATED" } });
  const techForm = useForm<AssignTechnicianFormValues>({ resolver: zodResolver(assignTechnicianSchema), values: { technicianUsername: ticket?.technicianUsername ?? "" } });
  const itemForm = useForm<AddTicketItemFormValues>({ resolver: zodResolver(addTicketItemSchema), defaultValues: { type: "PART", name: "", quantity: 1, unitPrice: 0, isWarrantyCovered: false } });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/45">
      <aside className="ml-auto flex h-full w-full max-w-5xl flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text">{ticket?.ticketNo ?? "Chi tiet phieu"}</h2>
            <p className="mt-1 text-sm text-slate-500">{ticket?.customerName ?? "Dang tai"} - {ticket?.serialNumber ?? ""}</p>
          </div>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-orange-50 hover:text-primary" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-14" />)}</div>
          ) : !ticket ? (
            <EmptyState title="Khong tai duoc phieu" />
          ) : (
            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <div className="space-y-5">
                <section className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Trang thai</p>
                      <div className="mt-2"><ServiceStatusBadge status={ticket.status} /></div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Tong chi phi</p>
                      <p className="mt-1 text-xl font-semibold text-text">{formatCurrency(ticket.totalCost)}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-700">{ticket.issueDescription}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <Info label="Loai sua" value={getServiceTypeLabel(ticket.serviceType)} />
                    <Info label="Bo phan loi" value={getComponentTypeLabel(ticket.componentType) || "Chua xac dinh"} />
                    <Info label="Cong sua" value={formatCurrency(ticket.laborCost)} />
                    <Info label="Gia von/bao hanh" value={formatCurrency(ticket.warrantyCost)} />
                    <Info label="Khach thanh toan" value={formatCurrency(ticket.customerPayAmount)} />
                  </div>
                  {ticket.predictedCause && <p className="mt-3 text-sm text-slate-600">Du doan nguyen nhan: {ticket.predictedCause}</p>}
                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    <FileList title="Anh khi nhan" value={ticket.beforeRepairImages} />
                    <FileList title="Anh loi" value={ticket.faultImages} />
                    <FileList title="Anh sau sua" value={ticket.afterRepairImages} />
                  </div>
                  <FileList title="Bien ban/file" value={ticket.documentFiles} />
                </section>

                <section className="rounded-lg border border-border">
                  <div className="border-b border-border px-4 py-3">
                    <h3 className="text-sm font-semibold text-text">Linh kien / chi phi thay the</h3>
                  </div>
                  {ticket.items.length === 0 ? (
                    <div className="p-4"><EmptyState title="Chua co chi phi" /></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[620px] text-left text-sm">
                        <thead className="bg-background text-xs uppercase text-slate-500">
                          <tr><th className="px-4 py-3">Loai</th><th className="px-4 py-3">Bo phan</th><th className="px-4 py-3">Ten</th><th className="px-4 py-3 text-right">SL</th><th className="px-4 py-3 text-right">Don gia</th><th className="px-4 py-3 text-right">Bao hanh</th><th className="px-4 py-3 text-right">Thanh tien</th></tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {ticket.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">{getItemTypeLabel(item.type)}</td>
                              <td className="px-4 py-3">{getComponentTypeLabel(item.componentType) || "-"}</td>
                              <td className="px-4 py-3">{item.name}</td>
                              <td className="px-4 py-3 text-right">{item.quantity}</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                              <td className="px-4 py-3 text-right">{item.isWarrantyCovered ? "Co" : "Khong"}</td>
                              <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.lineTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-text">Timeline xu ly</h3>
                  <div className="mt-4 space-y-4">
                    {ticket.timeline.map((event) => (
                      <div key={event.id} className="relative pl-6">
                        <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary" />
                        <p className="font-medium text-text">{event.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                        <p className="mt-1 text-xs text-slate-500">{event.eventTime}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="space-y-4">
                <ActionCard title="Cap nhat trang thai">
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => onUpdateStatus({ status: "COMPLETED" })} disabled={actionLoading}>
                      <CheckCircle2 className="h-4 w-4" />
                      Hoan thanh
                    </Button>
                    <Button variant="secondary" onClick={() => onUpdateStatus({ status: "RETURNED" })} disabled={actionLoading}>
                      <RotateCcw className="h-4 w-4" />
                      Tra xe
                    </Button>
                  </div>
                  <form className="space-y-3" onSubmit={statusForm.handleSubmit(onUpdateStatus)}>
                    <select className={inputClass} {...statusForm.register("status")}>
                      {ticketStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                    <Button className="w-full" type="submit" disabled={actionLoading}>Cap nhat</Button>
                  </form>
                </ActionCard>
                <ActionCard title="Gan ky thuat vien">
                  <form className="space-y-3" onSubmit={techForm.handleSubmit(onAssignTechnician)}>
                    <select className={inputClass} {...techForm.register("technicianUsername")}>
                      <option value="">Chon ky thuat vien</option>
                      {technicianOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                    <Button className="w-full" type="submit" disabled={actionLoading}>Gan ky thuat vien</Button>
                  </form>
                </ActionCard>
                <ActionCard title="Them linh kien / chi phi">
                  <form
                    className="space-y-3"
                    onSubmit={itemForm.handleSubmit((values) => {
                      onAddItem(values);
                      itemForm.reset({ type: "PART", name: "", quantity: 1, unitPrice: 0, isWarrantyCovered: false });
                    })}
                  >
                    <select className={inputClass} {...itemForm.register("type")}>
                      {serviceItemTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                    <input className={inputClass} placeholder="Ten linh kien/chi phi" {...itemForm.register("name")} />
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputClass} type="number" placeholder="So luong" {...itemForm.register("quantity")} />
                      <input className={inputClass} type="number" placeholder="Don gia" {...itemForm.register("unitPrice")} />
                    </div>
                    <select className={inputClass} {...itemForm.register("componentType")}>
                      <option value="">Bo phan lien quan</option>
                      {componentTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputClass} type="number" placeholder="Product ID" {...itemForm.register("productId")} />
                      <input className={inputClass} type="number" placeholder="Warehouse ID" {...itemForm.register("warehouseId")} />
                    </div>
                    <input className={inputClass} type="number" placeholder="Gia von" {...itemForm.register("unitCost")} />
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" {...itemForm.register("isWarrantyCovered")} />
                      Tinh vao chi phi bao hanh
                    </label>
                    <Button className="w-full" type="submit" disabled={actionLoading}>Them chi phi</Button>
                  </form>
                </ActionCard>
                <ActionCard title="Chan doan & bao gia">
                  <div className="space-y-3">
                    <select
                      className={inputClass}
                      defaultValue={ticket.componentType ?? ""}
                      onChange={(event) => onUpdateDiagnosis?.({
                        diagnosisNote: ticket.diagnosisNote ?? "Da kiem tra",
                        technicianDiagnosis: ticket.predictedCause ?? ticket.issueDescription,
                        warrantyRepair: ticket.warrantyRepair,
                        componentType: event.target.value ? event.target.value as ServiceTicket["componentType"] : undefined
                      })}
                    >
                      <option value="">Chon bo phan loi</option>
                      {componentTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                    <Button className="w-full" variant="secondary" onClick={() => onUpdateDiagnosis?.({ diagnosisNote: "Da kiem tra", technicianDiagnosis: ticket.predictedCause ?? ticket.issueDescription, warrantyRepair: ticket.warrantyRepair, componentType: ticket.componentType })}>Luu chan doan</Button>
                    <Button className="w-full" variant="secondary" onClick={() => onCreateQuotation?.("Báo giá sua chua theo chi phi da nhap")}>Tao bao gia</Button>
                    <Button className="w-full" variant="secondary" onClick={onApproveQuotation}>Khach dong y</Button>
                    <Button className="w-full" onClick={onCreateInvoice}>Tao invoice service</Button>
                  </div>
                </ActionCard>
              </aside>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function ActionCard({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-lg border border-border p-4"><h3 className="mb-3 text-sm font-semibold text-text">{title}</h3>{children}</section>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-background p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-text">{value}</p></div>;
}

function FileList({ title, value }: { title: string; value?: string }) {
  const files = value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
  if (files.length === 0) return null;
  return (
    <div className="rounded-lg bg-background p-3 text-xs">
      <p className="font-semibold text-slate-600">{title}</p>
      <div className="mt-2 space-y-1">
        {files.map((file) => (
          <a key={file} href={file} target="_blank" rel="noreferrer" className="block truncate text-primary hover:underline">
            {file}
          </a>
        ))}
      </div>
    </div>
  );
}

const inputClass = "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
