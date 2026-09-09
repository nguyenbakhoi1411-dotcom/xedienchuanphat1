"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ArrowDown, BarChart3, Clock3, FileText, Star, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ErpModule, ErpModuleTabKey } from "@/types/navigation";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { cn } from "@/lib/cn";

type ModulePageProps = {
  module: ErpModule;
};

const tabs: Array<{ key: ErpModuleTabKey; label: string }> = [
  { key: "process", label: "Quy trình" },
  { key: "documents", label: "Chứng từ" },
  { key: "reports", label: "Báo cáo" },
  { key: "settings", label: "Thiết lập" }
];

export function ModulePage({ module }: ModulePageProps) {
  const [activeTab, setActiveTab] = useState<ErpModuleTabKey>("process");
  const user = useCurrentUser();
  const Icon = module.icon;

  const currentItems = useMemo(() => {
    if (activeTab === "process") return module.process;
    if (activeTab === "documents") return module.documents;
    if (activeTab === "reports") return module.reports;
    return module.settings;
  }, [activeTab, module]);

  return (
    <div className="space-y-6">
      {/* HEADER: Tên module, Breadcrumb, Chi nhánh hiện tại */}
      <header className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-400">
                  ERP / {module.label}
                </p>
                <h1 className="truncate text-2xl font-bold tracking-normal text-text">{module.label}</h1>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{module.description}</p>
          </div>
          <div className="rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm shrink-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-400">Chi nhánh hiện tại</p>
            <p className="mt-1 font-semibold text-text">{user?.branchName ?? "Chưa xác định"}</p>
          </div>
        </div>
      </header>

      {/* BODY: Left Column (Tabs & Content), Right Panel (Báo cáo nhanh) */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Left Column: Tab panel & content */}
        <section className="rounded-lg border border-border bg-white shadow-soft">
          <div className="border-b border-border px-4 pt-4">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "h-11 shrink-0 border-b-2 px-4 text-sm font-semibold transition-colors",
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-text"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {activeTab === "process" ? (
              <ProcessFlow items={module.process} />
            ) : module.reportGroups && activeTab === "reports" ? (
              <GroupedItems groups={module.reportGroups} />
            ) : module.catalogGroups && activeTab === "documents" ? (
              <GroupedItems groups={module.catalogGroups} />
            ) : (
              <ItemGrid items={currentItems} />
            )}
          </div>
        </section>

        {/* Right Panel: Báo cáo nhanh */}
        <aside className="h-fit">
          <QuickReportPanel module={module} />
        </aside>
      </div>

      {/* BOTTOM PANEL: Shortcut, Favorite, Recent Documents */}
      <footer className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <h2 className="text-base font-bold text-text mb-4">Điều hướng nhanh</h2>
        <div className="grid gap-5 md:grid-cols-3">
          <ActionList title="Shortcut" icon={Zap} items={module.shortcuts ?? []} />
          <ActionList title="Favorite" icon={Star} items={module.favorites ?? []} />
          <ActionList title="Recent Documents" icon={Clock3} items={module.recentDocuments ?? []} />
        </div>
      </footer>
    </div>
  );
}

function ProcessFlow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-start">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${item}-${index}`} className="flex flex-col items-center gap-3 lg:flex-row lg:flex-1 lg:min-w-[200px]">
            <article className="flex min-h-[72px] w-full items-center justify-between rounded-lg border border-border bg-slate-50 px-4 py-3 shadow-sm hover:border-orange-200 transition-colors">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bước {index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-text">{item}</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100/50 text-primary shrink-0">
                <FileText className="h-4 w-4" />
              </span>
            </article>
            {!isLast && (
              <>
                {/* Down arrow on mobile */}
                <ArrowDown className="h-5 w-5 text-slate-300 lg:hidden shrink-0" />
                {/* Right arrow on desktop */}
                <ArrowRight className="hidden h-5 w-5 text-slate-300 lg:block shrink-0" />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ItemGrid({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className="flex min-h-16 items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-left text-sm font-semibold text-text shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50"
        >
          <span>{item}</span>
          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
        </button>
      ))}
    </div>
  );
}

function GroupedItems({ groups }: { groups: NonNullable<ErpModule["reportGroups"]> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <article key={group.title} className="rounded-lg border border-border bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-text">{group.title}</h3>
          <div className="mt-3 space-y-2">
            {group.items.map((item) => (
              <button
                key={item}
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-orange-50 hover:text-primary transition-colors"
              >
                <span>{item}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function QuickReportPanel({ module }: { module: ErpModule }) {
  const reports = module.reportGroups?.flatMap((group) => group.items).slice(0, 4) ?? module.reports.slice(0, 4);

  return (
    <aside className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text">Báo cáo nhanh</h2>
        <BarChart3 className="h-5 w-5 text-primary shrink-0" />
      </div>
      <div className="mt-4 space-y-2">
        {reports.map((report) => (
          <button
            key={report}
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-border bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-primary transition-colors"
          >
            <span>{report}</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        ))}
      </div>
    </aside>
  );
}

function ActionList({
  title,
  icon: Icon,
  items
}: {
  title: string;
  icon: LucideIcon;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-slate-400">
        <Icon className="h-4 w-4 shrink-0" />
        {title}
      </div>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className="block w-full rounded-md px-2 py-1.5 text-left text-sm font-medium text-slate-700 hover:bg-white hover:text-primary transition-colors"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
