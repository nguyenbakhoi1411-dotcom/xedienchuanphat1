"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wallet, Plus, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { cashApi } from "@/features/cash/api";
import { CashSummaryDto, CashReceiptDto, CashPaymentDto, CashLedgerDto } from "@/features/cash/types";

import { ReceiptTable } from "@/components/cash/ReceiptTable";
import { PaymentTable } from "@/components/cash/PaymentTable";
import { CashLedger } from "@/components/cash/CashLedger";
import Link from "next/link";

// Dynamic import for PrintVoucher to avoid SSR issues if needed, but we can just use normal import if it's pure react
// (PrintVoucher component not yet created, we will use window.print() or a hidden div)

type Tab = "phieu-thu" | "phieu-chi" | "dong-tien";

export default function CashPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initTab = (searchParams?.get("tab") as Tab | null) ?? "phieu-thu";
  const [tab, setTab] = useState<Tab>(initTab);

  // ── Header Summary ──
  const [summaryDate, setSummaryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState<CashSummaryDto | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // ── Filters ──
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [keyword, setKeyword] = useState("");

  // ── Data states ──
  const [receipts, setReceipts] = useState<CashReceiptDto[]>([]);
  const [rLoading, setRLoading] = useState(false);

  const [payments, setPayments] = useState<CashPaymentDto[]>([]);
  const [pLoading, setPLoading] = useState(false);

  const [ledger, setLedger] = useState<CashLedgerDto | null>(null);
  const [lLoading, setLLoading] = useState(false);

  // ── Modals (Removed) ──

  // Script load for SheetJS
  useEffect(() => {
    if (!document.getElementById("sheetjs")) {
      const script = document.createElement("script");
      script.id = "sheetjs";
      script.src = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
      document.head.appendChild(script);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = await cashApi.summary(summaryDate);
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  }, [summaryDate]);

  const loadReceipts = useCallback(async () => {
    setRLoading(true);
    try {
      const res = await cashApi.receipts({ fromDate, toDate, keyword, page: 1, size: 100 });
      setReceipts(res.items);
    } catch (err) {
      toast.error("Lỗi tải danh sách phiếu thu");
    } finally {
      setRLoading(false);
    }
  }, [fromDate, toDate, keyword]);

  const loadPayments = useCallback(async () => {
    setPLoading(true);
    try {
      const res = await cashApi.payments({ fromDate, toDate, keyword, page: 1, size: 100 });
      setPayments(res.items);
    } catch (err) {
      toast.error("Lỗi tải danh sách phiếu chi");
    } finally {
      setPLoading(false);
    }
  }, [fromDate, toDate, keyword]);

  const loadLedger = useCallback(async () => {
    setLLoading(true);
    try {
      const data = await cashApi.ledger(fromDate, toDate);
      setLedger(data);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu sổ quỹ");
    } finally {
      setLLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  useEffect(() => {
    if (tab === "phieu-thu") loadReceipts();
    else if (tab === "phieu-chi") loadPayments();
    else loadLedger();
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }, [tab, loadReceipts, loadPayments, loadLedger]);

  const handleRefresh = () => {
    loadSummary();
    if (tab === "phieu-thu") loadReceipts();
    else if (tab === "phieu-chi") loadPayments();
    else loadLedger();
  };

  const currentBalance = summary?.tonQuyHienTai || 0;

  // ── Actions ──
  const confirmReceipt = async (id: number) => {
    try {
      await cashApi.confirmReceipt(id);
      toast.success("Đã xác nhận ghi sổ thành công");
      loadReceipts();
      loadSummary();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi xác nhận");
    }
  };
  const cancelReceipt = async (id: number) => {
    try {
      await cashApi.cancelReceipt(id);
      toast.success("Đã hủy phiếu thu");
      loadReceipts();
      loadSummary();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi hủy");
    }
  };
  const printReceipt = (item: CashReceiptDto) => {
    // Demo print - in real life we would open a dialog with print layout
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Phiếu thu</title><style>body{font-family:sans-serif;padding:20px;}</style></head><body>
          <h2>PHIẾU THU</h2>
          <p>Mã: ${item.voucherNo}</p>
          <p>Ngày: ${new Date(item.receiptDate).toLocaleDateString("vi-VN")}</p>
          <p>Người nộp: ${item.payerName || ""}</p>
          <p>Lý do: ${item.description || ""}</p>
          <p>Số tiền: <b>${new Intl.NumberFormat("vi-VN").format(item.amount)} đ</b></p>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const confirmPayment = async (id: number) => {
    try {
      await cashApi.confirmPayment(id);
      toast.success("Đã xác nhận ghi sổ thành công");
      loadPayments();
      loadSummary();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi xác nhận");
    }
  };
  const cancelPayment = async (id: number) => {
    try {
      await cashApi.cancelPayment(id);
      toast.success("Đã hủy phiếu chi");
      loadPayments();
      loadSummary();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi hủy");
    }
  };
  const printPayment = (item: CashPaymentDto) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Phiếu chi</title><style>body{font-family:sans-serif;padding:20px;}</style></head><body>
          <h2>PHIẾU CHI</h2>
          <p>Mã: ${item.voucherNo}</p>
          <p>Ngày: ${new Date(item.paymentDate).toLocaleDateString("vi-VN")}</p>
          <p>Người nhận: ${item.payeeName || ""}</p>
          <p>Lý do: ${item.description || ""}</p>
          <p>Số tiền: <b>${new Intl.NumberFormat("vi-VN").format(item.amount)} đ</b></p>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 min-h-full">
      {/* ── HEADER XANH LÁ MISA AMIS ── */}
      <div className="bg-[#007042] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-none tracking-tight">Tiền mặt</h1>
                <p className="text-emerald-100 text-sm mt-1">Quản lý thu chi và quỹ tiền mặt</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="date" 
                value={summaryDate} 
                onChange={e => setSummaryDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white rounded-md px-3 py-1.5 text-sm outline-none"
              />
              <Button onClick={handleRefresh} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <p className="text-emerald-100 font-medium text-sm mb-1">Tồn quỹ đầu ngày</p>
              <div className="text-xl font-bold">
                {summaryLoading ? "..." : new Intl.NumberFormat("vi-VN").format(summary?.tonQuyDauNgay || 0)}
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <p className="text-emerald-100 font-medium text-sm mb-1">Thu trong ngày</p>
              <div className="text-xl font-bold">
                +{summaryLoading ? "..." : new Intl.NumberFormat("vi-VN").format(summary?.tongThuTrongNgay || 0)}
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <p className="text-emerald-100 font-medium text-sm mb-1">Chi trong ngày</p>
              <div className="text-xl font-bold">
                -{summaryLoading ? "..." : new Intl.NumberFormat("vi-VN").format(summary?.tongChiTrongNgay || 0)}
              </div>
            </div>
            <div className={`rounded-xl p-4 backdrop-blur-sm border ${summary?.isAmQuy ? 'bg-red-500/80 border-red-400' : 'bg-white/20 border-white/30'}`}>
              <p className="text-white font-medium text-sm mb-1">Tồn quỹ hiện tại {summary?.isAmQuy && "(CẢNH BÁO ÂM)"}</p>
              <div className="text-xl font-bold">
                {summaryLoading ? "..." : new Intl.NumberFormat("vi-VN").format(summary?.tonQuyHienTai || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS & CONTROLS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-white rounded-lg p-1 border shadow-sm">
            <button
              onClick={() => setTab("phieu-thu")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === "phieu-thu" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Phiếu thu
            </button>
            <button
              onClick={() => setTab("phieu-chi")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === "phieu-chi" ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Phiếu chi
            </button>
            <button
              onClick={() => setTab("dong-tien")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === "dong-tien" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Dòng tiền (Sổ quỹ)
            </button>
          </div>

          <div className="flex items-center gap-3">
            {tab !== "dong-tien" && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo mã, tên..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:border-emerald-500 transition-colors w-64"
                />
              </div>
            )}

            <div className="flex items-center gap-2 bg-white border rounded-md p-1 shadow-sm">
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-2 py-1 text-sm outline-none text-slate-700" />
              <span className="text-slate-300">-</span>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-2 py-1 text-sm outline-none text-slate-700" />
            </div>

            {tab === "phieu-thu" && (
              <Link href="/cash/receipt/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow-sm h-9 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Thêm phiếu thu
              </Link>
            )}
            {tab === "phieu-chi" && (
              <Link href="/cash/payment/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow-sm h-9 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Thêm phiếu chi
              </Link>
            )}
          </div>
        </div>

        {/* ── CONTENTS ── */}
        <div className="pb-20">
          {tab === "phieu-thu" && (
            <ReceiptTable 
              data={receipts} 
              loading={rLoading} 
              onConfirm={confirmReceipt} 
              onCancel={cancelReceipt}
              onPrint={printReceipt}
            />
          )}
          {tab === "phieu-chi" && (
            <PaymentTable 
              data={payments} 
              loading={pLoading} 
              onConfirm={confirmPayment} 
              onCancel={cancelPayment}
              onPrint={printPayment}
            />
          )}
          {tab === "dong-tien" && (
            <CashLedger 
              data={ledger} 
              loading={lLoading} 
            />
          )}
        </div>
      </div>

    </div>
  );
}
