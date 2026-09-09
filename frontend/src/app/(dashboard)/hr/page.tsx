"use client";

import {
  BriefcaseBusiness, CalendarCheck, DollarSign, Gauge,
  Plus, UserCheck, Shield, Users, Eye, EyeOff,
  Lock, Unlock, Edit2, CheckCircle, XCircle, RefreshCw
} from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api/axios";
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

const ROLE_TONE: Record<string, "blue" | "green" | "amber" | "red" | "slate"> = {
  ADMIN: "red", BRANCH_MANAGER: "amber", 
  ACCOUNTANT: "green", CASHIER: "green",
  SALES_STAFF: "blue", TECHNICIAN: "blue", MARKETING_STAFF: "blue",
  WAREHOUSE_STAFF: "slate", USER: "slate",
};
const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Quản trị hệ thống", BRANCH_MANAGER: "Quản lý CN",
  ACCOUNTANT: "Kế toán", CASHIER: "Thủ quỹ",
  SALES_STAFF: "Bán hàng", TECHNICIAN: "Kỹ thuật",
  MARKETING_STAFF: "Marketing", WAREHOUSE_STAFF: "Thủ kho", USER: "Người dùng",
};

// ─── Types ───────────────────────────────────────────────────────────────────
type SystemUser = {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  branchIds: number[];
  roles: string[];
  status: string;
  lastLoginAt: string | null;
};

type Role = {
  code: string;
  name: string;
  permissions: string[];
};

type UserFormState = {
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  branchIds: number[];
  roles: string[];
  status: string;
  password: string;
};

const EMPTY_FORM: UserFormState = {
  employeeCode: "", fullName: "", email: "", phone: "",
  branchIds: [], roles: ["SALES_STAFF"], status: "ACTIVE", password: "",
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function HrPage() {
  const [tab, setTab] = useState<"employees" | "attendance" | "leave" | "payroll" | "kpi" | "users">("employees");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>();
  const [month, setMonth] = useState(nowMonth);
  const [year, setYear] = useState(nowYear);
  const [employeeForm, setEmployeeForm] = useState<Partial<EmployeePayload>>({
    status: "ACTIVE", hireDate: today, branchId: 1, baseSalary: 0, allowance: 0
  });

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
    void createEmployee.mutateAsync(employeeForm as EmployeePayload).then(() =>
      setEmployeeForm({ status: "ACTIVE", hireDate: today, branchId: 1, baseSalary: 0, allowance: 0 })
    );
  }

  return (
    <div className="space-y-5 p-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Nhân sự, Chấm công & Tài khoản</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý hồ sơ nhân viên, bảng công, nghỉ phép, lương, KPI và tài khoản hệ thống.</p>
        </div>
        {tab !== "users" && (
          <EmployeePicker employees={employees.data ?? []} value={selectedEmployee?.id} onChange={setSelectedEmployeeId} />
        )}
      </section>

      {/* KPI summary cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiSummaryCard icon={<UserCheck className="h-5 w-5" />} label="Nhân viên" value={employees.data?.length ?? 0} />
        <KpiSummaryCard icon={<CalendarCheck className="h-5 w-5" />} label="Công tháng này" value={attendances.data?.length ?? 0} />
        <KpiSummaryCard icon={<DollarSign className="h-5 w-5" />} label="Lương đã tính" value={payrolls.data?.length ?? 0} />
        <KpiSummaryCard icon={<Gauge className="h-5 w-5" />} label="Nhân viên đang chọn" value={selectedEmployee?.employeeCode ?? "—"} />
      </section>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {[
          ["employees", "Hồ sơ nhân viên"],
          ["attendance", "Bảng công"],
          ["leave", "Nghỉ phép"],
          ["payroll", "Bảng lương"],
          ["kpi", "KPI nhân viên"],
          ["users", "Tài khoản hệ thống"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === value
                ? "border-b-2 border-primary text-primary"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setTab(value as typeof tab)}
          >
            {label === "Tài khoản hệ thống" && <Shield className="inline h-3.5 w-3.5 mr-1 mb-0.5" />}
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Hồ sơ nhân viên ── */}
      {tab === "employees" && (
        <section className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <Panel title="Thêm nhân viên" icon={<Plus className="h-4 w-4" />}>
            <div className="space-y-3">
              <input className={inputClass} placeholder="Mã nhân viên" value={employeeForm.employeeCode ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, employeeCode: e.target.value }))} />
              <input className={inputClass} placeholder="Họ tên" value={employeeForm.fullName ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, fullName: e.target.value }))} />
              <input className={inputClass} placeholder="Điện thoại" value={employeeForm.phone ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, phone: e.target.value }))} />
              <input className={inputClass} placeholder="Email" value={employeeForm.email ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, email: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className={inputClass} type="number" placeholder="Chi nhánh" value={employeeForm.branchId ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, branchId: Number(e.target.value) }))} />
                <input className={inputClass} type="number" placeholder="User ID" value={employeeForm.userId ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, userId: e.target.value ? Number(e.target.value) : undefined }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={inputClass} type="number" placeholder="Lương cơ bản" value={employeeForm.baseSalary ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, baseSalary: Number(e.target.value) }))} />
                <input className={inputClass} type="number" placeholder="Phụ cấp" value={employeeForm.allowance ?? ""} onChange={(e) => setEmployeeForm((f) => ({ ...f, allowance: Number(e.target.value) }))} />
              </div>
              <Button className="w-full" disabled={createEmployee.isPending} onClick={submitEmployee}>Lưu nhân viên</Button>
            </div>
          </Panel>
          <Panel title="Danh sách nhân viên" icon={<BriefcaseBusiness className="h-4 w-4" />}>
            <DataTable headers={["Mã", "Họ tên", "Chi nhánh", "Lương cơ bản", "Trạng thái"]}>
              {(employees.data ?? []).map((employee) => (
                <tr key={employee.id} className="border-t border-border hover:bg-background cursor-pointer" onClick={() => setSelectedEmployeeId(employee.id)}>
                  <td className="px-3 py-2 font-mono text-xs">{employee.employeeCode}</td>
                  <td className="px-3 py-2 font-medium">{employee.fullName}</td>
                  <td className="px-3 py-2 text-slate-500">CN #{employee.branchId}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(employee.baseSalary)}</td>
                  <td className="px-3 py-2">
                    <Badge tone={employee.status === "ACTIVE" ? "green" : "slate"}>{employee.status === "ACTIVE" ? "Đang làm" : "Nghỉ"}</Badge>
                  </td>
                </tr>
              ))}
            </DataTable>
          </Panel>
        </section>
      )}

      {/* ── Tab: Bảng công ── */}
      {tab === "attendance" && selectedEmployee && (
        <Panel title={`Bảng công — ${selectedEmployee.fullName}`} icon={<CalendarCheck className="h-4 w-4" />}>
          <AttendanceQuickForm employeeId={selectedEmployee.id} shiftId={shifts.data?.[0]?.id} onSubmit={(payload) => void saveAttendance.mutateAsync(payload)} />
          <DataTable headers={["Ngày", "Vào", "Ra", "Trễ (phút)", "Về sớm", "Tăng ca (h)", "Trạng thái"]}>
            {(attendances.data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-3 py-2">{row.workDate}</td>
                <td className="px-3 py-2">{row.checkIn?.slice(11, 16) ?? "—"}</td>
                <td className="px-3 py-2">{row.checkOut?.slice(11, 16) ?? "—"}</td>
                <td className="px-3 py-2 text-right">{row.lateMinutes}</td>
                <td className="px-3 py-2 text-right">{row.earlyLeaveMinutes}</td>
                <td className="px-3 py-2 text-right">{row.overtimeHours}</td>
                <td className="px-3 py-2"><Badge tone={row.status === "PRESENT" ? "green" : "amber"}>{row.status}</Badge></td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      )}

      {/* ── Tab: Nghỉ phép ── */}
      {tab === "leave" && selectedEmployee && (
        <Panel title="Nghỉ phép" icon={<CalendarCheck className="h-4 w-4" />}>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button onClick={() => void createLeave.mutateAsync({ employeeId: selectedEmployee.id, fromDate: today, toDate: today, reason: "Nghỉ phép" })}>Tạo đơn hôm nay</Button>
          </div>
          <DataTable headers={["Nhân viên", "Từ ngày", "Đến ngày", "Số ngày", "Lý do", "Trạng thái", ""]}>
            {(leaves.data ?? []).map((leave) => (
              <tr key={leave.id} className="border-t border-border">
                <td className="px-3 py-2">#{leave.employeeId}</td>
                <td className="px-3 py-2">{leave.fromDate}</td>
                <td className="px-3 py-2">{leave.toDate}</td>
                <td className="px-3 py-2 text-right">{leave.daysCount}</td>
                <td className="px-3 py-2">{leave.reason}</td>
                <td className="px-3 py-2">
                  <Badge tone={leave.status === "APPROVED" ? "green" : leave.status === "PENDING" ? "amber" : "red"}>
                    {leave.status === "APPROVED" ? "Đã duyệt" : leave.status === "PENDING" ? "Chờ duyệt" : "Từ chối"}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right">
                  {leave.status === "PENDING" && (
                    <Button variant="secondary" onClick={() => void approveLeave.mutateAsync({ id: leave.id, status: "APPROVED", approvedBy: selectedEmployee.id })}>
                      Duyệt
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      )}

      {/* ── Tab: Bảng lương ── */}
      {tab === "payroll" && selectedEmployee && (
        <Panel title="Bảng lương" icon={<DollarSign className="h-4 w-4" />}>
          <MonthControls month={month} year={year} onMonth={setMonth} onYear={setYear} />
          <div className="mb-4">
            <Button onClick={() => void generatePayroll.mutateAsync({ employeeId: selectedEmployee.id, month, year, advanceTaken: 0, kpiBonus: 0, recordAccounting: true })}>
              Tính lương nhân viên đang chọn
            </Button>
          </div>
          <DataTable headers={["Mã bảng", "NV", "Lương CB", "Phụ cấp", "Hoa hồng", "Phạt", "Tạm ứng", "Thực lĩnh"]}>
            {(payrolls.data ?? []).map((payroll) => (
              <tr key={payroll.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-xs">{payroll.payrollCode}</td>
                <td className="px-3 py-2">#{payroll.employeeId}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(payroll.baseSalary)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(payroll.allowance)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(payroll.commission)}</td>
                <td className="px-3 py-2 text-right text-red-600">{formatCurrency(payroll.deductionLate)}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(payroll.advanceTaken)}</td>
                <td className="px-3 py-2 text-right font-semibold text-green-700">{formatCurrency(payroll.netSalary)}</td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      )}

      {/* ── Tab: KPI ── */}
      {tab === "kpi" && selectedEmployee && (
        <Panel title="KPI nhân viên" icon={<Gauge className="h-4 w-4" />}>
          <MonthControls month={month} year={year} onMonth={setMonth} onYear={setYear} />
          <Button className="mb-4" onClick={() => void calculateKpi.mutateAsync({ employeeId: selectedEmployee.id, month, year })}>Tính KPI</Button>
          {calculatedKpi && (
            <div className="grid gap-4 md:grid-cols-3">
              <KpiSummaryCard label="Báo giá gửi" value={calculatedKpi.quotationsSent} />
              <KpiSummaryCard label="Đơn chốt" value={calculatedKpi.ordersClosed} />
              <KpiSummaryCard label="Doanh thu" value={formatCurrency(calculatedKpi.revenue)} />
              <KpiSummaryCard label="Tỷ lệ chuyển đổi" value={`${calculatedKpi.conversionRate}%`} />
              <KpiSummaryCard label="Ticket bảo hành" value={calculatedKpi.serviceTicketsHandled} />
              <KpiSummaryCard label="Điểm KPI" value={calculatedKpi.kpiScore} />
            </div>
          )}
        </Panel>
      )}

      {/* ── Tab: Tài khoản hệ thống ── */}
      {tab === "users" && <SystemUsersTab />}
    </div>
  );
}

// ─── System Users Tab ────────────────────────────────────────────────────────
function SystemUsersTab() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.allSettled([
        api.get<{ items: SystemUser[] }>("/api/users", { params: { page: 0, pageSize: 100 } }),
        api.get<Role[]>("/api/roles"),
      ]);
      if (usersRes.status === "fulfilled") setUsers(usersRes.value.data.items ?? []);
      if (rolesRes.status === "fulfilled") setRoles(rolesRes.value.data ?? []);
    } catch {
      toast.error("Không thể tải dữ liệu tài khoản");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load once on mount
  useState(() => { void loadData(); });

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingUser(null);
    setShowForm(true);
  }

  function openEdit(user: SystemUser) {
    setForm({
      employeeCode: user.employeeCode,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      branchIds: user.branchIds,
      roles: user.roles,
      status: user.status,
      password: "",
    });
    setEditingUser(user);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.employeeCode || !form.fullName || !form.email || form.roles.length === 0) {
      toast.error("Vui lòng điền đầy đủ: Mã, Họ tên, Email, Vai trò");
      return;
    }
    if (!editingUser && !form.password) {
      toast.error("Mật khẩu bắt buộc khi tạo mới");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        employeeCode: form.employeeCode,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        branchIds: form.branchIds,
        roles: form.roles,
        status: form.status,
        ...(form.password ? { password: form.password } : {}),
      };
      if (editingUser) {
        await api.put(`/api/users/${editingUser.id}`, payload);
        toast.success("Đã cập nhật tài khoản");
      } else {
        await api.post("/api/users", payload);
        toast.success("Đã tạo tài khoản mới");
      }
      setShowForm(false);
      void loadData();
    } catch {
      toast.error("Lưu tài khoản thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(user: SystemUser) {
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await api.patch(`/api/users/${user.id}/status`, { status: nextStatus });
      toast.success(nextStatus === "ACTIVE" ? "Đã kích hoạt tài khoản" : "Đã khóa tài khoản");
      void loadData();
    } catch {
      toast.error("Không thể thay đổi trạng thái");
    }
  }

  const availableRoles = roles.length > 0 ? roles : Object.keys(ROLE_LABEL).map(code => ({ code, name: ROLE_LABEL[code], permissions: [] }));

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Tài khoản & Phân quyền
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Thêm/sửa tài khoản đăng nhập, gán vai trò và chi nhánh</p>
        </div>
        <div className="flex gap-2">
          <button
            id="user-refresh-btn"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Button id="user-create-btn" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Thêm tài khoản
          </Button>
        </div>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ROLE_LABEL).map(([code, label]) => (
          <span key={code} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${ROLE_TONE[code] === "red" ? "bg-red-400" : ROLE_TONE[code] === "amber" ? "bg-amber-400" : ROLE_TONE[code] === "green" ? "bg-emerald-400" : ROLE_TONE[code] === "blue" ? "bg-blue-400" : "bg-slate-300"}`} />
            {label}
          </span>
        ))}
      </div>

      {/* User table */}
      <div className="rounded-xl border border-border bg-white shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="erp-table w-full">
              <thead>
                <tr>
                  <th>Mã tài khoản</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Vai trò</th>
                  <th>Chi nhánh</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400">Chưa có tài khoản nào</td></tr>
                ) : users.map((user) => (
                  <tr key={user.id}>
                    <td className="font-mono text-xs text-primary">{user.employeeCode}</td>
                    <td className="font-medium">{user.fullName}</td>
                    <td className="text-slate-600 text-sm">{user.email}</td>
                    <td className="text-slate-600">{user.phone || "—"}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map(r => (
                          <Badge key={r} tone={ROLE_TONE[r] ?? "slate"}>
                            {ROLE_LABEL[r] ?? r}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="text-slate-600 text-sm">
                      {user.branchIds.length > 0 ? user.branchIds.map(id => `CN #${id}`).join(", ") : "Tất cả"}
                    </td>
                    <td className="text-center">
                      <Badge tone={user.status === "ACTIVE" ? "green" : "red"}>
                        {user.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          id={`user-edit-${user.id}`}
                          onClick={() => openEdit(user)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          id={`user-toggle-${user.id}`}
                          onClick={() => void handleToggleStatus(user)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            user.status === "ACTIVE"
                              ? "text-amber-400 hover:bg-amber-50 hover:text-amber-600"
                              : "text-green-500 hover:bg-green-50 hover:text-green-700"
                          }`}
                          title={user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
                        >
                          {user.status === "ACTIVE" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-text">
                  {editingUser ? `Chỉnh sửa: ${editingUser.fullName}` : "Thêm tài khoản mới"}
                </h3>
              </div>
              <button onClick={() => setShowForm(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Mã đăng nhập *</label>
                  <input
                    id="user-form-code"
                    className={inputClass + " w-full"}
                    placeholder="nv001"
                    value={form.employeeCode}
                    onChange={e => setForm(f => ({ ...f, employeeCode: e.target.value }))}
                    disabled={!!editingUser}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Họ tên *</label>
                  <input
                    id="user-form-name"
                    className={inputClass + " w-full"}
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
                <input
                  id="user-form-email"
                  className={inputClass + " w-full"}
                  type="email"
                  placeholder="nv001@chuanphat.vn"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Điện thoại</label>
                  <input className={inputClass + " w-full"} placeholder="0909..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Chi nhánh (ID, cách nhau dấu phẩy)</label>
                  <input
                    className={inputClass + " w-full"}
                    placeholder="1, 2"
                    value={form.branchIds.join(", ")}
                    onChange={e => {
                      const ids = e.target.value.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                      setForm(f => ({ ...f, branchIds: ids }));
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Mật khẩu {editingUser ? "(để trống nếu không đổi)" : "*"}
                </label>
                <div className="relative">
                  <input
                    id="user-form-password"
                    className={inputClass + " w-full pr-10"}
                    type={showPassword ? "text" : "password"}
                    placeholder={editingUser ? "••••••••" : "Tối thiểu 8 ký tự"}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Role checkboxes */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Vai trò * (chọn ít nhất 1)</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableRoles.map(role => (
                    <label
                      key={role.code}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                        form.roles.includes(role.code)
                          ? "border-primary bg-orange-50 text-primary font-medium"
                          : "border-border hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-orange-500"
                        checked={form.roles.includes(role.code)}
                        onChange={e => {
                          if (e.target.checked) {
                            setForm(f => ({ ...f, roles: [...f.roles, role.code] }));
                          } else {
                            setForm(f => ({ ...f, roles: f.roles.filter(r => r !== role.code) }));
                          }
                        }}
                      />
                      <span>{ROLE_LABEL[role.code] ?? role.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">Trạng thái:</span>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, status: f.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }))}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    form.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {form.status === "ACTIVE" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {form.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                </button>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-slate-50">
              <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
              <Button id="user-form-save" disabled={saving} onClick={handleSave}>
                {saving ? "Đang lưu..." : editingUser ? "Cập nhật" : "Tạo tài khoản"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function EmployeePicker({ employees, value, onChange }: { employees: Employee[]; value?: number; onChange: (id: number) => void }) {
  return (
    <select className={inputClass} value={value ?? ""} onChange={(event) => onChange(Number(event.target.value))}>
      <option value="">Chọn nhân viên</option>
      {employees.map((employee) => (
        <option key={employee.id} value={employee.id}>{employee.employeeCode} — {employee.fullName}</option>
      ))}
    </select>
  );
}

function AttendanceQuickForm({ employeeId, shiftId, onSubmit }: {
  employeeId: number;
  shiftId?: number;
  onSubmit: (payload: { employeeId: number; workDate: string; workShiftId?: number; checkIn?: string; checkOut?: string }) => void;
}) {
  const [date, setDate] = useState(today);
  const [checkIn, setCheckIn] = useState("08:05");
  const [checkOut, setCheckOut] = useState("18:00");
  return (
    <div className="mb-4 grid gap-2 md:grid-cols-4">
      <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input className={inputClass} type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
      <input className={inputClass} type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
      <Button onClick={() => onSubmit({ employeeId, workDate: date, workShiftId: shiftId, checkIn: `${date}T${checkIn}:00+07:00`, checkOut: `${date}T${checkOut}:00+07:00` })}>Lưu công</Button>
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
    <section className="rounded-xl border border-border bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-2 text-text">
        {icon}
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function KpiSummaryCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string | number }) {
  return (
    <article className="rounded-xl border border-border bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <p className="text-sm">{label}</p>
      </div>
      <p className="mt-2 text-xl font-bold text-text">{value}</p>
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

const inputClass = "h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 w-full";
