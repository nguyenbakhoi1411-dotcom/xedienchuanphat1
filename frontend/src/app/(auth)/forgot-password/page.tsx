import Link from "next/link";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-soft">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-primary">
          <Mail className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-text">Quên mật khẩu</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Vui lòng liên hệ quản trị viên chi nhánh để được cấp lại mật khẩu.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          Quay lại đăng nhập
        </Link>
      </section>
    </main>
  );
}
