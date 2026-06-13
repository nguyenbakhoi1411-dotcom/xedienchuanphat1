import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Vui long nhap ten dang nhap, email hoac so dien thoai")
    .refine(
      (value) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isPhone = /^(0|\+84)[0-9]{9,10}$/.test(value.replace(/\s/g, ""));
        const isUsername = /^[a-zA-Z0-9._-]{3,50}$/.test(value);
        return isEmail || isPhone || isUsername;
      },
      "Ten dang nhap, email hoac so dien thoai khong hop le"
    ),
  password: z
    .string()
    .min(1, "Vui long nhap mat khau")
    .min(6, "Mat khau toi thieu 6 ky tu"),
  rememberMe: z.boolean().default(true)
});

export type LoginFormValues = z.infer<typeof loginSchema>;
