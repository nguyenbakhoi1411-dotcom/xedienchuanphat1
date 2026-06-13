import { z } from "zod";

const optionalNumber = z.preprocess((value) => value === "" || value === undefined ? undefined : Number(value), z.number().optional());

export const createTicketSchema = z.object({
  vehicleId: z.coerce.number().int().positive("Vui long nhap ma xe"),
  serialNumber: z.string().trim().min(1, "Vui long nhap serial xe"),
  customerName: z.string().trim().min(1, "Vui long nhap ten khach hang"),
  phone: z.string().trim().regex(/^(0|\+84)[0-9]{9,10}$/, "So dien thoai khong hop le"),
  issueDescription: z.string().trim().min(1, "Vui long nhap mo ta su co"),
  expectedReturnDate: z.string().optional(),
  beforeRepairImages: z.string().optional(),
  faultImages: z.string().optional(),
  documentFiles: z.string().optional(),
  serviceType: z.enum(["WARRANTY", "PAID_REPAIR", "MAINTENANCE"]).optional(),
  warrantyRepair: z.boolean().optional()
});

export const updateStatusSchema = z.object({
  status: z.enum(["CREATED", "ASSIGNED", "IN_PROGRESS", "RECEIVED", "CHECKING", "DIAGNOSING", "QUOTED", "WAITING_CUSTOMER_APPROVAL", "WAITING_PARTS", "REPAIRING", "QC_CHECK", "COMPLETED", "RETURNED", "CANCELLED"])
});

export const assignTechnicianSchema = z.object({
  technicianUsername: z.string().trim().min(1, "Vui long chon ky thuat vien")
});

export const addTicketItemSchema = z.object({
  type: z.enum(["PART", "LABOR", "OTHER"]),
  name: z.string().trim().min(1, "Vui long nhap ten linh kien/chi phi"),
  productId: optionalNumber,
  warehouseId: optionalNumber,
  quantity: z.coerce.number().int().positive("So luong phai lon hon 0"),
  unitPrice: z.coerce.number().min(0, "Don gia khong duoc am"),
  unitCost: optionalNumber,
  isWarrantyCovered: z.boolean().optional(),
  componentType: z.enum(["FRAME", "BATTERY", "MOTOR", "CHARGER", "CONTROLLER", "DISPLAY", "BRAKE", "LIGHT", "TIRE", "ACCESSORY"]).optional()
});

export const warrantyCheckSchema = z.object({
  serialNumber: z.string().trim().min(1, "Vui long nhap serial")
});

export type CreateTicketFormValues = z.infer<typeof createTicketSchema>;
export type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;
export type AssignTechnicianFormValues = z.infer<typeof assignTechnicianSchema>;
export type AddTicketItemFormValues = z.infer<typeof addTicketItemSchema>;
export type WarrantyCheckFormValues = z.infer<typeof warrantyCheckSchema>;
