import { z } from "zod";

export const paymentSchema = z.object({
  method: z.enum(["CASH", "BANK_TRANSFER", "INSTALLMENT", "MIXED"]),
  cashAmount: z.coerce.number().min(0, "Tiền mặt không được âm"),
  bankAmount: z.coerce.number().min(0, "Chuyển khoản không được âm"),
  installmentAmount: z.coerce.number().min(0, "Trả góp không được âm"),
  voucherCode: z.string().trim(),
  discountAmount: z.coerce.number().min(0, "Giảm giá không được âm")
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
