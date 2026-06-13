import { api } from "@/lib/api/axios";
import type { Attendance, Employee, EmployeePayload, KPI, LeaveRequest, Payroll, WorkShift } from "./types";

export const hrApi = {
  async employees(branchId?: number) {
    const response = await api.get<Employee[]>("/api/hr/employees", { params: { branchId } });
    return response.data.map(normalizeMoney);
  },
  async createEmployee(payload: EmployeePayload) {
    const response = await api.post<Employee>("/api/hr/employees", payload);
    return normalizeMoney(response.data);
  },
  async updateEmployee(id: number, payload: EmployeePayload) {
    const response = await api.put<Employee>(`/api/hr/employees/${id}`, payload);
    return normalizeMoney(response.data);
  },
  async shifts() {
    return (await api.get<WorkShift[]>("/api/hr/shifts")).data;
  },
  async attendances(params: { employeeId?: number; from?: string; to?: string }) {
    const response = await api.get<Attendance[]>("/api/hr/attendances", { params });
    return response.data.map((item) => ({ ...item, overtimeHours: Number(item.overtimeHours ?? 0) }));
  },
  async saveAttendance(payload: { employeeId: number; workDate: string; workShiftId?: number; checkIn?: string; checkOut?: string; note?: string }) {
    const response = await api.post<Attendance>("/api/hr/attendances", payload);
    return { ...response.data, overtimeHours: Number(response.data.overtimeHours ?? 0) };
  },
  async leaves(status?: string) {
    const response = await api.get<LeaveRequest[]>("/api/hr/leaves", { params: { status } });
    return response.data.map((item) => ({ ...item, daysCount: Number(item.daysCount ?? 0) }));
  },
  async createLeave(payload: { employeeId: number; fromDate: string; toDate: string; reason?: string; leaveType?: string }) {
    return (await api.post<LeaveRequest>("/api/hr/leaves", payload)).data;
  },
  async approveLeave(id: number, payload: { status: "APPROVED" | "REJECTED"; approvedBy?: number; rejectedReason?: string }) {
    return (await api.patch<LeaveRequest>(`/api/hr/leaves/${id}/approval`, payload)).data;
  },
  async payrolls(month: number, year: number) {
    const response = await api.get<Payroll[]>("/api/hr/payrolls", { params: { month, year } });
    return response.data.map(normalizePayroll);
  },
  async generatePayroll(payload: { employeeId: number; month: number; year: number; advanceTaken?: number; kpiBonus?: number; recordAccounting?: boolean }) {
    const response = await api.post<Payroll>("/api/hr/payrolls/generate", payload);
    return normalizePayroll(response.data);
  },
  async calculateKpi(employeeId: number, month: number, year: number) {
    const response = await api.post<KPI>("/api/hr/kpis/calculate", null, { params: { employeeId, month, year } });
    return {
      ...response.data,
      revenue: Number(response.data.revenue ?? 0),
      profit: Number(response.data.profit ?? 0),
      conversionRate: Number(response.data.conversionRate ?? 0),
      kpiScore: Number(response.data.kpiScore ?? 0)
    };
  }
};

function normalizeMoney(employee: Employee): Employee {
  return { ...employee, baseSalary: Number(employee.baseSalary ?? 0), allowance: Number(employee.allowance ?? 0) };
}

function normalizePayroll(payroll: Payroll): Payroll {
  return {
    ...payroll,
    baseSalary: Number(payroll.baseSalary ?? 0),
    allowance: Number(payroll.allowance ?? 0),
    commission: Number(payroll.commission ?? 0),
    kpiBonus: Number(payroll.kpiBonus ?? 0),
    overtimePay: Number(payroll.overtimePay ?? 0),
    deductionLate: Number(payroll.deductionLate ?? 0),
    advanceTaken: Number(payroll.advanceTaken ?? 0),
    grossSalary: Number(payroll.grossSalary ?? 0),
    netSalary: Number(payroll.netSalary ?? 0),
    items: payroll.items ?? []
  };
}
