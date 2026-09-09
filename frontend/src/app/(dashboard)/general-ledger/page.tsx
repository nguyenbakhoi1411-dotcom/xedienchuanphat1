"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import {
  useJournalEntries,
  useJournalEntryDetail,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  usePostJournalEntry,
  useReverseJournalEntry,
  useCancelJournalEntry,
  useChartOfAccounts,
  useCreateAccount,
  useGeneralLedgerReport,
  useTrialBalanceReport,
  useAccountingPeriods
} from "@/features/general-ledger/hooks";
import { useCustomers } from "@/features/customers/hooks";
import { useSuppliers } from "@/features/suppliers/hooks";
import {
  JOURNAL_STATUS_LABELS,
  JOURNAL_STATUS_BADGE_TONE,
  JOURNAL_SOURCE_LABELS
} from "@/features/general-ledger/types";
import type {
  JournalEntry,
  JournalEntryLine,
  ChartOfAccount,
  JournalEntryStatus,
  JournalSourceType
} from "@/features/general-ledger/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Calendar,
  Filter,
  Plus,
  RotateCcw,
  BookOpen,
  FolderTree,
  Scale,
  ListFilter,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  FileText
} from "lucide-react";

// Formats currency: eg 1.000.000 đ
function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

// Formats date: dd/MM/yyyy
function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export default function GeneralLedgerPage() {
  const user = useCurrentUser();
  const currentBranchId = user?.branchId ?? undefined;

  // Permissions
  const canView = user?.permissions.includes("ACCOUNTING_VIEW");
  const canCreate = user?.permissions.includes("ACCOUNTING_CREATE");
  const canPost = user?.permissions.includes("ACCOUNTING_POST");
  const canCancel = user?.permissions.includes("ACCOUNTING_CANCEL");

  // Tabs: 'entries' | 'ledger' | 'trial' | 'accounts'
  const [activeTab, setActiveTab] = useState<'entries' | 'ledger' | 'trial' | 'accounts'>('entries');

  // Common filters
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  // Tab 1 filters
  const [entryFromDate, setEntryFromDate] = useState(firstDayOfMonth);
  const [entryToDate, setEntryToDate] = useState(lastDayOfMonth);
  const [entrySource, setEntrySource] = useState<string>("All");
  const [entryStatus, setEntryStatus] = useState<string>("All");
  const [entryPage, setEntryPage] = useState(0);

  // Tab 2 filters
  const [ledgerAccount, setLedgerAccount] = useState("");
  const [ledgerFromDate, setLedgerFromDate] = useState(firstDayOfMonth);
  const [ledgerToDate, setLedgerToDate] = useState(lastDayOfMonth);
  const [queryAccount, setQueryAccount] = useState("");
  const [queryFromDate, setQueryFromDate] = useState("");
  const [queryToDate, setQueryToDate] = useState("");

  // Tab 3 filters
  const [trialFromDate, setTrialFromDate] = useState(firstDayOfMonth);
  const [trialToDate, setTrialToDate] = useState(lastDayOfMonth);
  const [queryTrialFrom, setQueryTrialFrom] = useState(firstDayOfMonth);
  const [queryTrialTo, setQueryTrialTo] = useState(lastDayOfMonth);

  // Fetching general data
  const { data: periods, isLoading: loadingPeriods } = useAccountingPeriods();
  const { data: accountsData, isLoading: loadingAccounts } = useChartOfAccounts();
  const accounts = accountsData?.content || [];

  // Query details for tab lists
  const { data: entriesData, isLoading: loadingEntries } = useJournalEntries({
    page: entryPage,
    size: 20,
    fromDate: entryFromDate || undefined,
    toDate: entryToDate || undefined,
    status: entryStatus === "All" ? undefined : entryStatus,
    sourceType: entrySource === "All" ? undefined : entrySource,
    branchId: currentBranchId
  });

  const { data: ledgerReport, isLoading: loadingLedger } = useGeneralLedgerReport({
    accountCode: queryAccount,
    fromDate: queryFromDate,
    toDate: queryToDate,
    branchId: currentBranchId
  });

  const { data: trialReport, isLoading: loadingTrial } = useTrialBalanceReport({
    fromDate: queryTrialFrom,
    toDate: queryTrialTo,
    branchId: currentBranchId
  });

  // Mutator hooks
  const createEntryMutation = useCreateJournalEntry();
  const updateEntryMutation = useUpdateJournalEntry();
  const postEntryMutation = usePostJournalEntry();
  const reverseEntryMutation = useReverseJournalEntry();
  const cancelEntryMutation = useCancelJournalEntry();
  const createAccountMutation = useCreateAccount();

  // Dialogs and Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryModalMode, setEntryModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);

  // Dialog confirm states
  const [confirmPostId, setConfirmPostId] = useState<number | null>(null);
  const [confirmReverseId, setConfirmReverseId] = useState<number | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);

  // Customers & Suppliers for entry line select
  const { data: customersData } = useCustomers({ page: 1, pageSize: 100, keyword: "", type: "ALL", source: "ALL" });
  const { data: suppliersData } = useSuppliers({ page: 1, pageSize: 100, keyword: "" });

  const customers = customersData?.items || [];
  const suppliers = suppliersData?.items || [];

  // Active period detection
  const currentPeriod = useMemo(() => {
    if (!periods) return null;
    const nowStr = today.toISOString().split('T')[0];
    return periods.find(p => p.startDate <= nowStr && p.endDate >= nowStr) || periods[0] || null;
  }, [periods]);

  // Total sums of listed entries
  const currentMonthEntriesCount = entriesData?.totalElements || 0;
  const currentMonthTotalDebit = useMemo(() => {
    if (!entriesData?.content) return 0;
    return entriesData.content
      .filter(e => e.status === 'POSTED')
      .reduce((sum, e) => sum + e.totalDebit, 0);
  }, [entriesData]);

  // Form States for Journal Entry Modal
  const [entryDate, setEntryDate] = useState(today.toISOString().split('T')[0]);
  const [entryPeriodId, setEntryPeriodId] = useState<number | undefined>(undefined);
  const [entryDesc, setEntryDesc] = useState("");
  const [entryLines, setEntryLines] = useState<JournalEntryLine[]>([
    { accountCode: "", debit: 0, credit: 0, description: "" },
    { accountCode: "", debit: 0, credit: 0, description: "" }
  ]);

  // Form States for Account Modal
  const [accCode, setAccCode] = useState("");
  const [accName, setAccName] = useState("");
  const [accParentId, setAccParentId] = useState<number | undefined>(undefined);
  const [accType, setAccType] = useState<'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'COST_OF_GOODS_SOLD'>('ASSET');
  const [accDesc, setAccDesc] = useState("");

  const detailAccounts = useMemo(() => accounts.filter(a => a.isDetail), [accounts]);
  const parentAccounts = useMemo(() => accounts.filter(a => !a.isDetail), [accounts]);

  // Sum calculations inside Journal Entry Modal
  const modalTotalDebit = entryLines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const modalTotalCredit = entryLines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const modalDiff = Math.abs(modalTotalDebit - modalTotalCredit);

  // Open create entry form
  const handleOpenCreateEntry = () => {
    if (!canCreate) {
      toast.error("Bạn không có quyền thực hiện hành động này");
      return;
    }
    setEntryModalMode('create');
    setEditingEntryId(null);
    setEntryDate(today.toISOString().split('T')[0]);
    setEntryPeriodId(currentPeriod?.id);
    setEntryDesc("");
    setEntryLines([
      { accountCode: "", debit: 0, credit: 0, description: "" },
      { accountCode: "", debit: 0, credit: 0, description: "" }
    ]);
    setIsEntryModalOpen(true);
  };

  // Open edit or view entry modal
  const handleOpenEntryDetail = (entry: JournalEntry, mode: 'view' | 'edit') => {
    setEntryModalMode(mode);
    setEditingEntryId(entry.id);
    setEntryDate(entry.entryDate);
    setEntryPeriodId(entry.periodId);
    setEntryDesc(entry.description || "");
    setEntryLines(entry.lines.map(l => ({
      id: l.id,
      accountCode: l.accountCode,
      accountName: l.accountName,
      debit: l.debit,
      credit: l.credit,
      description: l.description || "",
      customerId: l.customerId,
      supplierId: l.supplierId,
      costCenterId: l.costCenterId
    })));
    setIsEntryModalOpen(true);
  };

  // Save draft journal entry
  const handleSaveEntry = async (statusToSave: 'DRAFT' | 'POSTED') => {
    if (entryLines.length < 2) {
      toast.error("Bút toán phải có ít nhất 2 dòng chi tiết");
      return;
    }

    const invalidLines = entryLines.some(l => !l.accountCode || (!l.debit && !l.credit));
    if (invalidLines) {
      toast.error("Vui lòng điền đầy đủ tài khoản và số tiền Nợ/Có cho các dòng");
      return;
    }

    if (statusToSave === 'POSTED' && modalTotalDebit !== modalTotalCredit) {
      toast.error("Không thể ghi sổ bút toán không cân (Tổng Nợ khác Tổng Có)");
      return;
    }

    const payload = {
      entryDate,
      referenceNo: '',
      description: entryDesc,
      periodId: entryPeriodId,
      branchId: currentBranchId || 1,
      sourceType: 'MANUAL' as const,
      lines: entryLines.map(l => ({
        accountCode: l.accountCode,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        description: l.description || entryDesc,
        customerId: l.customerId ? Number(l.customerId) : undefined,
        supplierId: l.supplierId ? Number(l.supplierId) : undefined,
        costCenterId: l.costCenterId ? Number(l.costCenterId) : undefined
      }))
    };

    try {
      if (entryModalMode === 'create') {
        const result = await createEntryMutation.mutateAsync(payload);
        if (statusToSave === 'POSTED') {
          await postEntryMutation.mutateAsync(result.id);
        }
      } else if (editingEntryId) {
        await updateEntryMutation.mutateAsync({ id: editingEntryId, data: payload });
        if (statusToSave === 'POSTED') {
          await postEntryMutation.mutateAsync(editingEntryId);
        }
      }
      setIsEntryModalOpen(false);
    } catch (e) {
      // toast shown in hook
    }
  };

  // Entry Lines management
  const addLineRow = () => {
    setEntryLines([...entryLines, { accountCode: "", debit: 0, credit: 0, description: "" }]);
  };

  const removeLineRow = (index: number) => {
    if (entryLines.length <= 2) {
      toast.error("Bút toán phải có ít nhất 2 dòng chi tiết");
      return;
    }
    setEntryLines(entryLines.filter((_, i) => i !== index));
  };

  const updateLineValue = (index: number, key: keyof JournalEntryLine, value: any) => {
    const nextLines = [...entryLines];
    if (key === 'debit' && Number(value) > 0) {
      nextLines[index] = { ...nextLines[index], [key]: value, credit: 0 };
    } else if (key === 'credit' && Number(value) > 0) {
      nextLines[index] = { ...nextLines[index], [key]: value, debit: 0 };
    } else {
      nextLines[index] = { ...nextLines[index], [key]: value };
    }
    setEntryLines(nextLines);
  };

  // Open create account modal
  const handleOpenCreateAccount = () => {
    if (!canCreate) {
      toast.error("Bạn không có quyền thực hiện hành động này");
      return;
    }
    setEditingAccount(null);
    setAccCode("");
    setAccName("");
    setAccParentId(undefined);
    setAccType('ASSET');
    setAccDesc("");
    setIsAccountModalOpen(true);
  };

  // Open edit account modal
  const handleOpenEditAccount = (account: ChartOfAccount) => {
    setEditingAccount(account);
    setAccCode(account.accountCode);
    setAccName(account.accountName);
    setAccParentId(account.parentAccountId || account.parentId);
    setAccType(account.accountType);
    setAccDesc(account.description || "");
    setIsAccountModalOpen(true);
  };

  // Save account details
  const handleSaveAccount = async () => {
    if (!accCode || !accName) {
      toast.error("Vui lòng nhập Mã và Tên tài khoản");
      return;
    }
    const payload = {
      accountCode: accCode,
      accountName: accName,
      accountType: accType,
      parentAccountId: accParentId ? Number(accParentId) : undefined,
      description: accDesc,
      active: true
    };
    try {
      await createAccountMutation.mutateAsync(payload);
      setIsAccountModalOpen(false);
    } catch (e) {
      // error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP BAR */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Sổ Cái & Kế Toán Tổng Hợp</h1>
            <p className="mt-1.5 text-indigo-100">Bút toán, sổ cái, cân đối phát sinh và danh mục tài khoản</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap">
            <div className="min-w-[140px] rounded-xl bg-white/10 p-4 backdrop-blur-md">
              <span className="text-xs text-indigo-200">Bút toán tháng này</span>
              <div className="mt-1 text-xl font-bold">{loadingEntries ? "..." : currentMonthEntriesCount}</div>
            </div>
            <div className="min-w-[140px] rounded-xl bg-white/10 p-4 backdrop-blur-md">
              <span className="text-xs text-indigo-200">Tổng Nợ tháng</span>
              <div className="mt-1 text-xl font-bold">{fmt(currentMonthTotalDebit)}</div>
            </div>
            <div className="min-w-[140px] rounded-xl bg-white/10 p-4 backdrop-blur-md">
              <span className="text-xs text-indigo-200">Kỳ kế toán hiện tại</span>
              <div className="mt-1 text-xl font-bold truncate max-w-[150px]">{currentPeriod?.periodCode || "Chưa thiết lập"}</div>
            </div>
            <div className="min-w-[140px] rounded-xl bg-white/10 p-4 backdrop-blur-md flex flex-col justify-between">
              <span className="text-xs text-indigo-200">Trạng thái kỳ</span>
              <div className="mt-1">
                {currentPeriod?.status === 'OPEN' ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">OPEN</span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-400/20 px-2 py-0.5 text-xs font-semibold text-red-300">CLOSED</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 TABS STICKY BAR */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm rounded-xl">
        <div className="flex overflow-x-auto p-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('entries')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
              activeTab === 'entries'
                ? "bg-indigo-50 font-bold text-indigo-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Bút toán
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
              activeTab === 'ledger'
                ? "bg-indigo-50 font-bold text-indigo-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <FileText className="h-4 w-4" />
            Sổ cái
          </button>
          <button
            onClick={() => setActiveTab('trial')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
              activeTab === 'trial'
                ? "bg-indigo-50 font-bold text-indigo-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Scale className="h-4 w-4" />
            Cân đối phát sinh
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
              activeTab === 'accounts'
                ? "bg-indigo-50 font-bold text-indigo-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <FolderTree className="h-4 w-4" />
            Danh mục tài khoản
          </button>
        </div>
      </div>

      {/* TAB CONTENT AREAS */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[400px]">
        
        {/* TAB 1: BÚT TOÁN */}
        {activeTab === 'entries' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-xl border p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Từ</span>
                  <input
                    type="date"
                    value={entryFromDate}
                    onChange={(e) => setEntryFromDate(e.target.value)}
                    className="erp-input w-36"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Đến</span>
                  <input
                    type="date"
                    value={entryToDate}
                    onChange={(e) => setEntryToDate(e.target.value)}
                    className="erp-input w-36"
                  />
                </div>
                <select
                  value={entrySource}
                  onChange={(e) => setEntrySource(e.target.value)}
                  className="erp-input w-40"
                >
                  <option value="All">Tất cả loại nguồn</option>
                  <option value="MANUAL">Thủ công</option>
                  <option value="SALES">Bán hàng</option>
                  <option value="PURCHASE">Mua hàng</option>
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK">Ngân hàng</option>
                  <option value="PAYROLL">Bảng lương</option>
                </select>
                <select
                  value={entryStatus}
                  onChange={(e) => setEntryStatus(e.target.value)}
                  className="erp-input w-40"
                >
                  <option value="All">Tất cả trạng thái</option>
                  <option value="DRAFT">Nháp</option>
                  <option value="POSTED">Đã ghi sổ</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
              <Button
                variant="primary"
                onClick={handleOpenCreateEntry}
                className="flex items-center gap-2 self-start"
              >
                <Plus className="h-4 w-4" />
                Tạo bút toán
              </Button>
            </div>

            {loadingEntries ? (
              <Skeleton className="h-60 w-full" />
            ) : !entriesData?.content || entriesData.content.length === 0 ? (
              <EmptyState title="Không tìm thấy bút toán nào" description="Thử thay đổi bộ lọc hoặc tạo bút toán mới để ghi chép các giao dịch tổng hợp." />
            ) : (
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="p-4">Số BT</th>
                      <th className="p-4">Ngày</th>
                      <th className="p-4">Nguồn</th>
                      <th className="p-4">Diễn giải</th>
                      <th className="p-4 text-right">Tổng Nợ</th>
                      <th className="p-4 text-right">Tổng Có</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4">Người tạo</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm text-slate-700">
                    {entriesData.content.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-semibold text-indigo-700">{entry.entryCode}</td>
                        <td className="p-4">{fmtDate(entry.entryDate)}</td>
                        <td className="p-4">
                          <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                            {JOURNAL_SOURCE_LABELS[entry.sourceType] || entry.sourceType}
                          </span>
                        </td>
                        <td className="p-4 max-w-[280px] truncate" title={entry.description}>{entry.description || "—"}</td>
                        <td className="p-4 text-right font-semibold">{fmt(entry.totalDebit)}</td>
                        <td className="p-4 text-right font-semibold">{fmt(entry.totalCredit)}</td>
                        <td className="p-4">
                          <Badge tone={JOURNAL_STATUS_BADGE_TONE[entry.status]}>
                            {JOURNAL_STATUS_LABELS[entry.status]}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-500">{entry.createdBy}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {entry.status === 'DRAFT' && (
                              <>
                                <button
                                  onClick={() => handleOpenEntryDetail(entry, 'edit')}
                                  className="text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
                                >
                                  Sửa
                                </button>
                                {canPost && (
                                  <button
                                    onClick={() => setConfirmPostId(entry.id)}
                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200"
                                  >
                                    Ghi sổ
                                  </button>
                                )}
                                {canCancel && (
                                  <button
                                    onClick={() => setConfirmCancelId(entry.id)}
                                    className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded border border-red-200"
                                  >
                                    Hủy
                                  </button>
                                )}
                              </>
                            )}
                            {entry.status === 'POSTED' && (
                              <>
                                <button
                                  onClick={() => handleOpenEntryDetail(entry, 'view')}
                                  className="text-xs font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded"
                                >
                                  Xem
                                </button>
                                {canPost && (
                                  <button
                                    onClick={() => setConfirmReverseId(entry.id)}
                                    className="text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded border border-amber-200 flex items-center gap-1"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                    Đảo
                                  </button>
                                )}
                              </>
                            )}
                            {entry.status === 'CANCELLED' && (
                              <button
                                onClick={() => handleOpenEntryDetail(entry, 'view')}
                                className="text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
                              >
                                Xem
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SỔ CÁI */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border rounded-xl p-4 flex flex-wrap gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Tài khoản (bắt buộc)</label>
                <input
                  type="text"
                  placeholder="Nhập mã TK, vd: 111"
                  value={ledgerAccount}
                  onChange={(e) => setLedgerAccount(e.target.value)}
                  className="erp-input w-52"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Từ ngày</label>
                <input
                  type="date"
                  value={ledgerFromDate}
                  onChange={(e) => setLedgerFromDate(e.target.value)}
                  className="erp-input w-40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Đến ngày</label>
                <input
                  type="date"
                  value={ledgerToDate}
                  onChange={(e) => setLedgerToDate(e.target.value)}
                  className="erp-input w-40"
                />
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  if (!ledgerAccount.trim()) {
                    toast.error("Vui lòng nhập Mã Tài Khoản");
                    return;
                  }
                  setQueryAccount(ledgerAccount);
                  setQueryFromDate(ledgerFromDate);
                  setQueryToDate(ledgerToDate);
                }}
              >
                Xem sổ cái
              </Button>
            </div>

            {!queryAccount ? (
              <EmptyState title="Vui lòng chọn tài khoản và thời gian" description="Nhập mã tài khoản (ví dụ: 111, 112) và khoảng thời gian để truy vấn các dòng phát sinh chi tiết." />
            ) : loadingLedger ? (
              <Skeleton className="h-60 w-full" />
            ) : !ledgerReport || !ledgerReport.lines || ledgerReport.lines.length === 0 ? (
              <EmptyState title="Không có phát sinh nào trong kỳ" description="Tài khoản này không có bút toán đã ghi sổ phát sinh nào trong khoảng thời gian đã chọn." />
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl flex justify-between items-center">
                  <div className="font-bold text-blue-900 text-sm">Sổ cái tài khoản: {ledgerReport.accountCode} — {ledgerReport.accountName}</div>
                  <div className="font-bold text-blue-900 text-sm">Số dư đầu kỳ: {fmt(ledgerReport.openingBalance)}</div>
                </div>

                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th className="p-4">Ngày</th>
                        <th className="p-4">Số CT</th>
                        <th className="p-4">Loại</th>
                        <th className="p-4">Diễn giải</th>
                        <th className="p-4">TK đối ứng</th>
                        <th className="p-4 text-right">Nợ</th>
                        <th className="p-4 text-right">Có</th>
                        <th className="p-4 text-right">Số dư</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm text-slate-700">
                      {ledgerReport.lines.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-4">{fmtDate(row.date)}</td>
                          <td className="p-4 font-semibold text-indigo-700">{row.entryCode}</td>
                          <td className="p-4">
                            <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                              {(row as any).referenceType || "MANUAL"}
                            </span>
                          </td>
                          <td className="p-4">{row.description}</td>
                          <td className="p-4 font-mono font-semibold text-slate-600">{row.counterAccountCode || "—"}</td>
                          <td className="p-4 text-right font-semibold text-emerald-700">{row.debit ? fmt(row.debit) : "—"}</td>
                          <td className="p-4 text-right font-semibold text-red-700">{row.credit ? fmt(row.credit) : "—"}</td>
                          <td className="p-4 text-right font-bold text-slate-800">{fmt(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50/70 border-t font-semibold text-sm">
                        <td colSpan={5} className="p-4 text-right text-slate-500 uppercase">Tổng cộng phát sinh:</td>
                        <td className="p-4 text-right font-bold text-emerald-700">
                          {fmt(ledgerReport.lines.reduce((s, r) => s + r.debit, 0))}
                        </td>
                        <td className="p-4 text-right font-bold text-red-700">
                          {fmt(ledgerReport.lines.reduce((s, r) => s + r.credit, 0))}
                        </td>
                        <td className="p-4 text-right font-extrabold text-indigo-950">
                          {fmt(ledgerReport.closingBalance)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CÂN ĐỐI PHÁT SINH */}
        {activeTab === 'trial' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border rounded-xl p-4 flex flex-wrap gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Từ ngày</label>
                <input
                  type="date"
                  value={trialFromDate}
                  onChange={(e) => setTrialFromDate(e.target.value)}
                  className="erp-input w-44"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Đến ngày</label>
                <input
                  type="date"
                  value={trialToDate}
                  onChange={(e) => setTrialToDate(e.target.value)}
                  className="erp-input w-44"
                />
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setQueryTrialFrom(trialFromDate);
                  setQueryTrialTo(trialToDate);
                }}
              >
                Xem phát sinh
              </Button>
            </div>

            {loadingTrial ? (
              <Skeleton className="h-60 w-full" />
            ) : !trialReport || !trialReport.rows || trialReport.rows.length === 0 ? (
              <EmptyState title="Không có dữ liệu phát sinh" description="Không có bút toán nào ghi nhận trong khoảng thời gian đã chọn." />
            ) : (
              <div className="space-y-6">
                {/* Balance mismatch verification */}
                {Math.abs(trialReport.totalClosingDebit - trialReport.totalClosingCredit) < 0.1 ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl font-medium text-sm">
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>✓ Số liệu cân đối hoàn hảo trên toàn hệ thống</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl font-medium text-sm">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                    <span>⚠ Chênh lệch số liệu: {fmt(Math.abs(trialReport.totalClosingDebit - trialReport.totalClosingCredit))}</span>
                  </div>
                )}

                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                        <th className="p-4 text-left" rowSpan={2}>Mã tài khoản</th>
                        <th className="p-4 text-left" rowSpan={2}>Tên tài khoản</th>
                        <th className="p-4 border-b border-r" colSpan={2}>Số dư đầu kỳ</th>
                        <th className="p-4 border-b border-r" colSpan={2}>Phát sinh trong kỳ</th>
                        <th className="p-4 border-b" colSpan={2}>Số dư cuối kỳ</th>
                      </tr>
                      <tr className="border-b bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="p-2 border-r text-right">Nợ</th>
                        <th className="p-2 border-r text-right">Có</th>
                        <th className="p-2 border-r text-right">Nợ</th>
                        <th className="p-2 border-r text-right">Có</th>
                        <th className="p-2 border-r text-right">Nợ</th>
                        <th className="p-2 text-right">Có</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm text-slate-700">
                      {trialReport.rows.map((row) => (
                        <tr
                          key={row.accountCode}
                          className={`hover:bg-slate-50/50 ${row.hasChildren ? "font-semibold bg-slate-50/40" : ""}`}
                        >
                          <td className="p-4 font-mono font-bold text-slate-900" style={{ paddingLeft: `${(row.level - 1) * 16 + 16}px` }}>
                            {row.accountCode}
                          </td>
                          <td className="p-4">{row.accountName}</td>
                          <td className="p-2 border-r text-right text-slate-600">{row.openingDebit ? fmt(row.openingDebit) : "—"}</td>
                          <td className="p-2 border-r text-right text-slate-600">{row.openingCredit ? fmt(row.openingCredit) : "—"}</td>
                          <td className="p-2 border-r text-right text-slate-700">{row.periodDebit ? fmt(row.periodDebit) : "—"}</td>
                          <td className="p-2 border-r text-right text-slate-700">{row.periodCredit ? fmt(row.periodCredit) : "—"}</td>
                          <td className="p-2 border-r text-right font-semibold text-slate-800">{row.closingDebit ? fmt(row.closingDebit) : "—"}</td>
                          <td className="p-2 text-right font-semibold text-slate-800">{row.closingCredit ? fmt(row.closingCredit) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold text-sm">
                        <td colSpan={2} className="p-4 text-right uppercase">Tổng cộng:</td>
                        <td className="p-2 border-r text-right">{fmt(trialReport.totalOpeningDebit)}</td>
                        <td className="p-2 border-r text-right">{fmt(trialReport.totalOpeningCredit)}</td>
                        <td className="p-2 border-r text-right">{fmt(trialReport.totalPeriodDebit)}</td>
                        <td className="p-2 border-r text-right">{fmt(trialReport.totalPeriodCredit)}</td>
                        <td className="p-2 border-r text-right">{fmt(trialReport.totalClosingDebit)}</td>
                        <td className="p-2 text-right">{fmt(trialReport.totalClosingCredit)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DANH MỤC TÀI KHOẢN */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">Hệ thống tài khoản kế toán doanh nghiệp được phân cấp theo hình cây.</div>
              {canCreate && (
                <Button
                  variant="primary"
                  onClick={handleOpenCreateAccount}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Thêm tài khoản
                </Button>
              )}
            </div>

            {loadingAccounts ? (
              <Skeleton className="h-60 w-full" />
            ) : accounts.length === 0 ? (
              <EmptyState title="Hệ thống tài khoản trống" description="Tạo tài khoản đầu tiên để bắt đầu thiết lập hệ thống kế toán." />
            ) : (
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="p-4">Mã TK</th>
                      <th className="p-4">Tên TK</th>
                      <th className="p-4">Loại TK</th>
                      <th className="p-4">Cấp</th>
                      <th className="p-4">Ghi chú</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm text-slate-700">
                    {accounts.map((account) => (
                      <tr
                        key={account.id}
                        className={`hover:bg-slate-50/50 ${!account.isDetail ? "font-semibold bg-slate-50/30" : ""}`}
                      >
                        <td className="p-4 font-mono font-bold text-slate-900" style={{ paddingLeft: `${(account.level - 1) * 16 + 16}px` }}>
                          {account.accountCode}
                        </td>
                        <td className="p-4">{account.accountName}</td>
                        <td className="p-4">
                          <span className="inline-flex rounded bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                            {account.accountType}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{account.level}</td>
                        <td className="p-4 text-slate-500 truncate max-w-[200px]" title={account.description}>{account.description || "—"}</td>
                        <td className="p-4 text-right">
                          {canCreate && (
                            <button
                              onClick={() => handleOpenEditAccount(account)}
                              className="text-xs font-medium text-slate-600 hover:text-indigo-600"
                            >
                              Sửa
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* CONFIRM POST DIALOG */}
      <ConfirmDialog
        open={confirmPostId !== null}
        title="Ghi sổ bút toán"
        description="Bút toán sau khi ghi sổ sẽ không thể chỉnh sửa trực tiếp mà chỉ có thể điều chỉnh bằng cách tạo bút toán đảo ngược. Bạn chắc chắn muốn ghi sổ?"
        confirmText="Ghi sổ"
        onConfirm={async () => {
          if (confirmPostId) {
            try {
              await postEntryMutation.mutateAsync(confirmPostId);
            } catch (e) {}
          }
          setConfirmPostId(null);
        }}
        onClose={() => setConfirmPostId(null)}
      />

      {/* CONFIRM REVERSE DIALOG */}
      <ConfirmDialog
        open={confirmReverseId !== null}
        title="Đảo ngược bút toán"
        description="Hệ thống sẽ tạo một bút toán thủ công với các định khoản đảo chiều (Nợ thành Có, Có thành Nợ) để triệt tiêu hoàn toàn bút toán này. Xác nhận thực hiện?"
        confirmText="Đảo ngược"
        onConfirm={async () => {
          if (confirmReverseId) {
            try {
              await reverseEntryMutation.mutateAsync(confirmReverseId);
            } catch (e) {}
          }
          setConfirmReverseId(null);
        }}
        onClose={() => setConfirmReverseId(null)}
      />

      {/* CONFIRM CANCEL DIALOG */}
      <ConfirmDialog
        open={confirmCancelId !== null}
        title="Hủy bút toán nháp"
        description="Bút toán nháp này sẽ chuyển sang trạng thái HỦY và không được phép ghi sổ. Xác nhận hủy?"
        confirmText="Hủy bút toán"
        onConfirm={async () => {
          if (confirmCancelId) {
            try {
              await cancelEntryMutation.mutateAsync(confirmCancelId);
            } catch (e) {}
          }
          setConfirmCancelId(null);
        }}
        onClose={() => setConfirmCancelId(null)}
      />

      {/* MODAL TẠO / SỬA TÀI KHOẢN (size lg) */}
      <Modal
        open={isAccountModalOpen}
        title={editingAccount ? "Sửa tài khoản kế toán" : "Thêm tài khoản kế toán mới"}
        size="lg"
        onClose={() => setIsAccountModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Mã tài khoản *</label>
              <input
                type="text"
                placeholder="Ví dụ: 1111"
                value={accCode}
                onChange={(e) => setAccCode(e.target.value)}
                disabled={Boolean(editingAccount)}
                className="erp-input w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Tên tài khoản *</label>
              <input
                type="text"
                placeholder="Ví dụ: Tiền mặt tại quỹ"
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                className="erp-input w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Tài khoản cha</label>
              <select
                value={accParentId || ""}
                onChange={(e) => setAccParentId(e.target.value ? Number(e.target.value) : undefined)}
                className="erp-input w-full"
              >
                <option value="">(Không có - Tài khoản cấp 1)</option>
                {parentAccounts.map(a => (
                  <option key={a.id} value={a.id}>{a.accountCode} - {a.accountName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Loại tài khoản</label>
              <select
                value={accType}
                onChange={(e) => setAccType(e.target.value as any)}
                className="erp-input w-full"
              >
                <option value="ASSET">Tài sản (ASSET)</option>
                <option value="LIABILITY">Nợ phải trả (LIABILITY)</option>
                <option value="EQUITY">Vốn chủ sở hữu (EQUITY)</option>
                <option value="REVENUE">Doanh thu (REVENUE)</option>
                <option value="EXPENSE">Chi phí (EXPENSE)</option>
                <option value="COST_OF_GOODS_SOLD">Giá vốn hàng bán (COST_OF_GOODS_SOLD)</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Ghi chú</label>
            <textarea
              placeholder="Nhập ghi chú hoặc mô tả tài khoản..."
              value={accDesc}
              onChange={(e) => setAccDesc(e.target.value)}
              className="erp-input w-full h-24 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsAccountModalOpen(false)}>Hủy</Button>
            <Button
              variant="primary"
              onClick={handleSaveAccount}
              disabled={createAccountMutation.isPending}
            >
              {createAccountMutation.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL TẠO / SỬA BÚT TOÁN (size xl) */}
      <Modal
        open={isEntryModalOpen}
        title={entryModalMode === 'view' ? "Xem bút toán" : entryModalMode === 'edit' ? "Sửa bút toán" : "Tạo bút toán thủ công"}
        size="xl"
        onClose={() => setIsEntryModalOpen(false)}
      >
        <div className="space-y-5">
          {/* Row 1: Số BT | Ngày | Kỳ KT */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 bg-slate-50 border p-4 rounded-xl">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Số bút toán</label>
              <input
                type="text"
                placeholder="(Tự sinh sau khi lưu)"
                disabled
                className="erp-input w-full bg-slate-100/70 text-slate-500 font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Ngày chứng từ *</label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                disabled={entryModalMode === 'view'}
                className="erp-input w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Kỳ kế toán *</label>
              <select
                value={entryPeriodId || ""}
                onChange={(e) => setEntryPeriodId(Number(e.target.value))}
                disabled={entryModalMode === 'view'}
                className="erp-input w-full"
              >
                <option value="">Chọn kỳ kế toán...</option>
                {periods?.map(p => (
                  <option key={p.id} value={p.id}>{p.periodCode}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Loại nguồn | Diễn giải */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Loại nguồn</label>
              <input
                type="text"
                value="Thủ công (MANUAL)"
                disabled
                className="erp-input w-full bg-slate-100/70 text-slate-500"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Diễn giải chung *</label>
              <input
                type="text"
                placeholder="Nhập diễn giải chung cho bút toán..."
                value={entryDesc}
                onChange={(e) => setEntryDesc(e.target.value)}
                disabled={entryModalMode === 'view'}
                className="erp-input w-full"
              />
            </div>
          </div>

          {/* Lines Input Dynamic Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">Chi tiết bút toán định khoản</span>
              {entryModalMode !== 'view' && (
                <Button variant="secondary" onClick={addLineRow} className="flex items-center gap-1.5 text-xs py-1.5 px-3">
                  <Plus className="h-3.5 w-3.5" />
                  Thêm dòng
                </Button>
              )}
            </div>

            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs font-bold uppercase text-slate-500">
                    <th className="p-3 w-12 text-center">STT</th>
                    <th className="p-3 w-44">Tài khoản</th>
                    <th className="p-3 w-52">Đối tượng</th>
                    <th className="p-3">Diễn giải dòng</th>
                    <th className="p-3 w-36 text-right">Nợ</th>
                    <th className="p-3 w-36 text-right">Có</th>
                    {entryModalMode !== 'view' && <th className="p-3 w-10 text-center"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-slate-700">
                  {entryLines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/20">
                      <td className="p-2 text-center text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="p-2">
                        <select
                          value={line.accountCode}
                          onChange={(e) => updateLineValue(idx, 'accountCode', e.target.value)}
                          disabled={entryModalMode === 'view'}
                          className="erp-input w-full text-xs"
                        >
                          <option value="">Chọn TK...</option>
                          {detailAccounts.map(a => (
                            <option key={a.id} value={a.accountCode}>{a.accountCode} - {a.accountName}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 flex gap-1">
                        <select
                          value={line.customerId || ""}
                          onChange={(e) => updateLineValue(idx, 'customerId', e.target.value ? Number(e.target.value) : undefined)}
                          disabled={entryModalMode === 'view'}
                          className="erp-input w-1/2 text-xs"
                        >
                          <option value="">Khách hàng...</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.fullName}</option>
                          ))}
                        </select>
                        <select
                          value={line.supplierId || ""}
                          onChange={(e) => updateLineValue(idx, 'supplierId', e.target.value ? Number(e.target.value) : undefined)}
                          disabled={entryModalMode === 'view'}
                          className="erp-input w-1/2 text-xs"
                        >
                          <option value="">Nhà CC...</option>
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Nhập diễn giải dòng..."
                          value={line.description}
                          onChange={(e) => updateLineValue(idx, 'description', e.target.value)}
                          disabled={entryModalMode === 'view'}
                          className="erp-input w-full text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={line.debit || ""}
                          onChange={(e) => updateLineValue(idx, 'debit', e.target.value ? Number(e.target.value) : 0)}
                          disabled={entryModalMode === 'view'}
                          className="erp-input w-full text-right text-xs font-semibold text-emerald-800"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={line.credit || ""}
                          onChange={(e) => updateLineValue(idx, 'credit', e.target.value ? Number(e.target.value) : 0)}
                          disabled={entryModalMode === 'view'}
                          className="erp-input w-full text-right text-xs font-semibold text-red-800"
                        />
                      </td>
                      {entryModalMode !== 'view' && (
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLineRow(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sticky footer for totals and validation status */}
          <div className="bg-slate-50 border p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-4 text-sm font-semibold">
              <span>Tổng Nợ: <span className="text-emerald-700 font-bold">{fmt(modalTotalDebit)}</span></span>
              <span className="text-slate-300">|</span>
              <span>Tổng Có: <span className="text-red-700 font-bold">{fmt(modalTotalCredit)}</span></span>
            </div>

            {modalTotalDebit === modalTotalCredit && modalTotalDebit > 0 ? (
              <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-xs font-semibold">
                ✓ Định khoản cân đối
              </div>
            ) : (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-xs font-semibold">
                ⚠ Chênh lệch: {fmt(modalDiff)}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsEntryModalOpen(false)}>Hủy</Button>
            {entryModalMode !== 'view' && (
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => handleSaveEntry('DRAFT')}
                  disabled={createEntryMutation.isPending || updateEntryMutation.isPending}
                >
                  Lưu nháp
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleSaveEntry('POSTED')}
                  disabled={createEntryMutation.isPending || updateEntryMutation.isPending || postEntryMutation.isPending}
                >
                  Ghi sổ
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
