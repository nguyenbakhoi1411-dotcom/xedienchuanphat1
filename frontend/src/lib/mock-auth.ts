import type { AuthUser, Permission } from "@/types/auth";

export const mockUser: AuthUser = {
  id: 1,
  fullName: "Nguyen Minh Quan",
  username: "manager",
  role: "BRANCH_MANAGER",
  branchId: 1,
  branchName: "Chi nhanh Go Vap",
  avatarInitials: "MQ",
  permissions: [
    "DASHBOARD_VIEW",
    "BRANCH_VIEW",
    "PRODUCT_VIEW",
    "INVENTORY_VIEW",
    "SALES_VIEW",
    "SALES_CREATE",
    "SALES_UPDATE",
    "SALES_CANCEL",
    "SALES_DISCOUNT_APPROVE",
    "SALES_RETURN",
    "INVOICE_ISSUE",
    "CUSTOMER_VIEW",
    "WARRANTY_VIEW",
    "SUPPLIER_VIEW",
    "ACCOUNTING_VIEW",
    "ACCOUNTING_CREATE",
    "ACCOUNTING_POST",
    "ACCOUNTING_CANCEL",
    "ACCOUNTING_REPORT",
    "RECEIPT_CREATE",
    "PAYMENT_CREATE",
    "REPORT_VIEW",
    "HR_VIEW",
    "MARKETING_VIEW",
    "MARKETING_CREATE",
    "MARKETING_UPDATE",
    "SETTING_VIEW",
    "SETTING_MANAGE"
  ]
};

export function hasPermission(user: AuthUser, permissions: Permission[]) {
  return permissions.every((permission) => user.permissions.includes(permission));
}
