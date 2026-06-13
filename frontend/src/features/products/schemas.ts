import { z } from "zod";

export const productSchema = z.object({
  productCode: z.string().trim().min(1, "Vui long nhap ma san pham").max(50, "Ma san pham toi da 50 ky tu"),
  productName: z.string().trim().min(1, "Vui long nhap ten san pham").max(180, "Ten san pham toi da 180 ky tu"),
  category: z.enum(["ELECTRIC_MOTORBIKE", "BATTERY", "CHARGER", "SPARE_PART"]),
  brand: z.string().trim().min(1, "Vui long nhap thuong hieu"),
  model: z.string().trim().min(1, "Vui long nhap model"),
  color: z.string().trim().min(1, "Vui long nhap mau sac"),
  batteryCapacity: z.string().trim().min(1, "Vui long nhap dung luong pin"),
  motorPower: z.string().trim().min(1, "Vui long nhap cong suat dong co"),
  importPrice: z.coerce.number().min(0, "Gia nhap khong duoc am"),
  salePrice: z.coerce.number().min(0, "Gia ban khong duoc am"),
  warrantyMonths: z.coerce.number().int("Bao hanh phai la so nguyen").min(0, "Bao hanh khong duoc am"),
  imageUrl: z.string().trim().url("URL hinh anh khong hop le").or(z.literal("")),
  description: z.string().trim().max(1000, "Mo ta toi da 1000 ky tu"),
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED", "DELETED"])
}).refine((value) => value.salePrice >= value.importPrice, {
  message: "Gia ban nen lon hon hoac bang gia nhap",
  path: ["salePrice"]
});

export type ProductFormValues = z.infer<typeof productSchema>;
