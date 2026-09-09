"use client";

import React, { useEffect, useState } from 'react';
import { MasterDetailTable } from '@/features/sales/components/shared/MasterDetailTable';
import { DateRangePreset } from '@/features/sales/components/shared/DateRangePreset';
import { StatusBadge } from '@/features/sales/components/shared/StatusBadge';

const MASTER_COLUMNS = [
  { key: 'transferDate', label: 'Ngày hạch toán' },
  { key: 'transferNo', label: 'Số chứng từ' },
  { key: 'description', label: 'Lý do chuyển' },
  { key: 'totalAmount', label: 'Tổng tiền' },
  { key: 'status', label: 'Trạng thái' }
];

const DETAIL_COLUMNS = [
  { key: 'productCode', label: 'Mã hàng' },
  { key: 'productName', label: 'Tên hàng' },
  { key: 'fromWarehouseName', label: 'Từ kho' },
  { key: 'toWarehouseName', label: 'Đến kho' },
  { key: 'unitName', label: 'ĐVT' },
  { key: 'quantity', label: 'Số lượng' }
];

export function TransferTab() {
  const [data, setData] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/inventory/transfers')
      .then(res => res.json())
      .then(json => {
        if (json.content) {
          setData(json.content);
          if (json.content.length > 0) setSelectedRow(json.content[0]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

  const formattedMasterData = data.map(item => ({
    ...item,
    totalAmount: formatter.format(item.totalAmount || 0),
    status: <StatusBadge status={item.status === 'COMPLETED' ? 'DA_GHI' : 'CHUA_GHI'} />
  }));

  const detailData = selectedRow?.items || [];

  return (
    <div className="flex flex-col h-full bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <DateRangePreset />
          <div className="relative">
            <input type="text" placeholder="Tìm kiếm chứng từ..." className="border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:border-blue-500 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700">
            Thêm chứng từ
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded border border-gray-200">
        <MasterDetailTable
          masterColumns={MASTER_COLUMNS}
          masterData={formattedMasterData}
          masterTotal={{ totalAmount: formatter.format(data.reduce((sum, item) => sum + (item.totalAmount || 0), 0)) }}
          onRowClick={(row) => setSelectedRow(data.find(d => d.id === row.id))}
          selectedRowId={selectedRow?.id}
          detailColumns={DETAIL_COLUMNS}
          detailData={detailData}
          detailTitle="Chi tiết phiếu chuyển kho"
          detailTotal={{}}
        />
      </div>
    </div>
  );
}
