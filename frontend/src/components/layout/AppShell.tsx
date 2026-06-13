"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppErrorBoundary } from "@/components/layout/AppErrorBoundary";
import { InternalAiAssistant } from "@/features/assistant/InternalAiAssistant";
import { getAccessToken } from "@/lib/auth/token";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { navigationItems } from "@/constants/navigation";
import { useUiStore } from "@/store/uiStore";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useCurrentUser();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const openSidebar = useUiStore((state) => state.openSidebar);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    setHasSession(Boolean(token));

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  if (hasSession !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm font-medium text-slate-500">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }
  const matchedRoute = navigationItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0];
  const forbidden = Boolean(
    user &&
    matchedRoute &&
    !matchedRoute.permissions.every((permission) => user.permissions.includes(permission))
  );

  return (
    <div className="min-h-screen bg-background text-text">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="lg:pl-[280px]">
        <Header onMenuClick={openSidebar} />
        <main className="mx-auto w-full max-w-[1720px] px-4 py-5 lg:px-6 lg:py-6">
          <AppErrorBoundary>
            {forbidden ? <ForbiddenPanel /> : children}
          </AppErrorBoundary>
        </main>
      </div>
      <InternalAiAssistant />
    </div>
  );
}

function ForbiddenPanel() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 text-center shadow-soft">
        <div className="text-sm font-semibold uppercase tracking-normal text-red-600">403</div>
        <h1 className="mt-2 text-2xl font-semibold text-text">Không có quyền truy cập</h1>
        <p className="mt-2 text-sm text-slate-500">
          Tài khoản của bạn chưa được cấp quyền cho chức năng này. Vui lòng liên hệ quản trị viên để cấp quyền phù hợp.
        </p>
      </div>
    </section>
  );
}
