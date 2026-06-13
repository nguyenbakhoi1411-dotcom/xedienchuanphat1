"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AccountingFilters } from "@/features/accounting/AccountingFilters";
import { AccountingOverviewPanel } from "@/features/accounting/AccountingOverviewPanel";
import { AccountingTabs } from "@/features/accounting/AccountingTabs";
import { CashFlowChart } from "@/features/accounting/CashFlowChart";
import { DebtTable } from "@/features/accounting/DebtTable";
import { ExpensePanel } from "@/features/accounting/ExpensePanel";
import { FixedAssetPanel } from "@/features/accounting/FixedAssetPanel";
import { AccountingReportsPanel, ChartOfAccountsPanel, JournalEntriesPanel } from "@/features/accounting/LedgerPanels";
import { TaxInvoicePanel } from "@/features/accounting/TaxInvoicePanel";
import { VatReportPanel } from "@/features/accounting/VatReportPanel";
import { VoucherFormModal } from "@/features/accounting/VoucherFormModal";
import { VoucherTable } from "@/features/accounting/VoucherTable";
import {
  useAccountingReports,
  useAccountingOverview,
  useAccounts,
  useCreatePayment,
  useCreateReceipt,
  useDebts,
  useJournalEntries,
  usePayments,
  useReceipts
} from "@/features/accounting/hooks";
import type {
  AccountingFilters as AccountingFiltersType,
  AccountingTab,
  DebtFilters,
  VoucherType
} from "@/features/accounting/types";

const initialVoucherFilters: AccountingFiltersType = {
  keyword: "",
  status: "ALL",
  method: "ALL",
  page: 1,
  pageSize: 8
};

const initialDebtFilters: DebtFilters = {
  keyword: "",
  partyType: "ALL",
  page: 1,
  pageSize: 8
};

export default function AccountingPage() {
  const [tab, setTab] = useState<AccountingTab>("overview");
  const [receiptFilters, setReceiptFilters] = useState<AccountingFiltersType>(initialVoucherFilters);
  const [paymentFilters, setPaymentFilters] = useState<AccountingFiltersType>(initialVoucherFilters);
  const [debtFilters, setDebtFilters] = useState<DebtFilters>(initialDebtFilters);
  const [voucherModal, setVoucherModal] = useState<VoucherType | null>(null);

  const overview = useAccountingOverview();
  const accounts = useAccounts();
  const journalEntries = useJournalEntries();
  const reports = useAccountingReports();
  const receipts = useReceipts(receiptFilters);
  const payments = usePayments(paymentFilters);
  const debts = useDebts(debtFilters);
  const createReceipt = useCreateReceipt();
  const createPayment = useCreatePayment();

  async function handleCreateReceipt(payload: Parameters<typeof createReceipt.mutateAsync>[0]) {
    try {
      await createReceipt.mutateAsync(payload);
      setVoucherModal(null);
    } catch {
      // handled in hook
    }
  }

  async function handleCreatePayment(payload: Parameters<typeof createPayment.mutateAsync>[0]) {
    try {
      await createPayment.mutateAsync(payload);
      setVoucherModal(null);
    } catch {
      // handled in hook
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-text">Kế toán — ERP</h1>
          <p className="mt-1 text-sm text-slate-500">
            Bút toán • Hóa đơn VAT • Chi phí • TSCĐ • Báo cáo tài chính
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => { setTab("receipts"); setVoucherModal("RECEIPT"); }}>
            <Plus className="h-4 w-4" />
            Tạo phiếu thu
          </Button>
          <Button variant="secondary" onClick={() => { setTab("payments"); setVoucherModal("PAYMENT"); }}>
            <Plus className="h-4 w-4" />
            Tạo phiếu chi
          </Button>
        </div>
      </section>

      <AccountingTabs value={tab} onChange={setTab} />

      {/* ── Existing panels ── */}

      {tab === "overview" && <AccountingOverviewPanel data={overview.data} loading={overview.isLoading} />}

      {tab === "accounts" && <ChartOfAccountsPanel data={accounts.data} loading={accounts.isLoading} />}

      {tab === "journal" && <JournalEntriesPanel data={journalEntries.data} loading={journalEntries.isLoading} />}

      {tab === "receipts" && (
        <section className="rounded-lg border border-border bg-white shadow-soft">
          <div className="border-b border-border p-4">
            <AccountingFilters mode="voucher" value={receiptFilters} onChange={setReceiptFilters} />
          </div>
          <VoucherTable
            type="RECEIPT"
            data={receipts.data}
            params={receiptFilters}
            loading={receipts.isLoading}
            onPageChange={(page) => setReceiptFilters((current) => ({ ...current, page }))}
          />
        </section>
      )}

      {tab === "payments" && (
        <section className="rounded-lg border border-border bg-white shadow-soft">
          <div className="border-b border-border p-4">
            <AccountingFilters mode="voucher" value={paymentFilters} onChange={setPaymentFilters} />
          </div>
          <VoucherTable
            type="PAYMENT"
            data={payments.data}
            params={paymentFilters}
            loading={payments.isLoading}
            onPageChange={(page) => setPaymentFilters((current) => ({ ...current, page }))}
          />
        </section>
      )}

      {tab === "debts" && (
        <section className="rounded-lg border border-border bg-white shadow-soft">
          <div className="border-b border-border p-4">
            <AccountingFilters mode="debt" value={debtFilters} onChange={setDebtFilters} />
          </div>
          <DebtTable
            data={debts.data}
            params={debtFilters}
            loading={debts.isLoading}
            onPageChange={(page) => setDebtFilters((current) => ({ ...current, page }))}
          />
        </section>
      )}

      {tab === "reports" && (
        <AccountingReportsPanel
          trialBalance={reports.data?.trialBalance}
          balanceSheet={reports.data?.balanceSheet}
          incomeStatement={reports.data?.incomeStatement}
          customerDebtAging={reports.data?.customerDebtAging}
          supplierDebtAging={reports.data?.supplierDebtAging}
          loading={reports.isLoading}
        />
      )}

      {tab === "cashflow" && (
        <div className="space-y-4">
          <CashFlowChart data={overview.data?.cashFlow.series ?? []} />
          <section className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="Tiền vào" value={overview.data?.cashFlow.cashIn ?? 0} />
            <SummaryCard label="Tiền ra" value={overview.data?.cashFlow.cashOut ?? 0} />
            <SummaryCard label="Dòng tiền thuần" value={overview.data?.cashFlow.netCashFlow ?? 0} />
          </section>
        </div>
      )}

      {/* ── New ERP panels ── */}

      {tab === "tax-invoices" && <TaxInvoicePanel />}

      {tab === "vat-report" && <VatReportPanel />}

      {tab === "expenses" && <ExpensePanel />}

      {tab === "fixed-assets" && <FixedAssetPanel />}

      <VoucherFormModal
        open={voucherModal !== null}
        type={voucherModal ?? "RECEIPT"}
        loading={createReceipt.isPending || createPayment.isPending}
        onClose={() => setVoucherModal(null)}
        onCreateReceipt={(payload) => void handleCreateReceipt(payload)}
        onCreatePayment={(payload) => void handleCreatePayment(payload)}
      />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-text">
        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value)}
      </p>
    </article>
  );
}
