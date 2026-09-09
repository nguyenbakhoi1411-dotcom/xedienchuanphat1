"use client";
import React from "react";

const REPORTS = [
  { id: 1, name: "Bao cao doanh thu ban hang", desc: "Tong hop doanh thu theo thoi gian, nhan vien, san pham", icon: "📊", category: "Doanh thu" },
  { id: 2, name: "Bao cao cong no phai thu", desc: "Danh sach cong no phai thu theo khach hang", icon: "💰", category: "Cong no" },
  { id: 3, name: "Top san pham ban chay", desc: "Xep hang san pham theo doanh so va so luong ban", icon: "🏆", category: "San pham" },
  { id: 4, name: "Bang ke hoa don ban ra", desc: "Danh sach hoa don VAT da phat hanh", icon: "🧾", category: "Hoa don" },
  { id: 5, name: "Bao cao hieu qua nhan vien ban hang", desc: "Doanh so va chi tieu theo nhan vien", icon: "👤", category: "Nhan su" },
  { id: 6, name: "Phan tich no theo tuoi no", desc: "Phan loai cong no theo thoi gian qua han", icon: "📈", category: "Cong no" },
  { id: 7, name: "Bao cao doanh thu theo khu vuc", desc: "Doanh so phan bo theo chi nhanh, dia ban", icon: "🗺️", category: "Doanh thu" },
  { id: 8, name: "Bao cao bao gia", desc: "Ty le chuyen doi bao gia thanh don hang", icon: "📋", category: "Quy trinh" },
  { id: 9, name: "Lich su mua hang khach hang", desc: "Lich su mua hang va xu huong tieu dung", icon: "📝", category: "Khach hang" },
  { id: 10, name: "Bao cao hang tra lai", desc: "Thong ke ty le va ly do tra hang", icon: "🔄", category: "Tra hang" },
];

const CATEGORIES = ["Tat ca", "Doanh thu", "Cong no", "Hoa don", "San pham", "Khach hang", "Nhan su", "Quy trinh", "Tra hang"];

export function ReportsTab() {
  const [category, setCategory] = React.useState("Tat ca");
  const filtered = category === "Tat ca" ? REPORTS : REPORTS.filter(r => r.category === category);

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4 gap-4">
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${category === c ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
        {filtered.map(report => (
          <div key={report.id}
            className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{report.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 group-hover:text-blue-700 text-sm mb-1">{report.name}</div>
                <div className="text-xs text-gray-500 mb-2">{report.desc}</div>
                <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{report.category}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Xem bao cao</button>
              <button className="px-2 py-1 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50">Xuat Excel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
