"use client";

import { Search, UserRound } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/format";
import type { PosCustomer } from "./types";

type CustomerSelectModalProps = {
  open: boolean;
  keyword: string;
  customers?: PosCustomer[];
  loading: boolean;
  onKeywordChange: (keyword: string) => void;
  onSelect: (customer: PosCustomer) => void;
  onClose: () => void;
};

export function CustomerSelectModal({
  open,
  keyword,
  customers,
  loading,
  onKeywordChange,
  onSelect,
  onClose
}: CustomerSelectModalProps) {
  return (
    <Modal open={open} title="Chon khach hang" description="Tim theo ten hoac so dien thoai." size="md" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Ten khach hang hoac so dien thoai"
            className="w-full border-0 bg-transparent text-sm outline-none"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16" />)}
          </div>
        ) : !customers || customers.length === 0 ? (
          <EmptyState title="Khong co khach hang" description="Thu tu khoa tim kiem khac." />
        ) : (
          <div className="space-y-2">
            {customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => onSelect(customer)}
                className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-orange-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-primary">
                  <UserRound className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-text">{customer.name}</span>
                  <span className="block text-sm text-slate-500">{customer.phone} - No {formatCurrency(customer.debtAmount)}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
