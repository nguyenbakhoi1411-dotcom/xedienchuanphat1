"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingApi } from "./api";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";

export function RecurringJournalPanel() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({ name: "", description: "", debitAccount: "642", creditAccount: "242", amount: "", startDate: "", endDate: "", frequency: "MONTHLY", costCenterId: "" });
  const [runDate, setRunDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["recurring-journals", keyword],
    queryFn: () => accountingApi.recurringJournals(keyword, 0, 50),
  });

  const { data: costCentersData } = useQuery({
    queryKey: ["cost-centers"],
    queryFn: () => accountingApi.costCenters("", 0, 100),
  });

  const createMut = useMutation({
    mutationFn: (req: any) => accountingApi.createRecurringJournal(req),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["recurring-journals"] }); setShowForm(false); },
  });

  const runMut = useMutation({
    mutationFn: (date: string) => accountingApi.runRecurringJournals(date),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["recurring-journals"] }); },
  });

  const list = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Bút toán định kỳ</h2>
          <p className="text-sm text-slate-500">Thiết lập hạch toán tự động (phân bổ chi phí, trả trước dài hạn...)</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-amber-50 rounded-lg p-1 border border-amber-200">
            <input type="date" value={runDate} onChange={e => setRunDate(e.target.value)} className="bg-transparent border-none text-sm outline-none px-2" />
            <button onClick={() => runMut.mutate(runDate)} disabled={!runDate || runMut.isPending} className="bg-amber-500 text-white px-3 py-1.5 rounded-md text-sm font-bold disabled:opacity-50">
              Chạy phân bổ
            </button>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90">
            + Thêm cấu hình
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
            <tr>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Tài khoản Nợ/Có</th>
              <th className="px-4 py-3 text-right">Số tiền</th>
              <th className="px-4 py-3">Bắt đầu / Kết thúc</th>
              <th className="px-4 py-3">Tần suất</th>
              <th className="px-4 py-3">Lần chạy cuối</th>
              <th className="px-4 py-3">TTCP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={7} className="p-4"><Skeleton className="h-10 w-full" /></td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={7} className="p-8"><EmptyState title="Không có bút toán định kỳ" /></td></tr>
            ) : (
              list.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-red-500">Nợ {item.debitAccount}</span> / <span className="font-bold text-green-600">Có {item.creditAccount}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">{fmt(item.amount)}</td>
                  <td className="px-4 py-3 text-xs">
                    {item.startDate} &rarr; {item.endDate || "Không giới hạn"}
                  </td>
                  <td className="px-4 py-3"><Badge tone="blue">{item.frequency}</Badge></td>
                  <td className="px-4 py-3 font-medium text-amber-600">{item.lastRunDate || "Chưa chạy"}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{item.costCenterName || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Thêm Bút Toán Định Kỳ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên cấu hình</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">TK Nợ</label>
                <input type="text" value={form.debitAccount} onChange={e => setForm({...form, debitAccount: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">TK Có</label>
                <input type="text" value={form.creditAccount} onChange={e => setForm({...form, creditAccount: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số tiền mỗi kỳ</label>
                <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày bắt đầu</label>
                <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày kết thúc (tùy chọn)</label>
                <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tần suất</label>
                <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm">
                  <option value="MONTHLY">Hàng tháng</option>
                  <option value="WEEKLY">Hàng tuần</option>
                  <option value="DAILY">Hàng ngày</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trung tâm chi phí</label>
                <select value={form.costCenterId} onChange={e => setForm({...form, costCenterId: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm">
                  <option value="">-- Không có --</option>
                  {costCentersData?.items.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4 mt-4 border-t border-slate-100">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-600 font-semibold">Hủy</button>
              <button onClick={() => createMut.mutate({ ...form, amount: Number(form.amount), costCenterId: form.costCenterId ? Number(form.costCenterId) : null })} disabled={createMut.isPending || !form.name || !form.amount || !form.startDate} className="flex-1 py-2 rounded-lg bg-primary text-white font-semibold disabled:opacity-50">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
