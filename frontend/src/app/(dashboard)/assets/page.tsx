"use client";
import { FixedAssetPanel } from "@/features/accounting/FixedAssetPanel";

export default function AssetsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text">Tài sản cố định</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý tài sản và khấu hao</p>
      </div>
      <FixedAssetPanel />
    </div>
  );
}
