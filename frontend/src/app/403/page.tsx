import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-6 text-center shadow-soft">
        <div className="text-sm font-semibold uppercase tracking-normal text-red-600">403</div>
        <h1 className="mt-2 text-2xl font-semibold text-text">Khong co quyen truy cap</h1>
        <p className="mt-2 text-sm text-slate-500">
          Tai khoan cua ban khong duoc phep xem trang nay.
        </p>
        <Link href="/dashboard" className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white">
          Ve dashboard
        </Link>
      </section>
    </main>
  );
}
