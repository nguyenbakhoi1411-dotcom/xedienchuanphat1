"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { crmApi } from "./api";
import type { CareTask, Lead, Opportunity } from "./types";

export function useCrmLeads() {
  return useQuery({ queryKey: ["crm", "leads"], queryFn: () => crmApi.leads() });
}

export function useCrmOpportunities() {
  return useQuery({ queryKey: ["crm", "opportunities"], queryFn: () => crmApi.opportunities() });
}

export function useCrmTasks() {
  return useQuery({ queryKey: ["crm", "tasks"], queryFn: () => crmApi.tasks() });
}

export function useCrmReports() {
  return useQuery({ queryKey: ["crm", "reports"], queryFn: () => crmApi.reports() });
}

export function useCreateLead() {
  return mutation<Omit<Lead, "id">>((payload) => crmApi.createLead(payload), "Da tao lead");
}

export function useConvertLeadToCustomer() {
  return mutation<number>((id) => crmApi.convertLeadToCustomer(id), "Da chuyen lead thanh khach hang");
}

export function useCreateOpportunity() {
  return mutation<Omit<Opportunity, "id">>((payload) => crmApi.createOpportunity(payload), "Da tao co hoi");
}

export function useCreateTask() {
  return mutation<Omit<CareTask, "id">>((payload) => crmApi.createTask(payload), "Da tao task cham soc");
}

export function useRefreshSegments() {
  return mutation<void>(() => crmApi.refreshSegments(), "Da cap nhat phan hang khach hang");
}

function mutation<TPayload>(mutationFn: (payload: TPayload) => Promise<unknown>, message: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["crm"] });
      toast.success(message);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the thuc hien thao tac CRM")
  });
}
