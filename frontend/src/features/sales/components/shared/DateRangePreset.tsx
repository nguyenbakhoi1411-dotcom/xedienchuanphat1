import React from 'react';

export function DateRangePreset() {
  return (
    <select className="border border-gray-300 rounded px-2 py-1 bg-white outline-none focus:border-blue-500 text-sm">
      <option value="ytd">Đầu năm tới hiện tại</option>
      <option value="today">Hôm nay</option>
      <option value="this_week">Tuần này</option>
      <option value="this_month">Tháng này</option>
      <option value="custom">Tùy chọn...</option>
    </select>
  );
}
