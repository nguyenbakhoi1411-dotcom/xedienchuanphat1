"use client";

import { useState } from "react";
import { PriceListManagement } from "@/features/marketing/components/PriceListManagement";
import { PriceAdjustmentWizard } from "@/features/marketing/components/PriceAdjustmentWizard";
import { PromotionForm } from "@/features/marketing/components/PromotionForm";
import { LayoutDashboard, Tag, BadgePercent, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MarketingDashboard() {
  const [activeTab, setActiveTab] = useState<"PRICE_LIST" | "ADJUSTMENT" | "PROMOTION">("PRICE_LIST");

  const tabs = [
    { id: "PRICE_LIST", label: "Quản Lý Bảng Giá", icon: Tag },
    { id: "ADJUSTMENT", label: "Điều Chỉnh Giá Hàng Loạt", icon: TrendingDown },
    { id: "PROMOTION", label: "Chương Trình Khuyến Mãi", icon: BadgePercent },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            Marketing & Quản Lý Giá
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Quản lý bảng giá phân hạng, điều chỉnh giá hàng loạt và thiết lập các chương trình khuyến mãi động.
          </p>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors relative
                  ${isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"}`} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-blue-600"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "PRICE_LIST" && <PriceListManagement />}
            {activeTab === "ADJUSTMENT" && <PriceAdjustmentWizard />}
            {activeTab === "PROMOTION" && <PromotionForm />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
