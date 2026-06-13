"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { branchesApi } from "./api";
import type { BranchListParams, BranchPayload } from "./types";

export function useBranches(params: BranchListParams) {
  return useQuery({
    queryKey: ["branches", params],
    queryFn: () => branchesApi.list(params)
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BranchPayload) => branchesApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Da them chi nhanh");
    },
    onError: (error) => toast.error(getMutationErrorMessage(error))
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BranchPayload }) => branchesApi.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Da cap nhat chi nhanh");
    },
    onError: (error) => toast.error(getMutationErrorMessage(error))
  });
}

export function useSoftDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => branchesApi.softDelete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Da xoa mem chi nhanh");
    },
    onError: (error) => toast.error(getMutationErrorMessage(error))
  });
}

function getMutationErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Khong the thuc hien thao tac";
}
