import { FileText, Package, Briefcase, Receipt, FileCheck, RefreshCcw, Banknote, Percent } from "lucide-react";
import { SalesTabKey } from "../SalesTabs";
import { cn } from "@/lib/cn";

interface Props {
  onNavigate: (tab: SalesTabKey) => void;
}

export function SalesProcessFlowTab({ onNavigate }: Props) {
  return (
    <div className="p-8 h-full bg-slate-50/50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 text-center">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Nghiệp vụ bán hàng</h2>
          </div>
          
          <div className="p-12 relative flex justify-center items-center">
            {/* The Main Horizontal Axis Line */}
            <div className="absolute top-1/2 left-[20%] right-[20%] h-0.5 bg-emerald-300 -translate-y-1/2 hidden md:block"></div>
            {/* Arrow at the end of the line */}
            <div className="absolute top-1/2 right-[19%] w-3 h-3 border-t-2 border-r-2 border-emerald-300 rotate-45 -translate-y-1/2 hidden md:block"></div>
            
            {/* The Vertical Axis Line for Báo giá -> Hợp đồng */}
            <div className="absolute left-[20%] top-[30%] bottom-[30%] w-0.5 bg-emerald-300 hidden md:block"></div>

            {/* The Vertical Axis Line for Ghi nhận doanh thu -> Xuất hóa đơn */}
            <div className="absolute left-[40%] top-[30%] bottom-[30%] w-0.5 bg-emerald-300 hidden md:block"></div>

            {/* The Vertical Axis Line for Trả lại hàng bán -> Giảm giá hàng bán */}
            <div className="absolute left-[60%] top-[30%] bottom-[30%] w-0.5 bg-emerald-300 hidden md:block"></div>
            
            {/* The Vertical Axis Line for Thu tiền */}
            <div className="absolute left-[80%] top-[30%] bottom-[50%] w-0.5 bg-emerald-300 hidden md:block"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-y-16 gap-x-8 w-full max-w-4xl relative z-10">
              
              {/* Column 1: Khởi tạo */}
              <div className="flex flex-col items-center justify-between space-y-16">
                <button onClick={() => onNavigate("quote")} className="group flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <FileText className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-amber-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">$</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700">Báo giá</span>
                </button>
                
                <button onClick={() => onNavigate("sales_order")} className="group flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <Package className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">✓</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700">Đơn đặt hàng</span>
                </button>

                <button onClick={() => onNavigate("contract")} className="group flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <Briefcase className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-amber-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">!</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700 text-center">Hợp đồng<br/>bán hàng</span>
                </button>
              </div>

              {/* Column 2: Thực hiện */}
              <div className="flex flex-col items-center justify-between space-y-16 mt-8">
                <button onClick={() => onNavigate("voucher")} className="group flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <Receipt className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-orange-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">✓</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700 text-center">Ghi nhận<br/>doanh thu</span>
                </button>

                <button onClick={() => onNavigate("invoice")} className="group flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <FileCheck className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">$</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700">Xuất hóa đơn</span>
                </button>
              </div>

              {/* Column 3: Xử lý đặc biệt */}
              <div className="flex flex-col items-center justify-between space-y-16 mt-8">
                <button onClick={() => onNavigate("return")} className="group flex flex-col items-center cursor-pointer opacity-90 hover:opacity-100">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <RefreshCcw className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-orange-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">⟲</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700 text-center">Trả lại<br/>hàng bán</span>
                </button>

                <button onClick={() => onNavigate("discount")} className="group flex flex-col items-center cursor-pointer opacity-90 hover:opacity-100">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <Percent className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">%</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700 text-center">Giảm giá<br/>hàng bán</span>
                </button>
              </div>

              {/* Column 4: Hoàn thành */}
              <div className="flex flex-col items-center justify-start mt-8">
                <button className="group flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 relative">
                    <Banknote className="w-8 h-8" />
                    <div className="absolute -bottom-2 -right-2 bg-orange-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">→</div>
                  </div>
                  <span className="mt-3 text-sm font-medium text-slate-700 group-hover:text-emerald-700 text-center">Thu tiền theo<br/>hóa đơn</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="grid grid-cols-5 border-t border-slate-200 bg-white rounded-b-xl overflow-hidden mt-6">
          {["Khách hàng", "Hàng hóa, dịch vụ", "Điều khoản thanh toán", "Tiện ích", "Tùy chọn"].map((item, i) => (
            <button key={item} className="py-4 flex flex-col items-center justify-center hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors border-r border-slate-100 last:border-r-0">
              <span className="text-sm font-medium">{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
