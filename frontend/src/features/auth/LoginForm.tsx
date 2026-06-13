"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { saveAccessToken, saveCurrentUser, saveRefreshToken } from "@/lib/auth/token";
import { cn } from "@/lib/cn";
import { authApi } from "./api";
import { loginSchema, type LoginFormValues } from "./schemas";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: true
    }
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const response = await authApi.login(values);
      saveAccessToken(response.accessToken, values.rememberMe);
      saveRefreshToken(response.refreshToken, values.rememberMe);
      saveCurrentUser(response.user, values.rememberMe);
      toast.success("Dang nhap thanh cong");
      router.push("/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="block">
        <span className="text-sm font-medium text-text">Ten dang nhap, email hoac so dien thoai</span>
        <span
          className={cn(
            "mt-2 flex h-11 items-center gap-2 rounded-lg border bg-white px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-orange-100",
            errors.identifier ? "border-red-300" : "border-border"
          )}
        >
          <UserRound className="h-4 w-4 text-slate-400" />
          <input
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
            placeholder="admin"
            autoComplete="username"
            {...register("identifier")}
          />
        </span>
        {errors.identifier && (
          <span className="mt-1 block text-xs text-red-600">{errors.identifier.message}</span>
        )}
      </label>

      <label className="block">
        <span className="text-sm font-medium text-text">Mat khau</span>
        <span
          className={cn(
            "mt-2 flex h-11 items-center gap-2 rounded-lg border bg-white px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-orange-100",
            errors.password ? "border-red-300" : "border-border"
          )}
        >
          <LockKeyhole className="h-4 w-4 text-slate-400" />
          <input
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
            placeholder="Nhap mat khau"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("password")}
          />
          <button
            type="button"
            aria-label={showPassword ? "An mat khau" : "Hien mat khau"}
            className="text-slate-400 hover:text-primary"
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
        {errors.password && (
          <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span>
        )}
      </label>

      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            {...register("rememberMe")}
          />
          Ghi nho dang nhap
        </label>
        <Link href="/forgot-password" className="font-medium text-primary hover:text-orange-600">
          Quen mat khau?
        </Link>
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Dang xu ly
          </>
        ) : (
          "Dang nhap"
        )}
      </Button>
    </form>
  );
}
