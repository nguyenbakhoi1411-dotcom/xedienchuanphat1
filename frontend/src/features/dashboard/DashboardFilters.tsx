"use client";

import type { DashboardFilters as DashboardFiltersType } from "./types";

type DashboardFiltersProps = {
  value: DashboardFiltersType;
  onChange: (value: DashboardFiltersType) => void;
};

export function DashboardFilters({ value, onChange }: DashboardFiltersProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
      <input
        type="date"
        value={value.fromDate}
        onChange={(event) => onChange({ ...value, fromDate: event.target.value, month: "all" })}
        className="erp-input"
      />
      <input
        type="date"
        value={value.toDate}
        onChange={(event) => onChange({ ...value, toDate: event.target.value, month: "all" })}
        className="erp-input"
      />
      <select
        value={value.branchId}
        onChange={(event) => onChange({ ...value, branchId: event.target.value })}
        className="erp-input"
      >
        <option value="all">Tất cả chi nhánh</option>
        <option value="1">Chi nhánh Gò Vấp</option>
        <option value="2">Chi nhánh Thủ Đức</option>
        <option value="3">Chi nhánh Bình Thạnh</option>
      </select>

      <select
        value={value.employeeId}
        onChange={(event) => onChange({ ...value, employeeId: event.target.value })}
        className="erp-input"
      >
        <option value="all">Tất cả nhân viên</option>
        <option value="102">Nhân viên bán hàng 1</option>
        <option value="103">Nhân viên kho 1</option>
        <option value="104">Kế toán 1</option>
      </select>

      <select
        value={value.productCategory}
        onChange={(event) => onChange({ ...value, productCategory: event.target.value })}
        className="erp-input"
      >
        <option value="all">Tất cả danh mục</option>
        <option value="ELECTRIC_MOTORBIKE">Xe máy điện</option>
        <option value="BATTERY">Pin/ắc quy</option>
        <option value="ACCESSORY">Phụ kiện</option>
        <option value="SPARE_PART">Phụ tùng</option>
      </select>

      <select
        value={value.month}
        onChange={(event) => onChange({ ...value, month: event.target.value, fromDate: "", toDate: "" })}
        className="erp-input"
      >
        <option value="all">Theo khoảng ngày</option>
        {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
          <option key={month} value={String(month)}>
            Tháng {month}
          </option>
        ))}
      </select>

      <select
        value={value.timeRange}
        onChange={(event) =>
          onChange({ ...value, timeRange: event.target.value as DashboardFiltersType["timeRange"] })
        }
        className="erp-input"
      >
        <option value="TODAY">Hôm nay</option>
        <option value="THIS_MONTH">Tháng này</option>
        <option value="LAST_30_DAYS">30 ngày gần nhất</option>
        <option value="THIS_YEAR">Năm nay</option>
      </select>
    </div>
  );
}
