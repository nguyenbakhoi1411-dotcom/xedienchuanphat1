"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customersApi } from "./api";
import type { CareNotePayload, CareReminderPayload, CustomerListParams, CustomerPayload } from "./types";

export function useCustomers(params: CustomerListParams) {
  return useQuery({ queryKey: ["customers", params], queryFn: () => customersApi.list(params) });
}

export function useCustomerDetail(id?: number | null) {
  return useQuery({
    queryKey: ["customers", "detail", id],
    queryFn: () => customersApi.detail(id as number),
    enabled: Boolean(id)
  });
}

export function useCreateCustomer() {
  return useCustomerMutation<CustomerPayload>((payload) => customersApi.create(payload), "Da them khach hang");
}

export function useUpdateCustomer() {
  return useCustomerMutation<{ id: number; payload: CustomerPayload }>(
    ({ id, payload }) => customersApi.update(id, payload),
    "Da cap nhat khach hang"
  );
}

export function useAddCareNote() {
  return useCustomerMutation<{ id: number; payload: CareNotePayload }>(
    ({ id, payload }) => customersApi.addNote(id, payload),
    "Da them ghi chu"
  );
}

export function useAddCareReminder() {
  return useCustomerMutation<{ id: number; payload: CareReminderPayload }>(
    ({ id, payload }) => customersApi.addReminder(id, payload),
    "Da tao lich nhac"
  );
}

function useCustomerMutation<TPayload>(mutationFn: (payload: TPayload) => Promise<unknown>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(successMessage);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the thuc hien thao tac")
  });
}
