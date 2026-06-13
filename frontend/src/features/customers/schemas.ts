import { z } from "zod";

export const customerSchema = z.object({
  customerCode: z.string().trim().min(1, "Vui long nhap ma khach hang"),
  fullName: z.string().trim().min(1, "Vui long nhap ten khach hang"),
  phone: z.string().trim().regex(/^(0|\+84)[0-9]{9,10}$/, "So dien thoai khong hop le"),
  email: z.string().trim().email("Email khong hop le").or(z.literal("")),
  address: z.string().trim().min(1, "Vui long nhap dia chi"),
  type: z.enum(["NEW", "NORMAL", "RETAIL", "VIP", "WHOLESALE", "POTENTIAL", "HIGH_RISK_DEBT"]),
  source: z.enum(["WALK_IN", "FACEBOOK", "ZALO", "TIKTOK", "WEBSITE", "REFERRAL"]),
  birthday: z.string()
});

export const careNoteSchema = z.object({
  content: z.string().trim().min(1, "Vui long nhap noi dung ghi chu").max(1000, "Ghi chu toi da 1000 ky tu")
});

export const careReminderSchema = z.object({
  reminderDate: z.string().min(1, "Vui long chon ngay nhac"),
  title: z.string().trim().min(1, "Vui long nhap tieu de"),
  content: z.string().trim().min(1, "Vui long nhap noi dung")
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
export type CareNoteFormValues = z.infer<typeof careNoteSchema>;
export type CareReminderFormValues = z.infer<typeof careReminderSchema>;
