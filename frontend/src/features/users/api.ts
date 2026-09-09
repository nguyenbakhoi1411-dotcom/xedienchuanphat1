import { api } from "@/lib/api/axios";
import { permissionActions, permissionModules } from "./userOptions";
import type {
  EmployeeUser,
  PageResponse,
  PermissionAction,
  PermissionMatrixPayload,
  PermissionModule,
  Role,
  RoleCode,
  UserListParams,
  UserPayload
} from "./types";

export const usersApi = {
  async list(params: UserListParams): Promise<PageResponse<EmployeeUser>> {
    const response = await api.get<PageResponse<EmployeeUser>>("/api/users", {
      params: { page: Math.max(params.page - 1, 0), pageSize: params.pageSize }
    });
    const keyword = params.keyword.trim().toLowerCase();
    const items = response.data.items
      .map(normalizeUser)
      .filter((user) => {
        const matchKeyword = !keyword || user.employeeCode.toLowerCase().includes(keyword) || user.fullName.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword) || user.phone.includes(keyword);
        const matchBranch = params.branchId === "ALL" || user.branchIds.includes(Number(params.branchId));
        const matchRole = params.role === "ALL" || user.roles.includes(params.role);
        const matchStatus = params.status === "ALL" || user.status === params.status;
        return matchKeyword && matchBranch && matchRole && matchStatus;
      });
    return { ...response.data, page: response.data.page + 1, items };
  },

  async roles(): Promise<Role[]> {
    const [rolesResponse] = await Promise.all([
      api.get<Array<{ code: RoleCode; name: string; permissions: string[] }>>("/api/roles"),
      api.get<Array<{ code: string }>>("/api/permissions")
    ]);
    return rolesResponse.data.map((role) => ({
      code: role.code,
      name: role.name,
      description: getRoleDescription(role.code),
      userCount: 0,
      permissions: permissionCodesToMatrix(role.permissions)
    }));
  },

  async create(payload: UserPayload): Promise<EmployeeUser> {
    const response = await api.post<EmployeeUser>("/api/users", {
      ...payload,
      password: "ChangeMe@123"
    });
    return normalizeUser(response.data);
  },

  async update(id: number, payload: UserPayload): Promise<EmployeeUser> {
    const response = await api.put<EmployeeUser>(`/api/users/${id}`, payload);
    return normalizeUser(response.data);
  },

  async toggleStatus(id: number): Promise<EmployeeUser> {
    const current = await api.get<PageResponse<EmployeeUser>>("/api/users", { params: { page: 0, pageSize: 500 } });
    const user = current.data.items.find((item) => item.id === id);
    const nextStatus = normalizeUser(user as EmployeeUser).status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const response = await api.patch<EmployeeUser>(`/api/users/${id}/status`, { status: nextStatus });
    return normalizeUser(response.data);
  },

  async updatePermissionMatrix(payload: PermissionMatrixPayload): Promise<Role> {
    const permissionsResponse = await api.get<Array<{ code: string }>>("/api/permissions");
    const allowedCodes = new Set(permissionsResponse.data.map((permission) => permission.code));
    const permissionCodes = matrixToPermissionCodes(payload.permissions).filter((code) => allowedCodes.has(code));
    const response = await api.put<{ code: RoleCode; name: string; permissions: string[] }>(`/api/roles/${payload.roleCode}/permissions`, {
      permissions: permissionCodes
    });
    return {
      code: response.data.code,
      name: response.data.name,
      description: getRoleDescription(response.data.code),
      userCount: 0,
      permissions: permissionCodesToMatrix(response.data.permissions)
    };
  }
};

function getRoleDescription(role: RoleCode) {
  const descriptions: Record<string, string> = {
    ADMIN: "Quản trị toàn hệ thống",
    BRANCH_MANAGER: "Quản lý chi nhánh",
    SALES_STAFF: "Bán hàng và chăm sóc khách hàng",
    WAREHOUSE_STAFF: "Thủ kho, nhập xuất tồn",
    ACCOUNTANT: "Kế toán, công nợ",
    CASHIER: "Thủ quỹ, quản lý tiền mặt",
    TECHNICIAN: "Kỹ thuật viên bảo hành",
    USER: "Người dùng cơ bản",
    MARKETING_STAFF: "Nhân viên Marketing"
  };
  return descriptions[role] || "Vai trò hệ thống";
}

function normalizeUser(user: EmployeeUser): EmployeeUser {
  return {
    ...user,
    phone: user.phone ?? "",
    branchIds: user.branchIds ?? [],
    roles: user.roles ?? [],
    status: String(user.status) === "INACTIVE" ? "LOCKED" : user.status,
    lastLoginAt: user.lastLoginAt ?? null
  };
}

function permissionCodesToMatrix(codes: string[]): Record<PermissionModule, PermissionAction[]> {
  const matrix = createEmptyPermissionMatrix();
  for (const code of codes) {
    const [rawModule, rawAction] = splitPermissionCode(code);
    const module = normalizePermissionModule(rawModule);
    const action = normalizePermissionAction(rawAction);
    if (module && action && !matrix[module].includes(action)) matrix[module].push(action);
  }
  return matrix;
}

function matrixToPermissionCodes(matrix: Record<PermissionModule, PermissionAction[]>) {
  return Object.entries(matrix).flatMap(([module, actions]) =>
    actions.flatMap((action) => permissionCodeForMatrixCell(module as PermissionModule, action))
  );
}

function permissionCodeForMatrixCell(module: PermissionModule, action: PermissionAction) {
  if (module === "sales" && action === "approve") return ["SALES_DISCOUNT_APPROVE"];
  if (module === "inventory" && action === "approve") return ["INVENTORY_TRANSFER_APPROVE"];
  if (module === "accounting" && action === "approve") return ["ACCOUNTING_POST"];
  if (module === "invoice" && action === "approve") return ["INVOICE_ISSUE"];
  if (module === "warranty" && action === "approve") return ["WARRANTY_MANAGE"];
  if (module === "settings" && action === "update") return ["SETTING_MANAGE"];
  if (module === "hr" && action === "update") return ["ROLE_UPDATE", "USER_UPDATE"];
  if (module === "hr" && action === "create") return ["USER_CREATE"];
  if (module === "audit" && action === "view") return ["AUDIT_VIEW", "VIEW_AUDIT_LOG"];
  if (module === "audit") return [];
  return [`${permissionModuleToCode(module)}_${action.toUpperCase()}`];
}

function permissionModuleToCode(module: PermissionModule) {
  const map: Record<PermissionModule, string> = {
    dashboard: "DASHBOARD",
    branches: "BRANCH",
    products: "PRODUCT",
    inventory: "INVENTORY",
    sales: "SALES",
    invoice: "INVOICE",
    customers: "CUSTOMER",
    warranty: "WARRANTY",
    suppliers: "SUPPLIER",
    accounting: "ACCOUNTING",
    reports: "REPORT",
    hr: "USER",
    marketing: "MARKETING",
    settings: "SETTING",
    audit: "AUDIT"
  };
  return map[module];
}

function normalizePermissionModule(value?: string): PermissionModule | null {
  if (!value) return null;
  const mapped = value === "branch" ? "branches" : value === "product" ? "products" : value === "customer" ? "customers" : value === "supplier" ? "suppliers" : value === "setting" ? "settings" : value;
  return permissionModules.some((module) => module.value === mapped) ? (mapped as PermissionModule) : null;
}

function splitPermissionCode(code: string): [string | undefined, string | undefined] {
  const [module, ...actionParts] = code.toLowerCase().split("_");
  return [module, actionParts.join("_") || undefined];
}

function normalizePermissionAction(value?: string): PermissionAction | null {
  if (!value) return null;
  if (["discount_approve", "transfer_approve", "post", "issue", "manage"].includes(value)) return "approve";
  return permissionActions.some((action) => action.value === value) ? (value as PermissionAction) : null;
}

function createEmptyPermissionMatrix(): Record<PermissionModule, PermissionAction[]> {
  return permissionModules.reduce(
    (matrix, module) => ({ ...matrix, [module.value]: [] }),
    {} as Record<PermissionModule, PermissionAction[]>
  );
}

