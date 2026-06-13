"use client";

import { AlertTriangle, Minus, Plus, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import { calculateSubtotal, useCartStore } from "./cartStore";
import type { CartItem } from "./types";

const MAX_DISCOUNT_PCT = 5; // nguong giam gia can duyet
const VAT_RATE = 10;

type CartPanelProps = {
  onSelectCustomer: () => void;
  onOpenCustomer360?: () => void;
};

export function CartPanel({ onSelectCustomer, onOpenCustomer360 }: CartPanelProps) {
  const customer = useCartStore((state) => state.customer);
  const items = useCartStore((state) => state.items);
  const payment = useCartStore((state) => state.payment);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const setSerials = useCartStore((state) => state.setSerials);
  const subtotal = calculateSubtotal(items);
  const afterDiscount = Math.max(0, subtotal - (payment.discountAmount ?? 0));
  const vatAmount = Math.round(afterDiscount * VAT_RATE / 100);
  const discountPct = subtotal > 0 ? (payment.discountAmount / subtotal) * 100 : 0;
  const needsApproval = discountPct > MAX_DISCOUNT_PCT && payment.discountAmount > 0;

  return (
    <section className="flex min-h-0 flex-col rounded-lg border border-border bg-white shadow-soft">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text">Gio hang</h2>
            <p className="mt-1 text-sm text-slate-500">{items.length} mat hang - {formatCurrency(subtotal)}</p>
          </div>
          <Button variant="secondary" onClick={onSelectCustomer}>
            <UserRound className="h-4 w-4" />
            Khach hang
          </Button>
        </div>
        {customer && (
          <button
            type="button"
            onClick={onOpenCustomer360}
            className="mt-3 w-full text-left rounded-lg bg-orange-50 p-3 text-sm hover:bg-orange-100 transition-colors"
          >
            <p className="font-semibold text-text">{customer.name}</p>
            <p className="mt-1 text-slate-600">{customer.phone} - {customer.address}</p>
            {onOpenCustomer360 && <p className="mt-1 text-xs text-indigo-600 underline">Xem lich su 360°</p>}
          </button>
        )}

        {/* Discount approval warning */}
        {needsApproval && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              Giam gia <strong>{discountPct.toFixed(1)}%</strong> vuot nguong {MAX_DISCOUNT_PCT}% — can quan ly duyet khi tao don.
            </p>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <EmptyState title="Gio hang dang trong" description="Chon san pham ben trai de them vao hoa don." />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <CartLine
                key={item.productId}
                item={item}
                onQuantityChange={(quantity) => updateQuantity(item.productId, quantity)}
                onSerialsChange={(serials) => setSerials(item.productId, serials)}
                onRemove={() => removeItem(item.productId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* VAT preview footer */}
      {items.length > 0 && (
        <div className="border-t border-border bg-slate-50 px-4 py-3 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span className="font-medium text-slate-800">{formatCurrency(subtotal)}</span>
          </div>
          {payment.discountAmount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Giảm giá:</span>
              <span>- {formatCurrency(payment.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500">
            <span>VAT ({VAT_RATE}%):</span>
            <span>{formatCurrency(vatAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-bold text-slate-900">
            <span>Tổng cộng:</span>
            <span>{formatCurrency(afterDiscount + vatAmount)}</span>
          </div>
        </div>
      )}
    </section>
  );
}

function CartLine({
  item,
  onQuantityChange,
  onSerialsChange,
  onRemove
}: {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onSerialsChange: (serials: string[]) => void;
  onRemove: () => void;
}) {
  const isVehicle = item.category === "ELECTRIC_MOTORBIKE";
  const availableSerials = item.serialOptions.filter((serial) => serial.status === "IN_STOCK");

  return (
    <article className="rounded-lg border border-border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-text">{item.productName}</p>
          <p className="mt-1 text-xs text-slate-500">{item.productCode} - {formatCurrency(item.unitPrice)}</p>
        </div>
        <button type="button" onClick={onRemove} className="text-slate-400 hover:text-red-600" aria-label="Xoa san pham">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {isVehicle ? (
        <div className="mt-3">
          <label className="text-xs font-medium text-slate-600">Serial xe</label>
          <select
            multiple
            value={item.selectedSerials}
            onChange={(event) => onSerialsChange(Array.from(event.target.selectedOptions).map((option) => option.value))}
            className="erp-input mt-1 min-h-24 py-2"
          >
            {availableSerials.map((serial) => (
              <option key={serial.serialNumber} value={String(serial.id ?? serial.serialNumber)}>
                {serial.serialNumber} - {serial.branchName}
              </option>
            ))}
          </select>
          {availableSerials.length === 0 && <p className="mt-1 text-xs text-red-600">Khong co serial con hang tai chi nhanh nay</p>}
          {item.selectedSerials.length === 0 && <p className="mt-1 text-xs text-red-600">Vui long chon serial xe</p>}
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-lg border border-border bg-white shadow-sm">
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-l-lg hover:bg-orange-50" onClick={() => onQuantityChange(item.quantity - 1)}>
              <Minus className="h-4 w-4" />
            </button>
            <input
              value={item.quantity}
              onChange={(event) => onQuantityChange(Number(event.target.value))}
              className="h-9 w-12 border-x border-border text-center text-sm outline-none"
            />
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-r-lg hover:bg-orange-50" onClick={() => onQuantityChange(item.quantity + 1)}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="font-semibold text-text">{formatCurrency(item.unitPrice * item.quantity)}</span>
        </div>
      )}

      {isVehicle && <p className="mt-3 text-right font-semibold text-text">{formatCurrency(item.unitPrice * item.quantity)}</p>}
    </article>
  );
}
