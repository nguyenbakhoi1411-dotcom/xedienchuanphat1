"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, LockKeyhole, UserRound, WifiOff, AlertCircle } from "lucide-react";
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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isConnectionError, setIsConnectionError] = useState(false);

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
    setLoginError(null);
    setIsConnectionError(false);
    try {
      const response = await authApi.login(values);
      saveAccessToken(response.accessToken, values.rememberMe);
      saveRefreshToken(response.refreshToken, values.rememberMe);
      saveCurrentUser(response.user, values.rememberMe);
      toast.success("Đăng nhập thành công! Chào mừng " + response.user.fullName);
      router.push("/dashboard");
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setLoginError(msg);
      // Phát hiện lỗi kết nối
      const isConn = msg.includes("kết nối") || msg.includes("máy chủ") || msg.includes("Backend");
      setIsConnectionError(isConn);
    }
  }

  return (
    <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>

      {/* Hiển thị lỗi đăng nhập */}
      {loginError && (
        <div className={cn(
          "flex items-start gap-3 rounded-xl px-4 py-3 text-sm",
          isConnectionError
            ? "bg-amber-50 border border-amber-200 text-amber-800"
            : "bg-red-50 border border-red-200 text-red-700"
        )}>
          {isConnectionError
            ? <WifiOff className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
            : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
          }
          <div>
            <p className="font-semibold">
              {isConnectionError ? "Không thể kết nối Backend" : "Đăng nhập thất bại"}
            </p>
            <p className="mt-0.5 text-xs opacity-80">{loginError}</p>
            {isConnectionError && (
              <p className="mt-1 text-xs opacity-70">
                Hãy kiểm tra Backend đã khởi động trên IntelliJ/Eclipse chưa (port 8080).
              </p>
            )}
          </div>
        </div>
      )}

      {/* Username */}
      <label className="block">
        <span className="text-sm font-medium text-text">Tên đăng nhập</span>
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

      {/* Password */}
      <label className="block">
        <span className="text-sm font-medium text-text">Mật khẩu</span>
        <span
          className={cn(
            "mt-2 flex h-11 items-center gap-2 rounded-lg border bg-white px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-orange-100",
            errors.password ? "border-red-300" : "border-border"
          )}
        >
          <LockKeyhole className="h-4 w-4 text-slate-400" />
          <input
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
            placeholder="Nhập mật khẩu"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("password")}
          />
          <button
            type="button"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="text-slate-400 hover:text-primary transition-colors"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
        {errors.password && (
          <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span>
        )}
      </label>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            {...register("rememberMe")}
          />
          Ghi nhớ đăng nhập
        </label>
        <Link href="/forgot-password" className="font-medium text-primary hover:text-orange-600 transition-colors">
          Quên mật khẩu?
        </Link>
      </div>

      {/* Submit button */}
      <Button
        className="w-full h-11 text-base font-semibold"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Đang xử lý...
          </>
        ) : (
          "Đăng nhập"
        )}
      </Button>
    </form>
  );
}
