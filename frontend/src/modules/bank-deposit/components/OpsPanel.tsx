'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { receiptSubTypes, paymentSubTypes } from '../types';

interface OpsNode {
  id: string;
  label: string;
  type: 'receipt' | 'payment';
  items: Array<{ value: string; label: string }>;
}

interface OpsPanelProps {
  onNodeClick?: (nodeId: string, itemValue: string) => void;
}

export function OpsPanel({ onNodeClick }: OpsPanelProps) {
  const [openNode, setOpenNode] = useState<string | null>(null);

  const nodes: OpsNode[] = [
    {
      id: 'receipts',
      label: 'Thu tiền',
      type: 'receipt',
      items: receiptSubTypes,
    },
    {
      id: 'payments',
      label: 'Chi tiền',
      type: 'payment',
      items: paymentSubTypes,
    },
  ];

  const handleNodeClick = (nodeId: string) => {
    setOpenNode(openNode === nodeId ? null : nodeId);
  };

  const handleItemClick = (itemValue: string) => {
    onNodeClick?.(openNode || '', itemValue);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Nghiệp vụ tiền mặt</h3>

      {/* Workflow Diagram */}
      <div className="mb-6 flex items-center justify-between">
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            {/* Node */}
            <div className="w-40">
              <button
                onClick={() => handleNodeClick(node.id)}
                className="w-full rounded-lg border-2 border-orange-500 bg-white px-4 py-3 text-center font-medium text-orange-600 transition-all hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <div className="flex items-center justify-between">
                  <span>{node.label}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      openNode === node.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
              {openNode === node.id && (
                <div className="absolute z-10 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
                  {node.items.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleItemClick(item.value)}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-orange-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Arrow */}
            {index < nodes.length - 1 && (
              <div className="mx-2 text-orange-400">→</div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500">
        {openNode
          ? 'Chọn loại giao dịch từ menu trên'
          : 'Nhấn vào để xem các loại giao dịch'}
      </div>
    </div>
  );
}
