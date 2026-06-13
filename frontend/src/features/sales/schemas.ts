import { z } from "zod";

export const paymentSchema = z.object({
  method: z.enum(["CASH", "BANK_TRANSFER", "INSTALLMENT", "MIXED"]),
  cashAmount: z.coerce.number().min(0, "Tien mat khong duoc am"),
  bankAmount: z.coerce.number().min(0, "Chuyen khoan khong duoc am"),
  installmentAmount: z.coerce.number().min(0, "Tra gop khong duoc am"),
  voucherCode: z.string().trim(),
  discountAmount: z.coerce.number().min(0, "Giam gia khong duoc am")
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
