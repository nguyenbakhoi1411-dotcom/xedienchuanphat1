"use client";

import { useState } from 'react';
import {
  PackagePlus, PackageMinus, ArrowLeftRight, GitBranch,
  ClipboardList, FileBarChart, ChevronRight
} from 'lucide-react';

interface Step {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}

const STEPS: Step[] = [
  {
    id: 'receipt',
    label: 'Nhập kho',
    sublabel: 'Phiếu nhập kho',
    icon: PackagePlus,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    id: 'issue',
    label: 'Xuất kho',
    sublabel: 'Phiếu xuất kho',
    icon: PackageMinus,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    id: 'transfer',
    label: 'Chuyển kho',
    sublabel: 'Lệnh chuyển kho',
    icon: ArrowLeftRight,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  {
    id: 'stocktake',
    label: 'Kiểm kê',
    sublabel: 'Bảng kiểm kê',
    icon: ClipboardList,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    id: 'costing',
    label: 'Tính giá',
    sublabel: 'Giá xuất kho',
    icon: FileBarChart,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
  },
];

const WORKFLOW_ITEMS = [
  {
    title: 'Nhập kho — Mua hàng trong nước',
    desc: 'Tạo phiếu nhập kho từ nhà cung cấp trong nước. Ghi nhận số lượng và giá trị hàng hóa nhập vào kho.',
    tag: 'Nhập kho',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Nhập kho — Nhập từ sản xuất',
    desc: 'Nhập kho thành phẩm từ bộ phận sản xuất. Cập nhật tồn kho thành phẩm sau khi sản xuất hoàn tất.',
    tag: 'Nhập kho',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Xuất kho — Bán hàng',
    desc: 'Tạo phiếu xuất kho để giao hàng cho khách. Ghi nhận số lượng xuất và giá vốn hàng bán.',
    tag: 'Xuất kho',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Xuất kho — Xuất nội bộ',
    desc: 'Xuất kho hàng hóa dùng nội bộ (công cụ dụng cụ, nguyên vật liệu cho vận hành).',
    tag: 'Xuất kho',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Chuyển kho — Nội bộ',
    desc: 'Chuyển hàng hóa giữa các kho trong cùng chi nhánh hoặc giữa các chi nhánh.',
    tag: 'Chuyển kho',
    tagColor: 'bg-orange-100 text-orange-700',
  },
  {
    title: 'Kiểm kê kho',
    desc: 'Tạo bảng kiểm kê hàng hóa trong kho, đối chiếu số liệu thực tế với sổ sách kế toán.',
    tag: 'Kiểm kê',
    tagColor: 'bg-purple-100 text-purple-700',
  },
  {
    title: 'Tính giá xuất kho',
    desc: 'Thực hiện tính giá xuất kho theo phương pháp bình quân cuối kỳ hoặc FIFO.',
    tag: 'Tính giá',
    tagColor: 'bg-gray-100 text-gray-700',
  },
];

export function ProcessTab() {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-blue-500" />
          Quy trình nghiệp vụ Kho
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Tổng quan các bước trong quy trình quản lý kho hàng
        </p>
      </div>

      {/* Process steps flow */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveStep(isActive ? null : step.id)}
                className={`
                  flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all min-w-[120px]
                  ${isActive
                    ? `${step.bg} ${step.border} shadow-md scale-105`
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }
                `}
              >
                <div className={`p-2 rounded-full ${isActive ? 'bg-white' : step.bg}`}>
                  <Icon className={`h-5 w-5 ${step.color}`} />
                </div>
                <div className="text-center">
                  <div className={`text-sm font-semibold ${isActive ? step.color : 'text-gray-700'}`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{step.sublabel}</div>
                </div>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Workflow cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WORKFLOW_ITEMS.filter(item =>
          !activeStep || item.tag === STEPS.find(s => s.id === activeStep)?.label
        ).map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.tagColor}`}>
                {item.tag}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1.5 group-hover:text-blue-600 transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Xem hướng dẫn</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>

      {activeStep && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setActiveStep(null)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Xem tất cả quy trình
          </button>
        </div>
      )}
    </div>
  );
}
