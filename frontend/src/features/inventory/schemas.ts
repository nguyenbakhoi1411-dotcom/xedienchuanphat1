import { z } from "zod";

const baseTransactionSchema = {
  transactionNo: z.string().trim().min(1, "Vui long nhap so phieu"),
  transactionDate: z.string().min(1, "Vui long chon ngay"),
  productId: z.coerce.number().int().positive("Vui long chon san pham"),
  note: z.string().trim().max(500, "Ghi chu toi da 500 ky tu")
};

export const importStockSchema = z.object({
  ...baseTransactionSchema,
  branchId: z.coerce.number().int().positive("Vui long chon chi nhanh"),
  quantity: z.coerce.number().int().positive("So luong nhap phai lon hon 0"),
  unitCost: z.coerce.number().min(0, "Don gia khong duoc am")
});

export const exportStockSchema = z.object({
  ...baseTransactionSchema,
  branchId: z.coerce.number().int().positive("Vui long chon chi nhanh"),
  quantity: z.coerce.number().int().positive("So luong xuat phai lon hon 0")
});

export const transferStockSchema = z.object({
  ...baseTransactionSchema,
  fromBranchId: z.coerce.number().int().positive("Vui long chon kho xuat"),
  toBranchId: z.coerce.number().int().positive("Vui long chon kho nhan"),
  quantity: z.coerce.number().int().positive("So luong chuyen phai lon hon 0")
}).refine((value) => value.fromBranchId !== value.toBranchId, {
  message: "Kho xuat va kho nhan phai khac nhau",
  path: ["toBranchId"]
});

export const stockCountSchema = z.object({
  ...baseTransactionSchema,
  branchId: z.coerce.number().int().positive("Vui long chon chi nhanh"),
  countedQuantity: z.coerce.number().int().min(0, "So luong kiem khong duoc am")
});

export type ImportStockFormValues = z.infer<typeof importStockSchema>;
export type ExportStockFormValues = z.infer<typeof exportStockSchema>;
export type TransferStockFormValues = z.infer<typeof transferStockSchema>;
export type StockCountFormValues = z.infer<typeof stockCountSchema>;
