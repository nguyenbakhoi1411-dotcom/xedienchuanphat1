"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingApi } from "./api";
import type { FixedAsset, CreateFixedAssetPayload, DepreciationRunResult, DepreciationLine, DepreciationMethod } from "./types";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";
const fmtDate = (s: string) => s?.slice(0, 10);

const STATUS_META: Record<string, { label: string; color: string }> = {
  ACTIVE:            { label: "Đang dùng",  color: "#22c55e" },
  FULLY_DEPRECIATED: { label: "Hết KH",      color: "#f59e0b" },
  DISPOSED:          { label: "Đã thanh lý", color: "#ef4444" },
};

const ASSET_CATEGORIES = ["VEHICLE", "MACHINE", "EQUIPMENT", "BUILDING", "OTHER"];
const DEPR_METHODS = [
  { value: "STRAIGHT_LINE",     label: "Đường thẳng" },
  { value: "DECLINING_BALANCE", label: "Số dư giảm dần" },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

type FormState = {
  assetName: string;
  category: string;
  purchaseDate: string;
  costAmount: string;
  residualValue: string;
  usefulLifeMonths: string;
  depreciationMethod: string;
  branchId: number;
  purchaseOrderNo: string;
  supplierName: string;
  note: string;
};

export function FixedAssetPanel() {
  const qc = useQueryClient();
  const user = useCurrentUser();
  const now = new Date();
  const [showForm, setShowForm] = useState(false);
  const [showDeprModal, setShowDeprModal] = useState(false);
  const [deprYear, setDeprYear] = useState(now.getFullYear());
  const [deprMonth, setDeprMonth] = useState(now.getMonth() + 1);
  const [deprResult, setDeprResult] = useState<DepreciationRunResult | null>(null);
  const [selected, setSelected] = useState<FixedAsset | null>(null);

  const [form, setForm] = useState<FormState>({
    assetName: "", category: "VEHICLE", purchaseDate: now.toISOString().slice(0, 10),
    costAmount: "", residualValue: "0", usefulLifeMonths: "60",
    depreciationMethod: "STRAIGHT_LINE", branchId: user?.branchId ?? 1,
    purchaseOrderNo: "", supplierName: "", note: "",
  });

  useEffect(() => {
    if (user?.branchId) {
      setForm((f) => ({ ...f, branchId: user.branchId as number }));
    }
  }, [user?.branchId]);

  const { data: assets, isLoading } = useQuery<FixedAsset[]>({
    queryKey: ["fixed-assets"],
    queryFn: () => accountingApi.fixedAssets(),
  });

  const createMut = useMutation({
    mutationFn: (p: CreateFixedAssetPayload) => accountingApi.createFixedAsset(p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fixed-assets"] }); setShowForm(false); resetForm(); },
  });

  const deprMut = useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) => accountingApi.runDepreciation(year, month),
    onSuccess: (data) => { setDeprResult(data); qc.invalidateQueries({ queryKey: ["fixed-assets"] }); },
  });

  const disposeMut = useMutation({
    mutationFn: ({ id, amount, note }: { id: number; amount: number; note: string }) => accountingApi.disposeAsset(id, amount, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fixed-assets"] }); setSelected(null); },
  });

  const resetForm = () => setForm({ assetName: "", category: "VEHICLE", purchaseDate: now.toISOString().slice(0, 10), costAmount: "", residualValue: "0", usefulLifeMonths: "60", depreciationMethod: "STRAIGHT_LINE", branchId: user?.branchId ?? 1, purchaseOrderNo: "", supplierName: "", note: "" });

  const handleCreate = () => {
    if (!form.assetName || !form.costAmount) return;
    createMut.mutate({
      assetName: form.assetName, category: form.category,
      purchaseDate: form.purchaseDate, costAmount: Number(form.costAmount),
      residualValue: Number(form.residualValue), usefulLifeMonths: Number(form.usefulLifeMonths),
      depreciationMethod: form.depreciationMethod as DepreciationMethod,
      branchId: form.branchId, purchaseOrderNo: form.purchaseOrderNo,
      supplierName: form.supplierName, note: form.note,
    });
  };

  const list = assets ?? [];
  const totalCost = list.reduce((s, a) => s + a.costAmount, 0);
  const totalBook = list.reduce((s, a) => s + a.bookValue, 0);
  const totalDepr = list.reduce((s, a) => s + a.accumulatedDepreciation, 0);

  return (
    <div style={{ padding: "0 0 2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Tài sản cố định (TSCĐ)</h2>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{list.length} tài sản • Nguyên giá: <span style={{ color: "#6366f1", fontWeight: 700 }}>{fmt(totalCost)}</span> • Giá trị còn lại: <span style={{ color: "#22c55e", fontWeight: 700 }}>{fmt(totalBook)}</span></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowDeprModal(true)} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid rgba(251,191,36,0.4)", background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            Chạy khấu hao
          </button>
          <button onClick={() => setShowForm(true)} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            + Thêm TSCĐ
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {list.length > 0 && (
        <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700, flex: 1 }}>Tỷ lệ khấu hao lũy kế</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#f87171" }}>{totalCost > 0 ? ((totalDepr / totalCost) * 100).toFixed(1) : 0}%</span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 5, background: "linear-gradient(90deg,#6366f1,#f87171)", width: `${totalCost > 0 ? (totalDepr / totalCost) * 100 : 0}%`, transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#475569" }}>
            <span>KH lũy kế: {fmt(totalDepr)}</span>
            <span>Còn lại: {fmt(totalBook)}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)" }}>
              {["Mã TSCĐ", "Tên tài sản", "Loại", "Ngày mua", "Nguyên giá", "KH lũy kế", "Giá trị CL", "Tháng KH", "Trạng thái", ""].map((h) => (
                <th key={h} style={{ padding: "11px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px 12px" }}><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                  <td style={{ padding: "10px 12px" }}><Skeleton className="h-4 w-32 bg-slate-800" /></td>
                  <td style={{ padding: "10px 12px" }}><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                  <td style={{ padding: "10px 12px" }}><Skeleton className="h-4 w-24 bg-slate-800" /></td>
                  <td style={{ padding: "10px 12px" }}><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                  <td style={{ padding: "10px 12px" }}><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                  <td style={{ padding: "10px 12px" }}><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                  <td style={{ padding: "10px 12px" }}><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                  <td style={{ padding: "10px 12px" }}><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                  <td style={{ padding: "10px 12px" }}><Skeleton className="h-4 w-12 bg-slate-800" /></td>
                </tr>
              ))
            ) : !list.length ? (
              <tr>
                <td colSpan={10} style={{ padding: 40 }}>
                  <EmptyState
                    title="Chưa có tài sản cố định"
                    description="Hãy thêm tài sản cố định mới để theo dõi khấu hao và thanh lý."
                  />
                </td>
              </tr>
            ) : list.map((asset, i) => {
              const st = STATUS_META[asset.status] ?? { label: asset.status, color: "#94a3b8" };
              const deprPct = asset.costAmount > 0 ? (asset.accumulatedDepreciation / asset.costAmount) * 100 : 0;
              return (
                <tr key={asset.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px 12px", fontFamily: "monospace", color: "#818cf8", fontWeight: 600, fontSize: 12 }}>{asset.assetCode}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{asset.assetName}</div>
                    {asset.supplierName && <div style={{ color: "#475569", fontSize: 11 }}>{asset.supplierName}</div>}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>{asset.category}</span>
                  </td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8", fontSize: 12 }}>{fmtDate(asset.purchaseDate)}</td>
                  <td style={{ padding: "10px 12px", color: "#e2e8f0", fontWeight: 700, fontSize: 13 }}>{fmt(asset.costAmount)}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ color: "#f87171", fontWeight: 700, fontSize: 13 }}>{fmt(asset.accumulatedDepreciation)}</div>
                    <div style={{ height: 4, borderRadius: 2, background: "rgba(248,113,113,0.15)", marginTop: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 2, background: "#f87171", width: `${deprPct}%` }} />
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", color: "#22c55e", fontWeight: 700, fontSize: 13 }}>{fmt(asset.bookValue)}</td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8", fontSize: 12 }}>{asset.usefulLifeMonths} tháng</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.color + "22", color: st.color }}>{st.label}</span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {asset.status === "ACTIVE" && (
                      <button onClick={() => setSelected(asset)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "rgba(239,68,68,0.12)", color: "#ef4444", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Thanh lý</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Run depreciation modal */}
      {showDeprModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 16, padding: 28, width: 440, maxWidth: "90vw" }}>
            <h3 style={{ color: "#fbbf24", marginTop: 0, fontSize: 16 }}>Chạy khấu hao tháng</h3>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 16px" }}>Hệ thống sẽ tính và ghi bút toán khấu hao cho tất cả TSCĐ đang hoạt động. Idempotent — an toàn nếu chạy lại.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Tháng</label>
                <select value={deprMonth} onChange={(e) => setDeprMonth(Number(e.target.value))} style={inp}>
                  {MONTHS.map((m) => <option key={m} value={m}>Tháng {m}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Năm</label>
                <select value={deprYear} onChange={(e) => setDeprYear(Number(e.target.value))} style={inp}>
                  {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {deprResult && (
              <div style={{ marginTop: 16, background: "rgba(34,197,94,0.08)", borderRadius: 10, padding: 14, border: "1px solid rgba(34,197,94,0.2)" }}>
                <div style={{ color: "#22c55e", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Kết quả tháng {deprResult.month}/{deprResult.year}</div>
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  {deprResult.lines.map((l: DepreciationLine) => (
                    <div key={l.assetId} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12 }}>
                      <span style={{ color: "#94a3b8" }}>{l.assetName}</span>
                      <span style={{ color: l.result === "POSTED" ? "#22c55e" : l.result === "SKIPPED" ? "#f59e0b" : "#64748b", fontWeight: 700 }}>
                        {l.result === "POSTED" ? fmt(l.amount) : l.result}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, textAlign: "right", color: "#fbbf24", fontWeight: 800, fontSize: 14 }}>Tổng: {fmt(deprResult.totalAmount)}</div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button onClick={() => { setShowDeprModal(false); setDeprResult(null); }} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer" }}>Đóng</button>
              <button onClick={() => deprMut.mutate({ year: deprYear, month: deprMonth })} disabled={deprMut.isPending} style={{ flex: 2, padding: 10, borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#0f172a", fontWeight: 800, cursor: "pointer" }}>
                {deprMut.isPending ? "Đang chạy..." : `Chạy T${deprMonth}/${deprYear}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispose modal */}
      {selected && (
        <DisposeModal asset={selected} onDispose={(amount, note) => disposeMut.mutate({ id: selected.id, amount, note })} onClose={() => setSelected(null)} isPending={disposeMut.isPending} />
      )}

      {/* Create form modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 16, padding: 28, width: 520, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ color: "#f1f5f9", marginTop: 0, fontSize: 17 }}>Thêm tài sản cố định</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>Tên TSCĐ</label>
                <input value={form.assetName} onChange={(e) => setForm((f) => ({ ...f, assetName: e.target.value }))} placeholder="VD: Xe tải giao hàng 1.5T" style={inp} />
              </div>
              <div>
                <label style={lbl}>Loại</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={inp}>
                  {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Ngày mua</label>
                <input type="date" value={form.purchaseDate} onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Nguyên giá (₫)</label>
                <input type="number" value={form.costAmount} onChange={(e) => setForm((f) => ({ ...f, costAmount: e.target.value }))} placeholder="0" style={inp} />
              </div>
              <div>
                <label style={lbl}>Giá trị thanh lý (₫)</label>
                <input type="number" value={form.residualValue} onChange={(e) => setForm((f) => ({ ...f, residualValue: e.target.value }))} placeholder="0" style={inp} />
              </div>
              <div>
                <label style={lbl}>Thời gian KH (tháng)</label>
                <input type="number" value={form.usefulLifeMonths} onChange={(e) => setForm((f) => ({ ...f, usefulLifeMonths: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Phương pháp KH</label>
                <select value={form.depreciationMethod} onChange={(e) => setForm((f) => ({ ...f, depreciationMethod: e.target.value }))} style={inp}>
                  {DEPR_METHODS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Nhà cung cấp</label>
                <input value={form.supplierName} onChange={(e) => setForm((f) => ({ ...f, supplierName: e.target.value }))} placeholder="Tên NCC" style={inp} />
              </div>
              <div>
                <label style={lbl}>Số PO</label>
                <input value={form.purchaseOrderNo} onChange={(e) => setForm((f) => ({ ...f, purchaseOrderNo: e.target.value }))} placeholder="PO-2026-..." style={inp} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>Ghi chú</label>
                <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Ghi chú thêm..." style={inp} />
              </div>
            </div>

            {form.costAmount && form.usefulLifeMonths && !isNaN(Number(form.costAmount)) && (
              <div style={{ marginTop: 14, padding: 12, background: "rgba(99,102,241,0.08)", borderRadius: 8, fontSize: 12, color: "#94a3b8" }}>
                <strong style={{ color: "#818cf8" }}>Khấu hao ước tính:</strong>{" "}
                {fmt(Math.round((Number(form.costAmount) - Number(form.residualValue || 0)) / Number(form.usefulLifeMonths)))}/tháng
                <span style={{ color: "#475569" }}> ({form.usefulLifeMonths} tháng)</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setShowForm(false); resetForm(); }} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer" }}>Hủy</button>
              <button onClick={handleCreate} disabled={createMut.isPending || !form.assetName || !form.costAmount} style={{ flex: 2, padding: 10, borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                {createMut.isPending ? "Đang lưu..." : "Lưu TSCĐ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DisposeModal({ asset, onDispose, onClose, isPending }: { asset: FixedAsset; onDispose: (amount: number, note: string) => void; onClose: () => void; isPending: boolean }) {
  const [amount, setAmount] = useState("0");
  const [note, setNote] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#0f172a", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: 28, width: 400, maxWidth: "90vw" }}>
        <h3 style={{ color: "#ef4444", marginTop: 0, fontSize: 16 }}>Thanh lý: {asset.assetName}</h3>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>Giá trị còn lại: <strong style={{ color: "#22c55e" }}>{asset.bookValue.toLocaleString("vi-VN")} ₫</strong></div>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Giá trị thanh lý thu được (₫)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={inp} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Lý do / Ghi chú</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer" }}>Hủy</button>
          <button onClick={() => onDispose(Number(amount), note)} disabled={isPending} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            {isPending ? "Đang lưu..." : "Xác nhận thanh lý"}
          </button>
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0", padding: "9px 12px", fontSize: 13, boxSizing: "border-box" as const };
