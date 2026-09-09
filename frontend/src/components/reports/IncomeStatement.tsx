"use client";

import React from "react";
import ReportNumber from "./ReportNumber";

interface IncomeStatementProps {
  incomeData: any;
  profitLossData: any;
  loading?: boolean;
}

export default function IncomeStatement({ incomeData, profitLossData, loading }: IncomeStatementProps) {
  if (loading && !incomeData) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;
  }

  if (!incomeData || !profitLossData) return null;

  const rows = incomeData.rows || [];
  
  // Helpers to get balance from raw rows (debit - credit or credit - debit depending on account type)
  // Revenue increases with credit, Expense increases with debit
  const getCreditSum = (prefix: string) => {
    return rows.filter((r: any) => r.accountCode.startsWith(prefix)).reduce((sum: number, r: any) => sum + r.creditAmount, 0);
  };
  const getDebitSum = (prefix: string) => {
    return rows.filter((r: any) => r.accountCode.startsWith(prefix)).reduce((sum: number, r: any) => sum + r.debitAmount, 0);
  };

  const dtBanHang = getCreditSum("511");
  const giamTruDT = getDebitSum("521");
  const dtThuan = dtBanHang - giamTruDT;
  const giaVon = getDebitSum("632");
  const loNhuanGop = dtThuan - giaVon;
  
  const dtTaiChinh = getCreditSum("515");
  const cpTaiChinh = getDebitSum("635");
  const cpBanHang = getDebitSum("641");
  const cpQldn = getDebitSum("642");
  const lnThuanTuHDKD = loNhuanGop + dtTaiChinh - cpTaiChinh - cpBanHang - cpQldn;

  const thuNhapKhac = getCreditSum("711");
  const cpKhac = getDebitSum("811");
  const lnKhac = thuNhapKhac - cpKhac;

  const lnTruocThue = lnThuanTuHDKD + lnKhac;
  const cpThue = getDebitSum("821");
  const lnSauThue = lnTruocThue - cpThue;

  const maxVal = Math.max(dtThuan, giaVon, cpBanHang, cpQldn, Math.abs(lnSauThue));

  const renderBar = (val: number, color: string) => (
    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden ml-4 inline-block align-middle">
      <div className={`h-full ${color}`} style={{ width: `${maxVal > 0 ? (Math.abs(val) / maxVal) * 100 : 0}%` }} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 uppercase">Kết quả hoạt động kinh doanh</h3>
          <span className="text-sm text-gray-500">Đơn vị tính: VNĐ</span>
        </div>
        
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {/* 1. DT BH */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700">1. Doanh thu bán hàng và cung cấp dịch vụ</td>
              <td className="px-6 py-3 text-center text-gray-400">511</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={dtBanHang} /></td>
            </tr>
            {/* 2. Giảm trừ */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700 pl-10">2. Các khoản giảm trừ doanh thu</td>
              <td className="px-6 py-3 text-center text-gray-400">521</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={giamTruDT} type="cost" /></td>
            </tr>
            {/* 3. DT Thuần */}
            <tr className="bg-emerald-50/30">
              <td className="px-6 py-3 font-semibold text-emerald-800">3. Doanh thu thuần về bán hàng và CCDV (10 = 01 - 02)</td>
              <td className="px-6 py-3 text-center text-gray-400"></td>
              <td className="px-6 py-3 text-right font-bold text-emerald-700">
                <ReportNumber value={dtThuan} />
                {renderBar(dtThuan, 'bg-emerald-400')}
              </td>
            </tr>
            {/* 4. Giá vốn */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700">4. Giá vốn hàng bán</td>
              <td className="px-6 py-3 text-center text-gray-400">632</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={giaVon} type="cost" /></td>
            </tr>
            {/* 5. LN Gộp */}
            <tr className={loNhuanGop > 0 ? "bg-emerald-50" : "bg-red-50"}>
              <td className="px-6 py-3 font-semibold text-gray-900">5. Lợi nhuận gộp về bán hàng và CCDV (20 = 10 - 11)</td>
              <td className="px-6 py-3 text-center text-gray-400"></td>
              <td className="px-6 py-3 text-right font-bold">
                <ReportNumber value={loNhuanGop} type="profit" />
                {renderBar(loNhuanGop, loNhuanGop > 0 ? 'bg-emerald-500' : 'bg-red-500')}
              </td>
            </tr>

            {/* Chi phí HĐ */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700">6. Doanh thu hoạt động tài chính</td>
              <td className="px-6 py-3 text-center text-gray-400">515</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={dtTaiChinh} /></td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700">7. Chi phí tài chính</td>
              <td className="px-6 py-3 text-center text-gray-400">635</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={cpTaiChinh} type="cost" /></td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700">8. Chi phí bán hàng</td>
              <td className="px-6 py-3 text-center text-gray-400">641</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={cpBanHang} type="cost" /></td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700">9. Chi phí quản lý doanh nghiệp</td>
              <td className="px-6 py-3 text-center text-gray-400">642</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={cpQldn} type="cost" /></td>
            </tr>
            
            {/* LN HDKD */}
            <tr className="bg-gray-50 font-medium">
              <td className="px-6 py-3 text-gray-900">10. Lợi nhuận thuần từ hoạt động kinh doanh (30 = 20 + 21 - 22 - 25 - 26)</td>
              <td className="px-6 py-3 text-center text-gray-400"></td>
              <td className="px-6 py-3 text-right"><ReportNumber value={lnThuanTuHDKD} type="profit" /></td>
            </tr>

            {/* Khác */}
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700">11. Thu nhập khác</td>
              <td className="px-6 py-3 text-center text-gray-400">711</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={thuNhapKhac} /></td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700">12. Chi phí khác</td>
              <td className="px-6 py-3 text-center text-gray-400">811</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={cpKhac} type="cost" /></td>
            </tr>

            {/* LN Trước thuế */}
            <tr className="bg-gray-100 font-bold">
              <td className="px-6 py-4 text-gray-900">13. Tổng lợi nhuận kế toán trước thuế (50 = 30 + 40)</td>
              <td className="px-6 py-4 text-center text-gray-400"></td>
              <td className="px-6 py-4 text-right text-base"><ReportNumber value={lnTruocThue} type="profit" /></td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700 pl-10">14. Chi phí thuế TNDN hiện hành</td>
              <td className="px-6 py-3 text-center text-gray-400">821</td>
              <td className="px-6 py-3 text-right"><ReportNumber value={cpThue} type="cost" /></td>
            </tr>

            {/* LN Sau thuế */}
            <tr className={lnSauThue > 0 ? "bg-emerald-100" : "bg-red-100"}>
              <td className={`px-6 py-5 text-lg font-bold uppercase ${lnSauThue > 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                15. Lợi nhuận sau thuế thu nhập doanh nghiệp (60 = 50 - 51 - 52)
              </td>
              <td className="px-6 py-5 text-center"></td>
              <td className="px-6 py-5 text-right text-xl font-black">
                <ReportNumber value={lnSauThue} type="profit" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
