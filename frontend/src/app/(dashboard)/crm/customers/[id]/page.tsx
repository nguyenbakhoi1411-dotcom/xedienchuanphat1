"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { crmCustomerApi, crmAlertApi } from "@/features/crm/api";
import type { Customer360, TimelineEvent, AlertItem } from "@/features/crm/types";
import { RANK_COLORS, ALERT_COLORS } from "@/features/crm/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

const TIMELINE_ICONS: Record<string, string> = {
  ORDER: "🛒",
  QUOTATION: "📋",
  DEPOSIT: "💰",
  VEHICLE_SOLD: "🏍️",
  WARRANTY: "🛡️",
  REPAIR: "🔧",
  CARE_NOTE: "💬",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className={`rounded-xl p-4 border ${accent || "bg-white border-gray-100"}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function TabButton({ active, onClick, children, badge }: {
  active: boolean; onClick: () => void; children: React.ReactNode; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
        active ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Customer360Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [data, setData] = useState<Customer360 | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("vehicles");
  const [noteInput, setNoteInput] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await crmCustomerApi.get360(Number(id));
      setData(d);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleDismissAlert = async (alertId: number) => {
    await crmAlertApi.dismiss(alertId, "WEB_USER");
    setData(prev => prev ? { ...prev, alerts: prev.alerts.filter(a => a.id !== alertId) } : prev);
  };

  const handleAddNote = async () => {
    if (!noteInput.trim() || !data) return;
    setSavingNote(true);
    try {
      const note = await crmCustomerApi.addNote(data.id, noteInput, "WEB_USER");
      setData(prev => prev ? { ...prev, notes: [note, ...prev.notes] } : prev);
      setNoteInput("");
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
      Không tìm thấy khách hàng
    </div>
  );

  const TABS = [
    { key: "vehicles", label: "🏍️ Xe đã mua", count: data.vehicles.length },
    { key: "orders", label: "🛒 Đơn hàng", count: data.purchases.length },
    { key: "quotations", label: "📋 Báo giá", count: data.quotations.length },
    { key: "debt", label: "💳 Công nợ", count: data.debtAmount > 0 ? 1 : 0 },
    { key: "warranty", label: "🛡️ Bảo hành", count: data.warranties.length },
    { key: "repair", label: "🔧 Sửa chữa", count: data.repairs.length },
    { key: "care", label: "💬 Chăm sóc", count: data.notes.length },
    { key: "voucher", label: "🎟️ Voucher", count: data.usedVouchers.length },
    { key: "notes", label: "📝 Ghi chú", count: 0 },
    { key: "timeline", label: "📅 Timeline", count: data.timeline.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header / Profile Card ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button onClick={() => router.back()} className="text-indigo-200 hover:text-white text-sm mb-4 flex items-center gap-1">
            ← Quay lại
          </button>
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-3xl font-bold">
              {data.fullName[0]}
            </div>
            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{data.fullName}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RANK_COLORS[data.rank]} bg-opacity-90`}>
                  {data.rank}
                </span>
                {data.overdueDebtWarning && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white font-medium">⚠️ Nợ quá hạn</span>
                )}
              </div>
              <p className="text-indigo-200 text-sm">{data.customerCode} · {data.phone}</p>
              {data.email && <p className="text-indigo-300 text-xs mt-0.5">{data.email}</p>}
              {data.address && <p className="text-indigo-300 text-xs mt-0.5">📍 {data.address}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-indigo-200">
                {data.birthday && <span>🎂 {data.birthday}</span>}
                {data.source && <span>🔗 {data.source}</span>}
                <span>Thành viên từ {fmtDate(data.createdAt)}</span>
              </div>
            </div>
            {/* Score */}
            <div className="text-center bg-white/10 rounded-xl px-6 py-3 border border-white/20">
              <p className="text-3xl font-bold text-yellow-300">{data.score}</p>
              <p className="text-xs text-indigo-200">Điểm tích lũy</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <StatCard label="Tổng chi tiêu" value={fmt(data.totalSpent)} sub={`${data.purchases.length} đơn hàng`} />
            <StatCard label="Công nợ" value={fmt(data.debtAmount)}
              accent={data.debtAmount > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"} />
            <StatCard label="Xe đã mua" value={`${data.vehicles.length} xe`} sub={data.vehicles[0]?.productName ?? ""} />
            <StatCard label="Bảo hành" value={`${data.warranties.length} xe`}
              sub={data.warranties[0] ? `Hết hạn: ${fmtDate(data.warranties[data.warranties.length - 1]?.endDate)}` : "Chưa có"} />
          </div>
        </div>
      </div>

      {/* ── Alerts ───────────────────────────────────────────────────────────── */}
      {data.alerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="space-y-2">
            {data.alerts.map(alert => (
              <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${ALERT_COLORS[alert.severity]}`}>
                <span className="flex-1">
                  <span className="font-semibold">{alert.title}</span>
                  {alert.detail && <span className="ml-2 opacity-75">{alert.detail}</span>}
                </span>
                <button onClick={() => handleDismissAlert(alert.id)}
                  className="text-xs underline opacity-60 hover:opacity-100 whitespace-nowrap">
                  Đóng
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="overflow-x-auto">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit min-w-full">
            {TABS.map(tab => (
              <TabButton key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} badge={tab.count}>
                {tab.label}
              </TabButton>
            ))}
          </div>
        </div>

        {/* ── Tab Content ────────────────────────────────────────────────────── */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* 🏍️ Xe đã mua */}
          {activeTab === "vehicles" && (
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Xe đã mua ({data.vehicles.length})</h3>
              {data.vehicles.length === 0 ? <EmptyState label="Chưa mua xe nào" /> : (
                <div className="grid gap-4">
                  {data.vehicles.map(v => (
                    <div key={v.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gradient-to-r from-slate-50 to-transparent hover:shadow-md transition-shadow">
                      <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl">🏍️</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-800">{v.productName || "Xe điện"}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            v.status === "SOLD" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}>{v.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-gray-500">
                          <span>Serial: <span className="font-mono text-gray-700">{v.serialNumber}</span></span>
                          {v.frameNumber && <span>Số khung: <span className="font-mono text-gray-700">{v.frameNumber}</span></span>}
                          {v.batterySerial && <span>Số pin: <span className="font-mono text-gray-700">{v.batterySerial}</span></span>}
                          {v.soldDate && <span>Ngày bán: {fmtDate(v.soldDate)}</span>}
                          {v.warrantyEndDate && <span>Hết BH: {fmtDate(v.warrantyEndDate)}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 🛒 Đơn hàng */}
          {activeTab === "orders" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Đơn hàng", "Ngày", "Tổng tiền", "Đã thanh toán", "Còn lại", "Voucher", "Trạng thái"].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 text-left uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.purchases.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm text-indigo-700">{p.orderNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{fmtDate(p.orderDate)}</td>
                      <td className="px-4 py-3 text-sm font-medium">{fmt(p.totalAmount)}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{fmt(p.paidAmount)}</td>
                      <td className="px-4 py-3 text-sm text-red-500">{fmt(p.totalAmount - p.paidAmount)}</td>
                      <td className="px-4 py-3 text-xs font-mono text-purple-600">{p.voucherCode || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          p.paymentStatus === "PAID" ? "bg-green-100 text-green-700" :
                          p.paymentStatus === "PARTIAL" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                        }`}>{p.paymentStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.purchases.length === 0 && <EmptyState label="Chưa có đơn hàng" />}
            </div>
          )}

          {/* 📋 Báo giá */}
          {activeTab === "quotations" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Số báo giá", "Ngày", "Hiệu lực đến", "Tổng tiền", "Trạng thái"].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 text-left uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.quotations.map(q => (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm text-indigo-700">{q.quotationNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{fmtDate(q.quotationDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{fmtDate(q.validUntil)}</td>
                      <td className="px-4 py-3 text-sm font-medium">{fmt(q.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          q.status === "ACCEPTED" ? "bg-green-100 text-green-700" :
                          q.status === "EXPIRED" ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-700"
                        }`}>{q.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.quotations.length === 0 && <EmptyState label="Chưa có báo giá" />}
            </div>
          )}

          {/* 💳 Công nợ */}
          {activeTab === "debt" && (
            <div className="p-6">
              <div className={`rounded-2xl p-6 ${data.debtAmount > 0 ? "bg-red-50 border-2 border-red-200" : "bg-green-50 border-2 border-green-200"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{data.debtAmount > 0 ? "⚠️" : "✅"}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Công nợ hiện tại</p>
                    <p className={`text-3xl font-bold ${data.debtAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                      {fmt(data.debtAmount)}
                    </p>
                  </div>
                </div>
                {data.debtAmount > 0 && (
                  <p className="text-sm text-red-600 mt-2">⚠️ Khách hàng có công nợ chưa thanh toán. Vui lòng liên hệ để thu tiền.</p>
                )}
              </div>
              {/* Payment History */}
              <h4 className="font-semibold text-gray-700 mt-6 mb-3">Lịch sử thanh toán ({data.payments.length})</h4>
              <div className="space-y-2">
                {data.payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <span className="text-sm font-medium text-gray-700">{p.orderNo}</span>
                      <span className="mx-2 text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{fmtDate(p.paymentDate)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{fmt(p.amount)}</p>
                      <p className="text-xs text-gray-400">{p.paymentMethod}</p>
                    </div>
                  </div>
                ))}
                {data.payments.length === 0 && <EmptyState label="Chưa có thanh toán" />}
              </div>
            </div>
          )}

          {/* 🛡️ Bảo hành */}
          {activeTab === "warranty" && (
            <div className="p-6">
              <div className="grid gap-3">
                {data.warranties.map(w => (
                  <div key={w.id} className="p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-blue-50 to-transparent">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="font-mono text-sm font-semibold text-gray-800">{w.serialNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">HĐ: {w.invoiceNo}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-gray-600">{fmtDate(w.startDate)} → {fmtDate(w.endDate)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${
                          w.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                          w.status === "EXPIRED" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                        }`}>{w.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {data.warranties.length === 0 && <EmptyState label="Chưa có bảo hành" />}
              </div>
            </div>
          )}

          {/* 🔧 Sửa chữa */}
          {activeTab === "repair" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Serial", "Vấn đề", "Trạng thái", "Chi phí", "Ngày"].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 text-left uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.repairs.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm text-gray-700">{r.serialNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{r.issueDescription}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">{r.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{fmt(r.totalCost)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.repairs.length === 0 && <EmptyState label="Chưa có lịch sử sửa chữa" />}
            </div>
          )}

          {/* 💬 Chăm sóc */}
          {activeTab === "care" && (
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Lịch sử chăm sóc</h3>
              {/* Tasks */}
              {data.reminders.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Công việc cần làm</h4>
                  <div className="space-y-2">
                    {data.reminders.map(t => (
                      <div key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                        t.status === "DONE" ? "bg-gray-50 border-gray-100 opacity-60" : "bg-yellow-50 border-yellow-200"
                      }`}>
                        <span className="text-lg">{t.status === "DONE" ? "✅" : "📌"}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{t.title}</p>
                          {t.content && <p className="text-xs text-gray-500">{t.content}</p>}
                        </div>
                        {t.dueDate && <span className="text-xs text-gray-400">{fmtDate(t.dueDate)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Notes */}
              <div className="space-y-3">
                {data.notes.map(n => (
                  <div key={n.id} className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-sm text-gray-700">{n.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.createdBy} · {fmtDate(n.createdAt)}</p>
                  </div>
                ))}
              </div>
              {data.notes.length === 0 && data.reminders.length === 0 && <EmptyState label="Chưa có ghi chú chăm sóc" />}
            </div>
          )}

          {/* 🎟️ Voucher */}
          {activeTab === "voucher" && (
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Voucher đã sử dụng ({data.usedVouchers.length})</h3>
              {data.usedVouchers.length === 0 ? <EmptyState label="Chưa sử dụng voucher nào" /> : (
                <div className="flex flex-wrap gap-3">
                  {data.usedVouchers.map(v => (
                    <span key={v} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-mono font-medium text-sm">
                      🎟️ {v}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 📝 Ghi chú */}
          {activeTab === "notes" && (
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Thêm ghi chú</h3>
              <div className="flex gap-2">
                <textarea
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Nhập nội dung ghi chú..."
                  rows={3}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddNote}
                  disabled={savingNote || !noteInput.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                >
                  {savingNote ? "..." : "Lưu"}
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {data.notes.map(n => (
                  <div key={n.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm text-gray-700">{n.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.createdBy} · {fmtDate(n.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 📅 Timeline */}
          {activeTab === "timeline" && (
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Timeline ({data.timeline.length} sự kiện)</h3>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-transparent" />
                <div className="space-y-4">
                  {data.timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="h-10 w-10 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center text-xl z-10 flex-shrink-0 shadow-sm">
                        {TIMELINE_ICONS[event.type] || "📌"}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-indigo-100 transition-colors">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <p className="text-sm font-semibold text-gray-800">{event.title}</p>
                          <span className="text-xs text-gray-400">{fmtDate(event.occurredAt)}</span>
                        </div>
                        {event.detail && <p className="text-xs text-gray-500 mt-0.5">{event.detail}</p>}
                      </div>
                    </div>
                  ))}
                  {data.timeline.length === 0 && <EmptyState label="Chưa có sự kiện nào" />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <span className="text-4xl mb-2">📭</span>
      <p className="text-sm">{label}</p>
    </div>
  );
}
