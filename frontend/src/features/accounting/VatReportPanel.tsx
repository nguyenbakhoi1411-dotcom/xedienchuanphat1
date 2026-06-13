"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingApi } from "./api";
import type { VatReport } from "./types";

const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";
const fmtPct = (n: number) => n.toFixed(1) + "%";

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

export function VatReportPanel() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [activeTab, setActiveTab] = useState<"summary" | "output" | "input">("summary");

  const { data: report, isLoading, refetch } = useQuery<VatReport>({
    queryKey: ["vat-report", year, month],
    queryFn: () => accountingApi.vatReport(year, month),
    enabled: false,
  });

  const handleSearch = () => refetch();

  const statCards = report ? [
    { label: "Doanh số chịu thuế", value: fmt(report.outputTaxBase), color: "#6366f1", icon: "📤" },
    { label: "VAT đầu ra",         value: fmt(report.outputVatAmount), color: "#22c55e", icon: "🟢" },
    { label: "Giá trị mua vào",    value: fmt(report.inputTaxBase),  color: "#0ea5e9", icon: "📥" },
    { label: "VAT đầu vào",        value: fmt(report.inputVatAmount), color: "#f59e0b", icon: "🟡" },
    {
      label: report.vatPayable > 0 ? "VAT phải nộp" : "VAT được hoàn",
      value: fmt(report.vatPayable > 0 ? report.vatPayable : report.vatRefundable),
      color: report.vatPayable > 0 ? "#ef4444" : "#22c55e",
      icon: report.vatPayable > 0 ? "⚠️" : "✅",
    },
  ] : [];

  return (
    <div style={{ padding: "0 0 2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>📊 Báo cáo thuế VAT</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 13 }}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}/{year}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 13 }}>
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={handleSearch} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            {isLoading ? "Đang tải..." : "Xem báo cáo"}
          </button>
        </div>
      </div>

      {report && (
        <>
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 24 }}>
            {statCards.map((c) => (
              <div key={c.label} style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${c.color}30`, borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: c.color, marginTop: 4 }}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* Balance visual */}
          <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700, marginBottom: 14, textTransform: "uppercase" }}>Cân đối VAT tháng {month}/{year}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>VAT đầu ra</div>
                <div style={{ height: 12, borderRadius: 6, background: "rgba(99,102,241,0.2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 6, background: "#6366f1", width: "100%" }} />
                </div>
                <div style={{ fontSize: 12, color: "#818cf8", marginTop: 4, fontWeight: 700 }}>{fmt(report.outputVatAmount)}</div>
              </div>
              <div style={{ fontSize: 18, color: "#475569" }}>−</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>VAT đầu vào (khấu trừ)</div>
                <div style={{ height: 12, borderRadius: 6, background: "rgba(14,165,233,0.2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 6, background: "#0ea5e9", width: `${Math.min(100, (report.inputVatAmount / Math.max(report.outputVatAmount, 1)) * 100)}%` }} />
                </div>
                <div style={{ fontSize: 12, color: "#0ea5e9", marginTop: 4, fontWeight: 700 }}>{fmt(report.inputVatAmount)}</div>
              </div>
              <div style={{ fontSize: 18, color: "#475569" }}>=</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{report.vatPayable > 0 ? "Phải nộp" : "Được hoàn"}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: report.vatPayable > 0 ? "#ef4444" : "#22c55e" }}>
                  {fmt(report.vatPayable > 0 ? report.vatPayable : report.vatRefundable)}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["summary", "output", "input"] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, background: activeTab === t ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)", color: activeTab === t ? "#818cf8" : "#64748b" }}>
                {t === "summary" ? "Tổng hợp" : t === "output" ? `Hóa đơn bán ra (${report.outputInvoices.length})` : `Hóa đơn mua vào (${report.inputInvoices.length})`}
              </button>
            ))}
          </div>

          {activeTab !== "summary" && (
            <InvoiceList invoices={activeTab === "output" ? report.outputInvoices : report.inputInvoices} />
          )}
        </>
      )}

      {!report && !isLoading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15 }}>Chọn tháng và nhấn "Xem báo cáo"</div>
        </div>
      )}
    </div>
  );
}

function InvoiceList({ invoices }: { invoices: any[] }) {
  const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";
  return (
    <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.04)" }}>
            {["Số HĐ", "Ngày", "Doanh số", "Thuế suất", "VAT", "Tổng tiền", "Trạng thái"].map((h) => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, i) => (
            <tr key={inv.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 ? "rgba(255,255,255,0.02)" : "transparent" }}>
              <td style={{ padding: "10px 14px", color: "#818cf8", fontFamily: "monospace", fontWeight: 600, fontSize: 13 }}>{inv.invoiceCode}</td>
              <td style={{ padding: "10px 14px", color: "#94a3b8", fontSize: 13 }}>{inv.invoiceDate}</td>
              <td style={{ padding: "10px 14px", color: "#e2e8f0", fontSize: 13 }}>{fmt(inv.taxBaseAmount)}</td>
              <td style={{ padding: "10px 14px", color: "#f59e0b", fontSize: 13 }}>{inv.vatRate}%</td>
              <td style={{ padding: "10px 14px", color: "#fbbf24", fontSize: 13 }}>{fmt(inv.vatAmount)}</td>
              <td style={{ padding: "10px 14px", color: "#22c55e", fontWeight: 700, fontSize: 13 }}>{fmt(inv.totalAmount)}</td>
              <td style={{ padding: "10px 14px" }}>
                <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: inv.status === "ISSUED" ? "#22c55e22" : "#94a3b822", color: inv.status === "ISSUED" ? "#22c55e" : "#94a3b8" }}>{inv.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: "rgba(255,255,255,0.04)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <td colSpan={2} style={{ padding: "10px 14px", fontWeight: 700, color: "#e2e8f0", fontSize: 13 }}>Tổng ({invoices.length} hóa đơn)</td>
            <td style={{ padding: "10px 14px", fontWeight: 700, color: "#e2e8f0", fontSize: 13 }}>{fmt(invoices.reduce((s, i) => s + i.taxBaseAmount, 0))}</td>
            <td />
            <td style={{ padding: "10px 14px", fontWeight: 700, color: "#fbbf24", fontSize: 13 }}>{fmt(invoices.reduce((s, i) => s + i.vatAmount, 0))}</td>
            <td style={{ padding: "10px 14px", fontWeight: 700, color: "#22c55e", fontSize: 13 }}>{fmt(invoices.reduce((s, i) => s + i.totalAmount, 0))}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
