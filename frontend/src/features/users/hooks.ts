"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usersApi } from "./api";
import type { PermissionMatrixPayload, UserListParams, UserPayload } from "./types";

export function useUsers(params: UserListParams) {
  return useQuery({ queryKey: ["users", params], queryFn: () => usersApi.list(params) });
}

export function useRoles() {
  return useQuery({ queryKey: ["roles"], queryFn: () => usersApi.roles() });
}

export function useCreateUser() {
  return useUserMutation<UserPayload>((payload) => usersApi.create(payload), "Da them nhan vien");
}

export function useUpdateUser() {
  return useUserMutation<{ id: number; payload: UserPayload }>(
    ({ id, payload }) => usersApi.update(id, payload),
    "Da cap nhat nhan vien"
  );
}

export function useToggleUserStatus() {
  return useUserMutation<number>((id) => usersApi.toggleStatus(id), "Da cap nhat trang thai tai khoan");
}

export function useUpdatePermissionMatrix() {
  return useUserMutation<PermissionMatrixPayload>(
    (payload) => usersApi.updatePermissionMatrix(payload),
    "Da luu ma tran phan quyen"
  );
}

function useUserMutation<TPayload>(mutationFn: (payload: TPayload) => Promise<unknown>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["roles"] })
      ]);
      toast.success(successMessage);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the thuc hien thao tac")
  });
}
