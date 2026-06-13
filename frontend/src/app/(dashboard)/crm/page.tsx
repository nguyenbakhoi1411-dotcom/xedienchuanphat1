"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  crmCustomerApi,
  crmLeadApi,
  crmAlertApi,
  crmGroupApi,
} from "@/features/crm/api";
import type {
  CustomerSummary,
  Lead,
  LeadStatus,
  AlertItem,
  CustomerGroup,
  LeadRequest,
} from "@/features/crm/types";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  RANK_COLORS,
  ALERT_COLORS,
} from "@/features/crm/types";

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "tr";
  return new Intl.NumberFormat("vi-VN").format(n);
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

const PIPELINE_STAGES: LeadStatus[] = [
  "NEW", "CONTACTED", "CONSULTING", "QUOTED", "DEPOSITED",
];

const SOURCE_LABELS: Record<string, string> = {
  WALK_IN: "Ghé thăm", FACEBOOK: "Facebook", ZALO: "Zalo",
  WEBSITE: "Website", REFERRAL: "Giới thiệu", PHONE: "Điện thoại", OTHER: "Khác",
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  LEAD_STALE: "Lead chưa liên hệ",
  QUOTED_NO_BUY: "Báo giá chưa chốt",
  WARRANTY_EXPIRING: "Bảo hành sắp hết",
  NO_MAINTENANCE: "Chưa bảo dưỡng",
  OVERDUE_DEBT: "Công nợ quá hạn",
  BIRTHDAY: "Sinh nhật",
  INACTIVE_90_DAYS: "Không hoạt động",
};

// ── Tab Button ───────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, children, badge }: {
  active: boolean; onClick: () => void; children: React.ReactNode; badge?: number;
}) {
  return (
    <button onClick={onClick}
      className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        active ? "bg-indigo-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
      }`}>
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

type Tab = "customers" | "pipeline" | "alerts";

export default function CrmPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("customers");

  // Customers
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [custTotal, setCustTotal] = useState(0);
  const [custKeyword, setCustKeyword] = useState("");
  const [custPage, setCustPage] = useState(0);
  const [custLoading, setCustLoading] = useState(false);

  // Pipeline
  const [pipeline, setPipeline] = useState<Partial<Record<LeadStatus, Lead[]>>>({});
  const [pipeLoading, setPipeLoading] = useState(false);

  // Alerts
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertLoading, setAlertLoading] = useState(false);

  // Groups
  const [groups] = useState<CustomerGroup[]>([]);

  // New Lead Modal
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState<Partial<LeadRequest>>({ source: "WALK_IN" });
  const [savingLead, setSavingLead] = useState(false);

  // ── Loaders ────────────────────────────────────────────────────────────────

  const loadCustomers = useCallback(async () => {
    setCustLoading(true);
    try {
      const r = await crmCustomerApi.list({ keyword: custKeyword, page: custPage, size: 20 });
      setCustomers(r.items);
      setCustTotal(r.totalItems);
    } finally {
      setCustLoading(false);
    }
  }, [custKeyword, custPage]);

  const loadPipeline = useCallback(async () => {
    setPipeLoading(true);
    try {
      const r = await crmLeadApi.pipeline();
      setPipeline(r);
    } finally {
      setPipeLoading(false);
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    setAlertLoading(true);
    try {
      const r = await crmAlertApi.list(0, 50);
      setAlerts(r);
    } finally {
      setAlertLoading(false);
    }
  }, []);

  useEffect(() => { if (activeTab === "customers") loadCustomers(); }, [activeTab, loadCustomers]);
  useEffect(() => { if (activeTab === "pipeline") loadPipeline(); }, [activeTab, loadPipeline]);
  useEffect(() => { if (activeTab === "alerts") loadAlerts(); }, [activeTab, loadAlerts]);

  const urgentCount = alerts.filter(a => a.severity === "URGENT").length;

  // ── Lead actions ───────────────────────────────────────────────────────────

  const handleAdvanceLead = async (lead: Lead, targetStatus: LeadStatus) => {
    await crmLeadApi.advance(lead.id, targetStatus);
    loadPipeline();
  };

  const handleSaveLead = async () => {
    if (!leadForm.leadName || !leadForm.phone) return;
    setSavingLead(true);
    try {
      await crmLeadApi.create(leadForm as LeadRequest);
      setShowLeadModal(false);
      setLeadForm({ source: "WALK_IN" });
      loadPipeline();
    } finally {
      setSavingLead(false);
    }
  };

  const handleDismissAlert = async (id: number) => {
    await crmAlertApi.dismiss(id, "WEB_USER");
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">CRM & Customer 360</h1>
              <p className="text-indigo-200 text-sm mt-0.5">Quản lý khách hàng, lead pipeline, và cảnh báo thông minh</p>
            </div>
            <button onClick={() => setShowLeadModal(true)}
              className="px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-md">
              + Thêm Lead
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur">
              <p className="text-3xl font-bold">{custTotal}</p>
              <p className="text-indigo-200 text-sm">Khách hàng</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur">
              <p className="text-3xl font-bold">
                {Object.values(pipeline).reduce((s, arr) => s + (arr?.length ?? 0), 0)}
              </p>
              <p className="text-indigo-200 text-sm">Lead đang xử lý</p>
            </div>
            <div className={`rounded-xl p-4 border backdrop-blur ${urgentCount > 0 ? "bg-red-500/20 border-red-400/40" : "bg-white/10 border-white/20"}`}>
              <p className="text-3xl font-bold text-red-300">{urgentCount}</p>
              <p className="text-indigo-200 text-sm">Cảnh báo khẩn</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit">
          <TabBtn active={activeTab === "customers"} onClick={() => setActiveTab("customers")}>
            👥 Khách hàng
          </TabBtn>
          <TabBtn active={activeTab === "pipeline"} onClick={() => setActiveTab("pipeline")}>
            📊 Lead Pipeline
          </TabBtn>
          <TabBtn active={activeTab === "alerts"} onClick={() => setActiveTab("alerts")} badge={urgentCount}>
            🔔 Cảnh báo
          </TabBtn>
        </div>

        {/* ── Customer List ─────────────────────────────────────────────────── */}
        {activeTab === "customers" && (
          <div className="mt-4">
            <div className="flex gap-3 mb-4">
              <input
                value={custKeyword}
                onChange={e => { setCustKeyword(e.target.value); setCustPage(0); }}
                placeholder="🔍 Tìm khách hàng..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
              />
            </div>

            {custLoading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" /></div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Mã KH", "Khách hàng", "SĐT", "Hạng", "Điểm", "Công nợ", "LTV", "Mua cuối", "Chăm sóc cuối"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 text-left uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {customers.map(c => (
                      <tr key={c.id}
                        onClick={() => router.push(`/crm/customers/${c.id}`)}
                        className="hover:bg-indigo-50 cursor-pointer transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.customerCode || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                              {c.fullName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{c.fullName}</p>
                              {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{c.phone}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RANK_COLORS[c.rank]}`}>
                            {c.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-amber-600">{c.score}</td>
                        <td className="px-4 py-3 text-sm font-medium text-red-500">
                          {c.totalDebt > 0 ? fmt(c.totalDebt) : <span className="text-green-500">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{fmt(c.lifetimeValue)}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(c.lastPurchaseDate)}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(c.lastCareDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {customers.length === 0 && !custLoading && (
                  <div className="text-center py-12 text-gray-400 text-sm">Không tìm thấy khách hàng</div>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
              <span>Hiển thị {customers.length} / {custTotal}</span>
              <div className="flex gap-2">
                <button onClick={() => setCustPage(p => Math.max(0, p - 1))} disabled={custPage === 0}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">←</button>
                <span className="px-3 py-1">{custPage + 1}</span>
                <button onClick={() => setCustPage(p => p + 1)} disabled={(custPage + 1) * 20 >= custTotal}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">→</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Lead Pipeline (Kanban) ─────────────────────────────────────────── */}
        {activeTab === "pipeline" && (
          <div className="mt-4">
            {pipeLoading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" /></div>
            ) : (
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {PIPELINE_STAGES.map(stage => {
                    const leads = pipeline[stage] || [];
                    return (
                      <div key={stage} className="w-72 flex-shrink-0">
                        <div className={`flex items-center justify-between mb-3 px-3 py-2 rounded-xl border text-sm font-semibold ${LEAD_STATUS_COLORS[stage]}`}>
                          <span>{LEAD_STATUS_LABELS[stage]}</span>
                          <span className="bg-white bg-opacity-60 rounded-full px-2 py-0.5 text-xs">{leads.length}</span>
                        </div>
                        <div className="space-y-3 min-h-24">
                          {leads.map(lead => (
                            <div key={lead.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="font-semibold text-gray-800 text-sm leading-tight">{lead.leadName}</p>
                                <span className={`text-xs px-1.5 py-0.5 rounded-lg font-medium ${LEAD_STATUS_COLORS[lead.status]}`}>
                                  {lead.statusLabel}
                                </span>
                              </div>
                              <p className="text-xs font-mono text-gray-500">{lead.phone}</p>
                              {lead.interestedProduct && (
                                <p className="text-xs text-indigo-600 mt-1">🏍️ {lead.interestedProduct}</p>
                              )}
                              {lead.expectedValue && (
                                <p className="text-xs text-green-600 mt-0.5">💰 {fmt(lead.expectedValue)}</p>
                              )}
                              {lead.nextFollowUpDate && (
                                <p className="text-xs text-orange-500 mt-0.5">📅 {fmtDate(lead.nextFollowUpDate)}</p>
                              )}

                              {/* Next stage button */}
                              {stage !== "DEPOSITED" && (
                                <div className="flex gap-1 mt-3 pt-2 border-t border-gray-50">
                                  <button
                                    onClick={() => {
                                      const nextStage = PIPELINE_STAGES[PIPELINE_STAGES.indexOf(stage) + 1];
                                      if (nextStage) handleAdvanceLead(lead, nextStage);
                                    }}
                                    className="flex-1 text-xs py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors"
                                  >
                                    ▶ Tiến tiếp
                                  </button>
                                  <button
                                    onClick={() => handleAdvanceLead(lead, "LOST")}
                                    className="px-2 text-xs py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                              {stage === "DEPOSITED" && (
                                <button
                                  onClick={() => router.push(`/crm/leads/${lead.id}/convert`)}
                                  className="w-full mt-3 pt-2 border-t border-gray-50 text-xs py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors"
                                >
                                  🎉 Chuyển thành khách hàng
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {/* WON / LOST summary */}
                  <div className="w-52 flex-shrink-0">
                    <div className="bg-green-50 rounded-xl border border-green-200 p-4 mb-3">
                      <p className="text-green-700 font-bold text-lg">{(pipeline["WON"] || []).length}</p>
                      <p className="text-green-600 text-xs">Lead chốt thành công 🎉</p>
                    </div>
                    <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                      <p className="text-red-600 font-bold text-lg">{(pipeline["LOST"] || []).length}</p>
                      <p className="text-red-500 text-xs">Lead thất bại</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Alerts ─────────────────────────────────────────────────────────── */}
        {activeTab === "alerts" && (
          <div className="mt-4">
            {alertLoading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" /></div>
            ) : (
              <div className="space-y-3">
                {alerts.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-2">🎉</p>
                    <p>Không có cảnh báo nào</p>
                  </div>
                )}
                {alerts.map(alert => (
                  <div key={alert.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${ALERT_COLORS[alert.severity]}`}>
                    <span className="text-2xl flex-shrink-0">
                      {alert.severity === "URGENT" ? "🚨" : alert.severity === "WARNING" ? "⚠️" : "ℹ️"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-60">
                          {ALERT_TYPE_LABELS[alert.alertType] || alert.alertType}
                        </span>
                        <span className="text-xs opacity-40">{fmtDate(alert.createdAt)}</span>
                      </div>
                      <p className="font-semibold mt-0.5">{alert.title}</p>
                      {alert.detail && <p className="text-sm opacity-75 mt-0.5">{alert.detail}</p>}
                      {alert.customerId && (
                        <button onClick={() => router.push(`/crm/customers/${alert.customerId}`)}
                          className="text-xs underline mt-1 opacity-70 hover:opacity-100">
                          Xem khách hàng →
                        </button>
                      )}
                    </div>
                    <button onClick={() => handleDismissAlert(alert.id)}
                      className="text-sm opacity-50 hover:opacity-100 flex-shrink-0 px-3 py-1.5 rounded-lg bg-white/50 hover:bg-white/80 transition-all font-medium">
                      Đóng
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="h-10" />
      </div>

      {/* ── New Lead Modal ────────────────────────────────────────────────────── */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
              <h2 className="text-lg font-bold">Thêm Lead mới</h2>
              <p className="text-indigo-200 text-sm">Điền thông tin để tạo lead trong pipeline</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Họ tên *</label>
                <input value={leadForm.leadName || ""} onChange={e => setLeadForm(f => ({ ...f, leadName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Số điện thoại *</label>
                <input value={leadForm.phone || ""} onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0900000000" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Nguồn</label>
                <select value={leadForm.source} onChange={e => setLeadForm(f => ({ ...f, source: e.target.value as LeadRequest["source"] }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {Object.entries(SOURCE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Sản phẩm quan tâm</label>
                <input value={leadForm.interestedProduct || ""} onChange={e => setLeadForm(f => ({ ...f, interestedProduct: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Xe điện CP S1..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Ghi chú</label>
                <textarea value={leadForm.note || ""} onChange={e => setLeadForm(f => ({ ...f, note: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button onClick={() => setShowLeadModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Hủy
              </button>
              <button onClick={handleSaveLead} disabled={savingLead || !leadForm.leadName || !leadForm.phone}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50 hover:bg-indigo-700 transition-colors">
                {savingLead ? "Đang lưu..." : "Tạo Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
