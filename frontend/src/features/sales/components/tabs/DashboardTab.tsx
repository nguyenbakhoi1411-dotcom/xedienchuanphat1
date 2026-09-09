import React from 'react';
import { DateRangePreset } from '../shared/DateRangePreset';

export function DashboardTab() {
  return (
    <div className="p-6 bg-gray-50 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Biểu đồ Phân tích Bán hàng</h2>
        <DateRangePreset />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Doanh thu</h3>
          <p className="text-2xl font-bold text-gray-900">1,250,000,000 đ</p>
          <span className="text-green-500 text-xs font-medium">↑ 15% so với kỳ trước</span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Số lượng đơn hàng</h3>
          <p className="text-2xl font-bold text-gray-900">342</p>
          <span className="text-green-500 text-xs font-medium">↑ 5% so với kỳ trước</span>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Công nợ phải thu</h3>
          <p className="text-2xl font-bold text-red-600">450,000,000 đ</p>
          <span className="text-red-500 text-xs font-medium">↑ 2% so với kỳ trước</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm min-h-[300px] flex flex-col items-center justify-center">
          <h3 className="text-gray-700 font-semibold mb-4 w-full text-left">Doanh thu theo tháng</h3>
          <div className="flex-1 w-full flex items-end justify-around gap-2 pb-4 border-b">
            {[40, 60, 45, 80, 50, 90, 75].map((h, i) => (
              <div key={i} className="w-8 bg-blue-500 rounded-t-sm" style={{ height: `\${h}%` }}></div>
            ))}
          </div>
          <div className="w-full flex justify-around text-xs text-gray-500 mt-2">
            <span>T1</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm min-h-[300px] flex flex-col items-center justify-center">
          <h3 className="text-gray-700 font-semibold mb-4 w-full text-left">Top mặt hàng bán chạy</h3>
          <ul className="w-full space-y-4">
            <li>
              <div className="flex justify-between text-sm mb-1"><span>Máy tính xách tay</span><span>45%</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div></div>
            </li>
            <li>
              <div className="flex justify-between text-sm mb-1"><span>Điện thoại di động</span><span>30%</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-orange-400 h-2 rounded-full" style={{ width: '30%' }}></div></div>
            </li>
            <li>
              <div className="flex justify-between text-sm mb-1"><span>Phụ kiện</span><span>25%</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-orange-300 h-2 rounded-full" style={{ width: '25%' }}></div></div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
