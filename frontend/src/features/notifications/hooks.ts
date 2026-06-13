"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsApi } from "./api";
import type { ReminderPayload, ReminderStatus } from "./types";

export function useNotifications(limit = 20) {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => notificationsApi.list(limit),
    refetchInterval: 60_000
  });
}

export function useMarkNotificationRead(_limit = 20) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
  });
}

export function useMarkAllNotificationsRead(_limit = 20) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
  });
}

export function useReminders(params: { status?: ReminderStatus | "ALL"; page?: number; pageSize?: number }) {
  return useQuery({ queryKey: ["reminders", params], queryFn: () => notificationsApi.reminders(params) });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReminderPayload) => notificationsApi.createReminder(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reminders"] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Da tao lich nhac");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong tao duoc lich nhac")
  });
}

export function useMarkReminderDone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markReminderDone,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reminders"] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Da hoan tat lich nhac");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong cap nhat duoc lich nhac")
  });
}
