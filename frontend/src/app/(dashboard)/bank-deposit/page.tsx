"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Plus,
  ArrowRightLeft,
  Upload,
  FileText,
  X,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BankReceiptForm } from "@/modules/bank-deposit/forms/BankReceiptForm";
import { BankPaymentForm } from "@/modules/bank-deposit/forms/BankPaymentForm";
import { bankDepositApi } from "@/modules/bank-deposit/api/bank-deposit.api";
import type {
  BankAccount,
  BankTransaction,
  BankStatementLineDTO,
  ImportStatementResult,
  AutoMatchResult,
  BANK_NAMES,
} from "@/modules/bank-deposit/types";
import { BANK_NAMES as BANK_NAME_LIST } from "@/modules/bank-deposit/types";
import {
  useBankAccounts,
  useBankTransactions,
  useMatchBankReconciliation,
  useCreateBankAccount,
  useUpdateBankAccount,
  useAccountSummary,
  useImportStatement,
  useAutoMatch,
  useStatementLines,
} from "@/modules/bank-deposit/hooks";
import { useReceipts, usePayments } from "@/features/accounting/hooks";

// ─── Formatting helpers ──────────────────────────────────────────────────────

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
export default function BankDepositPage() {
  // ── Tabs ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"transactions" | "reconciliation" | "accounts">(
    "transactions"
  );

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountFormMode, setAccountFormMode] = useState<"create" | "edit">("create");
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);

  // ── Account form fields ───────────────────────────────────────────────────
  const [accBankName, setAccBankName] = useState("");
  const [accNumber, setAccNumber] = useState("");
  const [accName, setAccName] = useState("");
  const [accOpeningBalance, setAccOpeningBalance] = useState<number>(0);
  const [accBranch, setAccBranch] = useState("");
  const [accCode, setAccCode] = useState("1121");
  const [accIsActive, setAccIsActive] = useState(true);

  // ── Selected account ──────────────────────────────────────────────────────
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  // ── Date filters ──────────────────────────────────────────────────────────
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(lastDayOfMonth);
  const [page, setPage] = useState(1);

  // ── Reconciliation selection state ────────────────────────────────────────
  const [selectedBankTxIds, setSelectedBankTxIds] = useState<string[]>([]);
  const [selectedSysVoucherIds, setSelectedSysVoucherIds] = useState<number[]>([]);

  // ── Statement import state ────────────────────────────────────────────────
  const [importResult, setImportResult] = useState<ImportStatementResult | null>(null);
  const [autoMatchResult, setAutoMatchResult] = useState<AutoMatchResult | null>(null);
  const [statementFilter, setStatementFilter] = useState<string | undefined>(undefined);
  const [statementPage, setStatementPage] = useState(0);
  const [selectedStatementLineIds, setSelectedStatementLineIds] = useState<number[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Data Fetching
  // ─────────────────────────────────────────────────────────────────────────

  // Accounts list
  const {
    data: rawAccounts = [],
    isLoading: loadingAccounts,
    refetch: refetchAccounts,
  } = useBankAccounts();

  // The API layer already returns BankAccount (with aliases), so no extra mapping needed
  const accounts = (Array.isArray(rawAccounts) ? rawAccounts : []).map((acc: any) => ({
    ...acc,
    accountNumber: acc.accountNumber || acc.accountNo || "",
    accountName: acc.accountHolder || acc.accountName || "",
    balance: acc.currentBalance ?? acc.openingBalance ?? 0,
    isActive: acc.active ?? true,
    bankBranch: acc.chiNhanhNganHang || acc.bankBranch || "",
  })) as BankAccount[];

  // Keep selectedAccount reference fresh
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0]);
    } else if (selectedAccount) {
      const updated = accounts.find((a) => a.id === selectedAccount.id);
      if (updated) setSelectedAccount(updated);
    }
  }, [accounts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Account summary for header widgets
  const { data: accountSummary } = useAccountSummary(
    selectedAccount?.id,
    fromDate,
    toDate
  );

  // Transactions
  const transactionParams = useMemo(
    () => ({
      bankAccountId: selectedAccount?.id,
      startDate: fromDate || undefined,
      endDate: toDate || undefined,
      page,
      limit: 20,
    }),
    [selectedAccount, fromDate, toDate, page]
  );

  const {
    data: txResponse,
    isLoading: loadingTx,
    refetch: refetchTransactions,
  } = useBankTransactions(transactionParams);

  // PagedResponse<BankTransaction> → items + totalItems
  const rawTransactions: BankTransaction[] = (txResponse as any)?.items ?? [];
  const totalTransactions = (txResponse as any)?.totalItems ?? 0;

  // Enrich transactions with display aliases
  const transactions = useMemo(() => {
    return rawTransactions.map((tx) => {
      const creditAmount = tx.loaiGiaoDich === "RECEIPT" ? tx.soTien : 0;
      const debitAmount = tx.loaiGiaoDich === "PAYMENT" ? tx.soTien : 0;
      return {
        ...tx,
        // display helpers
        transactionDate: tx.ngayGiaoDich,
        description: tx.lyDo,
        creditAmount,
        debitAmount,
        runningBalance: 0, // backend may or may not send this; leave 0 as default
        reconciled:
          tx.trangThaiDoiChieu === "MATCHED" ||
          tx.trangThai === "CONFIRMED",
      };
    });
  }, [rawTransactions]);

  // System vouchers (general ledger) for the reconciliation tab
  const { data: systemReceiptsResponse, isLoading: loadingSysReceipts } = useReceipts({
    page: 1,
    pageSize: 100,
    keyword: "",
    status: "ALL",
    method: "ALL",
  });
  const { data: systemPaymentsResponse, isLoading: loadingSysPayments } = usePayments({
    page: 1,
    pageSize: 100,
    keyword: "",
    status: "ALL",
    method: "ALL",
  });

  const systemReceipts = systemReceiptsResponse?.items ?? [];
  const systemPayments = systemPaymentsResponse?.items ?? [];

  const systemVouchers = useMemo(() => {
    return [
      ...systemReceipts.map((r) => ({
        id: r.id,
        voucherNo: r.voucherNo,
        voucherDate: r.receiptDate,
        description: r.reason || "Thu tiền mặt",
        totalAmount: r.amount,
        voucherType: "RECEIPT",
        status: r.status,
      })),
      ...systemPayments.map((p) => ({
        id: p.id,
        voucherNo: p.voucherNo,
        voucherDate: p.paymentDate,
        description: p.reason || "Chi tiền mặt",
        totalAmount: p.amount,
        voucherType: "PAYMENT",
        status: p.status,
      })),
    ];
  }, [systemReceipts, systemPayments]);

  // Statement lines (after import)
  const { data: statementLinesData, isLoading: loadingLines, refetch: refetchLines } =
    useStatementLines(importResult?.statementId, statementFilter, statementPage, 50);

  const statementLines: BankStatementLineDTO[] = statementLinesData?.items ?? statementLinesData ?? [];

  // ── Unmatched lists ───────────────────────────────────────────────────────
  const unmatchedBankTransactions = useMemo(
    () => transactions.filter((tx) => !tx.reconciled),
    [transactions]
  );

  const unmatchedSystemVouchers = useMemo(
    () => systemVouchers.filter((v) => v.status === "POSTED"),
    [systemVouchers]
  );

  // ── Reconciliation variance ───────────────────────────────────────────────
  const bankSelectedSum = useMemo(
    () =>
      statementLines
        .filter((line) => selectedStatementLineIds.includes(line.id))
        .reduce((sum, line) => sum + (line.soTienThu || line.soTienChi || 0), 0),
    [selectedStatementLineIds, statementLines]
  );

  const systemSelectedSum = useMemo(
    () =>
      systemVouchers
        .filter((v) => selectedSysVoucherIds.includes(v.id))
        .reduce((sum, v) => sum + v.totalAmount, 0),
    [selectedSysVoucherIds, systemVouchers]
  );

  const calculatedDifference = bankSelectedSum - systemSelectedSum;

  // ─────────────────────────────────────────────────────────────────────────
  // Mutations
  // ─────────────────────────────────────────────────────────────────────────
  const createAccountMutation = useCreateBankAccount();
  const updateAccountMutation = useUpdateBankAccount();
  const matchMutation = useMatchBankReconciliation();
  const importStatementMutation = useImportStatement();
  const autoMatchMutation = useAutoMatch();

  const loadTransactions = useCallback(() => {
    refetchTransactions();
    refetchAccounts();
  }, [refetchTransactions, refetchAccounts]);

  // ─────────────────────────────────────────────────────────────────────────
  // Account form handlers
  // ─────────────────────────────────────────────────────────────────────────
  const resetAccountForm = () => {
    setAccBankName("");
    setAccNumber("");
    setAccName("");
    setAccOpeningBalance(0);
    setAccBranch("");
    setAccCode("1121");
    setAccIsActive(true);
    setEditingAccountId(null);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accBankName || !accNumber || !accName) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    if (accountFormMode === "create") {
      createAccountMutation.mutate(
        {
          bankName: accBankName,
          accountNumber: accNumber,      // backend field
          accountHolder: accName,        // backend field
          openingBalance: accOpeningBalance,
          chiNhanhNganHang: accBranch || undefined, // backend field
          accountingCode: accCode,
          currency: "VND",
        },
        {
          onSuccess: () => {
            setIsAccountModalOpen(false);
            resetAccountForm();
            refetchAccounts();
          },
        }
      );
    } else {
      if (!editingAccountId) return;
      updateAccountMutation.mutate(
        {
          id: editingAccountId,
          data: {
            bankName: accBankName,
            accountHolder: accName,           // backend field
            chiNhanhNganHang: accBranch || undefined, // backend field
            accountingCode: accCode,
            active: accIsActive,              // backend field
          },
        },
        {
          onSuccess: () => {
            setIsAccountModalOpen(false);
            resetAccountForm();
            refetchAccounts();
          },
        }
      );
    }
  };

  const openEditAccount = (acc: BankAccount) => {
    setAccountFormMode("edit");
    setEditingAccountId(acc.id);
    setAccBankName(acc.bankName);
    setAccNumber(acc.accountNumber);    // use DTO field
    setAccName(acc.accountHolder);      // use DTO field
    setAccOpeningBalance(acc.openingBalance ?? 0);
    setAccBranch(acc.chiNhanhNganHang ?? "");
    setAccCode(acc.accountingCode ?? "1121");
    setAccIsActive(acc.active);         // use DTO field
    setIsAccountModalOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Statement import handlers
  // ─────────────────────────────────────────────────────────────────────────
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedAccount) {
      toast.error("Vui lòng chọn tài khoản ngân hàng trước khi nhập sao kê");
      return;
    }
    setImporting(true);
    try {
      const result = await importStatementMutation.mutateAsync({
        file,
        bankAccountId: selectedAccount.id,
        nganHang: selectedAccount.bankName.includes("Techcombank") ? "TCB" : selectedAccount.bankName.includes("MB") ? "MB" : "VCB",
      });
      setImportResult(result);
      setAutoMatchResult(null);
      setSelectedStatementLineIds([]);
      setStatementPage(0);
      toast.success(
        `Nhập thành công ${result.tongSoDong} dòng sao kê (${result.soDoiChieuDuoc} đã khớp tự động)`
      );
    } catch {
      // error is toasted by the mutation
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAutoMatch() {
    if (!importResult) return;
    try {
      const result = await autoMatchMutation.mutateAsync(importResult.statementId);
      setAutoMatchResult(result);
      refetchLines();
    } catch {
      // error is toasted by the mutation
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Reconciliation pair-match handler
  // ─────────────────────────────────────────────────────────────────────────
  const handleMatch = () => {
    if (selectedStatementLineIds.length !== 1 || selectedSysVoucherIds.length !== 1) {
      toast.warning("Vui lòng chọn chính xác 1 dòng sao kê và 1 giao dịch hệ thống để ghép đôi");
      return;
    }
    
    if (!importResult) {
       toast.error("Không tìm thấy thông tin sao kê");
       return;
    }

    matchMutation.mutate(
      {
        statementId: importResult.statementId,
        lineId: selectedStatementLineIds[0],
        bankTransactionId: selectedSysVoucherIds[0],
      },
      {
        onSuccess: () => {
          setSelectedStatementLineIds([]);
          setSelectedSysVoucherIds([]);
          loadTransactions();
          refetchLines();
        },
      }
    );
  };

  const toggleSelectAllBank = () => {
    if (selectedBankTxIds.length === unmatchedBankTransactions.length) {
      setSelectedBankTxIds([]);
    } else {
      setSelectedBankTxIds(unmatchedBankTransactions.map((t) => String(t.id)));
    }
  };

  const toggleSelectAllSys = () => {
    if (selectedSysVoucherIds.length === unmatchedSystemVouchers.length) {
      setSelectedSysVoucherIds([]);
    } else {
      setSelectedSysVoucherIds(unmatchedSystemVouchers.map((v) => v.id));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col space-y-6 w-full pb-10">
      {/* ─── HEADER ────────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-gradient-to-r from-blue-900 to-indigo-800 text-white px-6 py-5 mb-5 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tiền gửi ngân hàng</h1>
            <p className="text-blue-200 text-sm mt-0.5">Giao dịch và đối chiếu sao kê ngân hàng</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowReceipt(true)}
              className="bg-white text-blue-800 hover:bg-blue-50 font-semibold shadow-sm"
            >
              + Thu tiền NH
            </Button>
            <Button
              onClick={() => setShowPayment(true)}
              className="bg-white/20 text-white hover:bg-white/30 font-semibold backdrop-blur-sm"
            >
              + Chi tiền NH
            </Button>
          </div>
        </div>

        {/* ── Account cards ── */}
        {loadingAccounts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
            <Skeleton className="h-24 bg-white/5 border border-white/10 rounded-lg" />
            <Skeleton className="h-24 bg-white/5 border border-white/10 rounded-lg" />
            <Skeleton className="h-24 bg-white/5 border border-white/10 rounded-lg" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center bg-white/5 border border-dashed border-white/20 rounded-lg p-5 mt-5 text-blue-200 text-sm">
            Chưa có tài khoản ngân hàng nào được đăng ký. Hãy chuyển qua tab Tài khoản NH để thêm mới.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => {
                  setSelectedAccount(acc);
                  setPage(1);
                }}
                className={`rounded-lg p-3 text-left transition duration-200 ${
                  selectedAccount?.id === acc.id
                    ? "bg-white/25 ring-2 ring-white/50 shadow-md"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Landmark className="h-4 w-4 text-blue-200" />
                  <span className="text-xs text-blue-200 truncate">{acc.bankName}</span>
                  {acc.isDefault && (
                    <span className="ml-auto text-[10px] bg-yellow-400/20 text-yellow-300 rounded px-1.5 py-0.5 font-bold">
                      Mặc định
                    </span>
                  )}
                </div>
                {/* accountNumber from DTO (also exposed as accountNo via alias) */}
                <p className="font-mono text-sm tracking-wide">{acc.accountNumber}</p>
                <p className="text-lg font-bold mt-1">{fmt(acc.currentBalance)}</p>
              </button>
            ))}
          </div>
        )}

        {/* ── Summary widgets (only when account selected & summary loaded) ── */}
        {selectedAccount && accountSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-white/10 rounded-lg p-3 flex flex-col gap-1">
              <span className="text-xs text-blue-200 flex items-center gap-1">
                <Activity className="h-3 w-3" /> Số dư đầu kỳ
              </span>
              <span className="font-bold text-base">{fmt(accountSummary.soDuDauKy)}</span>
            </div>
            <div className="bg-white/10 rounded-lg p-3 flex flex-col gap-1">
              <span className="text-xs text-blue-200 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-300" /> Tổng thu
              </span>
              <span className="font-bold text-base text-emerald-300">
                +{fmt(accountSummary.tongThuTrongKy)}
              </span>
            </div>
            <div className="bg-white/10 rounded-lg p-3 flex flex-col gap-1">
              <span className="text-xs text-blue-200 flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-red-300" /> Tổng chi
              </span>
              <span className="font-bold text-base text-red-300">
                -{fmt(accountSummary.tongChiTrongKy)}
              </span>
            </div>
            <div className="bg-white/10 rounded-lg p-3 flex flex-col gap-1">
              <span className="text-xs text-blue-200 flex items-center gap-1">
                <ArrowRightLeft className="h-3 w-3 text-yellow-300" /> Chưa đối chiếu
              </span>
              <span className="font-bold text-base text-yellow-300">
                {accountSummary.soGiaoDichChuaDcDoiChieu} GD
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── TAB BAR ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-20 px-4 -mx-4 md:px-6 flex items-center justify-between shadow-sm">
        <div className="flex space-x-8">
          {(["transactions", "reconciliation", "accounts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab === "transactions" && "Giao dịch"}
              {tab === "reconciliation" && "Đối chiếu"}
              {tab === "accounts" && "Tài khoản NH"}
            </button>
          ))}
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadTransactions}
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Làm mới
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB: GIAO DỊCH                                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "transactions" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Tài khoản thanh toán
              </label>
              <select
                value={String(selectedAccount?.id ?? "")}
                onChange={(e) => {
                  const acc = accounts.find((a) => String(a.id) === e.target.value);
                  if (acc) setSelectedAccount(acc);
                  setPage(1);
                }}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={String(acc.id)}>
                    {acc.bankName} - {acc.accountNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" /> Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="erp-input"
              />
            </div>

            <div className="w-full md:w-48">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" /> Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="erp-input"
              />
            </div>
          </div>

          {/* Transaction Table */}
          {loadingTx ? (
            <div className="space-y-3 py-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-10">
              <EmptyState
                title="Không có giao dịch"
                description="Chọn tài khoản và khoảng ngày để xem giao dịch"
              />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="erp-table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase border-b border-gray-100">
                    <th className="py-3 px-4">Số CT</th>
                    <th className="py-3 px-4">Ngày</th>
                    <th className="py-3 px-4">Mô tả</th>
                    <th className="py-3 px-4">Loại</th>
                    <th className="py-3 px-4 text-right text-emerald-600">Tiền vào</th>
                    <th className="py-3 px-4 text-right text-red-600">Tiền ra</th>
                    <th className="py-3 px-4 text-center">Đối chiếu</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 bg-white">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition duration-150">
                      {/* maGiaoDich → docNo alias */}
                      <td className="py-3.5 px-4 font-mono text-xs text-blue-900 font-semibold whitespace-nowrap">
                        {tx.maGiaoDich}
                      </td>
                      {/* ngayGiaoDich → docDate alias */}
                      <td className="py-3.5 px-4 font-medium text-gray-600 whitespace-nowrap">
                        {fmtDate(tx.ngayGiaoDich)}
                      </td>
                      {/* lyDo */}
                      <td
                        className="py-3.5 px-4 max-w-xs truncate text-gray-800"
                        title={tx.lyDo ?? ""}
                      >
                        {tx.lyDo ?? "—"}
                      </td>
                      {/* loaiThuChi → subType alias */}
                      <td className="py-3.5 px-4 text-gray-500 text-xs">{tx.subType}</td>
                      {/* soTien → amount alias */}
                      <td className="py-3.5 px-4 text-right text-emerald-600 font-semibold whitespace-nowrap">
                        {tx.loaiGiaoDich === "RECEIPT" ? fmt(tx.soTien) : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-red-600 font-semibold whitespace-nowrap">
                        {tx.loaiGiaoDich === "PAYMENT" ? fmt(tx.soTien) : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          tone={
                            tx.trangThaiDoiChieu === "MATCHED"
                              ? "green"
                              : tx.trangThaiDoiChieu === "DISCREPANCY"
                              ? "amber"
                              : "slate"
                          }
                        >
                          {tx.trangThaiDoiChieu === "MATCHED"
                            ? "Đã khớp"
                            : tx.trangThaiDoiChieu === "DISCREPANCY"
                            ? "Chênh lệch"
                            : "Chưa khớp"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          tone={
                            tx.trangThai === "CONFIRMED"
                              ? "green"
                              : tx.trangThai === "CANCELLED"
                              ? "red"
                              : "slate"
                          }
                        >
                          {tx.trangThai === "CONFIRMED"
                            ? "Đã duyệt"
                            : tx.trangThai === "CANCELLED"
                            ? "Đã hủy"
                            : "Nháp"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loadingTx && totalTransactions > 20 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
              <span>
                Hiển thị {transactions.length} trên tổng số {totalTransactions} giao dịch
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * 20 >= totalTransactions}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB: ĐỐI CHIẾU                                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "reconciliation" && (
        <div className="flex flex-col space-y-4">
          {/* ── Upload panel ── */}
          <div className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Nhập sao kê ngân hàng
                  </h3>
                  <p className="text-xs text-gray-400">
                    Upload file từ Internet Banking để hệ thống tự động đối chiếu.
                    Hỗ trợ: VCB, Techcombank, BIDV, MB, ACB…
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {importResult && (
                  <>
                    <button
                      onClick={handleAutoMatch}
                      disabled={autoMatchMutation.isPending}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      {autoMatchMutation.isPending ? "Đang ghép..." : "Tự động ghép"}
                    </button>
                    <button
                      onClick={() => {
                        setImportResult(null);
                        setAutoMatchResult(null);
                        setSelectedStatementLineIds([]);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" /> Xóa sao kê
                    </button>
                  </>
                )}
                <button
                  id="bank-statement-upload"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing || importStatementMutation.isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {importing ? "Đang tải..." : "Chọn file sao kê"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {/* Import result summary */}
            {importResult ? (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">
                    Sao kê #{importResult.statementId}
                  </span>
                  <span className="text-xs text-gray-500">
                    Tổng {importResult.tongSoDong} dòng
                  </span>
                  <Badge tone="green">{importResult.soDoiChieuDuoc} đã khớp</Badge>
                  <Badge tone="amber">{importResult.soCanXemLai} cần xem lại</Badge>
                </div>

                {/* Auto-match result */}
                {autoMatchResult && (
                  <div className="mt-3 flex items-center gap-3 text-xs flex-wrap">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-gray-700">
                      Tự động ghép:{" "}
                      <strong className="text-emerald-700">{autoMatchResult.soTuDongGhep}</strong>{" "}
                      khớp,{" "}
                      <strong className="text-yellow-700">{autoMatchResult.soCanXemLai}</strong>{" "}
                      cần xem lại,{" "}
                      <strong className="text-red-700">{autoMatchResult.soKhongGhepDuoc}</strong>{" "}
                      không ghép được
                    </span>
                  </div>
                )}

                {/* Filter bar for statement lines */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[
                    { value: undefined, label: "Tất cả" },
                    { value: "UNMATCHED", label: "Chưa khớp" },
                    { value: "MATCHED", label: "Đã khớp" },
                    { value: "IGNORED", label: "Bỏ qua" },
                  ].map(({ value, label }) => (
                    <button
                      key={label}
                      onClick={() => {
                        setStatementFilter(value);
                        setStatementPage(0);
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        statementFilter === value
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/30 py-10 text-center">
                <Upload className="h-8 w-8 text-blue-300 mb-2" />
                <p className="text-sm text-gray-500">Chưa có file sao kê nào được tải lên</p>
                <p className="text-xs text-gray-400 mt-1">
                  Xuất CSV/Excel từ Internet Banking, sau đó tải lên đây để tự động đối chiếu
                </p>
              </div>
            )}
          </div>

          {/* ── Two-column view: Statement lines ↔ System transactions ── */}
          {importResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Left: Statement lines from backend */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col h-[520px]">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                    <h3 className="font-bold text-gray-800">Sao kê ngân hàng</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Từ file đã nhập</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loadingLines ? (
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : statementLines.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                      <p className="text-sm font-medium">Không có dòng sao kê nào</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold sticky top-0 z-10">
                          <th className="py-2.5 px-2 text-center w-8">
                            <input
                              type="checkbox"
                              checked={
                                selectedStatementLineIds.length === statementLines.length &&
                                statementLines.length > 0
                              }
                              onChange={() => {
                                if (selectedStatementLineIds.length === statementLines.length) {
                                  setSelectedStatementLineIds([]);
                                } else {
                                  setSelectedStatementLineIds(statementLines.map((l) => l.id));
                                }
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                            />
                          </th>
                          <th className="py-2.5 px-2">Ngày</th>
                          <th className="py-2.5 px-2">Mô tả</th>
                          <th className="py-2.5 px-2 text-right">Thu</th>
                          <th className="py-2.5 px-2 text-right">Chi</th>
                          <th className="py-2.5 px-2 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {statementLines.map((line) => {
                          const isSelected = selectedStatementLineIds.includes(line.id);
                          return (
                            <tr
                              key={line.id}
                              className={`hover:bg-indigo-50/30 transition-colors duration-150 cursor-pointer ${
                                isSelected ? "bg-indigo-50/50" : ""
                              }`}
                              onClick={() => {
                                setSelectedStatementLineIds((prev) =>
                                  isSelected
                                    ? prev.filter((id) => id !== line.id)
                                    : [...prev, line.id]
                                );
                              }}
                            >
                              <td className="py-2.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    setSelectedStatementLineIds((prev) =>
                                      isSelected
                                        ? prev.filter((id) => id !== line.id)
                                        : [...prev, line.id]
                                    );
                                  }}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                                />
                              </td>
                              <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">
                                {fmtDate(line.ngayGiaoDich)}
                              </td>
                              <td
                                className="py-2.5 px-2 text-gray-700 max-w-[150px] truncate"
                                title={line.moTa ?? ""}
                              >
                                {line.moTa ?? "—"}
                              </td>
                              <td className="py-2.5 px-2 text-right text-emerald-600 font-semibold whitespace-nowrap">
                                {line.soTienThu > 0 ? fmt(line.soTienThu) : ""}
                              </td>
                              <td className="py-2.5 px-2 text-right text-red-600 font-semibold whitespace-nowrap">
                                {line.soTienChi > 0 ? fmt(line.soTienChi) : ""}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <Badge
                                  tone={
                                    line.trangThaiDoiChieu === "MATCHED"
                                      ? "green"
                                      : line.trangThaiDoiChieu === "IGNORED"
                                      ? "slate"
                                      : "amber"
                                  }
                                >
                                  {line.trangThaiDoiChieu === "MATCHED"
                                    ? "Khớp"
                                    : line.trangThaiDoiChieu === "IGNORED"
                                    ? "Bỏ qua"
                                    : "Chưa khớp"}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Statement pagination */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{statementLines.length} dòng hiển thị</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={statementPage === 0}
                      onClick={() => setStatementPage((p) => Math.max(0, p - 1))}
                      className="text-xs border-gray-200"
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={statementLines.length < 50}
                      onClick={() => setStatementPage((p) => p + 1)}
                      className="text-xs border-gray-200"
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right: System transactions */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col h-[520px]">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <h3 className="font-bold text-gray-800">Giao dịch hệ thống</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Phiếu thu/chi đã ghi sổ</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loadingSysReceipts || loadingSysPayments ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : unmatchedSystemVouchers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                      <p className="text-sm font-medium">Tất cả chứng từ hệ thống đã được khớp!</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold sticky top-0 z-10">
                          <th className="py-2.5 px-2 text-center w-8">
                            <input
                              type="checkbox"
                              checked={
                                selectedSysVoucherIds.length === unmatchedSystemVouchers.length &&
                                unmatchedSystemVouchers.length > 0
                              }
                              onChange={toggleSelectAllSys}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                            />
                          </th>
                          <th className="py-2.5 px-2">Ngày</th>
                          <th className="py-2.5 px-2">Số phiếu</th>
                          <th className="py-2.5 px-2">Mô tả</th>
                          <th className="py-2.5 px-2 text-right">Số tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {unmatchedSystemVouchers.map((v) => {
                          const isSelected = selectedSysVoucherIds.includes(v.id);
                          const isReceipt = v.voucherType === "RECEIPT";
                          return (
                            <tr
                              key={v.id}
                              className={`hover:bg-blue-50/35 transition-colors duration-150 ${
                                isSelected ? "bg-blue-50/50" : ""
                              }`}
                            >
                              <td className="py-2.5 px-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    setSelectedSysVoucherIds((prev) =>
                                      isSelected
                                        ? prev.filter((id) => id !== v.id)
                                        : [...prev, v.id]
                                    );
                                  }}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                                />
                              </td>
                              <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">
                                {fmtDate(v.voucherDate)}
                              </td>
                              <td className="py-2.5 px-2 font-mono text-blue-900 font-semibold">
                                {v.voucherNo}
                              </td>
                              <td
                                className="py-2.5 px-2 text-gray-700 max-w-xs truncate"
                                title={v.description ?? ""}
                              >
                                {v.description}
                              </td>
                              <td
                                className={`py-2.5 px-2 text-right font-bold whitespace-nowrap ${
                                  isReceipt ? "text-emerald-600" : "text-red-600"
                                }`}
                              >
                                {isReceipt ? "+" : "-"} {fmt(v.totalAmount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Pair-match footer (always visible in reconciliation tab) ── */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Chênh lệch đối chiếu
              </span>
              <span
                className={`text-xl font-extrabold transition-all duration-300 ${
                  calculatedDifference === 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                Chưa đối chiếu: {fmt(calculatedDifference)}
              </span>
              {calculatedDifference !== 0 && (
                <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="h-3 w-3" /> Số tiền lựa chọn chưa cân khớp tuyệt đối.
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStatementLineIds([]);
                  setSelectedSysVoucherIds([]);
                  toast.info("Đã bỏ chọn");
                }}
                disabled={selectedStatementLineIds.length === 0 && selectedSysVoucherIds.length === 0}
                className="border-gray-200 hover:bg-gray-50"
              >
                Hủy chọn
              </Button>
              <Button
                onClick={handleMatch}
                disabled={
                  selectedStatementLineIds.length !== 1 ||
                  selectedSysVoucherIds.length !== 1 ||
                  matchMutation.isPending
                }
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 font-bold shadow-md"
              >
                {matchMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="animate-spin h-4 w-4" /> Đang ghép đôi...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4" /> Ghép đôi
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB: TÀI KHOẢN NH                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "accounts" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Danh sách tài khoản ngân hàng</h3>
              <p className="text-xs text-gray-400">Danh mục tài khoản thanh toán sử dụng hạch toán giao dịch.</p>
            </div>
            <Button
              className="bg-blue-800 hover:bg-blue-900 text-white font-medium shadow-sm"
              onClick={() => {
                setAccountFormMode("create");
                resetAccountForm();
                setIsAccountModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> + Thêm tài khoản
            </Button>
          </div>

          {loadingAccounts ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="Chưa có tài khoản"
                description="Hãy nhấn Thêm tài khoản để bắt đầu quản lý dòng tiền."
              />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase border-b border-gray-100">
                    <th className="py-3.5 px-4">Tên ngân hàng</th>
                    <th className="py-3.5 px-4">Số tài khoản</th>
                    <th className="py-3.5 px-4">Chủ tài khoản</th>
                    <th className="py-3.5 px-4">Mã kế toán</th>
                    <th className="py-3.5 px-4 text-right">Số dư hiện tại</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-4 text-gray-800 font-bold">
                        {acc.bankName}
                        {acc.isDefault && (
                          <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-700 rounded px-1.5 py-0.5 font-bold">
                            Mặc định
                          </span>
                        )}
                      </td>
                      {/* accountNumber from DTO */}
                      <td className="py-3.5 px-4 font-mono text-gray-600">{acc.accountNumber}</td>
                      {/* accountHolder from DTO */}
                      <td className="py-3.5 px-4 text-gray-700">{acc.accountHolder || "—"}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-500">
                        {acc.accountingCode}
                      </td>
                      {/* currentBalance from DTO */}
                      <td className="py-3.5 px-4 text-right text-indigo-800 font-extrabold">
                        {fmt(acc.currentBalance)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {/* active from DTO (also exposed as isActive alias) */}
                        <Badge tone={acc.active ? "green" : "slate"}>
                          {acc.active ? "Đang hoạt động" : "Ngừng hoạt động"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-500 hover:text-blue-700 border-gray-200 bg-white"
                          onClick={() => openEditAccount(acc)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" /> Sửa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODALS                                                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      {/* Receipt overlay */}
      {showReceipt && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden animate-[scaleIn_0.2s_ease-out]">
          <BankReceiptForm
            key={String(selectedAccount?.id ?? "empty-receipt")}
            accountId={selectedAccount?.id?.toString()}
            onSuccess={() => {
              setShowReceipt(false);
              loadTransactions();
            }}
            onCancel={() => setShowReceipt(false)}
          />
        </div>
      )}

      {/* Payment overlay */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden animate-[scaleIn_0.2s_ease-out]">
          <BankPaymentForm
            key={String(selectedAccount?.id ?? "empty-payment")}
            accountId={selectedAccount?.id?.toString()}
            onSuccess={() => {
              setShowPayment(false);
              loadTransactions();
            }}
            onCancel={() => setShowPayment(false)}
          />
        </div>
      )}

      {/* Add / Edit account modal */}
      {isAccountModalOpen && (
        <Modal
          open={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          title={
            accountFormMode === "create"
              ? "Thêm tài khoản ngân hàng"
              : "Cập nhật tài khoản ngân hàng"
          }
          size="md"
        >
          <form onSubmit={handleSaveAccount} className="flex flex-col space-y-4 py-2">
            {/* Bank name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tên ngân hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={accBankName}
                onChange={(e) => setAccBankName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn ngân hàng --</option>
                {BANK_NAME_LIST.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Account number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Số tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={accountFormMode === "edit"}
                value={accNumber}
                onChange={(e) => setAccNumber(e.target.value)}
                placeholder="Nhập số tài khoản ngân hàng"
                className="w-full h-10 px-3 font-mono rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 bg-white"
              />
            </div>

            {/* Account holder */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Chủ tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                placeholder="Họ và tên chủ tài khoản"
                className="erp-input bg-white"
              />
            </div>

            {/* Opening balance (create only) */}
            {accountFormMode === "create" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Số dư ban đầu (đ)
                </label>
                <input
                  type="number"
                  min="0"
                  value={accOpeningBalance}
                  onChange={(e) => setAccOpeningBalance(Number(e.target.value))}
                  className="erp-input bg-white"
                />
              </div>
            )}

            {/* Branch */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Chi nhánh ngân hàng
              </label>
              <input
                type="text"
                value={accBranch}
                onChange={(e) => setAccBranch(e.target.value)}
                placeholder="Nhập chi nhánh mở tài khoản"
                className="erp-input bg-white"
              />
            </div>

            {/* Accounting code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mã tài khoản kế toán
              </label>
              <input
                type="text"
                value={accCode}
                onChange={(e) => setAccCode(e.target.value)}
                placeholder="Ví dụ: 1121"
                className="w-full h-10 px-3 font-mono rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Active toggle (edit only) */}
            {accountFormMode === "edit" && (
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="accIsActive"
                  checked={accIsActive}
                  onChange={(e) => setAccIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-blue-800 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="accIsActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Tài khoản đang hoạt động
                </label>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAccountModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold"
                disabled={
                  createAccountMutation.isPending || updateAccountMutation.isPending
                }
              >
                Lưu
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
