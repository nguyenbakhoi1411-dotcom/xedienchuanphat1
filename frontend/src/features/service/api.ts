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

const enableMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

const warranties: WarrantyCheck[] = [
  { serialNumber: "CP-S1-00091", vehicleId: 1001, customerName: "Nguyen Van A", startDate: "2026-05-02", endDate: "2028-05-02", status: "ACTIVE", valid: true },
  { serialNumber: "CP-CITY-00418", vehicleId: 1002, customerName: "Tran Thi B", startDate: "2025-01-10", endDate: "2026-01-10", status: "EXPIRED", valid: false }
];

let tickets: ServiceTicket[] = [
  {
    id: 1,
    ticketNo: "SC-2026-0101",
    vehicleId: 1001,
    serialNumber: "CP-S1-00091",
    customerName: "Nguyen Van A",
    phone: "0900000001",
    issueDescription: "Kiem tra pin va bo sac",
    serviceType: "WARRANTY",
    status: "IN_PROGRESS",
    warrantyRepair: true,
    laborCost: 350000,
    partsCost: 0,
    warrantyCost: 350000,
    customerPayAmount: 0,
    technicianUsername: "tech.leminh",
    totalCost: 350000,
    createdAt: "2026-06-04",
    updatedAt: "2026-06-06",
    items: [{ id: 1, type: "LABOR", name: "Cong kiem tra", quantity: 1, unitPrice: 350000, lineTotal: 350000 }],
    timeline: [
      event(1, "2026-06-04 09:00", "Tao phieu", "Tiep nhan yeu cau tu khach hang"),
      event(2, "2026-06-04 10:00", "Gan ky thuat vien", "tech.leminh phu trach"),
      event(3, "2026-06-05 14:00", "Dang xu ly", "Dang kiem tra he thong pin")
    ]
  },
  {
    id: 2,
    ticketNo: "SC-2026-0102",
    vehicleId: 1002,
    serialNumber: "CP-CITY-00418",
    customerName: "Tran Thi B",
    phone: "0900000002",
    issueDescription: "Thay tay thang",
    serviceType: "PAID_REPAIR",
    status: "WAITING_PARTS",
    warrantyRepair: false,
    laborCost: 0,
    partsCost: 0,
    warrantyCost: 0,
    customerPayAmount: 0,
    technicianUsername: "tech.hoangphuc",
    totalCost: 0,
    createdAt: "2026-06-05",
    updatedAt: "2026-06-06",
    items: [],
    timeline: [event(4, "2026-06-05 11:00", "Tao phieu", "Cho linh kien thay the")]
  }
];

export const serviceApi = {
  async list(params: TicketListParams): Promise<PageResponse<ServiceTicket>> {
    if (!enableMock) {
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
    }
    await wait();
    const keyword = params.keyword.trim().toLowerCase();
    const filtered = tickets.filter((ticket) => {
      const matchKeyword =
        keyword.length === 0 ||
        ticket.ticketNo.toLowerCase().includes(keyword) ||
        ticket.customerName.toLowerCase().includes(keyword) ||
        ticket.serialNumber.toLowerCase().includes(keyword);
      const matchStatus = params.status === "ALL" || ticket.status === params.status;
      return matchKeyword && matchStatus;
    });
    return paginate(filtered, params.page, params.pageSize);
  },

  async detail(id: number): Promise<ServiceTicket> {
    if (!enableMock) {
      const response = await api.get<BackendServiceTicket>(`/api/service-tickets/${id}`);
      return normalizeTicket(response.data);
    }
    await wait();
    const ticket = tickets.find((item) => item.id === id);
    if (!ticket) throw new Error("Khong tim thay phieu sua chua");
    return ticket;
  },

  async create(payload: CreateTicketPayload): Promise<ServiceTicket> {
    if (!enableMock) {
      const response = await api.post<BackendServiceTicket>("/api/service-tickets", payload);
      return normalizeTicket(response.data);
    }
    await wait();
    const now = new Date().toISOString().slice(0, 10);
    const ticket: ServiceTicket = {
      ...payload,
      id: Math.max(0, ...tickets.map((item) => item.id)) + 1,
      ticketNo: `SC-${Date.now().toString().slice(-8)}`,
      status: "CREATED",
      serviceType: payload.serviceType ?? (payload.warrantyRepair === false ? "PAID_REPAIR" : "WARRANTY"),
      warrantyRepair: payload.warrantyRepair ?? true,
      laborCost: 0,
      partsCost: 0,
      warrantyCost: 0,
      customerPayAmount: 0,
      totalCost: 0,
      createdAt: now,
      updatedAt: now,
      items: [],
      timeline: [event(Date.now(), `${now} 08:00`, "Tao phieu", payload.issueDescription)]
    };
    tickets = [ticket, ...tickets];
    return ticket;
  },

  async updateStatus(id: number, payload: UpdateStatusPayload): Promise<ServiceTicket> {
    if (!enableMock) {
      const response = await api.patch<BackendServiceTicket>(`/api/service-tickets/${id}/status`, payload);
      return normalizeTicket(response.data);
    }
    await wait();
    const ticket = await this.detail(id);
    ticket.status = payload.status;
    ticket.updatedAt = today();
    ticket.timeline = [event(Date.now(), ticket.updatedAt, "Cap nhat trang thai", statusLabel(payload.status)), ...ticket.timeline];
    return ticket;
  },

  async assignTechnician(id: number, payload: AssignTechnicianPayload): Promise<ServiceTicket> {
    if (!enableMock) {
      const response = await api.patch<BackendServiceTicket>(`/api/service-tickets/${id}/technician`, payload);
      return normalizeTicket(response.data);
    }
    await wait();
    const ticket = await this.detail(id);
    ticket.technicianUsername = payload.technicianUsername;
    if (ticket.status === "CREATED") ticket.status = "ASSIGNED";
    ticket.updatedAt = today();
    ticket.timeline = [event(Date.now(), ticket.updatedAt, "Gan ky thuat vien", payload.technicianUsername), ...ticket.timeline];
    return ticket;
  },

  async addItem(id: number, payload: AddTicketItemPayload): Promise<ServiceTicket> {
    if (!enableMock) {
      const response = await api.post<BackendServiceTicket>(`/api/service-tickets/${id}/items`, payload);
      return normalizeTicket(response.data);
    }
    await wait();
    const ticket = await this.detail(id);
    const lineTotal = payload.quantity * payload.unitPrice;
    ticket.items = [{ id: Date.now(), ...payload, lineTotal }, ...ticket.items];
    ticket.totalCost = ticket.items.reduce((sum, item) => sum + item.lineTotal, 0);
    ticket.warrantyCost = ticket.items.filter((item) => item.isWarrantyCovered || ticket.warrantyRepair).reduce((sum, item) => sum + item.lineTotal, 0);
    ticket.customerPayAmount = Math.max(0, ticket.totalCost - ticket.warrantyCost);
    ticket.updatedAt = today();
    ticket.timeline = [event(Date.now(), ticket.updatedAt, "Them chi phi", `${payload.name} - ${lineTotal}`), ...ticket.timeline];
    return ticket;
  },

  async updateDiagnosis(id: number, payload: { diagnosisNote?: string; predictedCause?: string; technicianDiagnosis?: string; warrantyRepair?: boolean; componentType?: ServiceTicket["componentType"] }): Promise<ServiceTicket> {
    if (!enableMock) {
      const response = await api.patch<BackendServiceTicket>(`/api/service-tickets/${id}/diagnosis`, payload);
      return normalizeTicket(response.data);
    }
    await wait();
    const ticket = await this.detail(id);
    ticket.diagnosisNote = payload.diagnosisNote;
    ticket.predictedCause = payload.predictedCause ?? payload.technicianDiagnosis;
    ticket.technicianDiagnosis = payload.technicianDiagnosis ?? payload.diagnosisNote;
    ticket.componentType = payload.componentType;
    ticket.warrantyRepair = payload.warrantyRepair ?? ticket.warrantyRepair;
    ticket.serviceType = ticket.warrantyRepair ? "WARRANTY" : "PAID_REPAIR";
    ticket.status = ticket.warrantyRepair ? "WAITING_PARTS" : "QUOTED";
    return ticket;
  },

  async createQuotation(id: number, note: string) {
    if (!enableMock) return (await api.post(`/api/service-tickets/${id}/quotation`, { note })).data;
    await wait();
    return { id: Date.now(), ticketId: id, status: "PENDING_CUSTOMER" };
  },

  async approveQuotation(id: number) {
    if (!enableMock) return (await api.post(`/api/service-tickets/${id}/quotation/approve`)).data;
    await wait();
    return { id: Date.now(), ticketId: id, status: "APPROVED" };
  },

  async createInvoice(id: number) {
    if (!enableMock) return (await api.post(`/api/service-tickets/${id}/invoice`)).data;
    await wait();
    return { id: Date.now(), ticketId: id, status: "ISSUED" };
  },

  async historyByVehicle(vehicleId: number): Promise<ServiceTicket[]> {
    if (!enableMock) {
      const response = await api.get<BackendServiceTicket[]>(`/api/service-tickets/vehicles/${vehicleId}/history`);
      return response.data.map(normalizeTicket);
    }
    await wait();
    return tickets.filter((ticket) => ticket.vehicleId === vehicleId);
  },

  async reports(): Promise<ServiceReport> {
    if (!enableMock) {
      const response = await api.get<ServiceReport>("/api/service-tickets/reports");
      return response.data;
    }
    await wait();
    return {
      ticketsByStatus: [
        { status: "DIAGNOSING", total: 3 },
        { status: "WAITING_PARTS", total: 2 },
        { status: "COMPLETED", total: 9 }
      ],
      averageHandlingHours: 18.5,
      commonIssues: [{ issue: "Kiem tra pin", total: 6 }],
      topTechnicians: [{ technicianUsername: "tech.leminh", total: 12 }],
      warrantyCost: 4200000,
      repairRevenue: 15800000,
      topFaultyModels: [{ issue: "CP S1", total: 4 }],
      topFaultyComponents: [{ issue: "BATTERY", total: 5 }],
      topFaultySuppliers: [{ issue: "Supplier #1", total: 3 }],
      warrantyCostByMonth: [{ issue: "2026-06-01", total: 4200000 }],
      reworkRate: 8.5
    };
  },

  async checkWarranty(serialNumber: string): Promise<WarrantyCheck> {
    if (!enableMock) {
      const response = await api.get<WarrantyCheck>(`/api/warranties/${encodeURIComponent(serialNumber)}`);
      return {
        ...response.data,
        valid: response.data.status === "ACTIVE"
      };
    }
    await wait();
    const warranty = warranties.find((item) => item.serialNumber.toLowerCase() === serialNumber.trim().toLowerCase());
    if (!warranty) throw new Error("Khong tim thay bao hanh cho serial nay");
    return warranty;
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

function event(id: number, eventTime: string, title: string, description: string) {
  return { id, eventTime, title, description };
}

function statusLabel(status: ServiceTicketStatus) {
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

function today() {
  return new Date().toISOString().slice(0, 10);
}

function paginate<T>(items: T[], page: number, pageSize: number): PageResponse<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageSize, totalItems, totalPages };
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}
