"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Role, RoleCode } from "./types";

export function RoleManagementPanel({
  roles,
  selectedRole,
  onSelectRole
}: {
  roles: Role[];
  selectedRole: RoleCode;
  onSelectRole: (role: RoleCode) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-white shadow-soft">
      <div className="border-b border-border p-4">
        <h2 className="text-base font-semibold text-text">Quan ly role</h2>
        <p className="mt-1 text-sm text-slate-500">Chon vai tro de cau hinh ma tran phan quyen theo module.</p>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => {
          const active = selectedRole === role.code;
          return (
            <button
              key={role.code}
              type="button"
              onClick={() => onSelectRole(role.code)}
              className={cn(
                "min-h-32 rounded-lg border p-4 text-left transition-colors",
                active ? "border-primary bg-orange-50" : "border-border bg-white hover:border-orange-200 hover:bg-orange-50/60"
              )}
            >
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", active ? "bg-primary text-white" : "bg-slate-100 text-slate-600")}>
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="mt-3 font-semibold text-text">{role.name}</div>
              <p className="mt-1 min-h-10 text-sm text-slate-500">{role.description}</p>
              <p className="mt-3 text-xs font-medium text-slate-500">{role.userCount} nhan vien</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
