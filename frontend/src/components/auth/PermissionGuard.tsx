"use client";

import type { ReactNode } from "react";
import type { Permission } from "@/types/auth";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";

type PermissionGuardProps = {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGuard({
  permissions,
  children,
  fallback = null
}: PermissionGuardProps) {
  const user = useCurrentUser();

  if (!user || !permissions.every((permission) => user.permissions.includes(permission))) {
    return fallback;
  }

  return children;
}
