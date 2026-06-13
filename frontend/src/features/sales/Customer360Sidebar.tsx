"use client";

import {
  AlertCircle, Award, Bike, CreditCard, Phone, ShieldCheck, ShoppingBag, TrendingUp, User, X
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { salesApi } from "./api";
import type { PosCustomer } from "./types";

const VND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  NEW: { label: "Khách mới", color: "bg-slate-100 text-slate-600" },
  REGULAR: { label: "Thân thiết", color: "bg-blue-100 text-blue-700" },
  VIP: { label: "VIP", color: "bg-amber-100 text-amber-700" },
  PLATINUM: { label: "Platinum", color: "bg-purple-100 text-purple-700" },
  HIGH_RISK_DEBT: { label: "Rủi ro nợ", color: "bg-red-100 text-red-700" },
};

interface Props {
  customer: PosCustomer;
  onClose?: () => void;
}

/**
 * Customer360Sidebar — hien thi lich su 360 cua khach hang duoc chon.
 * Mo ra khi click vao ten khach hang tren POS.
 */
export function Customer360Sidebar({ customer, onClose }: Props) {
  const { data: info, isLoading } = useQuery({
    queryKey: ["customer-360", customer.id],
    queryFn: () => salesApi.customer360(customer.id),
    enabled: Boolean(customer.id),
    staleTime: 30_000,
  });

  return (
    <aside className="flex h-full w-80 flex-col border-l border-slate-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-semibold">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{customer.name}</p>
            <p className="text-xs text-slate-500">{customer.phone}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : info ? (
          <div className="space-y-4 p-4">
            {/* Tier */}
            {info.tier && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TIER_CONFIG[info.tier]?.color ?? "bg-slate-100 text-slate-600"}`}>
                  {TIER_CONFIG[info.tier]?.label ?? info.tier}
                </span>
              </div>
            )}

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-2">
              <KpiCard icon={<ShoppingBag className="h-4 w-4" />} label="Tổng đơn" value={String(info.totalOrders)} />
              <KpiCard icon={<TrendingUp className="h-4 w-4" />} label="Tổng mua" value={VND(info.totalPurchaseAmount)} small />
              <KpiCard
                icon={<CreditCard className="h-4 w-4" />}
                label="Công nợ"
                value={VND(info.debtAmount)}
                small
                danger={info.debtAmount > 0}
              />
              {info.lastPurchaseDate && (
                <KpiCard icon={<User className="h-4 w-4" />} label="Mua gần nhất" value={info.lastPurchaseDate.slice(0, 10)} small />
              )}
            </div>

            {/* Owned serials */}
            {info.ownedSerials && info.ownedSerials.length > 0 && (
              <section>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <Bike className="h-3.5 w-3.5" />
                  Xe đang sở hữu
                </p>
                <div className="space-y-1.5">
                  {info.ownedSerials.map((s) => (
                    <div key={s.serialNumber} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-mono font-semibold text-indigo-700">{s.serialNumber}</p>
                      <p className="text-xs text-slate-500">{s.productName}</p>
                      {s.warrantyEndDate && (
                        <p className="text-xs text-emerald-600 mt-0.5">
                          BH đến: {s.warrantyEndDate}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent warranty */}
            {info.recentWarrantyRequests && info.recentWarrantyRequests.length > 0 && (
              <section>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Bảo hành gần đây
                </p>
                <div className="space-y-1.5">
                  {info.recentWarrantyRequests.slice(0, 3).map((w) => (
                    <div key={w.ticketNo} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-700">{w.ticketNo}</p>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-500">{w.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{w.createdAt.slice(0, 10)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Debt warning */}
            {info.debtAmount > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-700">Cảnh báo công nợ</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Khách còn nợ <strong>{VND(info.debtAmount)}</strong>. Cân nhắc thu nợ trước khi bán thêm.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-slate-400">
            Không tải được thông tin khách hàng
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Phone className="h-3.5 w-3.5" />
          <span>{customer.phone}</span>
          <span>•</span>
          <span>{customer.address}</span>
        </div>
      </div>
    </aside>
  );
}

function KpiCard({
  icon, label, value, small, danger
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  small?: boolean;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-slate-50 p-3 ${danger ? "border-red-200 bg-red-50" : ""}`}>
      <div className={`flex items-center gap-1 mb-1 ${danger ? "text-red-500" : "text-slate-400"}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`font-bold ${small ? "text-sm" : "text-base"} ${danger ? "text-red-700" : "text-slate-800"}`}>
        {value}
      </p>
    </div>
  );
}
