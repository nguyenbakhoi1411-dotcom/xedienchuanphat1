import Image from "next/image";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-text">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(460px,0.95fr)]">
        <section className="relative hidden overflow-hidden bg-primary lg:block">
          <Image
            src="/images/login-electric-motorbike.png"
            alt="Minh họa xe máy điện Chuẩn Phát"
            fill
            priority
            className="object-cover"
            sizes="55vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-950/35 via-primary/20 to-primary/85" />

          <div className="relative z-10 flex min-h-screen flex-col justify-between p-10 text-white xl:p-12">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-lg font-bold text-primary shadow-soft">
                CP
              </span>
              <div>
                <p className="text-xl font-bold">Chuẩn Phát</p>
                <p className="text-sm text-orange-50">Business Management System</p>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Đẳng cấp là mãi mãi
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal xl:text-5xl">
                Van hanh ban hang, kho, bao hanh va ke toan trong mot he thong.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-orange-50">
                Nen tang quan tri gon gang cho chi nhanh, san pham, khach hang, dong tien va bao cao dieu hanh.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-3 gap-3 text-sm">
              {[
                "Quan ly chi nhanh",
                "Theo doi ton kho",
                "Bao cao tuc thoi"
              ].map((item) => (
                <div key={item} className="rounded-lg border border-white/20 bg-white/15 p-3 backdrop-blur">
                  <CheckCircle2 className="mb-2 h-4 w-4" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
                CP
              </span>
              <div>
                <p className="text-xl font-bold text-text">Chuẩn Phát</p>
                <p className="text-sm font-medium text-primary">Đẳng cấp là mãi mãi</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-white p-6 shadow-soft sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase text-primary">Chuẩn Phát</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-normal text-text">Dang nhap he thong</h1>
                  <p className="mt-2 text-sm text-slate-500">Nhap thong tin tai khoan de tiep tuc lam viec.</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </span>
              </div>

              <LoginForm />
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              Tai khoan demo: <span className="font-medium text-text">admin</span> /{" "}
              <span className="font-medium text-text">Admin@123</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
