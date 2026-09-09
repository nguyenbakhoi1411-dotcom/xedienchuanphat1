import { ArrowRight, FileText, FileOutput, ArrowRightLeft, ShieldCheck, TrendingUp, AlertCircle } from "lucide-react";
import { TaxTabKey } from "../TaxTabs";
import { cn } from "@/lib/cn";

interface Props {
  onNavigate: (tab: TaxTabKey) => void;
}

export function OverviewTab({ onNavigate }: Props) {
  const processSteps = [
    {
      id: "input_invoices",
      title: "Hóa đơn đầu vào",
      description: "Quản lý hóa đơn mua vào, kiểm tra mã số thuế và tính hợp lệ.",
      icon: FileText,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      id: "output_invoices",
      title: "Hóa đơn đầu ra",
      description: "Quản lý hóa đơn bán ra, phát hành hóa đơn điện tử.",
      icon: FileOutput,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      id: "vat_declaration",
      title: "Khấu trừ thuế",
      description: "Thực hiện kết chuyển thuế GTGT cuối kỳ tự động.",
      icon: ArrowRightLeft,
      color: "bg-violet-500",
      lightColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      id: "tax_declaration_form",
      title: "Tờ khai thuế",
      description: "Lập tờ khai thuế GTGT (01/GTGT) nộp cơ quan thuế.",
      icon: ShieldCheck,
      color: "bg-amber-500",
      lightColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
  ] as const;

  return (
    <div className="p-8 h-full bg-slate-50/50">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="w-24 h-24 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Thuế GTGT đầu ra (Tháng này)</p>
            <h3 className="text-3xl font-bold text-slate-800">45,230,000 <span className="text-lg font-normal text-slate-500">VND</span></h3>
            <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12.5% so với tháng trước</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="w-24 h-24 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Thuế GTGT đầu vào (Tháng này)</p>
            <h3 className="text-3xl font-bold text-slate-800">28,150,000 <span className="text-lg font-normal text-slate-500">VND</span></h3>
            <div className="mt-4 flex items-center text-sm text-red-500 font-medium">
              <TrendingUp className="w-4 h-4 mr-1 rotate-180" />
              <span>-5.2% so với tháng trước</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <ShieldCheck className="w-24 h-24" />
            </div>
            <p className="text-sm font-medium text-blue-100 mb-1">Thuế GTGT phải nộp dự kiến</p>
            <h3 className="text-3xl font-bold text-white">17,080,000 <span className="text-lg font-normal text-blue-200">VND</span></h3>
            <button 
              onClick={() => onNavigate("vat_declaration")}
              className="mt-4 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center backdrop-blur-sm"
            >
              Thực hiện khấu trừ ngay
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Process Flow */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            Quy trình nghiệp vụ Thuế
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-slate-200 -z-10" />
            
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => onNavigate(step.id)}
                  className="bg-white group p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 text-left flex flex-col items-center md:items-start text-center md:text-left relative z-0 hover:-translate-y-1"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm", step.lightColor, step.textColor)}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                  
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:flex absolute -right-6 top-10 w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center z-10 text-slate-400">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex gap-4 items-start">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-full shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-orange-800">Nhắc nhở kỳ kê khai</h4>
            <p className="text-sm text-orange-700 mt-1">Sắp đến hạn nộp tờ khai thuế GTGT tháng này (Hạn cuối: 20/07/2026). Vui lòng hoàn thành đối soát và kết chuyển thuế trước ngày 15 để tránh sai sót.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
