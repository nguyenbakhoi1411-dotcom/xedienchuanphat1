import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "success";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  type = "button",
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Sizes
        size === "xs"      && "h-7 px-2.5 text-[11px] rounded-lg",
        size === "sm"      && "h-8 px-3.5 text-xs rounded-lg",
        size === "default" && "h-9 px-4 text-sm",
        size === "lg"      && "h-11 px-6 text-base rounded-xl",
        size === "icon"    && "h-9 w-9 p-0",
        // Variants
        variant === "primary" && [
          "text-white",
          "shadow-[0_1px_2px_rgba(234,88,12,0.3),0_1px_3px_rgba(249,115,22,0.15)]",
          "hover:shadow-[0_4px_12px_rgba(249,115,22,0.4)] hover:-translate-y-px",
          "active:translate-y-0 active:shadow-sm",
        ],
        (variant === "secondary" || variant === "outline") && [
          "border border-border bg-white text-slate-700",
          "shadow-soft hover:border-slate-300 hover:bg-slate-50",
          "active:bg-slate-100",
        ],
        variant === "ghost" && [
          "text-slate-600 hover:bg-orange-50 hover:text-primary",
        ],
        variant === "danger" && [
          "text-white bg-red-600",
          "shadow-[0_1px_2px_rgba(220,38,38,0.3)]",
          "hover:bg-red-700 hover:shadow-[0_4px_12px_rgba(239,68,68,0.35)] hover:-translate-y-px",
          "active:translate-y-0",
        ],
        variant === "success" && [
          "text-white bg-emerald-600",
          "shadow-[0_1px_2px_rgba(5,150,105,0.3)]",
          "hover:bg-emerald-700 hover:shadow-[0_4px_12px_rgba(16,185,129,0.35)] hover:-translate-y-px",
          "active:translate-y-0",
        ],
        className
      )}
      style={
        variant === "primary"
          ? { background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }
          : undefined
      }
      {...props}
    >
      {loading ? (
        <>
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}
