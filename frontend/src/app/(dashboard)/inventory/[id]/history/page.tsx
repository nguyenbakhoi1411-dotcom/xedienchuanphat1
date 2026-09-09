"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MOCK_HISTORY_DATA = [
  { date: "2023-10-01", stock: 100, in: 100, out: 0 },
  { date: "2023-10-02", stock: 90, in: 0, out: 10 },
  { date: "2023-10-03", stock: 95, in: 15, out: 10 },
  { date: "2023-10-04", stock: 80, in: 0, out: 15 },
  { date: "2023-10-05", stock: 130, in: 50, out: 0 },
  { date: "2023-10-06", stock: 110, in: 0, out: 20 },
  { date: "2023-10-07", stock: 120, in: 25, out: 15 },
];

const MOCK_TRANSACTIONS = [
  { id: 1, date: "2023-10-07", type: "Nhập kho", quantity: "+25", reference: "NK-005" },
  { id: 2, date: "2023-10-07", type: "Xuất kho", quantity: "-15", reference: "XK-012" },
  { id: 3, date: "2023-10-06", type: "Xuất kho", quantity: "-20", reference: "XK-011" },
  { id: 4, date: "2023-10-05", type: "Nhập kho", quantity: "+50", reference: "NK-004" },
];

export default function InventoryHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const totalIn = MOCK_HISTORY_DATA.reduce((sum, d) => sum + d.in, 0);
  const totalOut = MOCK_HISTORY_DATA.reduce((sum, d) => sum + d.out, 0);
  const currentStock = MOCK_HISTORY_DATA[MOCK_HISTORY_DATA.length - 1].stock;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Lịch sử tồn kho</h1>
          <p className="text-sm text-slate-500 mt-1">Sản phẩm SP-{String(id).padStart(4, "0")}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Tổng nhập (7 ngày)</div>
          <div className="mt-2 text-2xl font-bold text-green-600">+{totalIn}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Tổng xuất (7 ngày)</div>
          <div className="mt-2 text-2xl font-bold text-red-600">-{totalOut}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Tồn kho hiện tại</div>
          <div className="mt-2 text-2xl font-bold text-primary">{currentStock}</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-medium text-text mb-4">Biểu đồ biến động tồn kho</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_HISTORY_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="stock" name="Tồn kho" stroke="#f97316" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-lg font-medium text-text">Lịch sử giao dịch gần đây</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-border">
            <tr>
              <th className="p-4 font-medium">Ngày</th>
              <th className="p-4 font-medium">Loại giao dịch</th>
              <th className="p-4 font-medium">Mã tham chiếu</th>
              <th className="p-4 font-medium text-right">Số lượng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_TRANSACTIONS.map((txn) => (
              <tr key={txn.id} className="hover:bg-slate-50">
                <td className="p-4 text-text">{txn.date}</td>
                <td className="p-4 text-text">{txn.type}</td>
                <td className="p-4 text-blue-600 hover:underline cursor-pointer">{txn.reference}</td>
                <td className={`p-4 text-right font-medium ${txn.quantity.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
