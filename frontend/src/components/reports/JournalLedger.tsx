"use client";

import React, { useState, useEffect } from "react";
import { accountingApi } from "@/features/accounting/api";
import ReportNumber from "./ReportNumber";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface JournalLedgerProps {
  fromDate: string;
  toDate: string;
}

export default function JournalLedger({ fromDate, toDate }: JournalLedgerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filters
  const [keyword, setKeyword] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [referenceType, setReferenceType] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await accountingApi.journalLedger({
        fromDate,
        toDate,
        keyword,
        accountCode,
        referenceType,
        page,
        pageSize
      });
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load journal ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, page]); // Only re-fetch automatically on date or page change

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchData();
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 print:hidden flex-none">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tìm kiếm</label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Mã CT, diễn giải..."
                className="w-full pl-9 pr-3 py-2 border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tài khoản</label>
            <input
              type="text"
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
              placeholder="111, 112..."
              className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm"
            />
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Loại chứng từ</label>
            <select
              value={referenceType}
              onChange={(e) => setReferenceType(e.target.value)}
              className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="CASH_RECEIPT">Phiếu thu</option>
              <option value="CASH_PAYMENT">Phiếu chi</option>
              <option value="BANK">Báo Nợ/Có NH</option>
              <option value="SALES_ORDER">Bán hàng</option>
              <option value="PURCHASE_RECEIPT">Nhập hàng</option>
              <option value="MANUAL">Khác (Chung)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Lọc
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm flex-none">
          {error}
        </div>
      )}

      {/* Table Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left relative">
            <thead className="bg-gray-50 text-gray-700 border-b-2 border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold border-r w-24">Ngày HT</th>
                <th className="px-4 py-3 font-semibold border-r w-32">Số CT</th>
                <th className="px-4 py-3 font-semibold border-r w-40">Loại CT</th>
                <th className="px-4 py-3 font-semibold border-r">Diễn giải</th>
                <th className="px-4 py-3 font-semibold border-r w-20 text-center">Nợ</th>
                <th className="px-4 py-3 font-semibold border-r w-20 text-center">Có</th>
                <th className="px-4 py-3 font-semibold text-right w-36">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !data && (
                <tr>
                  <td colSpan={7} className="px-4 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
                    <p className="text-gray-400 mt-2">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              )}
              
              {!loading && data?.items?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    Không tìm thấy chứng từ nào phù hợp.
                  </td>
                </tr>
              )}

              {!loading && data?.items?.map((entry: any) => (
                <React.Fragment key={entry.id}>
                  {entry.lines?.map((line: any, idx: number) => (
                    <tr key={line.id} className="hover:bg-blue-50/50 transition-colors">
                      {idx === 0 && (
                        <>
                          <td className="px-4 py-2 border-r text-gray-600 whitespace-nowrap align-top" rowSpan={entry.lines.length}>
                            {new Date(entry.entryDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-4 py-2 border-r text-violet-600 font-medium whitespace-nowrap align-top" rowSpan={entry.lines.length}>
                            {entry.entryCode}
                          </td>
                          <td className="px-4 py-2 border-r text-gray-500 text-xs whitespace-nowrap align-top" rowSpan={entry.lines.length}>
                            {entry.referenceType}
                          </td>
                          <td className="px-4 py-2 border-r text-gray-800 font-medium align-top" rowSpan={entry.lines.length}>
                            {entry.description}
                          </td>
                        </>
                      )}
                      
                      <td className="px-4 py-2 border-r text-center font-medium">
                        {line.debitAmount > 0 ? line.accountCode : ''}
                      </td>
                      <td className="px-4 py-2 border-r text-center font-medium">
                        {line.creditAmount > 0 ? line.accountCode : ''}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <ReportNumber value={line.debitAmount > 0 ? line.debitAmount : line.creditAmount} />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer */}
        {data && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between flex-none">
            <div className="text-sm text-gray-600">
              Tổng số <span className="font-bold text-gray-900">{data.totalElements}</span> bút toán
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm">
                Trang {data.page} / {data.totalPages || 1}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.totalPages - 1 || loading}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
