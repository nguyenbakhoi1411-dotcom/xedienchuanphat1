export type Employee = {
  id: number;
  employeeCode: string;
  fullName: string;
  phone?: string;
  email?: string;
  branchId: number;
  departmentId?: number;
  positionId?: number;
  hireDate: string;
  status: string;
  baseSalary: number;
  allowance: number;
  userId?: number;
};

export type EmployeePayload = Omit<Employee, "id">;

export type WorkShift = {
  id: number;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
};

export type Attendance = {
  id: number;
  employeeId: number;
  workDate: string;
  workShiftId?: number;
  checkIn?: string;
  checkOut?: string;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeHours: number;
  status: string;
  note?: string;
};

export type LeaveRequest = {
  id: number;
  employeeId: number;
  fromDate: string;
  toDate: string;
  daysCount: number;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: number;
};

export type Payroll = {
  id: number;
  payrollCode: string;
  employeeId: number;
  branchId: number;
  month: number;
  year: number;
  baseSalary: number;
  allowance: number;
  commission: number;
  kpiBonus: number;
  overtimePay: number;
  deductionLate: number;
  advanceTaken: number;
  grossSalary: number;
  netSalary: number;
  status: string;
  items: Array<{ id: number; itemType: string; description: string; amount: number }>;
};

export type KPI = {
  id: number;
  employeeId: number;
  month: number;
  year: number;
  leadsHandled: number;
  quotationsSent: number;
  ordersClosed: number;
  revenue: number;
  profit: number;
  conversionRate: number;
  serviceTicketsHandled: number;
  kpiScore: number;
};
