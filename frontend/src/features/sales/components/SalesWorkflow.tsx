"use client";

import React from 'react';
import { FileEdit, ShoppingCart, FileOutput, Banknote, ArrowRight } from 'lucide-react';

const steps = [
  { id: 1, title: 'Báo giá', icon: FileEdit, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  { id: 2, title: 'Đơn đặt hàng', icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
  { id: 3, title: 'Xuất hóa đơn', icon: FileOutput, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
  { id: 4, title: 'Thu tiền', icon: Banknote, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
];

export const SalesWorkflow = () => {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[400px] bg-white border rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-12 text-gray-800">Quy trình Bán hàng</h2>
      <div className="flex items-center justify-center w-full max-w-4xl flex-wrap gap-y-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${step.border} ${step.bg} transition-colors group-hover:shadow-md`}>
                  <Icon className={`w-10 h-10 ${step.color}`} />
                </div>
                <span className="mt-4 font-medium text-gray-700 group-hover:text-gray-900">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:flex flex-1 px-4 items-center justify-center">
                  <div className="w-full h-1 bg-gray-200 rounded-full relative">
                    <ArrowRight className="absolute -right-2 -top-2.5 w-6 h-6 text-gray-400" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
