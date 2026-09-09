"use client";

import React, { useState } from "react";
import { accountingApi } from "@/features/accounting/api";
import ReportNumber from "./ReportNumber";
import { Search, Loader2 } from "lucide-react";

interface GeneralLedgerProps {
  fromDate: string;
  toDate: string;
  initialAccountCode?: string;
}

export default function GeneralLedger({ fromDate, toDate, initialAccountCode }: GeneralLedgerProps) {
  const [accountCode, setAccountCode] = useState(initialAccountCode || "");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!accountCode.trim()) return;
    
    setLoading(true);
    setError("");
    try {
      const res = await accountingApi.generalLedgerRaw(accountCode.trim(), fromDate, toDate);
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load general ledger");
    } finally {
      setLoading(false);
    }
  };

  // If initialAccountCode changes and it's different from current state, fetch automatically
  React.useEffect(() => {
    if (initialAccountCode && initialAccountCode !== accountCode) {
      setAccountCode(initialAccountCode);
    }
  }, [initialAccountCode]);

  React.useEffect(() => {
    if (initialAccountCode) {
      handleFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAccountCode, fromDate, toDate]);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end print:hidden">
        <form onSubmit={handleFetch} className="flex-1 flex gap-2">
          <div className="flex-1 max-w-sm">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã tài khoản</label>
            <div className="relative">
              <input
                type="text"
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
                placeholder="VD: 111, 112, 131..."
                className="w-full pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm"
                required
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !accountCode.trim()}
              className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Xem Sổ Cái
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="animate-pulse h-96 bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Đang tải dữ liệu sổ cái...</p>
        </div>
      )}

      {data && !loading && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="text-center py-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 uppercase">Sổ Cái Tài Khoản</h2>
            <p className="text-lg text-violet-700 font-semibold mt-1">TK {data.accountCode} - {data.accountName}</p>
            <p className="text-sm text-gray-500 mt-2">
              Từ {new Date(data.fromDate).toLocaleDateString('vi-VN')} đến {new Date(data.toDate).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-gray-700 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold border-r">Ngày HT</th>
                  <th className="px-4 py-3 font-semibold border-r">Số CT</th>
                  <th className="px-4 py-3 font-semibold border-r">Diễn giải</th>
                  <th className="px-4 py-3 font-semibold border-r text-center">TK ĐƯ</th>
                  <th className="px-4 py-3 font-semibold border-r text-right">PS Nợ</th>
                  <th className="px-4 py-3 font-semibold border-r text-right">PS Có</th>
                  <th className="px-4 py-3 font-semibold text-right">Số Dư</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Dư đầu kỳ */}
                <tr className="bg-amber-50/30 font-medium">
                  <td colSpan={4} className="px-4 py-3 border-r text-gray-800 text-center uppercase tracking-wide text-xs">
                    Số dư đầu kỳ
                  </td>
                  <td className="px-4 py-3 border-r text-right text-gray-400">—</td>
                  <td className="px-4 py-3 border-r text-right text-gray-400">—</td>
                  <td className="px-4 py-3 text-right">
                    <ReportNumber value={data.openingBalance} />
                  </td>
                </tr>

                {/* Các phát sinh */}
                {data.lines.map((line: any) => (
                  <tr key={line.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-2 border-r text-gray-600 whitespace-nowrap">
                      {new Date(line.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-2 border-r text-violet-600 font-medium whitespace-nowrap">
                      {line.entryCode}
                    </td>
                    <td className="px-4 py-2 border-r text-gray-800">{line.description}</td>
                    <td className="px-4 py-2 border-r text-center text-gray-600">{line.counterAccount}</td>
                    <td className="px-4 py-2 border-r text-right"><ReportNumber value={line.debitAmount} /></td>
                    <td className="px-4 py-2 border-r text-right"><ReportNumber value={line.creditAmount} /></td>
                    <td className="px-4 py-2 text-right">
                      <ReportNumber value={line.runningBalance} />
                    </td>
                  </tr>
                ))}

                {data.lines.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Không có chứng từ phát sinh trong kỳ
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr className="font-bold text-gray-900">
                  <td colSpan={4} className="px-4 py-3 border-r text-right uppercase text-xs tracking-wide">
                    Cộng phát sinh trong kỳ
                  </td>
                  <td className="px-4 py-3 border-r text-right">
                    <ReportNumber value={data.lines.reduce((s: number, l: any) => s + l.debitAmount, 0)} />
                  </td>
                  <td className="px-4 py-3 border-r text-right">
                    <ReportNumber value={data.lines.reduce((s: number, l: any) => s + l.creditAmount, 0)} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">—</td>
                </tr>
                <tr className="bg-amber-100/50 font-bold text-gray-900">
                  <td colSpan={4} className="px-4 py-4 border-r text-right uppercase text-sm tracking-wide">
                    Số dư cuối kỳ
                  </td>
                  <td className="px-4 py-4 border-r text-right text-gray-400">—</td>
                  <td className="px-4 py-4 border-r text-right text-gray-400">—</td>
                  <td className="px-4 py-4 text-right text-lg text-violet-700">
                    <ReportNumber value={data.closingBalance} />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
