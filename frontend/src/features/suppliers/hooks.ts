"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { suppliersApi } from "./api";
import type { PurchaseOrderPayload, SupplierListParams, SupplierPayload } from "./types";

export function useSuppliers(params: SupplierListParams) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => suppliersApi.list(params)
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierPayload) => suppliersApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Da them nha cung cap");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the them nha cung cap")
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SupplierPayload }) => suppliersApi.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Da cap nhat nha cung cap");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the cap nhat nha cung cap")
  });
}

export function useSoftDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => suppliersApi.softDelete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Da xoa mem nha cung cap");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the xoa nha cung cap")
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseOrderPayload) => suppliersApi.createPurchaseOrder(payload),
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success(`Da tao don nhap ${order.purchaseOrderNo}`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the tao don nhap")
  });
}
