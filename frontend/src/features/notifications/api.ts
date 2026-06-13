import { api } from "@/lib/api/axios";
import type { NotificationPage, PageResponse, Reminder, ReminderPayload, ReminderStatus } from "./types";

export const notificationsApi = {
  async list(limit = 20): Promise<NotificationPage> {
    const response = await api.get<NotificationPage>("/api/notifications", { params: { limit } });
    return response.data;
  },

  async markRead(id: number): Promise<void> {
    await api.patch(`/api/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.patch("/api/notifications/read-all");
  },

  async reminders(params: { status?: ReminderStatus | "ALL"; page?: number; pageSize?: number } = {}): Promise<PageResponse<Reminder>> {
    const response = await api.get<PageResponse<Reminder>>("/api/reminders", {
      params: {
        status: params.status === "ALL" ? undefined : params.status,
        page: Math.max((params.page ?? 1) - 1, 0),
        pageSize: params.pageSize ?? 20
      }
    });
    return { ...response.data, page: response.data.page + 1 };
  },

  async customerReminders(customerId: number): Promise<Reminder[]> {
    const response = await api.get<Reminder[]>(`/api/customers/${customerId}/reminders`);
    return response.data;
  },

  async createReminder(payload: ReminderPayload): Promise<Reminder> {
    const response = await api.post<Reminder>("/api/reminders", payload);
    return response.data;
  },

  async markReminderDone(id: number): Promise<Reminder> {
    const response = await api.patch<Reminder>(`/api/reminders/${id}/done`);
    return response.data;
  }
};
