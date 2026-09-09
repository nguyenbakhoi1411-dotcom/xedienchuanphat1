import { api } from "@/lib/api/axios";
import type {
  CareNotePayload,
  CareReminder,
  CareReminderPayload,
  Customer,
  CustomerDetail,
  CustomerListParams,
  CustomerPayload,
  PageResponse
} from "./types";

export const customersApi = {
  async list(params: CustomerListParams): Promise<PageResponse<Customer>> {
    const response = await api.get<PageResponse<Customer>>("/api/customers", {
      params: { keyword: params.keyword, page: Math.max(params.page - 1, 0), pageSize: params.pageSize }
    });
    return {
      ...response.data,
      page: response.data.page + 1,
      items: response.data.items.map(normalizeCustomer)
    };
  },

  async detail(id: number): Promise<CustomerDetail> {
    const response = await api.get<Customer360ApiResponse>(`/api/customers/${id}/360`);
    const detail = normalizeCustomer360(response.data);
    const remindersResponse = await api.get<CustomerReminderApiResponse[]>(`/api/customers/${id}/reminders`);
    detail.reminders = remindersResponse.data.map(normalizeCustomerReminder);
    return detail;
  },

  async create(payload: CustomerPayload): Promise<Customer> {
    const response = await api.post<Customer>("/api/customers", {
      phone: payload.phone,
      fullName: payload.fullName,
      email: payload.email,
      address: payload.address,
      source: payload.source,
      branchId: 1,
      assignedTo: payload.assignedTo,
      birthday: payload.birthday,
      tier: payload.type === "RETAIL" || payload.type === "POTENTIAL" ? "NEW" : payload.type,
      status: "ACTIVE"
    });
    return normalizeCustomer(response.data);
  },

  async update(id: number, payload: CustomerPayload): Promise<Customer> {
    const response = await api.put<Customer>(`/api/customers/${id}`, {
      id,
      phone: payload.phone,
      fullName: payload.fullName,
      email: payload.email,
      address: payload.address,
      source: payload.source,
      branchId: 1,
      assignedTo: payload.assignedTo,
      birthday: payload.birthday,
      tier: payload.type === "RETAIL" || payload.type === "POTENTIAL" ? "NEW" : payload.type,
      status: "ACTIVE"
    });
    return normalizeCustomer(response.data);
  },

  async addNote(id: number, payload: CareNotePayload): Promise<CustomerDetail> {
    await api.post(`/api/crm/customers/${id}/notes`, { content: payload.content, createdBy: "manager" });
    return this.detail(id);
  },

  async addReminder(id: number, payload: CareReminderPayload): Promise<CustomerDetail> {
    await api.post("/api/reminders", {
      customerId: id,
      title: payload.title,
      note: payload.content,
      reminderDate: payload.reminderDate,
      type: "CALL_CUSTOMER"
    });
    return this.detail(id);
  }
};

function normalizeCustomer(customer: Partial<Customer> & { id: number; fullName?: string; phone?: string }): Customer {
  return {
    id: customer.id,
    customerCode: customer.customerCode ?? `KH-${String(customer.id).padStart(5, "0")}`,
    fullName: customer.fullName ?? "",
    phone: customer.phone ?? "",
    email: customer.email ?? "",
    address: customer.address ?? "",
    type: customer.type ?? ((customer as { tier?: Customer["type"] }).tier ?? "NEW"),
    source: customer.source ?? "WALK_IN",
    birthday: customer.birthday ?? "",
    branchId: customer.branchId,
    assignedTo: customer.assignedTo,
    totalSpent: customer.totalSpent ?? 0,
    debtAmount: customer.debtAmount ?? 0,
    overdueDebtWarning: customer.overdueDebtWarning,
    createdAt: customer.createdAt ?? "",
    updatedAt: customer.updatedAt ?? ""
  };
}

function normalizeCustomerReminder(item: CustomerReminderApiResponse): CareReminder {
  return {
    id: item.id,
    reminderDate: item.reminderDate ?? "",
    title: item.title,
    content: item.note ?? "",
    status: item.status === "DONE" ? "DONE" : "OPEN"
  };
}

function normalizeCustomer360(customer: Customer360ApiResponse): CustomerDetail {
  return {
    id: customer.id,
    customerCode: `KH-${String(customer.id).padStart(5, "0")}`,
    fullName: customer.fullName,
    phone: customer.phone,
    email: customer.email ?? "",
    address: customer.address ?? "",
    type: customer.tier,
    source: customer.source ?? "WALK_IN",
    birthday: customer.birthday ?? "",
    branchId: customer.branchId,
    assignedTo: customer.assignedTo,
    totalSpent: Number(customer.totalSpent ?? 0),
    debtAmount: Number(customer.debtAmount ?? 0),
    overdueDebtWarning: customer.overdueDebtWarning,
    createdAt: customer.createdAt ?? "",
    updatedAt: customer.createdAt ?? "",
    purchases: customer.purchases.map((item) => ({
      id: item.id,
      invoiceNo: item.orderNo,
      orderNo: item.orderNo,
      purchaseDate: item.orderDate,
      productName: "Đơn hàng",
      amount: Number(item.totalAmount),
      paymentStatus: item.paymentStatus as "PAID" | "PARTIAL" | "UNPAID"
    })),
    payments: customer.payments.map((item) => ({ ...item, amount: Number(item.amount) })),
    warranties: customer.warranties.map((item) => ({
      id: item.id,
      ticketNo: item.invoiceNo ?? `BH-${item.id}`,
      createdAt: item.startDate,
      serialNumber: item.serialNumber,
      issue: `Hieu luc den ${item.endDate}`,
      status: item.status === "ACTIVE" ? "IN_PROGRESS" : "COMPLETED"
    })),
    repairs: customer.repairs.map((item) => ({ ...item, totalCost: Number(item.totalCost) })),
    notes: customer.notes.map((item) => ({
      id: item.id,
      noteDate: item.createdAt?.slice(0, 10) ?? "",
      content: item.content,
      createdBy: item.createdBy ?? "system"
    })),
    reminders: customer.reminders.map((item) => ({
      id: item.id,
      reminderDate: item.dueDate ?? "",
      title: item.title,
      content: item.content ?? "",
      status: item.status === "DONE" ? "DONE" : "OPEN"
    })),
    usedVouchers: customer.usedVouchers,
    opportunities: customer.opportunities.map((item) => ({ ...item, expectedValue: Number(item.expectedValue) }))
  };
}

type Customer360ApiResponse = {
  id: number;
  phone: string;
  fullName: string;
  email?: string;
  address?: string;
  source?: Customer["source"];
  branchId?: number;
  assignedTo?: number;
  birthday?: string;
  tier: Customer["type"];
  totalSpent: number;
  debtAmount: number;
  overdueDebtWarning: boolean;
  purchases: Array<{ id: number; orderNo: string; orderDate: string; totalAmount: number; paidAmount: number; paymentStatus: string; voucherCode?: string }>;
  payments: Array<{ id: number; orderNo: string; paymentDate: string; amount: number; paymentMethod: string; referenceNo?: string }>;
  warranties: Array<{ id: number; serialNumber: string; invoiceNo?: string; startDate: string; endDate: string; status: string }>;
  repairs: Array<{ id: number; serialNumber: string; issueDescription: string; status: string; totalCost: number; createdAt: string }>;
  notes: Array<{ id: number; customerId: number; content: string; createdBy?: string; createdAt: string }>;
  reminders: Array<{ id: number; title: string; content?: string; dueDate?: string; status: string }>;
  usedVouchers: string[];
  opportunities: Array<{ id: number; expectedValue: number; expectedCloseDate?: string; stage: string; probability: number }>;
  createdAt: string;
};

type CustomerReminderApiResponse = {
  id: number;
  reminderDate: string;
  customerId?: number;
  assignedTo?: number;
  type: string;
  status: string;
  title: string;
  note?: string;
  createdAt: string;
  doneAt?: string;
};
