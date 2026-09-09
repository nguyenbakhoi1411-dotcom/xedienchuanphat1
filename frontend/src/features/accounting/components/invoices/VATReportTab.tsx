"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { 
  Calculator, 
  CalendarDays, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  AlertCircle,
  FileText,
  Search,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/cn";

interface Invoice {
  id: string;
  issueDate: string;
  symbol: string;
  invoiceNumber: string;
  partnerName: string;
  taxCode: string;
  subTotal: number;
  vatAmount: number;
}

interface VATReportResponse {
  totalOutputVat: number;
  totalInputVat: number;
  netVatPayable: number;
  outputInvoices: Invoice[];
  inputInvoices: Invoice[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN");
};

export const VATReportTab = () => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<VATReportResponse | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      // In a real app, use axios or fetch to your API
      const response = await fetch(`/api/accounting/invoices/reports/vat?year=${year}&month=${month}`);
      
      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu báo cáo");
      }
      
      const data: VATReportResponse = await response.json();
      setReport(data);
      toast.success(`Đã lấy báo cáo kỳ ${month}/${year}`);
    } catch (error) {
      console.error("Lỗi khi lấy báo cáo:", error);
      toast.error("Không thể lấy dữ liệu báo cáo thuế");
      
      // MOCK DATA FOR DEMONSTRATION IF API FAILS
      setReport({
        totalOutputVat: 150000000,
        totalInputVat: 120000000,
        netVatPayable: 30000000,
        outputInvoices: [
          { id: "1", issueDate: `${year}-${month.toString().padStart(2, '0')}-05`, symbol: "1C23TDD", invoiceNumber: "0000123", partnerName: "Công ty TNHH Alpha", taxCode: "0101234567", subTotal: 500000000, vatAmount: 50000000 },
          { id: "2", issueDate: `${year}-${month.toString().padStart(2, '0')}-12`, symbol: "1C23TDD", invoiceNumber: "0000124", partnerName: "Công ty Cổ phần Beta", taxCode: "0301234568", subTotal: 1000000000, vatAmount: 100000000 },
        ],
        inputInvoices: [
          { id: "3", issueDate: `${year}-${month.toString().padStart(2, '0')}-02`, symbol: "1C23TAA", invoiceNumber: "0000555", partnerName: "Công ty TNHH Cung Cấp X", taxCode: "0501234569", subTotal: 800000000, vatAmount: 80000000 },
          { id: "4", issueDate: `${year}-${month.toString().padStart(2, '0')}-18`, symbol: "1C23TBB", invoiceNumber: "0000666", partnerName: "Nhà phân phối Y", taxCode: "0701234570", subTotal: 400000000, vatAmount: 40000000 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-500" />
              Năm báo cáo
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            >
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-500" />
              Tháng
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-70 h-[42px]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Lấy báo cáo
        </button>
      </div>

      {report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                    <ArrowUpFromLine className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-600 text-lg">Tổng Thuế Bán ra</h3>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {formatCurrency(report.totalOutputVat)}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                    <ArrowDownToLine className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-600 text-lg">Tổng Thuế Mua vào</h3>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {formatCurrency(report.totalInputVat)}
                </div>
              </div>
            </div>

            <div className={cn(
              "rounded-2xl p-6 shadow-sm border relative overflow-hidden group",
              report.netVatPayable > 0 
                ? "bg-red-50/50 border-red-200" 
                : "bg-emerald-50/50 border-emerald-200"
            )}>
              <div className={cn(
                "absolute right-0 top-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110",
                report.netVatPayable > 0 ? "bg-red-100" : "bg-emerald-100"
              )} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "p-2.5 rounded-xl",
                    report.netVatPayable > 0 
                      ? "bg-red-100 text-red-600" 
                      : "bg-emerald-100 text-emerald-600"
                  )}>
                    {report.netVatPayable > 0 ? <AlertCircle className="w-6 h-6" /> : <Calculator className="w-6 h-6" />}
                  </div>
                  <h3 className={cn(
                    "font-semibold text-lg",
                    report.netVatPayable > 0 ? "text-red-700" : "text-emerald-700"
                  )}>
                    Thuế GTGT Phải nộp
                  </h3>
                </div>
                <div className={cn(
                  "text-3xl font-bold",
                  report.netVatPayable > 0 ? "text-red-700" : "text-emerald-700"
                )}>
                  {formatCurrency(report.netVatPayable)}
                </div>
                <p className={cn(
                  "text-sm mt-2 font-medium",
                  report.netVatPayable > 0 ? "text-red-600/80" : "text-emerald-600/80"
                )}>
                  {report.netVatPayable > 0 
                    ? "Kỳ này phát sinh thuế phải nộp" 
                    : "Được khấu trừ chuyển kỳ sau"}
                </p>
              </div>
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Output Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-800 text-lg">Bảng kê Hóa đơn Bán ra</h3>
                <span className="ml-auto text-xs font-medium px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {report.outputInvoices.length} hóa đơn
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Ngày</th>
                      <th className="px-4 py-3">Ký hiệu/Số</th>
                      <th className="px-4 py-3">Khách hàng</th>
                      <th className="px-4 py-3 text-right">Doanh số</th>
                      <th className="px-4 py-3 text-right">Thuế GTGT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.outputInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-slate-600">{formatDate(inv.issueDate)}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{inv.invoiceNumber}</div>
                          <div className="text-xs text-slate-500">{inv.symbol}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900 truncate max-w-[150px]" title={inv.partnerName}>
                            {inv.partnerName}
                          </div>
                          <div className="text-xs text-slate-500">MST: {inv.taxCode}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {formatCurrency(inv.subTotal)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-blue-600">
                          {formatCurrency(inv.vatAmount)}
                        </td>
                      </tr>
                    ))}
                    {report.outputInvoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                          Không có hóa đơn bán ra trong kỳ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Input Invoices */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800 text-lg">Bảng kê Hóa đơn Mua vào</h3>
                <span className="ml-auto text-xs font-medium px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                  {report.inputInvoices.length} hóa đơn
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Ngày</th>
                      <th className="px-4 py-3">Ký hiệu/Số</th>
                      <th className="px-4 py-3">Nhà cung cấp</th>
                      <th className="px-4 py-3 text-right">Doanh số</th>
                      <th className="px-4 py-3 text-right">Thuế GTGT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.inputInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-slate-600">{formatDate(inv.issueDate)}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{inv.invoiceNumber}</div>
                          <div className="text-xs text-slate-500">{inv.symbol}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900 truncate max-w-[150px]" title={inv.partnerName}>
                            {inv.partnerName}
                          </div>
                          <div className="text-xs text-slate-500">MST: {inv.taxCode}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {formatCurrency(inv.subTotal)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-indigo-600">
                          {formatCurrency(inv.vatAmount)}
                        </td>
                      </tr>
                    ))}
                    {report.inputInvoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                          Không có hóa đơn mua vào trong kỳ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
