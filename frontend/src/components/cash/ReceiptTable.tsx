"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Edit2, Printer, CheckCircle, Trash2 } from "lucide-react";
import { CashReceiptDto } from "@/features/cash/types";

type Props = {
  data: CashReceiptDto[];
  loading: boolean;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
  onPrint: (item: CashReceiptDto) => void;
};

export function ReceiptTable({ data, loading, onConfirm, onCancel, onPrint }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 bg-white border rounded-lg">
        Không tìm thấy phiếu thu nào.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT": return <Badge tone="amber">Nháp</Badge>;
      case "CONFIRMED": return <Badge tone="green">Đã ghi sổ</Badge>;
      case "CANCELLED": return <Badge tone="red">Đã hủy</Badge>;
      default: return <Badge tone="slate">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "SALE": return "Thu bán hàng";
      case "DEBT": return "Thu công nợ";
      default: return "Thu khác";
    }
  };

  const totalConfirmed = data
    .filter(x => x.status === "CONFIRMED")
    .reduce((sum, x) => sum + x.amount, 0);

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Ngày</th>
              <th className="px-4 py-3 font-medium">Mã PT</th>
              <th className="px-4 py-3 font-medium">Loại</th>
              <th className="px-4 py-3 font-medium">Người nộp</th>
              <th className="px-4 py-3 font-medium text-right">Số tiền</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3">{new Date(item.receiptDate).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{item.voucherNo}</td>
                <td className="px-4 py-3">{getTypeLabel(item.receiptType)}</td>
                <td className="px-4 py-3 text-slate-600">
                  <div className="max-w-[150px] truncate" title={item.payerName}>
                    {item.payerName || "—"}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-green-600">
                  {new Intl.NumberFormat("vi-VN").format(item.amount)}
                </td>
                <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => onPrint(item)} title="In phiếu">
                      <Printer className="w-4 h-4 text-slate-500" />
                    </Button>
                    {item.status === "DRAFT" && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (window.confirm("Xác nhận ghi sổ phiếu thu này?")) {
                            onConfirm(item.id);
                          }
                        }} title="Xác nhận ghi sổ">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (window.confirm("Hủy bỏ phiếu thu này?")) {
                            onCancel(item.id);
                          }
                        }} title="Hủy phiếu">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                    {item.status === "CONFIRMED" && (
                      <Button variant="ghost" size="icon" onClick={() => {
                        if (window.confirm("Hủy phiếu đã ghi sổ sẽ đồng thời đảo bút toán. Bạn chắc chắn chứ?")) {
                          onCancel(item.id);
                        }
                      }} title="Hủy phiếu">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-semibold border-t">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right">Tổng (chỉ tính Đã ghi sổ):</td>
              <td className="px-4 py-3 text-right text-green-700">
                {new Intl.NumberFormat("vi-VN").format(totalConfirmed)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
