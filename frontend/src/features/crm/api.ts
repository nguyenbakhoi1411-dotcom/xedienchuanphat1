import { api } from "@/lib/api/axios";
import type { AxiosResponse } from "axios";
import type {
  AlertItem,
  CareNote,
  CareTask,
  Customer360,
  CustomerGroup,
  CustomerSummary,
  Lead,
  LeadRequest,
  LeadStatus,
  Opportunity,
  PageResponse,
} from "./types";

const d = <T>(r: AxiosResponse<T>): T => r.data;
const optional = <T>(value: T | null | undefined): T | undefined => value ?? undefined;

// ── Customer Groups ────────────────────────────────────────────────────────
export const crmGroupApi = {
  list: (): Promise<CustomerGroup[]> =>
    api.get<CustomerGroup[]>("/api/crm/customer-groups").then(d),
};

// ── Customers ─────────────────────────────────────────────────────────────
export const crmCustomerApi = {
  list: (params?: { keyword?: string; branchId?: number; page?: number; size?: number }): Promise<PageResponse<CustomerSummary>> =>
    api.get<PageResponse<CustomerSummary>>("/api/crm/customers", { params }).then(d),

  get360: (id: number): Promise<Customer360> =>
    api.get<Customer360>(`/api/crm/customers/${id}/360`).then(d),

  addNote: (customerId: number, content: string, createdBy?: string): Promise<CareNote> =>
    api.post<CareNote>(`/api/crm/customers/${customerId}/notes`, { content, createdBy }).then(d),

  refreshSegments: (): Promise<void> =>
    api.post("/api/crm/customers/refresh-segments").then(() => undefined),
};

// ── Leads ─────────────────────────────────────────────────────────────────
export const crmLeadApi = {
  list: (params?: { keyword?: string; status?: LeadStatus; page?: number; pageSize?: number }): Promise<PageResponse<Lead>> =>
    api.get<PageResponse<Lead>>("/api/crm/leads", { params }).then(d),

  pipeline: (): Promise<Record<LeadStatus, Lead[]>> =>
    api.get<Record<LeadStatus, Lead[]>>("/api/crm/leads/pipeline").then(d),

  create: (req: LeadRequest): Promise<Lead> =>
    api.post<Lead>("/api/crm/leads", req).then(d),

  update: (id: number, req: LeadRequest): Promise<Lead> =>
    api.put<Lead>(`/api/crm/leads/${id}`, req).then(d),

  advance: (id: number, targetStatus: LeadStatus, reason?: string): Promise<Lead> =>
    api.post<Lead>(`/api/crm/leads/${id}/advance`, { targetStatus, reason }).then(d),

  convertToCustomer: (id: number, data: { branchId?: number; assignedTo?: number; email?: string; address?: string }): Promise<Customer360> =>
    api.post<Customer360>(`/api/crm/leads/${id}/convert-customer`, data).then(d),
};

// ── Tasks ─────────────────────────────────────────────────────────────────
export const crmTaskApi = {
  list: (status?: string, page = 0, pageSize = 20): Promise<PageResponse<CareTask>> =>
    api.get<PageResponse<CareTask>>("/api/crm/tasks", { params: { status, page, pageSize } }).then(d),

  create: (req: Omit<CareTask, "id" | "createdAt" | "completedAt">): Promise<CareTask> =>
    api.post<CareTask>("/api/crm/tasks", req).then(d),

  updateStatus: (id: number, status: string): Promise<CareTask> =>
    api.patch<CareTask>(`/api/crm/tasks/${id}/status`, { status }).then(d),
};

// ── Alerts ────────────────────────────────────────────────────────────────
export const crmAlertApi = {
  list: (page = 0, size = 50): Promise<AlertItem[]> =>
    api.get<AlertItem[]>("/api/crm/alerts", { params: { page, size } }).then(d),

  dismiss: (id: number, by?: string): Promise<void> =>
    api.post(`/api/crm/alerts/${id}/dismiss`, null, { params: { by } }).then(() => undefined),
};

// ── Reports ───────────────────────────────────────────────────────────────
export const crmReportApi = {
  get: (): Promise<unknown> =>
    api.get("/api/crm/reports").then(d),
};

// ── Opportunities ─────────────────────────────────────────────────────────
export const crmOpportunityApi = {
  list: (stage?: string): Promise<Opportunity[]> =>
    api.get<Opportunity[]>("/api/crm/opportunities", { params: { stage } }).then(d),

  create: (req: Omit<Opportunity, "id" | "createdAt">): Promise<Opportunity> =>
    api.post<Opportunity>("/api/crm/opportunities", req).then(d),

  update: (id: number, req: Partial<Opportunity>): Promise<Opportunity> =>
    api.put<Opportunity>(`/api/crm/opportunities/${id}`, req).then(d),
};

export const crmApi = {
  leads: () => crmLeadApi.list().then((page) => page.items),
  opportunities: () => crmOpportunityApi.list(),
  tasks: () => crmTaskApi.list().then((page) => page.items),
  reports: () => crmReportApi.get(),
  createLead: (payload: LeadRequest | Omit<Lead, "id">) => crmLeadApi.create({
    leadName: payload.leadName,
    phone: payload.phone,
    email: optional(payload.email),
    source: payload.source,
    interestedProduct: optional(payload.interestedProduct),
    assignedTo: optional(payload.assignedTo),
    branchId: optional(payload.branchId),
    nextFollowUpDate: optional(payload.nextFollowUpDate),
    expectedValue: optional(payload.expectedValue),
    status: optional(payload.status),
    lostReason: optional(payload.lostReason),
    note: optional(payload.note),
  }),
  convertLeadToCustomer: (id: number) => crmLeadApi.convertToCustomer(id, {}),
  createOpportunity: (payload: Omit<Opportunity, "id">) => crmOpportunityApi.create(payload),
  createTask: (payload: Omit<CareTask, "id">) => crmTaskApi.create(payload),
  refreshSegments: () => crmCustomerApi.refreshSegments(),
};
