import { z } from "zod";

export const userSchema = z.object({
  employeeCode: z.string().trim().min(1, "Vui long nhap ma nhan vien"),
  fullName: z.string().trim().min(2, "Ten nhan vien toi thieu 2 ky tu"),
  email: z.string().trim().email("Email khong hop le"),
  phone: z.string().trim().regex(/^[0-9]{9,11}$/, "So dien thoai phai co 9-11 chu so"),
  branchIds: z.array(z.coerce.number()).min(1, "Chon it nhat mot chi nhanh"),
  roles: z.array(z.enum([
    "ADMIN",
    "SUPER_ADMIN",
    "DIRECTOR",
    "BRANCH_MANAGER",
    "SALES_STAFF",
    "WAREHOUSE_STAFF",
    "ACCOUNTANT",
    "TECHNICIAN",
    "MARKETING_STAFF",
    "HR_MANAGER",
    "AUDITOR"
  ])).min(1, "Chon it nhat mot vai tro"),
  status: z.enum(["ACTIVE", "LOCKED"])
});

export type UserFormValues = z.infer<typeof userSchema>;
