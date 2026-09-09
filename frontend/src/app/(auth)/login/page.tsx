import Image from "next/image";
import { CheckCircle2, Sparkles, ShieldCheck, Zap, BarChart2, Package } from "lucide-react";
import { LoginForm } from "@/features/auth/LoginForm";

const FEATURES = [
  { icon: Zap, title: "Vận hành bán hàng", desc: "Đơn hàng, hóa đơn, khách hàng" },
  { icon: Package, title: "Quản lý kho", desc: "Tồn kho, nhập xuất, kiểm kho" },
  { icon: BarChart2, title: "Báo cáo tức thì", desc: "Dashboard, P&L, công nợ" },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <div className="grid min-h-screen lg:grid-cols-[1fr_480px]">

        {/* ── Left panel ── */}
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
          {/* Background image */}
          <Image
            src="/images/login-electric-motorbike.png"
            alt="Xe máy điện Chuẩn Phát"
            fill
            priority
            className="object-cover"
            sizes="60vw"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(15,23,42,0.7) 0%, rgba(120,53,15,0.5) 50%, rgba(194,65,12,0.75) 100%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between min-h-screen p-10 xl:p-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <img src="/images/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
              </div>
              <div>
                <p className="text-base font-bold text-white">Chuẩn Phát</p>
                <p className="text-xs text-orange-200">Business Management System</p>
              </div>
            </div>

            {/* Hero text */}
            <div className="max-w-lg">
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                style={{
                  background: "rgba(249,115,22,0.25)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(249,115,22,0.4)",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Đẳng cấp là mãi mãi
              </div>
              <h1 className="text-4xl font-extrabold leading-tight text-white xl:text-5xl">
                Vận hành thông minh,{" "}
                <span className="text-orange-300">tăng trưởng bền vững</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-orange-100">
                Nền tảng quản trị gọn gàng cho chi nhánh, sản phẩm, khách hàng,
                dòng tiền và báo cáo điều hành.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <div
                    className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{ background: "rgba(249,115,22,0.3)" }}
                  >
                    <Icon className="h-4 w-4 text-orange-300" />
                  </div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs text-orange-200">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Right panel (login form) ── */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-sm">

            {/* Mobile logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
              >
                <img src="/images/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
              </div>
              <div>
                <p className="font-bold text-text">Chuẩn Phát ERP</p>
                <p className="text-xs font-medium text-primary">Đẳng cấp là mãi mãi</p>
              </div>
            </div>

            {/* Login card */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: "white",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-modal)",
              }}
            >
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>
                    Chuẩn Phát ERP
                  </p>
                  <h1 className="mt-2 text-2xl font-extrabold text-text tracking-tight">
                    Đăng nhập hệ thống
                  </h1>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Nhập thông tin tài khoản để tiếp tục làm việc.
                  </p>
                </div>
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
                    border: "1px solid #fed7aa",
                  }}
                >
                  <ShieldCheck className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
                </div>
              </div>

              <LoginForm />
            </div>

            {/* Demo credentials */}
            <div
              className="mt-4 rounded-xl p-3 text-center"
              style={{
                background: "linear-gradient(135deg, #F0FDF4, #ECFDF5)",
                border: "1px solid #BBF7D0",
              }}
            >
              <p className="text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="inline h-3.5 w-3.5 mr-1 -mt-px" />
                Demo:{" "}
                <span className="font-bold">admin</span>
                {" / "}
                <span className="font-bold">Admin@123</span>
              </p>
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              © 2025 Chuẩn Phát. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
