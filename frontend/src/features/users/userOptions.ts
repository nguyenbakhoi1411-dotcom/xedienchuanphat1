import type { BranchOption, PermissionAction, PermissionModule, RoleCode, UserStatus } from "./types";

export const roleOptions: Array<{ value: RoleCode; label: string }> = [
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super admin" },
  { value: "DIRECTOR", label: "Giam doc" },
  { value: "BRANCH_MANAGER", label: "Quan ly chi nhanh" },
  { value: "SALES_STAFF", label: "Nhan vien ban hang" },
  { value: "WAREHOUSE_STAFF", label: "Nhan vien kho" },
  { value: "ACCOUNTANT", label: "Ke toan" },
  { value: "TECHNICIAN", label: "Ky thuat vien" },
  { value: "MARKETING_STAFF", label: "Marketing" },
  { value: "HR_MANAGER", label: "Quan ly nhan su" },
  { value: "AUDITOR", label: "Kiem toan noi bo" }
];

export const statusOptions: Array<{ value: UserStatus; label: string }> = [
  { value: "ACTIVE", label: "Dang hoat dong" },
  { value: "LOCKED", label: "Da khoa" }
];

export const permissionActions: Array<{ value: PermissionAction; label: string }> = [
  { value: "view", label: "View" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "approve", label: "Approve" },
  { value: "export", label: "Export" }
];

export const permissionModules: Array<{ value: PermissionModule; label: string }> = [
  { value: "dashboard", label: "Dashboard" },
  { value: "branches", label: "Chi nhanh" },
  { value: "products", label: "San pham" },
  { value: "inventory", label: "Kho" },
  { value: "sales", label: "Ban hang" },
  { value: "invoice", label: "Hóa đơn" },
  { value: "customers", label: "Khach hang" },
  { value: "warranty", label: "Bao hanh" },
  { value: "suppliers", label: "Nha cung cap" },
  { value: "accounting", label: "Ke toan" },
  { value: "reports", label: "Bao cao" },
  { value: "hr", label: "Nhan su & phan quyen" },
  { value: "marketing", label: "Marketing" },
  { value: "settings", label: "Cai dat" },
  { value: "audit", label: "Audit log" }
];

export const branchOptions: BranchOption[] = [
  { id: 1, name: "Chuan Phat Go Vap" },
  { id: 2, name: "Chuan Phat Thu Duc" },
  { id: 3, name: "Chuan Phat Binh Thanh" }
];

export function getRoleLabel(value: RoleCode) {
  return roleOptions.find((item) => item.value === value)?.label ?? value;
}

export function getStatusLabel(value: UserStatus) {
  return statusOptions.find((item) => item.value === value)?.label ?? value;
}

export function getBranchNames(ids: number[]) {
  return ids.map((id) => branchOptions.find((branch) => branch.id === id)?.name).filter(Boolean).join(", ");
}
