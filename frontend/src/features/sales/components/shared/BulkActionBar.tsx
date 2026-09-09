import React from 'react';

interface BulkActionBarProps {
  selectedCount: number;
  onAction: (action: string) => void;
}

export function BulkActionBar({ selectedCount, onAction }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 p-2 flex items-center gap-4 rounded-md mb-2 shadow-sm text-sm">
      <span className="text-orange-700 font-medium">Đã chọn {selectedCount} bản ghi</span>
      <select 
        className="border border-gray-300 rounded px-2 py-1 bg-white outline-none focus:border-orange-400"
        onChange={(e) => {
          if(e.target.value) {
            onAction(e.target.value);
            e.target.value = "";
          }
        }}
      >
        <option value="">Thực hiện hàng loạt ▼</option>
        <option value="publish">Phát hành HĐ</option>
        <option value="record_revenue">Ghi nhận doanh số</option>
        <option value="export">Xuất khẩu</option>
        <option value="delete">Xóa</option>
      </select>
    </div>
  );
}
