"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { serviceApi } from "./api";
import type {
  AddTicketItemPayload,
  AssignTechnicianPayload,
  ComponentType,
  CreateTicketPayload,
  TicketListParams,
  UpdateStatusPayload
} from "./types";

export function useServiceTickets(params: TicketListParams) {
  return useQuery({ queryKey: ["service", "tickets", params], queryFn: () => serviceApi.list(params) });
}

export function useServiceTicketDetail(id?: number | null) {
  return useQuery({
    queryKey: ["service", "ticket", id],
    queryFn: () => serviceApi.detail(id as number),
    enabled: Boolean(id)
  });
}

export function useCreateServiceTicket() {
  return useServiceMutation<CreateTicketPayload>((payload) => serviceApi.create(payload), "Da tao phieu sua chua");
}

export function useUpdateTicketStatus(id: number | null) {
  return useServiceMutation<UpdateStatusPayload>((payload) => serviceApi.updateStatus(id as number, payload), "Da cap nhat trang thai");
}

export function useAssignTechnician(id: number | null) {
  return useServiceMutation<AssignTechnicianPayload>((payload) => serviceApi.assignTechnician(id as number, payload), "Da gan ky thuat vien");
}

export function useAddTicketItem(id: number | null) {
  return useServiceMutation<AddTicketItemPayload>((payload) => serviceApi.addItem(id as number, payload), "Da them linh kien/chi phi");
}

export function useWarrantyCheck() {
  return useMutation({
    mutationFn: (serialNumber: string) => serviceApi.checkWarranty(serialNumber),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the kiem tra bao hanh")
  });
}

export function useServiceReports() {
  return useQuery({ queryKey: ["service", "reports"], queryFn: () => serviceApi.reports() });
}

export function useUpdateDiagnosis(id: number | null) {
  return useServiceMutation<{ diagnosisNote?: string; predictedCause?: string; technicianDiagnosis?: string; warrantyRepair?: boolean; componentType?: ComponentType }>((payload) => serviceApi.updateDiagnosis(id as number, payload), "Da cap nhat chan doan");
}

export function useCreateRepairQuotation(id: number | null) {
  return useServiceMutation<string>((note) => serviceApi.createQuotation(id as number, note), "Da tao bao gia sua chua");
}

export function useApproveRepairQuotation(id: number | null) {
  return useServiceMutation<void>(() => serviceApi.approveQuotation(id as number), "Da duyet bao gia");
}

export function useCreateServiceInvoice(id: number | null) {
  return useServiceMutation<void>(() => serviceApi.createInvoice(id as number), "Da tao hoa don sua chua");
}

function useServiceMutation<TPayload>(mutationFn: (payload: TPayload) => Promise<unknown>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["service"] });
      toast.success(successMessage);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the thuc hien thao tac")
  });
}
