import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let colorClass = "bg-gray-100 text-gray-700 border-gray-200";
  let label = status;

  if (status === 'CHUA_GHI' || status === 'CHUA_PHAT_HANH') {
    colorClass = "bg-orange-50 text-orange-600 border-orange-200";
    label = status === 'CHUA_GHI' ? 'Chưa ghi DS' : 'Chưa phát hành';
  } else if (status === 'DA_GHI' || status === 'DA_PHAT_HANH' || status === 'DA_XUAT_DU') {
    colorClass = "bg-green-50 text-green-600 border-green-200";
    label = status === 'DA_GHI' ? 'Đã ghi DS' : (status === 'DA_PHAT_HANH' ? 'Đã phát hành' : 'Đã xuất đủ');
  } else if (status === 'CHUA_THUC_HIEN' || status === 'CHUA_XUAT') {
    colorClass = "bg-gray-100 text-gray-600 border-gray-300";
    label = status === 'CHUA_THUC_HIEN' ? 'Chưa thực hiện' : 'Chưa xuất';
  } else if (status === 'HOAN_THANH') {
    colorClass = "bg-blue-50 text-blue-600 border-blue-200";
    label = "Hoàn thành";
  } else if (status === 'DRAFT') {
    colorClass = "bg-gray-100 text-gray-600 border-gray-300";
    label = "Nháp";
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-medium border rounded-full whitespace-nowrap \${colorClass}`}>
      {label}
    </span>
  );
}
