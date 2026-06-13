import { api } from "@/lib/api/axios";
import { permissionActions, permissionModules, roleOptions } from "./userOptions";
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

const enableMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

let users: EmployeeUser[] = [
  {
    id: 1,
    employeeCode: "NV-001",
    fullName: "Nguyen Van Quan",
    email: "manager@chuanphat.vn",
    phone: "0900000000",
    branchIds: [1],
    roles: ["ADMIN", "BRANCH_MANAGER"],
    status: "ACTIVE",
    lastLoginAt: "2026-06-05 08:30"
  },
  {
    id: 2,
    employeeCode: "NV-002",
    fullName: "Tran Thi Mai",
    email: "sales@chuanphat.vn",
    phone: "0900000002",
    branchIds: [1, 2],
    roles: ["SALES_STAFF"],
    status: "ACTIVE",
    lastLoginAt: "2026-06-04 18:12"
  },
  {
    id: 3,
    employeeCode: "NV-003",
    fullName: "Le Minh Khoi",
    email: "warehouse@chuanphat.vn",
    phone: "0900000003",
    branchIds: [2],
    roles: ["WAREHOUSE_STAFF"],
    status: "LOCKED",
    lastLoginAt: null
  },
  {
    id: 4,
    employeeCode: "NV-004",
    fullName: "Pham Thanh Dat",
    email: "tech@chuanphat.vn",
    phone: "0900000004",
    branchIds: [3],
    roles: ["TECHNICIAN"],
    status: "ACTIVE",
    lastLoginAt: "2026-06-03 09:20"
  }
];

let roles: Role[] = roleOptions.map((role) => ({
  code: role.value,
  name: role.label,
  description: getRoleDescription(role.value),
  userCount: users.filter((user) => user.roles.includes(role.value)).length,
  permissions: createDefaultPermissions(role.value)
}));

export const usersApi = {
  async list(params: UserListParams): Promise<PageResponse<EmployeeUser>> {
    if (!enableMock) {
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
    }
    await wait();
    const keyword = params.keyword.trim().toLowerCase();
    const filtered = users.filter((user) => {
      const matchKeyword =
        keyword.length === 0 ||
        user.employeeCode.toLowerCase().includes(keyword) ||
        user.fullName.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone.includes(keyword);
      const matchBranch = params.branchId === "ALL" || user.branchIds.includes(Number(params.branchId));
      const matchRole = params.role === "ALL" || user.roles.includes(params.role);
      const matchStatus = params.status === "ALL" || user.status === params.status;
      return matchKeyword && matchBranch && matchRole && matchStatus;
    });
    return paginate(filtered, params.page, params.pageSize);
  },

  async roles(): Promise<Role[]> {
    if (!enableMock) {
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
    }
    await wait();
    return roles.map((role) => ({
      ...role,
      userCount: users.filter((user) => user.roles.includes(role.code)).length
    }));
  },

  async create(payload: UserPayload): Promise<EmployeeUser> {
    if (!enableMock) {
      const response = await api.post<EmployeeUser>("/api/users", {
        ...payload,
        password: "ChangeMe@123"
      });
      return normalizeUser(response.data);
    }
    await wait();
    assertUnique(payload.employeeCode, payload.email);
    const user: EmployeeUser = { id: Date.now(), lastLoginAt: null, ...payload };
    users = [user, ...users];
    return user;
  },

  async update(id: number, payload: UserPayload): Promise<EmployeeUser> {
    if (!enableMock) {
      const response = await api.put<EmployeeUser>(`/api/users/${id}`, payload);
      return normalizeUser(response.data);
    }
    await wait();
    assertUnique(payload.employeeCode, payload.email, id);
    let updated: EmployeeUser | null = null;
    users = users.map((user) => {
      if (user.id !== id) return user;
      updated = { ...user, ...payload };
      return updated;
    });
    if (!updated) throw new Error("Khong tim thay nhan vien");
    return updated;
  },

  async toggleStatus(id: number): Promise<EmployeeUser> {
    if (!enableMock) {
      const current = await api.get<PageResponse<EmployeeUser>>("/api/users", { params: { page: 0, pageSize: 500 } });
      const user = current.data.items.find((item) => item.id === id);
      const nextStatus = normalizeUser(user as EmployeeUser).status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const response = await api.patch<EmployeeUser>(`/api/users/${id}/status`, { status: nextStatus });
      return normalizeUser(response.data);
    }
    await wait();
    let updated: EmployeeUser | null = null;
    users = users.map((user) => {
      if (user.id !== id) return user;
      updated = { ...user, status: user.status === "ACTIVE" ? "LOCKED" : "ACTIVE" };
      return updated;
    });
    if (!updated) throw new Error("Khong tim thay tai khoan");
    return updated;
  },

  async updatePermissionMatrix(payload: PermissionMatrixPayload): Promise<Role> {
    if (!enableMock) {
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
    await wait();
    let updated: Role | null = null;
    roles = roles.map((role) => {
      if (role.code !== payload.roleCode) return role;
      updated = { ...role, permissions: payload.permissions };
      return updated;
    });
    if (!updated) throw new Error("Khong tim thay vai tro");
    return updated;
  }
};

function assertUnique(employeeCode: string, email: string, ignoreId?: number) {
  const duplicated = users.some((user) => user.id !== ignoreId && (user.employeeCode === employeeCode || user.email === email));
  if (duplicated) throw new Error("Ma nhan vien hoac email da ton tai");
}

function createDefaultPermissions(role: RoleCode): Record<PermissionModule, PermissionAction[]> {
  const empty = createEmptyPermissionMatrix();
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    const allPermissions = createEmptyPermissionMatrix();
    for (const module of permissionModules) {
      allPermissions[module.value] = permissionActions.map((action) => action.value);
    }
    return allPermissions;
  }
  if (role === "DIRECTOR") return grant(empty, ["dashboard", "branches", "products", "inventory", "sales", "customers", "accounting", "reports", "marketing", "audit"], ["view", "approve", "export"]);
  if (role === "BRANCH_MANAGER") {
    const permissions = grant(empty, ["dashboard", "customers", "inventory", "warranty", "reports"], ["view", "create", "update", "approve", "export"]);
    permissions.sales = ["view", "create", "update", "approve"];
    permissions.invoice = ["approve"];
    return permissions;
  }
  if (role === "SALES_STAFF") {
    const permissions = grant(empty, ["dashboard", "customers", "products"], ["view", "create", "update"]);
    permissions.sales = ["view", "create", "update"];
    permissions.invoice = ["approve"];
    return permissions;
  }
  if (role === "WAREHOUSE_STAFF") return grant(empty, ["dashboard", "inventory", "products", "suppliers"], ["view", "create", "update", "export"]);
  if (role === "ACCOUNTANT") return grant(empty, ["dashboard", "accounting", "reports", "sales", "suppliers"], ["view", "create", "update", "approve", "export"]);
  if (role === "TECHNICIAN") return grant(empty, ["dashboard", "warranty", "products"], ["view", "create", "update"]);
  if (role === "MARKETING_STAFF") return grant(empty, ["dashboard", "marketing", "customers", "reports"], ["view", "create", "update", "export"]);
  if (role === "HR_MANAGER") return grant(empty, ["dashboard", "hr", "audit"], ["view", "create", "update"]);
  if (role === "AUDITOR") return grant(empty, ["dashboard", "reports", "audit"], ["view", "export"]);
  return empty;
}

function grant(base: Record<PermissionModule, PermissionAction[]>, modules: PermissionModule[], actions: PermissionAction[]) {
  return modules.reduce((result, module) => ({ ...result, [module]: actions }), base);
}

function getRoleDescription(role: RoleCode) {
  const descriptions: Record<RoleCode, string> = {
    ADMIN: "Toan quyen he thong",
    SUPER_ADMIN: "Toan quyen he thong",
    DIRECTOR: "Xem va phe duyet toan he thong",
    BRANCH_MANAGER: "Quan ly van hanh chi nhanh",
    SALES_STAFF: "Ban hang va cham soc khach hang",
    WAREHOUSE_STAFF: "Nhap xuat ton va kiem kho",
    ACCOUNTANT: "Thu chi, cong no va bao cao tai chinh",
    TECHNICIAN: "Bao hanh va sua chua",
    MARKETING_STAFF: "Marketing va cham soc khach hang",
    HR_MANAGER: "Quan ly nhan su, tai khoan va ho so",
    AUDITOR: "Xem bao cao va nhat ky he thong"
  };
  return descriptions[role];
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

function paginate<T>(items: T[], page: number, pageSize: number): PageResponse<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageSize, totalItems, totalPages };
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300));
}
