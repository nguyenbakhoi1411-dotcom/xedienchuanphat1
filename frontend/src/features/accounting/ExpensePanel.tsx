"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingApi } from "./api";
import type { Expense, ExpenseCategory, CreateExpensePayload } from "./types";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "SALARY",      label: "Lương" },
  { value: "RENT",        label: "Thuê mặt bằng" },
  { value: "UTILITIES",   label: "Điện/Nước" },
  { value: "MARKETING",   label: "Marketing" },
  { value: "MAINTENANCE", label: "Bảo trì" },
  { value: "OTHER",       label: "Khác" },
];

const STATUS_COLOR: Record<string, string> = { DRAFT: "#94a3b8", POSTED: "#22c55e", CANCELLED: "#ef4444" };
const STATUS_LABEL: Record<string, string> = { DRAFT: "Nháp", POSTED: "Đã duyệt", CANCELLED: "Đã hủy" };

const ACCOUNT_OPTIONS = [
  { code: "641", label: "641 — Chi phí bán hàng" },
  { code: "642", label: "642 — Chi phí QLDN" },
  { code: "811", label: "811 — Chi phí khác" },
  { code: "334", label: "334 — Phải trả người lao động" },
];

const CONTRA_ACCOUNTS = [
  { code: "111", label: "111 — Tiền mặt" },
  { code: "112", label: "112 — Tiền gửi NH" },
  { code: "334", label: "334 — Phải trả NLD" },
  { code: "331", label: "331 — Phải trả NCC" },
];

type FormState = {
  category: ExpenseCategory;
  amount: string;
  description: string;
  branchId: number;
  accountCode: string;
  contraAccount: string;
};

export function ExpensePanel() {
  const qc = useQueryClient();
  const user = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [catFilter, setCatFilter] = useState("");
  const [form, setForm] = useState<FormState>({
    category: "OTHER", amount: "", description: "", branchId: user?.branchId ?? 1,
    accountCode: "642", contraAccount: "111",
  });

  useEffect(() => {
    if (user?.branchId) {
      setForm((f) => ({ ...f, branchId: user.branchId as number }));
    }
  }, [user?.branchId]);

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", catFilter],
    queryFn: () => accountingApi.expenses(undefined, catFilter || undefined),
  });

  const createMut = useMutation({
    mutationFn: (p: CreateExpensePayload) => accountingApi.createExpense(p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); setShowForm(false); resetForm(); },
  });

  const postMut = useMutation({
    mutationFn: (id: number) => accountingApi.postExpense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => accountingApi.deleteExpense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const resetForm = () => setForm({ category: "OTHER", amount: "", description: "", branchId: user?.branchId ?? 1, accountCode: "642", contraAccount: "111" });

  const handleSubmit = () => {
    if (!form.amount || isNaN(Number(form.amount))) return;
    createMut.mutate({ category: form.category, amount: Number(form.amount), description: form.description, branchId: form.branchId, accountCode: form.accountCode, contraAccount: form.contraAccount });
  };

  const items: Expense[] = data?.items ?? [];
  const totalPosted = items.filter((e) => e.status === "POSTED").reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ padding: "0 0 2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Chi phí vận hành</h2>
          {items.length > 0 && <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Đã duyệt: <span style={{ color: "#ef4444", fontWeight: 700 }}>{fmt(totalPosted)}</span></div>}
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
          + Thêm chi phí
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={() => setCatFilter("")} style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 600, borderColor: !catFilter ? "#6366f1" : "rgba(255,255,255,0.1)", background: !catFilter ? "rgba(99,102,241,0.15)" : "transparent", color: !catFilter ? "#818cf8" : "#64748b" }}>Tất cả</button>
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setCatFilter(c.value)} style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 600, borderColor: catFilter === c.value ? "#6366f1" : "rgba(255,255,255,0.1)", background: catFilter === c.value ? "rgba(99,102,241,0.15)" : "transparent", color: catFilter === c.value ? "#818cf8" : "#64748b" }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)" }}>
              {["Mã chi phí", "Ngày", "Danh mục", "Mô tả", "TK Nợ", "Số tiền", "Trạng thái", "Thao tác"].map((h) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px 14px" }}><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                  <td style={{ padding: "10px 14px" }}><Skeleton className="h-4 w-24 bg-slate-800" /></td>
                  <td style={{ padding: "10px 14px" }}><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                  <td style={{ padding: "10px 14px" }}><Skeleton className="h-4 w-32 bg-slate-800" /></td>
                  <td style={{ padding: "10px 14px" }}><Skeleton className="h-4 w-12 bg-slate-800" /></td>
                  <td style={{ padding: "10px 14px" }}><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                  <td style={{ padding: "10px 14px" }}><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                  <td style={{ padding: "10px 14px" }}><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                </tr>
              ))
            ) : !items.length ? (
              <tr>
                <td colSpan={8} style={{ padding: 40 }}>
                  <EmptyState
                    title="Chưa có chi phí nào"
                    description="Hãy thêm chi phí mới để quản lý các khoản chi tiêu của doanh nghiệp."
                  />
                </td>
              </tr>
            ) : items.map((exp, i) => {
              const cat = CATEGORIES.find((c) => c.value === exp.category);
              return (
                <tr key={exp.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#818cf8", fontWeight: 600, fontSize: 13 }}>{exp.expenseCode}</td>
                  <td style={{ padding: "10px 14px", color: "#94a3b8", fontSize: 13 }}>{exp.expenseDate}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>{cat?.label ?? exp.category}</span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#94a3b8", fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exp.description ?? "—"}</td>
                  <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#64748b", fontSize: 12 }}>{exp.accountCode}</td>
                  <td style={{ padding: "10px 14px", color: "#f87171", fontWeight: 700, fontSize: 13 }}>{fmt(exp.amount)}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: (STATUS_COLOR[exp.status] ?? "#94a3b8") + "22", color: STATUS_COLOR[exp.status] ?? "#94a3b8" }}>{STATUS_LABEL[exp.status] ?? exp.status}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {exp.status === "DRAFT" && (
                        <>
                          <button onClick={() => postMut.mutate(exp.id)} disabled={postMut.isPending} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "rgba(34,197,94,0.15)", color: "#22c55e", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Duyệt</button>
                          <button onClick={() => deleteMut.mutate(exp.id)} disabled={deleteMut.isPending} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "rgba(239,68,68,0.12)", color: "#ef4444", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Xóa</button>
                        </>
                      )}
                      {exp.journalEntryId && <span style={{ fontSize: 11, color: "#475569" }}>BT #{exp.journalEntryId}</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create form modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 16, padding: 28, width: 480, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ color: "#f1f5f9", marginTop: 0, fontSize: 17 }}>Thêm chi phí</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>Danh mục</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {CATEGORIES.map((c) => (
                    <button key={c.value} onClick={() => setForm((f) => ({ ...f, category: c.value }))} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 600, borderColor: form.category === c.value ? "#6366f1" : "rgba(255,255,255,0.1)", background: form.category === c.value ? "rgba(99,102,241,0.2)" : "transparent", color: form.category === c.value ? "#818cf8" : "#64748b" }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={lbl}>Số tiền (₫)</label>
                <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" style={inp} />
              </div>

              <div>
                <label style={lbl}>Chi nhánh ID</label>
                <input type="number" value={form.branchId} onChange={(e) => setForm((f) => ({ ...f, branchId: Number(e.target.value) }))} style={inp} />
              </div>

              <div>
                <label style={lbl}>Tài khoản Nợ</label>
                <select value={form.accountCode} onChange={(e) => setForm((f) => ({ ...f, accountCode: e.target.value }))} style={inp}>
                  {ACCOUNT_OPTIONS.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>Tài khoản Có</label>
                <select value={form.contraAccount} onChange={(e) => setForm((f) => ({ ...f, contraAccount: e.target.value }))} style={inp}>
                  {CONTRA_ACCOUNTS.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>Mô tả</label>
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Ghi chú chi phí..." style={inp} />
              </div>
            </div>

            {form.amount && !isNaN(Number(form.amount)) && (
              <div style={{ marginTop: 14, padding: 12, background: "rgba(99,102,241,0.08)", borderRadius: 8, fontSize: 12, color: "#94a3b8" }}>
                <strong style={{ color: "#818cf8" }}>Bút toán sẽ sinh:</strong><br />
                Nợ {form.accountCode}: {fmt(Number(form.amount))}<br />
                Có {form.contraAccount}: {fmt(Number(form.amount))}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setShowForm(false); resetForm(); }} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", cursor: "pointer" }}>Hủy</button>
              <button onClick={handleSubmit} disabled={createMut.isPending || !form.amount} style={{ flex: 2, padding: 10, borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                {createMut.isPending ? "Đang lưu..." : "Lưu chi phí"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0", padding: "9px 12px", fontSize: 13, boxSizing: "border-box" };
