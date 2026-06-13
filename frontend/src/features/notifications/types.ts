export type NotificationSeverity = "INFO" | "WARNING" | "ERROR" | "SUCCESS";

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  severity: NotificationSeverity;
  module: string;
  entityId?: number | null;
  createdAt: string;
  readAt?: string | null;
  read: boolean;
};

export type NotificationPage = {
  unreadCount: number;
  items: NotificationItem[];
};

export type ReminderType = "CALL_CUSTOMER" | "MAINTENANCE" | "WARRANTY_EXPIRY" | "DEBT_FOLLOWUP";
export type ReminderStatus = "PENDING" | "DONE" | "CANCELLED";

export type Reminder = {
  id: number;
  reminderDate: string;
  customerId?: number | null;
  assignedTo?: number | null;
  type: ReminderType;
  status: ReminderStatus;
  title: string;
  note?: string | null;
  createdAt: string;
  doneAt?: string | null;
};

export type ReminderPayload = {
  reminderDate: string;
  customerId?: number | null;
  assignedTo?: number | null;
  type: ReminderType;
  title: string;
  note?: string;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
