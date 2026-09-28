import type { AuthUser } from "@/types/auth";

export function canFilterSalesDataByEmployee(user: AuthUser | null) {
  return Boolean(
    user &&
      (user.role === "ADMIN" ||
        user.role === "SUPER_ADMIN" ||
        user.role === "CHIEF_ACCOUNTANT" ||
        user.permissions.includes("REPORT_VIEW_ALL"))
  );
}
