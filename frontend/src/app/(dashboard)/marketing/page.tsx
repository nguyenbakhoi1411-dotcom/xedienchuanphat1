"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api/axios";

type Voucher = {
  id: number;
  code: string;
  name: string;
  discountType: "AMOUNT" | "PERCENT";
  discountValue: number;
  minimumOrderAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  status: string;
};

type Campaign = {
  id: number;
  name: string;
  source: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: string;
  note: string;
};

type SourceRow = { source: string; customers: number };
type PricePolicy = {
  id: number;
  policyCode: string;
  policyName: string;
  description?: string;
  scopeType: "GLOBAL" | "BRANCH" | "PRODUCT" | "CATEGORY" | "BRAND";
  priceChangeType: "FIXED_PRICE" | "DISCOUNT_AMOUNT" | "DISCOUNT_PERCENT" | "INCREASE_AMOUNT" | "INCREASE_PERCENT";
  value: number;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  priority: number;
  note?: string;
  targets: Array<{ branchId?: number; productId?: number; categoryCode?: string; brand?: string }>;
};
type PricePolicyPerformance = { policyId: number; policyCode: string; policyName: string; orderCount: number; revenue: number; policyDiscountAmount: number; estimatedProfit?: number | null };

const voucherDefaults: Omit<Voucher, "id" | "usedCount"> = {
  code: "",
  name: "",
  discountType: "AMOUNT",
  discountValue: 0,
  minimumOrderAmount: 0,
  startDate: "",
  endDate: "",
  usageLimit: 0,
  status: "ACTIVE"
};

const campaignDefaults: Omit<Campaign, "id"> = {
  name: "",
  source: "FACEBOOK",
  startDate: "",
  endDate: "",
  budget: 0,
  status: "PLANNED",
  note: ""
};
const pricePolicyDefaults: Omit<PricePolicy, "id" | "status" | "targets"> & { targetValue: string } = {
  policyCode: "",
  policyName: "",
  description: "",
  scopeType: "GLOBAL",
  priceChangeType: "DISCOUNT_AMOUNT",
  value: 0,
  startDate: "",
  endDate: "",
  priority: 0,
  note: "",
  targetValue: ""
};

export default function MarketingPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [pricePolicies, setPricePolicies] = useState<PricePolicy[]>([]);
  const [priceReport, setPriceReport] = useState<PricePolicyPerformance[]>([]);
  const [voucherForm, setVoucherForm] = useState(voucherDefaults);
  const [campaignForm, setCampaignForm] = useState(campaignDefaults);
  const [pricePolicyForm, setPricePolicyForm] = useState(pricePolicyDefaults);
  const [editingVoucherId, setEditingVoucherId] = useState<number | null>(null);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [voucherResponse, campaignResponse, sourceResponse] = await Promise.all([
      api.get<Voucher[]>("/api/marketing/vouchers"),
      api.get<Campaign[]>("/api/marketing/campaigns"),
      api.get<SourceRow[]>("/api/marketing/customer-sources")
    ]);
    const [policyResponse, reportResponse] = await Promise.all([
      api.get<PricePolicy[]>("/api/price-policies").catch(() => ({ data: [] as PricePolicy[] })),
      api.get<PricePolicyPerformance[]>("/api/reports/price-policy-performance").catch(() => ({ data: [] as PricePolicyPerformance[] }))
    ]);
    setVouchers(voucherResponse.data.map(normalizeVoucher));
    setCampaigns(campaignResponse.data.map(normalizeCampaign));
    setSources(sourceResponse.data.map((item) => ({ source: item.source, customers: Number(item.customers) })));
    setPricePolicies(policyResponse.data.map(normalizePricePolicy));
    setPriceReport(reportResponse.data.map(normalizePriceReport));
  }

  async function saveVoucher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request = editingVoucherId
      ? api.put(`/api/marketing/vouchers/${editingVoucherId}`, voucherForm)
      : api.post("/api/marketing/vouchers", voucherForm);
    await request;
    setVoucherForm(voucherDefaults);
    setEditingVoucherId(null);
    await loadData();
    toast.success("Da luu voucher");
  }

  async function saveCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request = editingCampaignId
      ? api.put(`/api/marketing/campaigns/${editingCampaignId}`, campaignForm)
      : api.post("/api/marketing/campaigns", campaignForm);
    await request;
    setCampaignForm(campaignDefaults);
    setEditingCampaignId(null);
    await loadData();
    toast.success("Da luu campaign");
  }

  async function deleteVoucher(id: number) {
    await api.delete(`/api/marketing/vouchers/${id}`);
    await loadData();
    toast.success("Da xoa voucher");
  }

  async function savePricePolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await api.post("/api/price-policies", {
      ...pricePolicyForm,
      targets: buildTargets(pricePolicyForm.scopeType, pricePolicyForm.targetValue)
    });
    setPricePolicyForm(pricePolicyDefaults);
    await loadData();
    toast.success("Da tao chinh sach gia DRAFT");
  }

  async function transitionPricePolicy(id: number, action: "submit" | "approve" | "cancel") {
    await api.post(`/api/price-policies/${id}/${action}`);
    await loadData();
    toast.success("Da cap nhat chinh sach gia");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Marketing</h1>
        <p className="mt-1 text-sm text-muted">Tach rieng campaign/voucher va Pricing Management - chinh sach gia toan he thong.</p>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <form className="space-y-3 rounded-lg border border-border bg-white p-4 shadow-sm" onSubmit={savePricePolicy}>
          <h2 className="text-base font-semibold text-text">Tao chinh sach gia</h2>
          <Input label="Ma chuong trinh" value={pricePolicyForm.policyCode} onChange={(value) => setPricePolicyForm({ ...pricePolicyForm, policyCode: value })} />
          <Input label="Ten chuong trinh" value={pricePolicyForm.policyName} onChange={(value) => setPricePolicyForm({ ...pricePolicyForm, policyName: value })} />
          <Input label="Mo ta" value={pricePolicyForm.description ?? ""} onChange={(value) => setPricePolicyForm({ ...pricePolicyForm, description: value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Pham vi" value={pricePolicyForm.scopeType} options={["GLOBAL", "BRANCH", "PRODUCT", "CATEGORY", "BRAND"]} onChange={(value) => setPricePolicyForm({ ...pricePolicyForm, scopeType: value as PricePolicy["scopeType"], targetValue: "" })} />
            <Select label="Loai dieu chinh" value={pricePolicyForm.priceChangeType} options={["FIXED_PRICE", "DISCOUNT_AMOUNT", "DISCOUNT_PERCENT", "INCREASE_AMOUNT", "INCREASE_PERCENT"]} onChange={(value) => setPricePolicyForm({ ...pricePolicyForm, priceChangeType: value as PricePolicy["priceChangeType"] })} />
            <Input label="Gia tri" type="number" value={String(pricePolicyForm.value)} onChange={(value) => setPricePolicyForm({ ...pricePolicyForm, value: Number(value) })} />
            <Input label="Uu tien" type="number" value={String(pricePolicyForm.priority)} onChange={(value) => setPricePolicyForm({ ...pricePolicyForm, priority: Number(value) })} />
            <Input label="Ngay bat dau" type="date" value={pricePolicyForm.startDate} onChange={(value) => setPricePolicyForm({ ...pricePolicyForm, startDate: value })} />
            <Input label="Ngay ket thuc" type="date" value={pricePolicyForm.endDate} onChange={(value) => setPricePolicyForm({ ...pricePolicyForm, endDate: value })} />
          </div>
          {pricePolicyForm.scopeType !== "GLOBAL" && (
            <Input label="Target (ID chi nhanh/san pham, category code hoac brand)" value={pricePolicyForm.targetValue} onChange={(value) => setPricePolicyForm({ ...pricePolicyForm, targetValue: value })} />
          )}
          <Input label="Ghi chu" value={pricePolicyForm.note ?? ""} onChange={(value) => setPricePolicyForm({ ...pricePolicyForm, note: value })} />
          <div className="flex justify-end"><Button type="submit">Tao policy</Button></div>
        </form>

        <div className="rounded-lg border border-border bg-white shadow-sm">
          <TableHeader title="Chinh sach gia" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-muted">
                <tr><th className="px-4 py-3">Ma</th><th>Ten</th><th>Pham vi</th><th>Dieu chinh</th><th>Hieu luc</th><th>Trang thai</th><th className="px-4 text-right">Workflow</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pricePolicies.map((policy) => (
                  <tr key={policy.id}>
                    <td className="px-4 py-3 font-medium">{policy.policyCode}</td>
                    <td>{policy.policyName}</td>
                    <td>{policy.scopeType}</td>
                    <td>{policy.priceChangeType} {policy.value}</td>
                    <td>{policy.startDate} - {policy.endDate}</td>
                    <td>{policy.status}</td>
                    <td className="space-x-1 px-4 text-right">
                      {policy.status === "DRAFT" && <Button variant="ghost" onClick={() => transitionPricePolicy(policy.id, "submit")}>Gui duyet</Button>}
                      {policy.status === "PENDING_APPROVAL" && <Button variant="ghost" onClick={() => transitionPricePolicy(policy.id, "approve")}>Duyet</Button>}
                      {!["CANCELLED", "EXPIRED"].includes(policy.status) && <Button variant="ghost" onClick={() => transitionPricePolicy(policy.id, "cancel")}>Huy</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white shadow-sm">
        <TableHeader title="Hieu qua chinh sach gia" />
        <div className="grid gap-3 p-4 md:grid-cols-4">
          {priceReport.map((row) => (
            <article key={row.policyId} className="rounded-lg border border-border p-3">
              <p className="text-sm font-semibold text-text">{row.policyName}</p>
              <p className="mt-1 text-xs text-muted">{row.policyCode} - {row.orderCount} don</p>
              <p className="mt-2 text-sm">Doanh thu: <b>{formatCurrency(row.revenue)}</b></p>
              <p className="text-sm">Giam do policy: <b>{formatCurrency(row.policyDiscountAmount)}</b></p>
              {row.estimatedProfit != null && <p className="text-sm">Loi nhuan uoc tinh: <b>{formatCurrency(row.estimatedProfit)}</b></p>}
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <form className="space-y-3 rounded-lg border border-border bg-white p-4 shadow-sm" onSubmit={saveVoucher}>
          <h2 className="text-base font-semibold text-text">{editingVoucherId ? "Sua voucher" : "Them voucher"}</h2>
          <Input label="Ma voucher" value={voucherForm.code} onChange={(value) => setVoucherForm({ ...voucherForm, code: value })} />
          <Input label="Ten voucher" value={voucherForm.name} onChange={(value) => setVoucherForm({ ...voucherForm, name: value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Loai giam" value={voucherForm.discountType} options={["AMOUNT", "PERCENT"]} onChange={(value) => setVoucherForm({ ...voucherForm, discountType: value as Voucher["discountType"] })} />
            <Input label="Gia tri" type="number" value={String(voucherForm.discountValue)} onChange={(value) => setVoucherForm({ ...voucherForm, discountValue: Number(value) })} />
            <Input label="Don toi thieu" type="number" value={String(voucherForm.minimumOrderAmount)} onChange={(value) => setVoucherForm({ ...voucherForm, minimumOrderAmount: Number(value) })} />
            <Input label="Gioi han luot dung" type="number" value={String(voucherForm.usageLimit)} onChange={(value) => setVoucherForm({ ...voucherForm, usageLimit: Number(value) })} />
            <Input label="Ngay bat dau" type="date" value={voucherForm.startDate ?? ""} onChange={(value) => setVoucherForm({ ...voucherForm, startDate: value })} />
            <Input label="Ngay ket thuc" type="date" value={voucherForm.endDate ?? ""} onChange={(value) => setVoucherForm({ ...voucherForm, endDate: value })} />
          </div>
          <Select label="Trang thai" value={voucherForm.status} options={["ACTIVE", "INACTIVE"]} onChange={(value) => setVoucherForm({ ...voucherForm, status: value })} />
          <div className="flex justify-end gap-2">
            {editingVoucherId && <Button variant="secondary" onClick={() => { setEditingVoucherId(null); setVoucherForm(voucherDefaults); }}>Huy</Button>}
            <Button type="submit">Luu voucher</Button>
          </div>
        </form>

        <div className="rounded-lg border border-border bg-white shadow-sm">
          <TableHeader title="Danh sach voucher" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-muted">
                <tr><th className="px-4 py-3">Ma</th><th>Ten</th><th>Giam</th><th>Da dung</th><th>Trang thai</th><th className="px-4 text-right">Thao tac</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vouchers.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium">{item.code}</td>
                    <td>{item.name}</td>
                    <td>{item.discountType === "PERCENT" ? `${item.discountValue}%` : formatCurrency(item.discountValue)}</td>
                    <td>{item.usedCount}/{item.usageLimit || "-"}</td>
                    <td>{item.status}</td>
                    <td className="px-4 text-right">
                      <Button variant="ghost" onClick={() => { setEditingVoucherId(item.id); setVoucherForm({ ...item }); }}>Sua</Button>
                      <Button variant="ghost" onClick={() => deleteVoucher(item.id)}>Xoa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <form className="space-y-3 rounded-lg border border-border bg-white p-4 shadow-sm" onSubmit={saveCampaign}>
          <h2 className="text-base font-semibold text-text">{editingCampaignId ? "Sua campaign" : "Them campaign"}</h2>
          <Input label="Ten campaign" value={campaignForm.name} onChange={(value) => setCampaignForm({ ...campaignForm, name: value })} />
          <Select label="Nguon" value={campaignForm.source} options={["FACEBOOK", "ZALO", "REFERRAL", "WALK_IN", "OTHER"]} onChange={(value) => setCampaignForm({ ...campaignForm, source: value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Ngay bat dau" type="date" value={campaignForm.startDate ?? ""} onChange={(value) => setCampaignForm({ ...campaignForm, startDate: value })} />
            <Input label="Ngay ket thuc" type="date" value={campaignForm.endDate ?? ""} onChange={(value) => setCampaignForm({ ...campaignForm, endDate: value })} />
            <Input label="Ngan sach" type="number" value={String(campaignForm.budget)} onChange={(value) => setCampaignForm({ ...campaignForm, budget: Number(value) })} />
            <Select label="Trang thai" value={campaignForm.status} options={["PLANNED", "RUNNING", "DONE", "PAUSED"]} onChange={(value) => setCampaignForm({ ...campaignForm, status: value })} />
          </div>
          <Input label="Ghi chu" value={campaignForm.note ?? ""} onChange={(value) => setCampaignForm({ ...campaignForm, note: value })} />
          <div className="flex justify-end gap-2">
            {editingCampaignId && <Button variant="secondary" onClick={() => { setEditingCampaignId(null); setCampaignForm(campaignDefaults); }}>Huy</Button>}
            <Button type="submit">Luu campaign</Button>
          </div>
        </form>

        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-white shadow-sm">
            <TableHeader title="Danh sach campaign" />
            <div className="divide-y divide-border">
              {campaigns.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <div>
                    <div className="font-medium text-text">{item.name}</div>
                    <div className="text-muted">{item.source} - {formatCurrency(item.budget)} - {item.status}</div>
                  </div>
                  <Button variant="ghost" onClick={() => { setEditingCampaignId(item.id); setCampaignForm({ ...item }); }}>Sua</Button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white shadow-sm">
            <TableHeader title="Nguon khach hang" />
            <div className="divide-y divide-border">
              {sources.map((item) => (
                <div key={item.source} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{item.source}</span>
                  <span className="font-semibold text-text">{item.customers}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function normalizeVoucher(item: Voucher): Voucher {
  return {
    ...item,
    discountValue: Number(item.discountValue),
    minimumOrderAmount: Number(item.minimumOrderAmount),
    usageLimit: Number(item.usageLimit),
    usedCount: Number(item.usedCount)
  };
}

function normalizeCampaign(item: Campaign): Campaign {
  return { ...item, budget: Number(item.budget), note: item.note ?? "" };
}

function normalizePricePolicy(item: PricePolicy): PricePolicy {
  return { ...item, value: Number(item.value), priority: Number(item.priority), targets: item.targets ?? [] };
}

function normalizePriceReport(item: PricePolicyPerformance): PricePolicyPerformance {
  return {
    ...item,
    revenue: Number(item.revenue ?? 0),
    policyDiscountAmount: Number(item.policyDiscountAmount ?? 0),
    estimatedProfit: item.estimatedProfit == null ? null : Number(item.estimatedProfit)
  };
}

function buildTargets(scopeType: PricePolicy["scopeType"], targetValue: string) {
  if (scopeType === "GLOBAL") return [];
  const value = targetValue.trim();
  if (!value) return [];
  if (scopeType === "BRANCH") return [{ branchId: Number(value) }];
  if (scopeType === "PRODUCT") return [{ productId: Number(value) }];
  if (scopeType === "CATEGORY") return [{ categoryCode: value }];
  return [{ brand: value }];
}

function TableHeader({ title }: { title: string }) {
  return <div className="border-b border-border px-4 py-3 text-base font-semibold text-text">{title}</div>;
}

function Input({ label, value, type = "text", onChange }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <input className={inputClass} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text">{label}</span>
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
  );
}

const inputClass = "mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
