"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell
} from "recharts";
import {
  TrendingUp, ShoppingCart, Banknote, TrendingDown,
  Wallet, AlertCircle, Sparkles, RefreshCw, Send, X,
  ChevronDown, ArrowUpRight, ArrowDownRight, Minus,
  ExternalLink, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { api } from "@/lib/api/axios";
import { toast } from "sonner";

// ─── helpers ────────────────────────────────────────────────────────────────
function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " tỷ";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "tr";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}
function fmtFull(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}
function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtMonthAxis(v: string | number) {
  const s = String(v);
  if (s.includes("-")) {
    const [y, m] = s.split("-");
    return `T${parseInt(m)}`;
  }
  return `T${v}`;
}
function fmtMonthLabel(v: string | number) {
  const s = String(v);
  if (s.includes("-")) {
    const [y, m] = s.split("-");
    return `Tháng ${parseInt(m)}/${y}`;
  }
  return `Tháng ${v}`;
}

// ─── types ───────────────────────────────────────────────────────────────────
type KpiItem = { key: string; value: string; label: string; helper?: string; trend?: string; tone?: string };
type DashboardData = {
  kpis?: KpiItem[];
  revenueByMonth?: RevenuePoint[];
  profitByMonth?: ProfitPoint[];
  topProducts?: TopProduct[];
};
type RevenuePoint = { month: string | number; revenue: number };
type ProfitPoint  = { month: string | number; profit: number };
type ChartPoint   = { month: string | number; revenue: number; profit: number };
type TopProduct   = { productId?: number; productName: string; quantitySold: number; revenue: number };
type SalesOrder   = { id: number; orderNo: string; orderDate?: string; createdAt?: string; customerName: string; totalAmount: number; status: string };
type PageResp<T>  = { content?: T[]; items?: T[] };

// ─── status ──────────────────────────────────────────────────────────────────
const ORDER_TONE: Record<string, "slate" | "blue" | "amber" | "green" | "red"> = {
  DRAFT: "amber", CONFIRMED: "blue", DELIVERING: "green",
  COMPLETED: "green", CANCELLED: "red",
};
const ORDER_LABEL: Record<string, string> = {
  DRAFT: "Chờ xác nhận", CONFIRMED: "Đã xác nhận",
  DELIVERING: "Đang giao", COMPLETED: "Đã giao", CANCELLED: "Đã hủy",
};

// ─── KPI nav links ────────────────────────────────────────────────────────────
const KPI_HREF: Record<string, string> = {
  todayRevenue:  "/sales?filter=today",
  monthRevenue:  "/sales?filter=today",
  todayOrders:   "/sales?tab=don-hang&filter=today",
  orders:        "/sales?tab=don-hang&filter=today",
  grossProfit:   "/reports?tab=income-statement",
  payments:      "/cash?tab=phieu-chi&filter=today",
  cashBalance:   "/cash?tab=dong-tien",
  receivable:    "/reports?tab=cong-no-phai-thu",
};

// ─── parse compact ────────────────────────────────────────────────────────────
function parseCompact(v: string | number | null | undefined): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const s = v.trim();
  if (s.endsWith("B")) return parseFloat(s) * 1_000_000_000;
  if (s.endsWith("M")) return parseFloat(s) * 1_000_000;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}
function getKpi(kpis: KpiItem[] | undefined, key: string) {
  return kpis?.find(k => k.key === key);
}
function getKpiValue(kpis: KpiItem[] | undefined, key: string): number | null {
  const item = getKpi(kpis, key);
  return item ? parseCompact(item.value) : null;
}

// ─── Delta badge ──────────────────────────────────────────────────────────────
function DeltaBadge({ trend }: { trend?: string }) {
  if (!trend || trend === "unchanged" || trend === "") {
    return <span className="flex items-center gap-0.5 text-xs text-slate-400"><Minus className="h-3 w-3" /> Không thay đổi</span>;
  }
  const isUp = trend.startsWith("up:");
  const pct  = trend.split(":")[1] ?? "";
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-emerald-600" : "text-red-500"}`}>
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {pct}% so hôm qua
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
type IconComponent = React.ComponentType<{ className?: string }>;

const KPI_GRADIENTS = [
  "linear-gradient(135deg, #f97316, #ea580c)",
  "linear-gradient(135deg, #3b82f6, #2563eb)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #ef4444, #dc2626)",
  "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  "linear-gradient(135deg, #f59e0b, #d97706)",
];

function KpiCard({
  label, value, icon: Icon, loading, trend, href, index = 0,
}: {
  label: string; value: number | null; icon: IconComponent;
  loading: boolean; trend?: string; href?: string; index?: number;
}) {
  const gradient = KPI_GRADIENTS[index % KPI_GRADIENTS.length];
  const content = (
    <div
      className="group relative rounded-2xl bg-white p-5 cursor-pointer overflow-hidden"
      style={{
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-soft)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
        (e.currentTarget as HTMLElement).style.borderColor = "#FED7AA";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-soft)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
      }}
    >
      {/* Subtle background glow */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-5 transition-opacity duration-300 group-hover:opacity-10"
        style={{ background: gradient }} />

      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight pr-2">{label}</p>
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl shadow-sm"
          style={{ background: gradient }}
        >
          <Icon className="h-4 w-4 text-white" />
        </span>
      </div>
      {loading ? (
        <div className="h-8 w-28 mb-1 skeleton-shimmer rounded-lg" />
      ) : (
        <p className="text-[22px] font-extrabold text-text tracking-tight">{fmt(value)}</p>
      )}
      <div className="mt-2">
        {loading ? <div className="h-4 w-20 skeleton-shimmer rounded" /> : <DeltaBadge trend={trend} />}
      </div>
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

// ─── AI types ─────────────────────────────────────────────────────────────────
type AiMsg = {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
  detailHref?: string;
};

// ─── Top Products filter ──────────────────────────────────────────────────────
type TopFilter = "month" | "30d" | "quarter";

function filterToDateRange(f: TopFilter): { from: string; to: string } {
  const now  = new Date();
  const to   = now.toISOString().slice(0, 10);
  if (f === "30d") {
    const from = new Date(now); from.setDate(from.getDate() - 29);
    return { from: from.toISOString().slice(0, 10), to };
  }
  if (f === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    const from = new Date(now.getFullYear(), q * 3, 1).toISOString().slice(0, 10);
    return { from, to };
  }
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  return { from, to };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const user   = useCurrentUser();
  const router = useRouter();

  const [dashData,     setDashData]     = useState<DashboardData | null>(null);
  const [chartData,    setChartData]    = useState<ChartPoint[]>([]);
  const [topProducts,  setTopProducts]  = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<SalesOrder[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [topFilter,    setTopFilter]    = useState<TopFilter>("month");
  const [topLoading,   setTopLoading]   = useState(false);
  const [showRevenue,  setShowRevenue]  = useState(true);
  const [showProfit,   setShowProfit]   = useState(true);

  // ── AI Slide-in Panel ──
  const [aiPanelOpen,   setAiPanelOpen]   = useState(false);
  const [aiChip,        setAiChip]        = useState<string>("");
  const [aiMessages,    setAiMessages]    = useState<AiMsg[]>([]);
  const [aiInput,       setAiInput]       = useState("");
  const [aiLoading,     setAiLoading]     = useState(false);
  const aiEndRef    = useRef<HTMLDivElement>(null);
  const aiInputRef  = useRef<HTMLInputElement>(null);

  // ── load all dashboard data ──
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, ordRes] = await Promise.allSettled([
        api.get<DashboardData>("/api/dashboard/summary", {
          params: { branchId: user?.branchId }
        }),
        api.get<PageResp<SalesOrder>>("/api/sales/orders", {
          params: { page: 0, size: 10, sort: "createdAt,desc" }
        }),
      ]);
      if (dashRes.status === "fulfilled" && dashRes.value.data) {
        const d = dashRes.value.data;
        setDashData(d);
        // Merge revenueByMonth + profitByMonth into one chartData array
        const rev  = d.revenueByMonth ?? [];
        const prof = d.profitByMonth  ?? [];
        const merged = rev.map(r => {
          const p = prof.find(x => x.month === r.month);
          return { month: r.month, revenue: r.revenue ?? 0, profit: p?.profit ?? 0 };
        });
        setChartData(merged);
        setTopProducts((d.topProducts ?? []).slice(0, 5));
      }
      if (ordRes.status === "fulfilled") {
        const d = ordRes.value.data;
        setRecentOrders(d.content ?? d.items ?? []);
      }
    } catch {
      toast.error("Không thể tải dữ liệu tổng quan");
    } finally {
      setLoading(false);
    }
  }, [user?.branchId]);

  useEffect(() => { void loadAll(); }, [loadAll]);

  // ── auto-refresh every 60s ──
  useEffect(() => {
    const id = setInterval(() => { void loadAll(); }, 60_000);
    return () => clearInterval(id);
  }, [loadAll]);

  // ── load top products with filter ──
  const loadTopProducts = useCallback(async (f: TopFilter) => {
    setTopLoading(true);
    try {
      const { from, to } = filterToDateRange(f);
      const res = await api.get<TopProduct[]>("/api/dashboard/top-products", {
        params: { branchId: user?.branchId, fromDate: from, toDate: to }
      });
      setTopProducts((res.data ?? []).slice(0, 5));
    } catch {
      toast.error("Không thể tải top sản phẩm");
    } finally {
      setTopLoading(false);
    }
  }, [user?.branchId]);

  useEffect(() => { if (!loading) void loadTopProducts(topFilter); }, [topFilter]);

  // ── AI scroll ──
  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMessages]);

  // ── AI send ──
  const sendAiMessage = useCallback(async (question: string) => {
    if (!question.trim() || aiLoading) return;
    const q = question.trim();
    setAiInput("");
    setAiPanelOpen(true);
    setAiMessages(prev => [
      ...prev,
      { role: "user", content: q },
      { role: "assistant", content: "", loading: true },
    ]);
    setAiLoading(true);
    const detailHref = q.includes("tồn đọng") ? "/sales"
                     : q.includes("sắp hết")  ? "/inventory"
                     : q.includes("doanh thu") ? "/reports?tab=income-statement"
                     : undefined;
    try {
      const res = await api.post("/api/ai-assistant/ask", {
        question: q,
        branchId: user?.branchId ?? null,
      });
      const data = res.data;
      setAiMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: data.answer ?? "Không có phản hồi.",
          loading: false,
          detailHref,
        };
        return next;
      });
    } catch {
      setAiMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: "Không thể kết nối AI. Vui lòng thử lại.",
          loading: false,
        };
        return next;
      });
    } finally {
      setAiLoading(false);
    }
  }, [user?.branchId, aiLoading]);

  const openChip = (chip: string) => {
    setAiChip(chip);
    setAiPanelOpen(true);
    if (!aiMessages.some(m => m.role === "user" && m.content === chip)) {
      void sendAiMessage(chip);
    }
  };

  // ── dates ──
  const todayLabel = new Date().toLocaleDateString("vi-VN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // ── extract KPIs ──
  const kpis        = dashData?.kpis;
  const todayRev    = getKpiValue(kpis, "todayRevenue");
  const monthRev    = getKpiValue(kpis, "monthRevenue");
  const displayRev  = todayRev ?? monthRev;
  const revLabel    = todayRev != null ? "Doanh thu hôm nay" : "Doanh thu tháng này";
  const revTrend    = getKpi(kpis, "todayRevenue")?.trend ?? getKpi(kpis, "monthRevenue")?.trend;
  const todayOrders = getKpiValue(kpis, "todayOrders");
  const ordTrend    = getKpi(kpis, "todayOrders")?.trend;
  const grossProfit = getKpiValue(kpis, "grossProfit");
  const payments    = getKpiValue(kpis, "payments");
  const payTrend    = getKpi(kpis, "payments")?.trend;
  const cashBal     = getKpiValue(kpis, "cashBalance");
  const receivable  = getKpiValue(kpis, "receivable");

  // ── top products progress bar ──
  const maxQty = Math.max(...topProducts.map(p => p.quantitySold), 1);

  // ── chart custom tooltip ──
  const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-border bg-white p-3 shadow-lg text-sm">
        <p className="font-semibold text-slate-700 mb-1.5">{fmtMonthLabel(label ?? "")}</p>
        {payload.map((p, i) => (
          <p key={i} className="flex justify-between gap-4">
            <span className="text-slate-500">{p.name === "revenue" ? "Doanh thu" : "Lợi nhuận"}</span>
            <span className="font-bold text-text">{fmtFull(p.value)}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-text tracking-tight">Tổng quan</h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
            <span>{todayLabel}</span>
            <span className="text-slate-300">·</span>
            <span>Chi nhánh:</span>
            <span
              className="font-semibold rounded-full px-2 py-0.5 text-xs"
              style={{ background: "#fff7ed", color: "var(--color-primary)", border: "1px solid #FED7AA" }}
            >
              {user?.branchName ?? "Tất cả"}
            </span>
          </p>
        </div>
        <button
          id="dash-refresh"
          onClick={loadAll}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-soft hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 transition-transform ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* ── 6 KPI cards ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard index={0} label={revLabel} value={displayRev} icon={TrendingUp} loading={loading} trend={revTrend} href={KPI_HREF.todayRevenue} />
        <KpiCard index={1} label="Đơn hàng hôm nay" value={todayOrders} icon={ShoppingCart} loading={loading} trend={ordTrend} href={KPI_HREF.todayOrders} />
        <KpiCard index={2} label="Lợi nhuận gộp" value={grossProfit} icon={Banknote} loading={loading} href={KPI_HREF.grossProfit} />
        <KpiCard index={3} label="Chi tiền hôm nay" value={payments} icon={TrendingDown} loading={loading} trend={payTrend} href={KPI_HREF.payments} />
        <KpiCard index={4} label="Tồn quỹ khả dụng" value={cashBal} icon={Wallet} loading={loading} href={KPI_HREF.cashBalance} />
        <KpiCard index={5} label="Công nợ phải thu" value={receivable} icon={AlertCircle} loading={loading} href={KPI_HREF.receivable} />
      </div>

      {/* ── AI Assistant panel ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,247,237,0.9) 0%, rgba(255,237,213,0.8) 100%)",
          border: "1px solid #FED7AA",
          boxShadow: "0 4px 16px rgba(249,115,22,0.08)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-orange-200">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Trợ lý AI Chuẩn Phát</p>
              <p className="text-xs text-slate-500">Phân tích dữ liệu thực từ hệ thống</p>
            </div>
          </div>
          <button
            id="ai-panel-toggle"
            onClick={() => setAiPanelOpen(v => !v)}
            className="rounded-full p-1 text-slate-400 hover:bg-orange-100 hover:text-orange-600 transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${aiPanelOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {[
            "Doanh thu so tháng trước?",
            "Đơn nào đang tồn đọng?",
            "Hàng nào sắp hết?",
            "Chi nhánh nào bán tốt nhất?",
          ].map(q => (
            <button
              key={q}
              id={`ai-chip-${q.slice(0, 15).replace(/\s+/g, "-")}`}
              onClick={() => openChip(q)}
              disabled={aiLoading}
              className="flex items-center gap-1.5 rounded-full border border-orange-300 bg-white px-3 py-1.5 text-xs font-medium text-primary hover:bg-orange-100 transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              {q}
            </button>
          ))}
        </div>

        {/* Chat area */}
        {aiPanelOpen && (
          <div className="border-t border-orange-200">
            <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
              {aiMessages.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">Chọn câu hỏi gợi ý hoặc tự gõ bên dưới</p>
              ) : aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white mr-2 mt-1">
                      <Sparkles className="h-3 w-3" />
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-orange-500 text-white rounded-tr-sm"
                      : "bg-white border border-orange-100 text-slate-700 rounded-tl-sm shadow-sm"
                  }`}>
                    {msg.loading ? (
                      <div className="flex gap-1.5 items-center h-5">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.detailHref && (
                          <Link
                            href={msg.detailHref}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:underline"
                          >
                            Xem chi tiết <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={aiEndRef} />
            </div>
            <div className="border-t border-orange-100 px-4 py-3 flex gap-2">
              <input
                ref={aiInputRef}
                id="ai-chat-input"
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendAiMessage(aiInput); } }}
                placeholder="Hỏi về doanh thu, tồn kho, công nợ..."
                disabled={aiLoading}
                className="flex-1 rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
              />
              <button
                id="ai-send-btn"
                onClick={() => void sendAiMessage(aiInput)}
                disabled={aiLoading || !aiInput.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
              {aiMessages.length > 0 && (
                <button
                  id="ai-clear-btn"
                  onClick={() => setAiMessages([])}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-200 text-slate-400 hover:bg-orange-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">

        {/* Bar chart doanh thu 12 tháng */}
        <div className="rounded-2xl border border-border bg-white p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-text">Doanh thu 12 tháng</h2>
              <p className="text-xs text-slate-400 mt-0.5">So sánh doanh thu và lợi nhuận</p>
            </div>
            {/* Legend toggles */}
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setShowRevenue(v => !v)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border font-semibold transition-all ${
                  showRevenue
                    ? "bg-orange-100 border-orange-300 text-orange-700"
                    : "border-border bg-white text-slate-400 hover:border-slate-300"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Doanh thu
              </button>
              <button
                onClick={() => setShowProfit(v => !v)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border font-semibold transition-all ${
                  showProfit
                    ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                    : "border-border bg-white text-slate-400 hover:border-slate-300"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Lợi nhuận
              </button>
            </div>
          </div>
          {loading ? (
            <div className="h-56 skeleton-shimmer rounded-xl" />
          ) : chartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={224}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tickFormatter={fmtMonthAxis} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}tr`} tick={{ fontSize: 11, fill: "#94A3B8" }} width={44} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                {showRevenue && (
                  <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={28} />
                )}
                {showProfit && (
                  <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top 5 sản phẩm */}
        <div className="rounded-2xl border border-border bg-white p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-text">Top 5 bán chạy</h2>
              <p className="text-xs text-slate-400 mt-0.5">Sản phẩm theo số lượng</p>
            </div>
            <select
              id="top-products-filter"
              value={topFilter}
              onChange={e => setTopFilter(e.target.value as TopFilter)}
              className="h-8 rounded-xl border border-border bg-slate-50 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-200 text-slate-700"
            >
              <option value="month">Tháng này</option>
              <option value="30d">30 ngày qua</option>
              <option value="quarter">Quý này</option>
            </select>
          </div>
          {loading || topLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 skeleton-shimmer rounded-lg" />)}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu</div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, idx) => {
                const pct = Math.round((p.quantitySold / maxQty) * 100);
                const gradients = [
                  "linear-gradient(90deg, #f97316, #ea580c)",
                  "linear-gradient(90deg, #f59e0b, #d97706)",
                  "linear-gradient(90deg, #eab308, #ca8a04)",
                  "linear-gradient(90deg, #84cc16, #65a30d)",
                  "linear-gradient(90deg, #10b981, #059669)",
                ];
                return (
                  <div key={p.productId ?? idx}>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="flex-shrink-0 h-6 w-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                          style={{ background: gradients[idx] }}
                        >
                          {idx + 1}
                        </span>
                        <span className="truncate font-medium text-slate-700">{p.productName}</span>
                      </div>
                      <div className="flex-shrink-0 text-right ml-2">
                        <span className="font-bold text-text">{p.quantitySold}</span>
                        <span className="text-xs text-slate-400 ml-1">sp</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: gradients[idx] }}
                        />
                      </div>
                      <span className="flex-shrink-0 text-xs text-slate-500 w-16 text-right font-medium">{fmt(p.revenue)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 10 đơn hàng gần nhất ── */}
      <div
        className="rounded-2xl bg-white overflow-hidden"
        style={{ border: "1px solid var(--color-border)", boxShadow: "var(--shadow-soft)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-text">Đơn hàng gần nhất</h2>
            <p className="text-xs text-slate-400 mt-0.5">10 đơn hàng mới nhất</p>
          </div>
          <Link
            href="/sales"
            className="flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-soft hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-11 skeleton-shimmer rounded-lg" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
              <ShoppingCart className="h-6 w-6" style={{ color: "#F97316" }} />
            </div>
            <p className="text-sm font-medium">Chưa có đơn hàng</p>
            <p className="text-xs text-slate-300">Các đơn hàng mới sẽ hiển thị ở đây</p>
          </div>
        ) : (
          <div className="erp-table-wrap">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Số đơn</th>
                  <th>Ngày tạo</th>
                  <th>Khách hàng</th>
                  <th className="text-right">Tổng tiền</th>
                  <th className="text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr
                    key={o.id}
                    className="cursor-pointer hover:bg-orange-50/40 transition-colors"
                    onClick={() => router.push(`/sales/${o.id}`)}
                  >
                    <td className="font-mono text-primary text-sm font-medium">{o.orderNo}</td>
                    <td className="text-slate-500 text-sm">{fmtDate(o.createdAt ?? o.orderDate)}</td>
                    <td className="font-medium">{o.customerName}</td>
                    <td className="text-right font-semibold">{fmtFull(o.totalAmount)}</td>
                    <td className="text-center">
                      <Badge tone={ORDER_TONE[o.status] ?? "slate"}>
                        {ORDER_LABEL[o.status] ?? o.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
