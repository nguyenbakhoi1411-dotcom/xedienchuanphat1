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

const enableMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

let customers: CustomerDetail[] = [
  {
    id: 1,
    customerCode: "KH-0001",
    fullName: "Nguyen Van A",
    phone: "0900000001",
    email: "a@example.com",
    address: "Go Vap, TP.HCM",
    type: "VIP",
    source: "WALK_IN",
    birthday: "1990-01-12",
    totalSpent: 32800000,
    debtAmount: 0,
    createdAt: "2026-05-01",
    updatedAt: "2026-06-06",
    purchases: [
      { id: 1, invoiceNo: "HD-0001", purchaseDate: "2026-05-02", productName: "Xe may dien CP S1", serialNumber: "CP-S1-00091", amount: 15800000, paymentStatus: "PAID" },
      { id: 2, invoiceNo: "HD-0007", purchaseDate: "2026-06-01", productName: "Binh ac quy LFP 72V", amount: 6500000, paymentStatus: "PAID" }
    ],
    warranties: [
      { id: 1, ticketNo: "SC-0001", createdAt: "2026-06-04", serialNumber: "CP-S1-00091", issue: "Kiem tra pin", status: "IN_PROGRESS" }
    ],
    notes: [{ id: 1, noteDate: "2026-06-05", content: "Khach quan tam goi bao duong dinh ky.", createdBy: "manager" }],
    reminders: [{ id: 1, reminderDate: "2026-06-20", title: "Nhac bao duong", content: "Goi khach dat lich bao duong", status: "OPEN" }]
  },
  {
    id: 2,
    customerCode: "KH-0002",
    fullName: "Tran Thi B",
    phone: "0900000002",
    email: "b@example.com",
    address: "Thu Duc, TP.HCM",
    type: "RETAIL",
    source: "FACEBOOK",
    birthday: "1994-08-20",
    totalSpent: 13900000,
    debtAmount: 4000000,
    createdAt: "2026-05-18",
    updatedAt: "2026-06-02",
    purchases: [{ id: 3, invoiceNo: "HD-0003", purchaseDate: "2026-05-19", productName: "Xe may dien CP City", serialNumber: "CP-CITY-00418", amount: 13900000, paymentStatus: "PARTIAL" }],
    warranties: [],
    notes: [],
    reminders: []
  },
  {
    id: 3,
    customerCode: "KH-0003",
    fullName: "Pham Quoc C",
    phone: "0900000003",
    email: "",
    address: "Quan 7, TP.HCM",
    type: "POTENTIAL",
    source: "ZALO",
    birthday: "",
    totalSpent: 0,
    debtAmount: 0,
    createdAt: "2026-06-01",
    updatedAt: "2026-06-01",
    purchases: [],
    warranties: [],
    notes: [{ id: 2, noteDate: "2026-06-01", content: "Dang so sanh dong CP S1 va CP City.", createdBy: "sales" }],
    reminders: []
  }
];

export const customersApi = {
  async list(params: CustomerListParams): Promise<PageResponse<Customer>> {
    if (!enableMock) {
      const response = await api.get<PageResponse<Customer>>("/api/customers", {
        params: { keyword: params.keyword, page: Math.max(params.page - 1, 0), pageSize: params.pageSize }
      });
      return {
        ...response.data,
        page: response.data.page + 1,
        items: response.data.items.map(normalizeCustomer)
      };
    }
    await wait();
    const keyword = params.keyword.trim().toLowerCase();
    const filtered = customers.filter((item) => {
      const matchKeyword =
        keyword.length === 0 ||
        item.fullName.toLowerCase().includes(keyword) ||
        item.phone.includes(keyword) ||
        item.email.toLowerCase().includes(keyword);
      const matchType = params.type === "ALL" || item.type === params.type;
      const matchSource = params.source === "ALL" || item.source === params.source;
      return matchKeyword && matchType && matchSource;
    });
    return paginate(filtered, params.page, params.pageSize);
  },

  async detail(id: number): Promise<CustomerDetail> {
    if (!enableMock) {
      const response = await api.get<Customer360ApiResponse>(`/api/customers/${id}/360`);
      const detail = normalizeCustomer360(response.data);
      const remindersResponse = await api.get<CustomerReminderApiResponse[]>(`/api/customers/${id}/reminders`);
      detail.reminders = remindersResponse.data.map(normalizeCustomerReminder);
      return detail;
    }
    await wait();
    const customer = customers.find((item) => item.id === id);
    if (!customer) throw new Error("Khong tim thay khach hang");
    return customer;
  },

  async create(payload: CustomerPayload): Promise<Customer> {
    if (!enableMock) {
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
    }
    await wait();
    if (customers.some((item) => item.customerCode.toLowerCase() === payload.customerCode.toLowerCase())) {
      throw new Error("Ma khach hang da ton tai");
    }
    const now = new Date().toISOString().slice(0, 10);
    const customer: CustomerDetail = {
      ...payload,
      id: Math.max(0, ...customers.map((item) => item.id)) + 1,
      totalSpent: 0,
      debtAmount: 0,
      createdAt: now,
      updatedAt: now,
      purchases: [],
      warranties: [],
      notes: [],
      reminders: []
    };
    customers = [customer, ...customers];
    return customer;
  },

  async update(id: number, payload: CustomerPayload): Promise<Customer> {
    if (!enableMock) {
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
    }
    await wait();
    const current = customers.find((item) => item.id === id);
    if (!current) throw new Error("Khong tim thay khach hang");
    const updated: CustomerDetail = { ...current, ...payload, updatedAt: new Date().toISOString().slice(0, 10) };
    customers = customers.map((item) => (item.id === id ? updated : item));
    return updated;
  },

  async addNote(id: number, payload: CareNotePayload): Promise<CustomerDetail> {
    if (!enableMock) {
      await api.post(`/api/crm/customers/${id}/notes`, { content: payload.content, createdBy: "manager" });
      return this.detail(id);
    }
    await wait();
    const customer = await this.detail(id);
    customer.notes = [
      { id: Date.now(), noteDate: new Date().toISOString().slice(0, 10), content: payload.content, createdBy: "manager" },
      ...customer.notes
    ];
    return customer;
  },

  async addReminder(id: number, payload: CareReminderPayload): Promise<CustomerDetail> {
    if (!enableMock) {
      await api.post("/api/reminders", {
        customerId: id,
        title: payload.title,
        note: payload.content,
        reminderDate: payload.reminderDate,
        type: "CALL_CUSTOMER"
      });
      return this.detail(id);
    }
    await wait();
    const customer = await this.detail(id);
    customer.reminders = [{ id: Date.now(), status: "OPEN", ...payload }, ...customer.reminders];
    return customer;
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
      productName: "Don hang",
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

function paginate<T>(items: T[], page: number, pageSize: number): PageResponse<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageSize, totalItems, totalPages };
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}
