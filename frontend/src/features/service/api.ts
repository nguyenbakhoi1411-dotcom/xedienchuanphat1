import { api } from "@/lib/api/axios";
import type {
  AddTicketItemPayload,
  AssignTechnicianPayload,
  CreateTicketPayload,
  PageResponse,
  ServiceTicket,
  ServiceTicketStatus,
  ServiceReport,
  TicketListParams,
  UpdateStatusPayload,
  WarrantyCheck
} from "./types";

export const serviceApi = {
  async list(params: TicketListParams): Promise<PageResponse<ServiceTicket>> {
    const response = await api.get<PageResponse<BackendServiceTicket>>("/api/service-tickets", {
      params: {
        keyword: params.keyword,
        status: params.status === "ALL" ? undefined : params.status,
        page: Math.max(params.page - 1, 0),
        pageSize: params.pageSize
      }
    });
    return {
      ...response.data,
      page: response.data.page + 1,
      items: response.data.items.map(normalizeTicket)
    };
  },

  async detail(id: number): Promise<ServiceTicket> {
    const response = await api.get<BackendServiceTicket>(`/api/service-tickets/${id}`);
    return normalizeTicket(response.data);
  },

  async create(payload: CreateTicketPayload): Promise<ServiceTicket> {
    const response = await api.post<BackendServiceTicket>("/api/service-tickets", payload);
    return normalizeTicket(response.data);
  },

  async updateStatus(id: number, payload: UpdateStatusPayload): Promise<ServiceTicket> {
    const response = await api.patch<BackendServiceTicket>(`/api/service-tickets/${id}/status`, payload);
    return normalizeTicket(response.data);
  },

  async assignTechnician(id: number, payload: AssignTechnicianPayload): Promise<ServiceTicket> {
    const response = await api.patch<BackendServiceTicket>(`/api/service-tickets/${id}/technician`, payload);
    return normalizeTicket(response.data);
  },

  async addItem(id: number, payload: AddTicketItemPayload): Promise<ServiceTicket> {
    const response = await api.post<BackendServiceTicket>(`/api/service-tickets/${id}/items`, payload);
    return normalizeTicket(response.data);
  },

  async updateDiagnosis(id: number, payload: { diagnosisNote?: string; predictedCause?: string; technicianDiagnosis?: string; warrantyRepair?: boolean; componentType?: ServiceTicket["componentType"] }): Promise<ServiceTicket> {
    const response = await api.patch<BackendServiceTicket>(`/api/service-tickets/${id}/diagnosis`, payload);
    return normalizeTicket(response.data);
  },

  async createQuotation(id: number, note: string) {
    return (await api.post(`/api/service-tickets/${id}/quotation`, { note })).data;
  },

  async approveQuotation(id: number) {
    return (await api.post(`/api/service-tickets/${id}/quotation/approve`)).data;
  },

  async createInvoice(id: number) {
    return (await api.post(`/api/service-tickets/${id}/invoice`)).data;
  },

  async historyByVehicle(vehicleId: number): Promise<ServiceTicket[]> {
    const response = await api.get<BackendServiceTicket[]>(`/api/service-tickets/vehicles/${vehicleId}/history`);
    return response.data.map(normalizeTicket);
  },

  async reports(): Promise<ServiceReport> {
    const response = await api.get<ServiceReport>("/api/service-tickets/reports");
    return response.data;
  },

  async checkWarranty(serialNumber: string): Promise<WarrantyCheck> {
    const response = await api.get<WarrantyCheck>(`/api/warranties/${encodeURIComponent(serialNumber)}`);
    return {
      ...response.data,
      valid: response.data.status === "ACTIVE"
    };
  }
};

type BackendServiceTicket = Omit<ServiceTicket, "ticketNo" | "phone" | "timeline" | "items" | "createdAt" | "updatedAt"> & {
  ticketNo?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  items?: ServiceTicket["items"];
  timeline?: ServiceTicket["timeline"];
};

function normalizeTicket(ticket: BackendServiceTicket): ServiceTicket {
  return {
    ...ticket,
    ticketNo: ticket.ticketNo ?? `SC-${String(ticket.id).padStart(6, "0")}`,
    phone: ticket.phone ?? "",
    totalCost: Number(ticket.totalCost ?? 0),
    laborCost: Number(ticket.laborCost ?? 0),
    partsCost: Number(ticket.partsCost ?? 0),
    warrantyCost: Number(ticket.warrantyCost ?? 0),
    warrantyRepair: ticket.warrantyRepair ?? true,
    serviceType: ticket.serviceType ?? (ticket.warrantyRepair === false ? "PAID_REPAIR" : "WARRANTY"),
    customerPayAmount: Number(ticket.customerPayAmount ?? 0),
    createdAt: String(ticket.createdAt ?? ""),
    updatedAt: String(ticket.updatedAt ?? ""),
    items: (ticket.items ?? []).map((item) => ({ ...item, lineTotal: Number(item.lineTotal), unitPrice: Number(item.unitPrice), unitCost: Number(item.unitCost ?? 0) })),
    timeline: ticket.timeline ?? []
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _statusLabel(status: ServiceTicketStatus) {
  return {
    CREATED: "Moi tao",
    ASSIGNED: "Da gan",
    IN_PROGRESS: "Dang xu ly",
    CHECKING: "Dang kiem tra",
    WAITING_PARTS: "Cho linh kien",
    RECEIVED: "Da tiep nhan",
    DIAGNOSING: "Dang chan doan",
    QUOTED: "Da bao gia",
    WAITING_CUSTOMER_APPROVAL: "Cho khach duyet",
    REPAIRING: "Dang sua",
    QC_CHECK: "Kiem tra QC",
    RETURNED: "Da tra xe",
    COMPLETED: "Hoan thanh",
    CANCELLED: "Da huy"
  }[status];
}

