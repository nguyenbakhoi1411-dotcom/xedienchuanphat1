"use client";

import { useState } from "react";
import { WorkflowDiagram } from "@/features/cash-operations/WorkflowDiagram";
import { ReportsList } from "@/features/cash-operations/ReportsList";
import { BottomNavigation } from "@/features/cash-operations/BottomNavigation";
import { PromoBanner } from "@/features/cash-operations/PromoBanner";

export default function CashOperationsPage() {
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleOperationSelect = (operation: string, type: string) => {
    setSelectedOperation(`${type}: ${operation}`);
    console.log(`Selected ${type}: ${operation}`);
  };

  const handleReportSelect = (report: string) => {
    setSelectedReport(report);
    console.log(`Selected report: ${report}`);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    console.log(`Active tab: ${tab}`);
  };

  const handleCtaClick = () => {
    console.log("CTA clicked: Kết nối ngay");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Main content - Two column layout */}
      <div className="flex flex-1 overflow-hidden gap-4 px-4 py-4">
        {/* Left Panel - 70% */}
        <div className="flex w-[70%] flex-col rounded-lg border border-border bg-white shadow-soft overflow-hidden">
          {/* Workflow Diagram */}
          <div className="flex-1 overflow-y-auto p-6">
            <WorkflowDiagram onOperationSelect={handleOperationSelect} />
          </div>

          {/* Bottom Navigation */}
          <BottomNavigation onTabChange={handleTabChange} />
        </div>

        {/* Right Panel - 30% */}
        <div className="flex w-[30%] flex-col rounded-lg border border-border bg-white shadow-soft overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <ReportsList onReportSelect={handleReportSelect} />
          </div>
        </div>
      </div>

      {/* Bottom Banner - Full width */}
      <div className="flex-shrink-0 px-4 pb-4">
        <PromoBanner onCtaClick={handleCtaClick} />
      </div>
    </div>
  );
}
