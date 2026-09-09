"use client";
import { useState } from "react";
import { PackagePlus, Truck, ArrowRightLeft, Settings, Download, Upload, Calculator, ClipboardList } from "lucide-react";
import type { InventoryTab } from "@/features/inventory/types";
import { CalculateIssueCostModal } from "../modals/CalculateIssueCostModal";
import { StocktakeModal } from "../modals/StocktakeModal";

interface Props {
  onNavigate: (tab: InventoryTab) => void;
}

export function InventoryProcessFlowTab({ onNavigate }: Props) {
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showStocktakeModal, setShowStocktakeModal] = useState(false);

  return (
    <div className="p-8 h-full bg-slate-50/50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 text-center">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Nghiệp vụ kho</h2>
          </div>
          
          <div className="p-12 relative flex justify-center items-center">
            {/* The Main Horizontal Axis Line */}
            <div className="absolute top-1/2 left-[20%] right-[10%] h-0.5 bg-emerald-300 -translate-y-1/2 hidden md:block"></div>
            {/* Arrow at the end of the line */}
            <div className="absolute top-1/2 right-[9%] w-3 h-3 border-t-2 border-r-2 border-emerald-300 rotate-45 -translate-y-1/2 hidden md:block"></div>
            
            {/* Vertical Line from Lệnh sản xuất -> Lắp ráp */}
            <div className="absolute left-[20%] top-[25%] bottom-[25%] w-0.5 bg-emerald-300 hidden md:block"></div>
            
            {/* Short Vertical Lines for middle icons */}
            <div className="absolute left-[40%] top-[35%] bottom-[50%] w-0.5 bg-emerald-300 hidden md:block"></div>
            <div className="absolute left-[45%] top-[50%] bottom-[65%] w-0.5 bg-emerald-300 hidden md:block"></div>
            
            <div className="absolute left-[60%] top-[35%] bottom-[50%] w-0.5 bg-emerald-300 hidden md:block"></div>
            <div className="absolute left-[65%] top-[50%] bottom-[65%] w-0.5 bg-emerald-300 hidden md:block"></div>
            
            <div className="absolute left-[85%] top-[50%] bottom-[65%] w-0.5 bg-emerald-300 hidden md:block"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-y-16 gap-x-8 w-full max-w-3xl relative z-10">
              
              {/* Column 1: Lệnh / Lắp ráp */}
              <div className="flex flex-col items-center justify-between space-y-24">
                <button className="group flex flex-col items-center cursor-pointer opacity-70 hover:opacity-100">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <PackagePlus className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">✓</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700">Lệnh sản xuất</span>
                </button>
                
                <button className="group flex flex-col items-center cursor-pointer opacity-70 hover:opacity-100">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <Settings className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-amber-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">⚙</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700 text-center">Lắp ráp, tháo<br/>dỡ</span>
                </button>
              </div>

              {/* Column 2: Xuất kho / Nhập kho */}
              <div className="flex flex-col items-center justify-between space-y-16 mt-6">
                <button onClick={() => onNavigate("issues")} className="group flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <Upload className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-orange-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">↑</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700">Xuất kho</span>
                </button>

                <button onClick={() => onNavigate("receipts")} className="group flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <Download className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">↓</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700">Nhập kho</span>
                </button>
              </div>

              {/* Column 3: Chuyển kho / Tính giá */}
              <div className="flex flex-col items-center justify-between space-y-16 mt-6">
                <button onClick={() => onNavigate("transfers")} className="group flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <ArrowRightLeft className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">⇌</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700">Chuyển kho</span>
                </button>

                <button onClick={() => setShowCalcModal(true)} className="group flex flex-col items-center cursor-pointer opacity-90 hover:opacity-100">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <Calculator className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">$</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700 text-center">Tính giá xuất<br/>kho</span>
                </button>
              </div>

              {/* Column 4: Kiểm kê */}
              <div className="flex flex-col items-center justify-end h-full pb-8">
                <button onClick={() => setShowStocktakeModal(true)} className="group flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <ClipboardList className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">✓</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700">Kiểm kê</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="grid grid-cols-4 border-t border-slate-200 bg-white rounded-b-xl overflow-hidden mt-6">
          {["Vật tư hàng hóa", "Kho", "Tính giá xuất kho", "Báo cáo"].map((item) => (
            <button key={item} className="py-4 flex flex-col items-center justify-center hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors border-r border-slate-100 last:border-r-0">
              <span className="text-sm font-medium">{item}</span>
            </button>
          ))}
        </div>
      </div>

      {showCalcModal && <CalculateIssueCostModal onClose={() => setShowCalcModal(false)} />}
      {showStocktakeModal && <StocktakeModal onClose={() => setShowStocktakeModal(false)} />}
    </div>
  );
}
