"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { userSchema, type UserFormValues } from "./schemas";
import { branchOptions, roleOptions, statusOptions } from "./userOptions";
import type { EmployeeUser, UserPayload } from "./types";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  user?: EmployeeUser | null;
  loading?: boolean;
  onSubmit: (payload: UserPayload) => void;
  onClose: () => void;
};

const defaultValues: UserFormValues = {
  employeeCode: "",
  fullName: "",
  email: "",
  phone: "",
  branchIds: [],
  roles: [],
  status: "ACTIVE"
};

export function UserFormModal({ open, mode, user, loading = false, onSubmit, onClose }: Props) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues
  });

  useEffect(() => {
    if (!open) return;
    form.reset(user ? toFormValues(user) : defaultValues);
  }, [form, open, user]);

  function handleSubmit(values: UserFormValues) {
    onSubmit(values);
  }

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Them nhan vien" : "Sua nhan vien"}
      description="Gan chi nhanh, vai tro va trang thai tai khoan cho nhan vien."
      size="lg"
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Ma nhan vien" error={form.formState.errors.employeeCode?.message}>
            <input className={inputClass} {...form.register("employeeCode")} />
          </Field>
          <Field label="Ho ten" error={form.formState.errors.fullName?.message}>
            <input className={inputClass} {...form.register("fullName")} />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <input className={inputClass} type="email" {...form.register("email")} />
          </Field>
          <Field label="So dien thoai" error={form.formState.errors.phone?.message}>
            <input className={inputClass} {...form.register("phone")} />
          </Field>
          <Field label="Trang thai" error={form.formState.errors.status?.message}>
            <select className={inputClass} {...form.register("status")}>
              {statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </Field>
        </div>

        <CheckboxGroup label="Chi nhanh" error={form.formState.errors.branchIds?.message}>
          {branchOptions.map((branch) => (
            <label key={branch.id} className={checkboxClass}>
              <input type="checkbox" value={branch.id} {...form.register("branchIds", { valueAsNumber: true })} />
              <span>{branch.name}</span>
            </label>
          ))}
        </CheckboxGroup>

        <CheckboxGroup label="Vai tro" error={form.formState.errors.roles?.message}>
          {roleOptions.map((role) => (
            <label key={role.value} className={checkboxClass}>
              <input type="checkbox" value={role.value} {...form.register("roles")} />
              <span>{role.label}</span>
            </label>
          ))}
        </CheckboxGroup>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Huy</Button>
          <Button type="submit" disabled={loading}>{loading ? "Dang luu" : "Luu nhan vien"}</Button>
        </div>
      </form>
    </Modal>
  );
}

const inputClass = "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
const checkboxClass = "flex min-h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm text-slate-700";

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function CheckboxGroup({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-text">{label}</legend>
      <div className="mt-2 grid gap-2 md:grid-cols-2">{children}</div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </fieldset>
  );
}

function toFormValues(user: EmployeeUser): UserFormValues {
  return {
    employeeCode: user.employeeCode,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    branchIds: user.branchIds,
    roles: user.roles as any,
    status: user.status
  };
}
