"use client";

import React from "react";
import ReportNumber from "./ReportNumber";
import { AlertTriangle } from "lucide-react";

interface DebtAgingProps {
  data: any;
  loading?: boolean;
  type: "customer" | "supplier";
  title: string;
}

export default function DebtAging({ data, loading, type, title }: DebtAgingProps) {
  if (loading && !data) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-gray-500">Không có dữ liệu công nợ.</div>;
  }

  const totals = data.reduce(
    (acc: any, row: any) => ({
      total: acc.total + Number(row.total),
      notDue: acc.notDue + Number(row.notDue || 0),
      bucket0To30: acc.bucket0To30 + Number(row.bucket0To30),
      bucket31To60: acc.bucket31To60 + Number(row.bucket31To60),
      bucket61To90: acc.bucket61To90 + Number(row.bucket61To90),
      bucketOver90: acc.bucketOver90 + Number(row.bucketOver90),
    }),
    { total: 0, notDue: 0, bucket0To30: 0, bucket31To60: 0, bucket61To90: 0, bucketOver90: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold border-r min-w-[200px]">Đối tượng</th>
                <th className="px-4 py-3 font-semibold border-r text-right bg-blue-50/50">Tổng nợ</th>
                <th className="px-4 py-3 font-semibold border-r text-right">Trong hạn</th>
                <th className="px-4 py-3 font-semibold border-r text-right text-orange-600">0 - 30 ngày</th>
                <th className="px-4 py-3 font-semibold border-r text-right text-orange-700">31 - 60 ngày</th>
                <th className="px-4 py-3 font-semibold border-r text-right text-red-600">61 - 90 ngày</th>
                <th className="px-4 py-3 font-semibold text-right text-red-700">&gt; 90 ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row: any) => (
                <tr key={row.partyId} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3 border-r font-medium text-gray-900 whitespace-nowrap">
                    {row.partyName}
                  </td>
                  <td className="px-4 py-3 border-r text-right font-semibold bg-blue-50/20">
                    <ReportNumber value={row.total} />
                  </td>
                  <td className="px-4 py-3 border-r text-right text-gray-600">
                    <ReportNumber value={row.notDue} />
                  </td>
                  <td className="px-4 py-3 border-r text-right text-orange-600">
                    <ReportNumber value={row.bucket0To30} />
                  </td>
                  <td className="px-4 py-3 border-r text-right text-orange-700 font-medium">
                    <ReportNumber value={row.bucket31To60} />
                  </td>
                  <td className="px-4 py-3 border-r text-right text-red-600 font-semibold">
                    <ReportNumber value={row.bucket61To90} />
                  </td>
                  <td className="px-4 py-3 text-right text-red-700 font-bold">
                    <div className="flex items-center justify-end gap-1">
                      {row.bucketOver90 > 0 && <AlertTriangle className="w-3 h-3" />}
                      <ReportNumber value={row.bucketOver90} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-bold border-t border-gray-300 text-gray-900">
              <tr>
                <td className="px-4 py-4 text-right border-r uppercase text-xs tracking-wider">Tổng cộng:</td>
                <td className="px-4 py-4 text-right border-r text-base text-violet-700 bg-violet-50/50">
                  <ReportNumber value={totals.total} />
                </td>
                <td className="px-4 py-4 text-right border-r"><ReportNumber value={totals.notDue} /></td>
                <td className="px-4 py-4 text-right border-r text-orange-600"><ReportNumber value={totals.bucket0To30} /></td>
                <td className="px-4 py-4 text-right border-r text-orange-700"><ReportNumber value={totals.bucket31To60} /></td>
                <td className="px-4 py-4 text-right border-r text-red-600"><ReportNumber value={totals.bucket61To90} /></td>
                <td className="px-4 py-4 text-right text-red-700"><ReportNumber value={totals.bucketOver90} /></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
