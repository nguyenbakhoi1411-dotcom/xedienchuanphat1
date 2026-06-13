export type UserStatus = "ACTIVE" | "LOCKED";

export type RoleCode =
  | "ADMIN"
  | "SUPER_ADMIN"
  | "DIRECTOR"
  | "BRANCH_MANAGER"
  | "SALES_STAFF"
  | "WAREHOUSE_STAFF"
  | "ACCOUNTANT"
  | "TECHNICIAN"
  | "MARKETING_STAFF"
  | "HR_MANAGER"
  | "AUDITOR";

export type PermissionAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "export";

export type PermissionModule =
  | "dashboard"
  | "branches"
  | "products"
  | "inventory"
  | "sales"
  | "invoice"
  | "customers"
  | "warranty"
  | "suppliers"
  | "accounting"
  | "reports"
  | "hr"
  | "marketing"
  | "settings"
  | "audit";

export type BranchOption = {
  id: number;
  name: string;
};

export type EmployeeUser = {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  branchIds: number[];
  roles: RoleCode[];
  status: UserStatus;
  lastLoginAt: string | null;
};

export type Role = {
  code: RoleCode;
  name: string;
  description: string;
  userCount: number;
  permissions: Record<PermissionModule, PermissionAction[]>;
};

export type UserListParams = {
  keyword: string;
  branchId: "ALL" | number;
  role: "ALL" | RoleCode;
  status: "ALL" | UserStatus;
  page: number;
  pageSize: number;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type UserPayload = {
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  branchIds: number[];
  roles: RoleCode[];
  status: UserStatus;
};

export type PermissionMatrixPayload = {
  roleCode: RoleCode;
  permissions: Record<PermissionModule, PermissionAction[]>;
};
