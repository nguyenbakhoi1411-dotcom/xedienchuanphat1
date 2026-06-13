"use client";

import { OperationNode } from "./OperationNode";

interface WorkflowDiagramProps {
  onOperationSelect?: (operation: string, type: string) => void;
}

const thuTienItems = ["Phiếu thu", "Thu tiền theo hóa đơn", "Thu tiền theo hóa đơn nhiều khách hàng"];

const chiTienItems = [
  "Phiếu chi",
  "Chi tiền theo hóa đơn",
  "Chi tiền theo hóa đơn nhiều nhà cung cấp"
];

export function WorkflowDiagram({ onOperationSelect }: WorkflowDiagramProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-semibold text-text">NGHIỆP VỤ TIỀN MẶT</h2>
      </div>

      {/* Workflow */}
      <div className="space-y-6">
        {/* Thu tiền - Top arrow pointing right */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <OperationNode
              label="Thu tiền"
              type="receipt"
              position="top"
              hasDropdown={true}
              dropdownItems={thuTienItems}
              onItemClick={(item) => onOperationSelect?.(item, "RECEIPT")}
            />
          </div>
          <div className="flex h-12 w-12 items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 48 48" className="text-slate-400">
              <path
                d="M 0 24 L 40 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path d="M 36 20 L 44 24 L 36 28" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>

        {/* Center - Kiểm kê quỹ */}
        <div className="flex justify-end">
          <div className="w-1/2">
            <OperationNode
              label="Kiểm kê quỹ"
              type="audit"
              position="center"
              hasDropdown={false}
              onItemClick={(item) => onOperationSelect?.(item, "AUDIT")}
            />
          </div>
        </div>

        {/* Chi tiền - Bottom arrow pointing right */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <OperationNode
              label="Chi tiền"
              type="payment"
              position="bottom"
              hasDropdown={true}
              dropdownItems={chiTienItems}
              onItemClick={(item) => onOperationSelect?.(item, "PAYMENT")}
            />
          </div>
          <div className="flex h-12 w-12 items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 48 48" className="text-slate-400">
              <path
                d="M 0 24 L 40 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path d="M 36 20 L 44 24 L 36 28" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
