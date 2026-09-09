"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { CashLedgerDto } from "@/features/cash/types";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Add SheetJS import via dynamic or require if it's installed, or use window.XLSX if loaded via CDN
// We will assume window.XLSX is available or we will load it in page.tsx
declare global {
  interface Window {
    XLSX: any;
  }
}

type Props = {
  data: CashLedgerDto | null;
  loading: boolean;
};

export function CashLedger({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4 p-4 bg-white border rounded-lg">
        <div className="flex gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-1/4 rounded-lg" />)}
        </div>
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (!data) return null;

  const handleExportExcel = () => {
    if (!window.XLSX) {
      alert("Tính năng xuất Excel đang tải thư viện, vui lòng thử lại sau vài giây.");
      return;
    }
    
    // Prepare data
    const wsData = [
      ["SỔ QUỸ TIỀN MẶT"],
      [],
      ["Dư đầu kỳ:", data.soDuDauKy],
      ["Tổng thu trong kỳ:", data.tongThuTrongKy],
      ["Tổng chi trong kỳ:", data.tongChiTrongKy],
      ["Dư cuối kỳ:", data.soDuCuoiKy],
      [],
      ["Ngày", "Loại", "Mã CT", "Diễn giải", "Thu", "Chi", "Tồn quỹ"]
    ];

    data.transactions.forEach(row => {
      wsData.push([
        new Date(row.ngay).toLocaleDateString("vi-VN"),
        row.loai === "RECEIPT" ? "Thu" : "Chi",
        row.maChungTu,
        row.dienGiai,
        row.thu,
        row.chi,
        row.soDuSauGd
      ]);
    });

    const ws = window.XLSX.utils.aoa_to_sheet(wsData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "SoQuy");
    window.XLSX.writeFile(wb, `SoQuy_${new Date().getTime()}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* 4 Cards Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Dư đầu kỳ</p>
          <p className="text-2xl font-bold text-slate-800">
            {new Intl.NumberFormat("vi-VN").format(data.soDuDauKy)} <span className="text-sm font-normal text-slate-500">đ</span>
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Tổng thu trong kỳ</p>
          <p className="text-2xl font-bold text-emerald-600">
            +{new Intl.NumberFormat("vi-VN").format(data.tongThuTrongKy)} <span className="text-sm font-normal text-slate-500">đ</span>
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Tổng chi trong kỳ</p>
          <p className="text-2xl font-bold text-orange-600">
            -{new Intl.NumberFormat("vi-VN").format(data.tongChiTrongKy)} <span className="text-sm font-normal text-slate-500">đ</span>
          </p>
        </div>
        <div className={`bg-white border rounded-lg p-4 shadow-sm border-l-4 ${data.soDuCuoiKy < 0 ? 'border-l-red-500 bg-red-50' : 'border-l-blue-500'}`}>
          <p className="text-sm font-medium text-slate-500 mb-1">Dư cuối kỳ</p>
          <p className={`text-2xl font-bold ${data.soDuCuoiKy < 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {new Intl.NumberFormat("vi-VN").format(data.soDuCuoiKy)} <span className="text-sm font-normal text-slate-500">đ</span>
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium text-slate-800">Chi tiết giao dịch (Đã ghi sổ)</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
              <Download className="w-4 h-4" /> Xuất Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" /> In sổ
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left print-table">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Ngày</th>
                <th className="px-4 py-3 font-medium">Mã CT</th>
                <th className="px-4 py-3 font-medium">Diễn giải</th>
                <th className="px-4 py-3 font-medium text-right">Thu</th>
                <th className="px-4 py-3 font-medium text-right">Chi</th>
                <th className="px-4 py-3 font-medium text-right border-l">Tồn quỹ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Dư đầu kỳ row */}
              <tr className="bg-slate-50/50 font-medium text-slate-600">
                <td colSpan={3} className="px-4 py-3 text-right">Số dư đầu kỳ:</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-right border-l">{new Intl.NumberFormat("vi-VN").format(data.soDuDauKy)}</td>
              </tr>
              
              {data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Không có phát sinh trong kỳ</td>
                </tr>
              ) : (
                data.transactions.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{new Date(row.ngay).toLocaleDateString("vi-VN")}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{row.maChungTu}</td>
                    <td className="px-4 py-3 text-slate-600">{row.dienGiai || "—"}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">
                      {row.thu > 0 ? new Intl.NumberFormat("vi-VN").format(row.thu) : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-orange-600">
                      {row.chi > 0 ? new Intl.NumberFormat("vi-VN").format(row.chi) : ""}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium border-l ${row.soDuSauGd < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                      {new Intl.NumberFormat("vi-VN").format(row.soDuSauGd)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-semibold border-t">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right">Tổng phát sinh:</td>
                <td className="px-4 py-3 text-right text-emerald-700">{new Intl.NumberFormat("vi-VN").format(data.tongThuTrongKy)}</td>
                <td className="px-4 py-3 text-right text-orange-700">{new Intl.NumberFormat("vi-VN").format(data.tongChiTrongKy)}</td>
                <td className="px-4 py-3 border-l"></td>
              </tr>
              <tr className="border-t">
                <td colSpan={3} className="px-4 py-3 text-right">Số dư cuối kỳ:</td>
                <td colSpan={2}></td>
                <td className={`px-4 py-3 text-right border-l ${data.soDuCuoiKy < 0 ? 'text-red-700' : 'text-blue-700'}`}>
                  {new Intl.NumberFormat("vi-VN").format(data.soDuCuoiKy)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
