"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingApi } from "./api";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Search } from "lucide-react";

export function CostCenterPanel() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({ code: "", name: "", description: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["cost-centers", keyword],
    queryFn: () => accountingApi.costCenters(keyword, 0, 50),
  });

  const createMut = useMutation({
    mutationFn: (req: { code: string; name: string; description?: string }) => accountingApi.createCostCenter(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cost-centers"] });
      setShowForm(false);
      setForm({ code: "", name: "", description: "" });
    },
  });

  const deactivateMut = useMutation({
    mutationFn: (id: number) => accountingApi.deactivateCostCenter(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cost-centers"] }),
  });

  const list = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Trung tâm chi phí</h2>
          <p className="text-sm text-slate-500">Quản lý trung tâm chi phí để bóc tách doanh thu, chi phí theo bộ phận.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90"
        >
          + Thêm TTCP
        </button>
      </div>

      <div className="relative w-72">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
            <tr>
              <th className="px-4 py-3">Mã TTCP</th>
              <th className="px-4 py-3">Tên trung tâm chi phí</th>
              <th className="px-4 py-3">Mô tả</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={5} className="p-4"><Skeleton className="h-10 w-full" /></td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={5} className="p-8"><EmptyState title="Không có dữ liệu" /></td></tr>
            ) : (
              list.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-800 font-medium">{item.code}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-slate-500">{item.description}</td>
                  <td className="px-4 py-3">
                    <Badge tone={item.status === "ACTIVE" ? "green" : "slate"}>
                      {item.status === "ACTIVE" ? "Hoạt động" : "Ngừng HĐ"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.status === "ACTIVE" && (
                      <button
                        onClick={() => deactivateMut.mutate(item.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                      >
                        Ngừng
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Thêm Trung Tâm Chi Phí</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã TTCP</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên TTCP</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  onClick={() => createMut.mutate(form)}
                  disabled={createMut.isPending || !form.code || !form.name}
                  className="flex-1 py-2 rounded-lg bg-primary text-white font-semibold disabled:opacity-50"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
