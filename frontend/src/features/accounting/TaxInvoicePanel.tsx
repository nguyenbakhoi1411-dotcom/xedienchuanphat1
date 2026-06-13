"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingApi } from "./api";
import type { TaxInvoice, InvoiceType } from "./types";

const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  DRAFT:     { label: "Nháp",       color: "#94a3b8" },
  ISSUED:    { label: "Đã xuất",    color: "#22c55e" },
  ADJUSTED:  { label: "Điều chỉnh", color: "#f59e0b" },
  REPLACED:  { label: "Thay thế",   color: "#8b5cf6" },
  CANCELLED: { label: "Hủy",        color: "#ef4444" },
};

export function TaxInvoicePanel() {
  const [tab, setTab] = useState<InvoiceType>("OUTPUT");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCancel, setShowCancel] = useState<TaxInvoice | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const qc = useQueryClient();

  const queryKey = tab === "OUTPUT" ? ["tax-invoices-output", statusFilter] : ["tax-invoices-input", statusFilter];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      tab === "OUTPUT"
        ? accountingApi.outputInvoices(undefined, statusFilter === "ALL" ? undefined : statusFilter)
        : accountingApi.inputInvoices(undefined, statusFilter === "ALL" ? undefined : statusFilter),
  });

  const issueMut = useMutation({
    mutationFn: (id: number) => accountingApi.issueInvoice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const cancelMut = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => accountingApi.cancelInvoice(id, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey }); setShowCancel(null); setCancelReason(""); },
  });

  return (
    <div style={{ padding: "0 0 2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
          Hóa đơn VAT
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          {(["OUTPUT", "INPUT"] as InvoiceType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: tab === t ? (t === "OUTPUT" ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "linear-gradient(135deg,#0ea5e9,#06b6d4)") : "rgba(255,255,255,0.06)",
                color: tab === t ? "#fff" : "#94a3b8",
              }}
            >
              {t === "OUTPUT" ? "🧾 Bán ra" : "📥 Mua vào"}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["ALL", "DRAFT", "ISSUED", "ADJUSTED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "5px 14px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 600,
              borderColor: statusFilter === s ? "#6366f1" : "rgba(255,255,255,0.1)",
              background: statusFilter === s ? "rgba(99,102,241,0.15)" : "transparent",
              color: statusFilter === s ? "#818cf8" : "#64748b",
            }}
          >
            {s === "ALL" ? "Tất cả" : STATUS_LABEL[s]?.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)" }}>
              {["Số hóa đơn", "Ngày", "Khách/NCC", "Doanh số", "VAT", "Tổng tiền", "Trạng thái", "Thao tác"].map((h) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#475569" }}>Đang tải...</td></tr>
            ) : !data?.items?.length ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#475569" }}>Chưa có hóa đơn</td></tr>
            ) : data.items.map((inv, i) => {
              const st = STATUS_LABEL[inv.status] ?? { label: inv.status, color: "#94a3b8" };
              return (
                <tr key={inv.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ fontFamily: "monospace", color: "#818cf8", fontWeight: 600, fontSize: 13 }}>{inv.invoiceCode}</span>
                    {inv.invoiceSerial && <span style={{ color: "#475569", fontSize: 11, display: "block" }}>{inv.invoiceSerial}</span>}
                  </td>
                  <td style={{ padding: "11px 14px", color: "#94a3b8", fontSize: 13 }}>{inv.invoiceDate}</td>
                  <td style={{ padding: "11px 14px", color: "#e2e8f0", fontSize: 13 }}>{inv.relatedOrderNo ?? `ID: ${inv.customerId ?? inv.supplierId}`}</td>
                  <td style={{ padding: "11px 14px", color: "#94a3b8", fontSize: 13 }}>{fmt(inv.taxBaseAmount)}</td>
                  <td style={{ padding: "11px 14px", color: "#fbbf24", fontSize: 13 }}>{fmt(inv.vatAmount)} <span style={{ color: "#475569", fontSize: 11 }}>({inv.vatRate}%)</span></td>
                  <td style={{ padding: "11px 14px", color: "#22c55e", fontWeight: 700, fontSize: 13 }}>{fmt(inv.totalAmount)}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.color + "22", color: st.color }}>{st.label}</span>
                    {inv.eInvoiceNo && <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>E: {inv.eInvoiceNo}</div>}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {inv.status === "DRAFT" && (
                        <button onClick={() => issueMut.mutate(inv.id)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "rgba(34,197,94,0.15)", color: "#22c55e", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Xuất</button>
                      )}
                      {["DRAFT", "ISSUED"].includes(inv.status) && (
                        <button onClick={() => setShowCancel(inv)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "rgba(239,68,68,0.12)", color: "#ef4444", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Hủy</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cancel dialog */}
      {showCancel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: 28, width: 400, maxWidth: "90vw" }}>
            <h3 style={{ color: "#ef4444", marginTop: 0, fontSize: 16 }}>Hủy hóa đơn {showCancel.invoiceCode}</h3>
            <p style={{ color: "#94a3b8", fontSize: 13 }}>Lý do hủy:</p>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} placeholder="Nhập lý do..." style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0", padding: 10, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => { setShowCancel(null); setCancelReason(""); }} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer" }}>Đóng</button>
              <button onClick={() => cancelMut.mutate({ id: showCancel.id, reason: cancelReason })} disabled={cancelMut.isPending} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                {cancelMut.isPending ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
