"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productsApi } from "./api";
import type { ProductListParams, ProductPayload } from "./types";

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.list(params)
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) => productsApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Da them san pham");
    },
    onError: (error) => toast.error(getMutationErrorMessage(error))
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) => productsApi.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Da cap nhat san pham");
    },
    onError: (error) => toast.error(getMutationErrorMessage(error))
  });
}

export function useSoftDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsApi.softDelete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Da xoa mem san pham");
    },
    onError: (error) => toast.error(getMutationErrorMessage(error))
  });
}

function getMutationErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Khong the thuc hien thao tac";
}
