"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { accountingApi } from "@/features/accounting/api";
import { AccountingTabs } from "@/features/accounting/AccountingTabs";
import { AccountingOverviewPanel } from "@/features/accounting/AccountingOverviewPanel";
import { GeneralOperationsPanel } from "@/features/accounting/components/GeneralOperationsPanel";
import { VoucherTable } from "@/features/accounting/VoucherTable";
import { DebtTable } from "@/features/accounting/DebtTable";
import {
  ChartOfAccountsPanel,
  JournalEntriesPanel,
  AccountingReportsPanel } from "@/features/accounting/LedgerPanels";
import { TaxInvoicePanel } from "@/features/accounting/TaxInvoicePanel";
import { VatReportPanel } from "@/features/accounting/VatReportPanel";
import { ExpensePanel } from "@/features/accounting/ExpensePanel";
import { FixedAssetPanel } from "@/features/accounting/FixedAssetPanel";
import { CashFlowChart } from "@/features/accounting/CashFlowChart";
import type { AccountingTab, AccountingFilters } from "@/features/accounting/types";

export default function AccountingPage() {
  const [tab, setTab] = useState<AccountingTab>("overview");
  const [filters, setFilters] = useState<AccountingFilters>({ page: 1, pageSize: 20, keyword: "", status: "ALL", method: "ALL" });
  const [overview, setOverview]   = useState<any>(null);
  const [receipts, setReceipts]   = useState<any>(null);
  const [payments, setPayments]   = useState<any>(null);
  const [debts, setDebts]         = useState<any>(null);
  const [accounts, setAccounts]   = useState<any>(null);
  const [journal, setJournal]     = useState<any>(null);
  const [reports, setReports]     = useState<any>(null);
  const [loading, setLoading]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "overview" && !overview) setOverview(await accountingApi.overview());
      if (tab === "receipts") setReceipts(await accountingApi.receipts(filters));
      if (tab === "payments") setPayments(await accountingApi.payments(filters));
      if (tab === "debts")
        setDebts(
          await accountingApi.debts({
            page: 1, pageSize: 100, keyword: "", partyType: "ALL" })
        );
      if (tab === "accounts" && !accounts) setAccounts(await accountingApi.accounts());
      if (tab === "journal" && !journal) setJournal(await accountingApi.journalEntries());
      if (tab === "reports" && !reports) {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const from = `${y}-${m}-01`;
        const to = now.toISOString().slice(0, 10);
        const [bs, is_, tb, cda, sda] = await Promise.allSettled([
          accountingApi.balanceSheet(from, to),
          accountingApi.incomeStatement(from, to),
          accountingApi.trialBalance(from, to),
          accountingApi.customerDebtAging(),
          accountingApi.supplierDebtAging(),
        ]);
        setReports({
          balanceSheet:      bs.status  === "fulfilled" ? bs.value  : null,
          incomeStatement:   is_.status === "fulfilled" ? is_.value : null,
          trialBalance:      tb.status  === "fulfilled" ? tb.value  : null,
          customerDebtAging: cda.status === "fulfilled" ? cda.value : [],
          supplierDebtAging: sda.status === "fulfilled" ? sda.value : [] });
      }
    } catch {
      toast.error("Lỗi tải dữ liệu kế toán");
    } finally {
      setLoading(false);
    }
  }, [tab, filters, overview, accounts, journal, reports]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-0">
      <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 text-white px-6 pt-5 pb-0">
        <h1 className="text-2xl font-bold mb-4">Kế toán</h1>
        <AccountingTabs value={tab} onChange={setTab} />
      </div>

      <div className="pt-5 space-y-4">
        {tab === "overview"     && <AccountingOverviewPanel data={overview} loading={loading} />}
        {tab === "general_operations" && <GeneralOperationsPanel />}
        {tab === "receipts"     && (
          <VoucherTable type="RECEIPT" data={receipts} params={filters} loading={loading} onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))} />
        )}
        {tab === "payments"     && (
          <VoucherTable type="PAYMENT" data={payments} params={filters} loading={loading} onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))} />
        )}
        {tab === "debts"        && (
          <DebtTable data={debts} params={{ page: 1, pageSize: 100, keyword: "", partyType: "ALL" }} loading={loading} onPageChange={() => {}} />
        )}
        {tab === "accounts"     && <ChartOfAccountsPanel data={accounts} loading={loading} />}
        {tab === "journal"      && <JournalEntriesPanel data={journal} loading={loading} />}
        {tab === "reports"      && (
          <AccountingReportsPanel {...((reports as any) ?? {})}  />
        )}
        {tab === "tax-invoices" && <TaxInvoicePanel />}
        {tab === "vat-report"   && <VatReportPanel />}
        {tab === "expenses"     && <ExpensePanel />}
        {tab === "fixed-assets" && <FixedAssetPanel />}
        {tab === "cashflow"     && (
          <CashFlowChart
            data={(overview as any | null)?.cashFlow}
            
          />
        )}
      </div>
    </div>
  );
}









