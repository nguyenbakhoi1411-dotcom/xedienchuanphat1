import { z } from "zod";

export const receiptSchema = z.object({
  voucherNo: z.string().trim().min(1, "Vui long nhap so phieu"),
  receiptDate: z.string().min(1, "Vui long chon ngay thu"),
  customerId: z.coerce.number().int().positive("Vui long chon khach hang"),
  customerName: z.string().trim().min(1, "Vui long nhap ten khach hang"),
  amount: z.coerce.number().positive("So tien thu phai lon hon 0"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER"]),
  bankAccountId: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  reason: z.string().trim().min(1, "Vui long nhap ly do thu")
}).superRefine((value, ctx) => {
  if (value.paymentMethod === "BANK_TRANSFER" && !value.bankAccountId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bankAccountId"], message: "Vui long chon tai khoan ngan hang" });
  }
});

export const paymentSchema = z.object({
  voucherNo: z.string().trim().min(1, "Vui long nhap so phieu"),
  paymentDate: z.string().min(1, "Vui long chon ngay chi"),
  supplierId: z.coerce.number().int().positive("Vui long chon nha cung cap"),
  supplierName: z.string().trim().min(1, "Vui long nhap ten nha cung cap"),
  amount: z.coerce.number().positive("So tien chi phai lon hon 0"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER"]),
  bankAccountId: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
  reason: z.string().trim().min(1, "Vui long nhap ly do chi")
}).superRefine((value, ctx) => {
  if (value.paymentMethod === "BANK_TRANSFER" && !value.bankAccountId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["bankAccountId"], message: "Vui long chon tai khoan ngan hang" });
  }
});

export type ReceiptFormValues = z.infer<typeof receiptSchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
