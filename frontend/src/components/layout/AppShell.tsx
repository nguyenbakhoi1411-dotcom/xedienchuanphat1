"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppErrorBoundary } from "@/components/layout/AppErrorBoundary";
import { InternalAiAssistant } from "@/features/assistant/InternalAiAssistant";
import { getAccessToken, getCurrentUser } from "@/lib/auth/token";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { navigationItems } from "@/constants/navigation";
import { useUiStore } from "@/store/uiStore";
import { ShieldX } from "lucide-react";

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
    const currentUser = getCurrentUser();

    if (!token || !currentUser) {
      router.replace("/login");
      setHasSession(false);
    } else {
      setHasSession(true);
    }
  }, [router, user]);

  if (hasSession !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin"
            />
          </div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Đang xác thực phiên đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  const matchedRoute = navigationItems
    .filter((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0];

  const forbidden = Boolean(
    user &&
    matchedRoute &&
    !matchedRoute.permissions.every((permission) => user.permissions.includes(permission as any))
  );

  return (
    <div
      className="min-h-screen text-text"
      style={{ background: "var(--color-background)" }}
    >
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="lg:pl-[272px] flex flex-col min-h-screen">
        <Header onMenuClick={openSidebar} />
        <main
          className="flex-1 mx-auto w-full px-5 py-6 lg:px-6 animate-in"
          style={{ maxWidth: "1720px" }}
        >
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
      <div className="w-full max-w-sm text-center animate-in">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg, #FEF2F2, #FEE2E2)", border: "1px solid #FCA5A5" }}>
          <ShieldX className="h-9 w-9 text-red-500" />
        </div>
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-red-500">
          Lỗi 403
        </div>
        <h1 className="text-2xl font-bold text-text mb-3">
          Không có quyền truy cập
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
          Tài khoản của bạn chưa được cấp quyền cho chức năng này.
          Vui lòng liên hệ quản trị viên.
        </p>
      </div>
    </section>
  );
}
