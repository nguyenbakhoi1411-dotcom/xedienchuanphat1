"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { permissionActions, permissionModules } from "./userOptions";
import type { PermissionAction, PermissionModule, PermissionMatrixPayload, Role } from "./types";

export function PermissionMatrix({
  role,
  loading,
  onSave
}: {
  role?: Role;
  loading: boolean;
  onSave: (payload: PermissionMatrixPayload) => void;
}) {
  const [draft, setDraft] = useState<Record<PermissionModule, PermissionAction[]>>(emptyMatrix());

  useEffect(() => {
    setDraft(role ? cloneMatrix(role.permissions) : emptyMatrix());
  }, [role]);

  if (!role) {
    return (
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <p className="text-sm text-slate-500">Chon role de cau hinh quyen.</p>
      </section>
    );
  }

  function toggleAction(module: PermissionModule, action: PermissionAction) {
    setDraft((current) => {
      const actions = current[module] ?? [];
      const nextActions = actions.includes(action) ? actions.filter((item) => item !== action) : [...actions, action];
      return { ...current, [module]: nextActions };
    });
  }

  function toggleModule(module: PermissionModule) {
    setDraft((current) => {
      const checkedAll = permissionActions.every((action) => current[module]?.includes(action.value));
      return {
        ...current,
        [module]: checkedAll ? [] : permissionActions.map((action) => action.value)
      };
    });
  }

  function resetPermissions() {
    if (!role) return;
    setDraft(cloneMatrix(role.permissions));
  }

  function clearPermissions() {
    setDraft(emptyMatrix());
  }

  return (
    <section className="rounded-lg border border-border bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text">Ma tran phan quyen: {role.name}</h2>
          <p className="mt-1 text-sm text-slate-500">Bat/tat quyen theo tung module.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={resetPermissions} disabled={loading}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="secondary" onClick={clearPermissions} disabled={loading}>
            Bo chon tat ca
          </Button>
          <Button onClick={() => onSave({ roleCode: role.code, permissions: draft })} disabled={loading}>
            {loading ? "Dang luu" : "Luu phan quyen"}
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="erp-table min-w-[860px]">
          <thead>
            <tr>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3 text-center">Tat ca</th>
              {permissionActions.map((action) => <th key={action.value} className="px-4 py-3 text-center">{action.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {permissionModules.map((module) => {
              const checkedAll = permissionActions.every((action) => draft[module.value]?.includes(action.value));
              return (
                <tr key={module.value} className="hover:bg-orange-50/60">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-text">{module.label}</div>
                    <div className="mt-1 text-xs text-slate-500">{draft[module.value]?.length ?? 0}/{permissionActions.length} quyen dang bat</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Checkbox checked={checkedAll} onChange={() => toggleModule(module.value)} />
                  </td>
                  {permissionActions.map((action) => (
                    <td key={action.value} className="px-4 py-3 text-center">
                      <Checkbox checked={draft[module.value]?.includes(action.value) ?? false} onChange={() => toggleAction(module.value, action.value)} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1"
    />
  );
}

function emptyMatrix() {
  return permissionModules.reduce(
    (matrix, module) => ({ ...matrix, [module.value]: [] }),
    {} as Record<PermissionModule, PermissionAction[]>
  );
}

function cloneMatrix(matrix: Record<PermissionModule, PermissionAction[]>) {
  return permissionModules.reduce(
    (draft, module) => ({ ...draft, [module.value]: [...(matrix[module.value] ?? [])] }),
    {} as Record<PermissionModule, PermissionAction[]>
  );
}
