"use client";

import { BriefcaseBusiness, CalendarCheck, DollarSign, Gauge, Plus, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import {
  useApproveLeave,
  useCalculateKpi,
  useCreateHrEmployee,
  useCreateLeave,
  useGeneratePayroll,
  useHrAttendances,
  useHrEmployees,
  useHrLeaves,
  useHrPayrolls,
  useHrShifts,
  useSaveAttendance
} from "@/features/hr/hooks";
import type { Employee, EmployeePayload, KPI } from "@/features/hr/types";

const today = new Date().toISOString().slice(0, 10);
const nowMonth = new Date().getMonth() + 1;
const nowYear = new Date().getFullYear();

export default function HrPage() {
  const [tab, setTab] = useState<"employees" | "attendance" | "leave" | "payroll" | "kpi">("employees");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>();
  const [month, setMonth] = useState(nowMonth);
  const [year, setYear] = useState(nowYear);
  const [employeeForm, setEmployeeForm] = useState<Partial<EmployeePayload>>({ status: "ACTIVE", hireDate: today, branchId: 1, baseSalary: 0, allowance: 0 });

  const employees = useHrEmployees();
  const shifts = useHrShifts();
  const attendances = useHrAttendances({ employeeId: selectedEmployeeId });
  const leaves = useHrLeaves();
  const payrolls = useHrPayrolls(month, year);
  const createEmployee = useCreateHrEmployee();
  const saveAttendance = useSaveAttendance();
  const createLeave = useCreateLeave();
  const approveLeave = useApproveLeave();
  const generatePayroll = useGeneratePayroll();
  const calculateKpi = useCalculateKpi();
  const calculatedKpi = calculateKpi.data as KPI | undefined;

  const selectedEmployee = useMemo(
    () => employees.data?.find((employee) => employee.id === selectedEmployeeId) ?? employees.data?.[0],
    [employees.data, selectedEmployeeId]
  );

  function submitEmployee() {
    if (!employeeForm.employeeCode || !employeeForm.fullName || !employeeForm.branchId) return;
    void createEmployee.mutateAsync(employeeForm as EmployeePayload).then(() => setEmployeeForm({ status: "ACTIVE", hireDate: today, branchId: 1, baseSalary: 0, allowance: 0 }));
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-text">Nhan su, cham cong, luong, KPI</h1>
          <p className="mt-1 text-sm text-slate-500">Quan ly ho so nhan vien, bang cong, nghi phep, payroll va KPI theo chi nhanh.</p>
        </div>
        <EmployeePicker employees={employees.data ?? []} value={selectedEmployee?.id} onChange={setSelectedEmployeeId} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<UserCheck className="h-5 w-5" />} label="Nhan vien" value={employees.data?.length ?? 0} />
        <KpiCard icon={<CalendarCheck className="h-5 w-5" />} label="Cong thang nay" value={attendances.data?.length ?? 0} />
        <KpiCard icon={<DollarSign className="h-5 w-5" />} label="Luong da tinh" value={payrolls.data?.length ?? 0} />
        <KpiCard icon={<Gauge className="h-5 w-5" />} label="Nhan vien dang chon" value={selectedEmployee?.employeeCode ?? "-"} />
      </section>

      <div className="flex flex-wrap gap-2 border-b border-border">
        {[
          ["employees", "Ho so nhan vien"],
          ["attendance", "Bang cong"],
          ["leave", "Nghi phep"],
          ["payroll", "Bang luong"],
          ["kpi", "KPI nhan vien"]
        ].map(([value, label]) => (
          <button key={value} className={`px-3 py-2 text-sm font-medium ${tab === value ? "border-b-2 border-primary text-primary" : "text-slate-500"}`} onClick={() => setTab(value as typeof tab)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "employees" && (
        <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <Panel title="Them nhan vien" icon={<Plus className="h-4 w-4" />}>
            <div className="space-y-3">
              <input className={inputClass} placeholder="Ma nhan vien" value={employeeForm.employeeCode ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, employeeCode: e.target.value }))} />
              <input className={inputClass} placeholder="Ho ten" value={employeeForm.fullName ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, fullName: e.target.value }))} />
              <input className={inputClass} placeholder="Dien thoai" value={employeeForm.phone ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, phone: e.target.value }))} />
              <input className={inputClass} placeholder="Email" value={employeeForm.email ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, email: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className={inputClass} type="number" placeholder="Chi nhanh" value={employeeForm.branchId ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, branchId: Number(e.target.value) }))} />
                <input className={inputClass} type="number" placeholder="User ID" value={employeeForm.userId ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, userId: e.target.value ? Number(e.target.value) : undefined }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={inputClass} type="number" placeholder="Luong co ban" value={employeeForm.baseSalary ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, baseSalary: Number(e.target.value) }))} />
                <input className={inputClass} type="number" placeholder="Phu cap" value={employeeForm.allowance ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, allowance: Number(e.target.value) }))} />
              </div>
              <Button className="w-full" disabled={createEmployee.isPending} onClick={submitEmployee}>Luu nhan vien</Button>
            </div>
          </Panel>
          <Panel title="Danh sach nhan vien" icon={<BriefcaseBusiness className="h-4 w-4" />}>
            <DataTable headers={["Ma", "Ho ten", "Chi nhanh", "Luong co ban", "Trang thai"]}>
              {(employees.data ?? []).map((employee) => (
                <tr key={employee.id} className="border-t border-border hover:bg-background" onClick={() => setSelectedEmployeeId(employee.id)}>
                  <td className="px-3 py-2 font-mono text-xs">{employee.employeeCode}</td>
                  <td className="px-3 py-2">{employee.fullName}</td>
                  <td className="px-3 py-2">#{employee.branchId}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(employee.baseSalary)}</td>
                  <td className="px-3 py-2">{employee.status}</td>
                </tr>
              ))}
            </DataTable>
          </Panel>
        </section>
      )}

      {tab === "attendance" && selectedEmployee && (
        <Panel title={`Bang cong - ${selectedEmployee.fullName}`} icon={<CalendarCheck className="h-4 w-4" />}>
          <AttendanceQuickForm employeeId={selectedEmployee.id} shiftId={shifts.data?.[0]?.id} onSubmit={(payload) => void saveAttendance.mutateAsync(payload)} />
          <DataTable headers={["Ngay", "Vao", "Ra", "Tre", "Ve som", "Tang ca", "Trang thai"]}>
            {(attendances.data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-3 py-2">{row.workDate}</td>
                <td className="px-3 py-2">{row.checkIn?.slice(11, 16) ?? "-"}</td>
                <td className="px-3 py-2">{row.checkOut?.slice(11, 16) ?? "-"}</td>
                <td className="px-3 py-2 text-right">{row.lateMinutes}</td>
                <td className="px-3 py-2 text-right">{row.earlyLeaveMinutes}</td>
                <td className="px-3 py-2 text-right">{row.overtimeHours}</td>
                <td className="px-3 py-2">{row.status}</td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      )}

      {tab === "leave" && selectedEmployee && (
        <Panel title="Nghi phep" icon={<CalendarCheck className="h-4 w-4" />}>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button onClick={() => void createLeave.mutateAsync({ employeeId: selectedEmployee.id, fromDate: today, toDate: today, reason: "Nghi phep" })}>Tao don hom nay</Button>
          </div>
          <DataTable headers={["Nhan vien", "Tu ngay", "Den ngay", "So ngay", "Ly do", "Trang thai", ""]}>
            {(leaves.data ?? []).map((leave) => (
              <tr key={leave.id} className="border-t border-border">
                <td className="px-3 py-2">#{leave.employeeId}</td>
                <td className="px-3 py-2">{leave.fromDate}</td>
                <td className="px-3 py-2">{leave.toDate}</td>
                <td className="px-3 py-2 text-right">{leave.daysCount}</td>
                <td className="px-3 py-2">{leave.reason}</td>
                <td className="px-3 py-2">{leave.status}</td>
                <td className="px-3 py-2 text-right">
                  {leave.status === "PENDING" && <Button variant="secondary" onClick={() => void approveLeave.mutateAsync({ id: leave.id, status: "APPROVED", approvedBy: selectedEmployee.id })}>Duyet</Button>}
                </td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      )}

      {tab === "payroll" && selectedEmployee && (
        <Panel title="Bang luong" icon={<DollarSign className="h-4 w-4" />}>
          <MonthControls month={month} year={year} onMonth={setMonth} onYear={setYear} />
          <div className="mb-4 flex flex-wrap gap-2">
            <Button onClick={() => void generatePayroll.mutateAsync({ employeeId: selectedEmployee.id, month, year, advanceTaken: 0, kpiBonus: 0, recordAccounting: true })}>Tinh luong nhan vien dang chon</Button>
          </div>
          <DataTable headers={["Ma bang", "NV", "Luong", "Phu cap", "Hoa hong", "Phat", "Tam ung", "Thuc linh"]}>
            {(payrolls.data ?? []).map((payroll) => (
              <tr key={payroll.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-xs">{payroll.payrollCode}</td>
                <td className="px-3 py-2">#{payroll.employeeId}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(payroll.baseSalary)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(payroll.allowance)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(payroll.commission)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(payroll.deductionLate)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(payroll.advanceTaken)}</td>
                <td className="px-3 py-2 text-right font-semibold">{formatCurrency(payroll.netSalary)}</td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      )}

      {tab === "kpi" && selectedEmployee && (
        <Panel title="KPI nhan vien" icon={<Gauge className="h-4 w-4" />}>
          <MonthControls month={month} year={year} onMonth={setMonth} onYear={setYear} />
          <Button onClick={() => void calculateKpi.mutateAsync({ employeeId: selectedEmployee.id, month, year })}>Tinh KPI</Button>
          {calculatedKpi && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <KpiCard label="Bao gia" value={calculatedKpi.quotationsSent} />
              <KpiCard label="Don chot" value={calculatedKpi.ordersClosed} />
              <KpiCard label="Doanh thu" value={formatCurrency(calculatedKpi.revenue)} />
              <KpiCard label="Chuyen doi" value={`${calculatedKpi.conversionRate}%`} />
              <KpiCard label="Ticket BH" value={calculatedKpi.serviceTicketsHandled} />
              <KpiCard label="Diem KPI" value={calculatedKpi.kpiScore} />
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

function EmployeePicker({ employees, value, onChange }: { employees: Employee[]; value?: number; onChange: (id: number) => void }) {
  return (
    <select className={inputClass} value={value ?? ""} onChange={(event) => onChange(Number(event.target.value))}>
      <option value="">Chon nhan vien</option>
      {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeCode} - {employee.fullName}</option>)}
    </select>
  );
}

function AttendanceQuickForm({ employeeId, shiftId, onSubmit }: { employeeId: number; shiftId?: number; onSubmit: (payload: { employeeId: number; workDate: string; workShiftId?: number; checkIn?: string; checkOut?: string }) => void }) {
  const [date, setDate] = useState(today);
  const [checkIn, setCheckIn] = useState("08:05");
  const [checkOut, setCheckOut] = useState("18:00");
  return (
    <div className="mb-4 grid gap-2 md:grid-cols-4">
      <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input className={inputClass} type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
      <input className={inputClass} type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
      <Button onClick={() => onSubmit({ employeeId, workDate: date, workShiftId: shiftId, checkIn: `${date}T${checkIn}:00+07:00`, checkOut: `${date}T${checkOut}:00+07:00` })}>Luu cong</Button>
    </div>
  );
}

function MonthControls({ month, year, onMonth, onYear }: { month: number; year: number; onMonth: (value: number) => void; onYear: (value: number) => void }) {
  return (
    <div className="mb-4 flex gap-2">
      <input className={inputClass} type="number" min={1} max={12} value={month} onChange={(e) => onMonth(Number(e.target.value))} />
      <input className={inputClass} type="number" value={year} onChange={(e) => onYear(Number(e.target.value))} />
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2 text-text">{icon}<h2 className="font-semibold">{title}</h2></div>
      {children}
    </section>
  );
}

function KpiCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string | number }) {
  return (
    <article className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2 text-slate-500">{icon}<p className="text-sm">{label}</p></div>
      <p className="mt-2 text-xl font-semibold text-text">{value}</p>
    </article>
  );
}

function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-background text-xs uppercase text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="px-3 py-2">{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const inputClass = "h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
