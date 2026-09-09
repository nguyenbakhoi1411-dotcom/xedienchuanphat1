"use client";
import { ExpensePanel } from "@/features/accounting/ExpensePanel";

export default function ExpensesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text">Chi phí</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý và phê duyệt các khoản chi phí
        </p>
      </div>
      <ExpensePanel />
    </div>
  );
}
