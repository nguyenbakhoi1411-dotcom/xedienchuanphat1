"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, BarChart2, Search, SlidersHorizontal, EyeOff, LayoutGrid } from "lucide-react";
import { REPORT_CATALOG, ReportCategory, ReportItem } from "@/features/reports/data/reportCatalog";

export default function ReportsPortalPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("yeu-thich");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("misa-amis-report-favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleFavorite = (id: string) => {
    let newFavs;
    if (favorites.includes(id)) {
      newFavs = favorites.filter((f) => f !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    localStorage.setItem("misa-amis-report-favorites", JSON.stringify(newFavs));
  };

  // Build the "Yêu thích" category
  const favoriteItems: ReportItem[] = [];
  REPORT_CATALOG.forEach((cat) => {
    if (cat.items) {
      cat.items.forEach((item) => {
        if (favorites.includes(item.id)) favoriteItems.push(item);
      });
    }
    if (cat.groups) {
      cat.groups.forEach((g) => {
        g.items.forEach((item) => {
          if (favorites.includes(item.id)) favoriteItems.push(item);
        });
      });
    }
  });

  const categories = [
    { id: "yeu-thich", name: "Yêu thích" },
    ...REPORT_CATALOG,
  ];

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <div className="flex h-screen bg-white text-sm">
      {/* Sidebar */}
      <div className="w-56 border-r border-teal-100 flex flex-col bg-slate-50/50 flex-none">
        <div className="p-3">
          <button className="flex items-center gap-2 px-3 py-2 text-teal-700 bg-teal-50 rounded-md font-medium w-full shadow-sm border border-teal-100">
            <span className="text-lg leading-none">+</span>
            Thêm nhanh
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-800 font-medium border-l-4 border-teal-500 rounded-l-none -ml-2 pl-4"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Top bar (Tabs) */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 flex-none bg-slate-50">
          <div className="flex gap-6 h-12">
            <button className="border-b-2 border-teal-500 text-teal-700 font-medium h-full flex items-center px-1">
              Tất cả
            </button>
            <button className="text-slate-500 hover:text-slate-800 h-full flex items-center px-1">
              Báo cáo đã lưu
            </button>
            <button className="text-slate-500 hover:text-slate-800 h-full flex items-center px-1">
              Lịch gửi báo cáo định kỳ
              <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">MỚI</span>
            </button>
            <button className="text-slate-500 hover:text-slate-800 h-full flex items-center px-1 gap-1">
              AVA Phân tích tài chính
              <span className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center">
                🤖
              </span>
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 font-bold rounded">MỚI</span>
              <span>In nhanh hơn - Ổn định hơn - In dữ liệu lớn với trình in mới của AMIS Kế toán. <a href="#" className="text-blue-600 hover:underline">Xem ngay</a></span>
            </div>
            <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
              Ngôn ngữ báo cáo: 
              <select className="border border-slate-300 rounded px-2 py-1 bg-white">
                <option>Tiếng Việt</option>
                <option>English</option>
              </select>
            </div>
            <button className="flex items-center gap-1 hover:text-slate-800">
              <EyeOff className="w-3.5 h-3.5" /> Ẩn/hiện báo cáo
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-4 bg-white flex-none">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên báo cáo" 
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            Tìm kiếm nhanh báo cáo với AVA Kế toán 🤖
          </div>
        </div>

        {/* Report List */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
          <div className="bg-white border border-slate-200 rounded shadow-sm min-h-full">
            {/* Category Header */}
            <div className="px-4 py-3 border-b border-slate-100 font-bold text-slate-800 bg-slate-50/50 rounded-t">
              {activeCategory?.name}
            </div>

            <div className="p-4 space-y-6">
              {activeCategoryId === "yeu-thich" && (
                <div>
                  {favoriteItems.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">
                      Chưa có báo cáo nào được thêm vào danh sách Yêu thích.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-12 gap-y-1">
                      {favoriteItems.map(item => (
                        <ReportRow key={item.id} item={item} isFav={true} onToggle={() => toggleFavorite(item.id)} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeCategoryId !== "yeu-thich" && activeCategory && (activeCategory as ReportCategory).items && (
                <div className="grid grid-cols-2 gap-x-12 gap-y-1">
                  {(activeCategory as ReportCategory).items!.map(item => (
                    <ReportRow key={item.id} item={item} isFav={favorites.includes(item.id)} onToggle={() => toggleFavorite(item.id)} />
                  ))}
                </div>
              )}

              {activeCategoryId !== "yeu-thich" && activeCategory && (activeCategory as ReportCategory).groups && (
                <div className="space-y-6">
                  {(activeCategory as ReportCategory).groups!.map(group => (
                    <div key={group.id}>
                      <h3 className="font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 mb-2 flex items-center justify-between group cursor-pointer hover:bg-slate-200">
                        {group.name}
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 rotate-90" />
                      </h3>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-1 px-3">
                        {group.items.map(item => (
                          <ReportRow key={item.id} item={item} isFav={favorites.includes(item.id)} onToggle={() => toggleFavorite(item.id)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportRow({ item, isFav, onToggle }: { item: ReportItem, isFav: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 group hover:bg-slate-50 px-2 -mx-2 rounded">
      <Link 
        href={item.href || "#"} 
        className={`text-slate-700 hover:text-teal-600 truncate flex-1 ${!item.href && "opacity-70 cursor-not-allowed"}`}
        title={item.href ? "" : "Báo cáo này đang được cập nhật"}
        onClick={(e) => {
          if (!item.href) {
            e.preventDefault();
            alert("Báo cáo này đang trong quá trình phát triển.");
          }
        }}
      >
        {item.name}
      </Link>
      <div className="flex items-center gap-3 ml-4 flex-none opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-slate-400 hover:text-teal-600" title="Xem báo cáo">
          <BarChart2 className="w-4 h-4" />
        </button>
        <button className={`${isFav ? "text-green-500" : "text-slate-300 hover:text-green-500"} opacity-100`} onClick={onToggle}>
          <Star className={`w-4 h-4 ${isFav ? "fill-green-500" : ""}`} />
        </button>
      </div>
    </div>
  );
}

// Simple icon for Chevron
function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
