"use client";

import React from "react";
import ReportNumber from "./ReportNumber";

interface BalanceSheetProps {
  data: any;
  loading?: boolean;
}

export default function BalanceSheet({ data, loading }: BalanceSheetProps) {
  if (loading && !data) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;
  }

  if (!data || !data.rows) return null;

  const rows = data.rows || [];

  // Helper to calculate total balance for account prefix.
  // Balance sheet uses Debit balance for Assets, Credit balance for Liabilities/Equity.
  const getDebitSum = (prefix: string) => {
    return rows.filter((r: any) => r.accountCode.startsWith(prefix)).reduce((sum: number, r: any) => sum + r.debitAmount - r.creditAmount, 0);
  };
  const getCreditSum = (prefix: string) => {
    return rows.filter((r: any) => r.accountCode.startsWith(prefix)).reduce((sum: number, r: any) => sum + r.creditAmount - r.debitAmount, 0);
  };

  // TÀI SẢN (TK 1, 2)
  const tien = getDebitSum("11");
  const phaiThu = getDebitSum("13");
  const hangTonKho = getDebitSum("15");
  const tsNganHanKhac = getDebitSum("14") + getDebitSum("12");
  const tongTsNganHan = tien + phaiThu + hangTonKho + tsNganHanKhac;

  const tscd = getDebitSum("211") + getDebitSum("213");
  const khauHao = -getCreditSum("214"); // Khấu hao là số âm bên TS
  const tsDaiHanKhac = getDebitSum("22") + getDebitSum("24");
  const tongTsDaiHan = tscd + khauHao + tsDaiHanKhac;

  const tongTaiSan = tongTsNganHan + tongTsDaiHan;

  // NGUỒN VỐN (TK 3, 4)
  const phaiTraNcc = getCreditSum("331");
  const thue = getCreditSum("333");
  const luong = getCreditSum("334");
  const noNganHanKhac = getCreditSum("33") + getCreditSum("34") - phaiTraNcc - thue - luong;
  const tongNoPhaiTra = phaiTraNcc + thue + luong + noNganHanKhac;

  const vonGop = getCreditSum("411");
  const lnChuaPhanPhoi = getCreditSum("421");
  const quyKhac = getCreditSum("41") + getCreditSum("44") - vonGop - lnChuaPhanPhoi;
  const tongVonChuSoHuu = vonGop + lnChuaPhanPhoi + quyKhac;

  const tongNguonVon = tongNoPhaiTra + tongVonChuSoHuu;

  const isBalanced = Math.abs(tongTaiSan - tongNguonVon) < 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* TÀI SẢN */}
        <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 uppercase">Tài Sản</h3>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-gray-50/50">
                <td className="px-6 py-3 font-semibold text-gray-900 uppercase">A. Tài sản ngắn hạn</td>
                <td className="px-6 py-3 text-right font-semibold"><ReportNumber value={tongTsNganHan} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">I. Tiền và các khoản tương đương tiền</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={tien} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">II. Các khoản phải thu ngắn hạn</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={phaiThu} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">III. Hàng tồn kho</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={hangTonKho} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">IV. Tài sản ngắn hạn khác</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={tsNganHanKhac} /></td>
              </tr>

              <tr className="bg-gray-50/50">
                <td className="px-6 py-3 font-semibold text-gray-900 uppercase">B. Tài sản dài hạn</td>
                <td className="px-6 py-3 text-right font-semibold"><ReportNumber value={tongTsDaiHan} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">I. Tài sản cố định</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={tscd} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-500 italic pl-14">- Giá trị hao mòn lũy kế</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={khauHao} parentheses /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">II. Tài sản dài hạn khác</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={tsDaiHanKhac} /></td>
              </tr>
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
              <tr>
                <td className="px-6 py-4 font-bold text-gray-900 uppercase text-base">Tổng cộng tài sản</td>
                <td className="px-6 py-4 text-right font-bold text-lg text-emerald-700">
                  <ReportNumber value={tongTaiSan} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* NGUỒN VỐN */}
        <div className="flex-1">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 uppercase">Nguồn Vốn</h3>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-gray-50/50">
                <td className="px-6 py-3 font-semibold text-gray-900 uppercase">A. Nợ phải trả</td>
                <td className="px-6 py-3 text-right font-semibold"><ReportNumber value={tongNoPhaiTra} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">I. Phải trả người bán</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={phaiTraNcc} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">II. Thuế và các khoản phải nộp NN</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={thue} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">III. Phải trả người lao động</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={luong} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">IV. Nợ phải trả khác</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={noNganHanKhac} /></td>
              </tr>

              <tr className="bg-gray-50/50">
                <td className="px-6 py-3 font-semibold text-gray-900 uppercase">B. Vốn chủ sở hữu</td>
                <td className="px-6 py-3 text-right font-semibold"><ReportNumber value={tongVonChuSoHuu} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">I. Vốn góp của chủ sở hữu</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={vonGop} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">II. Lợi nhuận sau thuế chưa PP</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={lnChuaPhanPhoi} /></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-700 pl-10">III. Quỹ khác</td>
                <td className="px-6 py-2 text-right"><ReportNumber value={quyKhac} /></td>
              </tr>
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
              <tr>
                <td className="px-6 py-4 font-bold text-gray-900 uppercase text-base">Tổng cộng nguồn vốn</td>
                <td className={`px-6 py-4 text-right font-bold text-lg ${isBalanced ? 'text-emerald-700' : 'text-red-600'}`}>
                  <ReportNumber value={tongNguonVon} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {!isBalanced && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center font-medium">
          ⚠️ Bảng cân đối kế toán đang mất cân đối: <ReportNumber value={Math.abs(tongTaiSan - tongNguonVon)} />
        </div>
      )}
    </div>
  );
}
