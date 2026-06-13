"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api/axios";

type SettingsForm = {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  taxCode: string;
  logoUrl: string;
  invoiceTemplate: string;
  defaultWarrantyPolicy: string;
  lowStockThreshold: number;
};

const defaults: SettingsForm = {
  companyName: "",
  companyAddress: "",
  companyPhone: "",
  taxCode: "",
  logoUrl: "",
  invoiceTemplate: "",
  defaultWarrantyPolicy: "",
  lowStockThreshold: 5
};

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<SettingsForm>("/api/settings")
      .then((response) => setForm({ ...defaults, ...response.data }))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.put<SettingsForm>("/api/settings", form);
      setForm({ ...defaults, ...response.data });
      toast.success("Da luu cai dat");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Cai dat</h1>
        <p className="mt-1 text-sm text-muted">Cau hinh thong tin cong ty, mau hoa don va tham so van hanh.</p>
      </div>
      <form className="grid gap-5 rounded-lg border border-border bg-white p-5 shadow-sm lg:grid-cols-2" onSubmit={submit}>
        <Input label="Ten cong ty" value={form.companyName} onChange={(value) => setForm({ ...form, companyName: value })} />
        <Input label="Dien thoai" value={form.companyPhone} onChange={(value) => setForm({ ...form, companyPhone: value })} />
        <Input label="Dia chi" value={form.companyAddress} onChange={(value) => setForm({ ...form, companyAddress: value })} />
        <Input label="Ma so thue" value={form.taxCode} onChange={(value) => setForm({ ...form, taxCode: value })} />
        <Input label="Logo URL" value={form.logoUrl} onChange={(value) => setForm({ ...form, logoUrl: value })} />
        <Input label="Nguong canh bao ton kho thap" type="number" value={String(form.lowStockThreshold)} onChange={(value) => setForm({ ...form, lowStockThreshold: Number(value) })} />
        <Textarea label="Mau hoa don" value={form.invoiceTemplate} onChange={(value) => setForm({ ...form, invoiceTemplate: value })} />
        <Textarea label="Chinh sach bao hanh mac dinh" value={form.defaultWarrantyPolicy} onChange={(value) => setForm({ ...form, defaultWarrantyPolicy: value })} />
        <div className="flex justify-end border-t border-border pt-4 lg:col-span-2">
          <Button type="submit" disabled={loading || saving}>{saving ? "Dang luu" : "Luu cai dat"}</Button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, type = "text", onChange }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <input className={inputClass} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <textarea className={`${inputClass} min-h-28 py-2`} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

const inputClass = "mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
