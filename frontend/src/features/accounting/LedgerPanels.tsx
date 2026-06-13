"use client";

import type { ChartOfAccount, DebtAgingRow, FinancialStatement, JournalEntry, PageResponse } from "./types";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export function ChartOfAccountsPanel({ data, loading }: { data?: PageResponse<ChartOfAccount>; loading: boolean }) {
  return (
    <section className="rounded-lg border border-border bg-white shadow-soft">
      <PanelHeader title="He thong tai khoan" description="Danh muc tai khoan ke toan dung cho but toan kep va bao cao." />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Ma TK</th><th className="px-4 py-3">Ten tai khoan</th><th className="px-4 py-3">Loai</th><th className="px-4 py-3">Trang thai</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? <SkeletonRow columns={4} /> : data?.items.map((item) => (
              <tr key={item.id}><td className="px-4 py-3 font-semibold">{item.accountCode}</td><td className="px-4 py-3">{item.accountName}</td><td className="px-4 py-3">{item.accountType}</td><td className="px-4 py-3">{item.active ? "Dang dung" : "Ngung"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function JournalEntriesPanel({ data, loading }: { data?: PageResponse<JournalEntry>; loading: boolean }) {
  return (
    <section className="rounded-lg border border-border bg-white shadow-soft">
      <PanelHeader title="But toan ke toan" description="Chi cac but toan POSTED moi anh huong bao cao." />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Ngay</th><th className="px-4 py-3">Tham chieu</th><th className="px-4 py-3">Trang thai</th><th className="px-4 py-3 text-right">Tong No</th><th className="px-4 py-3 text-right">Tong Co</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? <SkeletonRow columns={5} /> : data?.items.map((item) => (
              <tr key={item.id}><td className="px-4 py-3">{item.entryDate}</td><td className="px-4 py-3">{item.referenceType} {item.referenceId}</td><td className="px-4 py-3">{item.status}</td><td className="px-4 py-3 text-right">{money.format(item.totalDebit)}</td><td className="px-4 py-3 text-right">{money.format(item.totalCredit)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AccountingReportsPanel({ trialBalance, balanceSheet, incomeStatement, customerDebtAging, supplierDebtAging, loading }: { trialBalance?: FinancialStatement; balanceSheet?: FinancialStatement; incomeStatement?: FinancialStatement; customerDebtAging?: DebtAgingRow[]; supplierDebtAging?: DebtAgingRow[]; loading: boolean }) {
  return (
    <div className="space-y-4">
      <StatementTable title="Trial Balance" data={trialBalance} loading={loading} />
      <StatementTable title="Balance Sheet co ban" data={balanceSheet} loading={loading} />
      <StatementTable title="Income Statement co ban" data={incomeStatement} loading={loading} />
      <AgingTable title="Customer Debt Aging" rows={customerDebtAging} loading={loading} />
      <AgingTable title="Supplier Debt Aging" rows={supplierDebtAging} loading={loading} />
    </div>
  );
}

function StatementTable({ title, data, loading }: { title: string; data?: FinancialStatement; loading: boolean }) {
  return (
    <section className="rounded-lg border border-border bg-white shadow-soft">
      <PanelHeader title={title} description={data ? `${data.fromDate} - ${data.toDate}` : "Dang tai du lieu"} />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">TK</th><th className="px-4 py-3">Ten tai khoan</th><th className="px-4 py-3 text-right">No</th><th className="px-4 py-3 text-right">Co</th><th className="px-4 py-3 text-right">So du</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? <SkeletonRow columns={5} /> : data?.rows.map((row) => (
              <tr key={row.accountCode}><td className="px-4 py-3 font-semibold">{row.accountCode}</td><td className="px-4 py-3">{row.accountName}</td><td className="px-4 py-3 text-right">{money.format(row.debitAmount)}</td><td className="px-4 py-3 text-right">{money.format(row.creditAmount)}</td><td className="px-4 py-3 text-right">{money.format(row.balance)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AgingTable({ title, rows, loading }: { title: string; rows?: DebtAgingRow[]; loading: boolean }) {
  return (
    <section className="rounded-lg border border-border bg-white shadow-soft">
      <PanelHeader title={title} description="Phan tich cong no theo tuoi no." />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Doi tuong</th><th className="px-4 py-3 text-right">0-30</th><th className="px-4 py-3 text-right">31-60</th><th className="px-4 py-3 text-right">61-90</th><th className="px-4 py-3 text-right">&gt;90</th><th className="px-4 py-3 text-right">Tong</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? <SkeletonRow columns={6} /> : rows?.map((row) => (
              <tr key={`${row.partyType}-${row.partyId}`}><td className="px-4 py-3">{row.partyName}</td><td className="px-4 py-3 text-right">{money.format(row.bucket0To30)}</td><td className="px-4 py-3 text-right">{money.format(row.bucket31To60)}</td><td className="px-4 py-3 text-right">{money.format(row.bucket61To90)}</td><td className="px-4 py-3 text-right">{money.format(row.bucketOver90)}</td><td className="px-4 py-3 text-right font-semibold">{money.format(row.total)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PanelHeader({ title, description }: { title: string; description: string }) {
  return <div className="border-b border-border p-4"><h2 className="text-base font-semibold text-text">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>;
}

function SkeletonRow({ columns }: { columns: number }) {
  return <tr>{Array.from({ length: columns }).map((_, index) => <td key={index} className="px-4 py-3 text-slate-400">Dang tai...</td>)}</tr>;
}
