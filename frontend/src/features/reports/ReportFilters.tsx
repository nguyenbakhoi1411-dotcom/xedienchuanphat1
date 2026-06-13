"use client";

import type { ReportFilters as ReportFiltersType, ReportType } from "./types";
import { branchOptions, customerOptions, employeeOptions, productCategoryOptions, productOptions, reportTypes, statusOptions } from "./reportOptions";

type ReportFiltersProps = {
  reportType: ReportType;
  filters: ReportFiltersType;
  onReportTypeChange: (value: ReportType) => void;
  onFiltersChange: (value: ReportFiltersType) => void;
};

export function ReportFilters({
  reportType,
  filters,
  onReportTypeChange,
  onFiltersChange
}: ReportFiltersProps) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.2fr)_repeat(8,minmax(130px,1fr))]">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-text">Loai bao cao</span>
          <select
            value={reportType}
            onChange={(event) => onReportTypeChange(event.target.value as ReportType)}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-orange-100"
          >
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-text">Tu ngay</span>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(event) => onFiltersChange({ ...filters, fromDate: event.target.value, page: 0 })}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-orange-100"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-text">Den ngay</span>
          <input
            type="date"
            value={filters.toDate}
            onChange={(event) => onFiltersChange({ ...filters, toDate: event.target.value, page: 0 })}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-orange-100"
          />
        </label>

        <SelectFilter
          label="Chi nhanh"
          value={filters.branchId}
          options={branchOptions}
          onChange={(branchId) => onFiltersChange({ ...filters, branchId, page: 0 })}
        />

        <SelectFilter
          label="Nhan vien"
          value={filters.employeeId}
          options={employeeOptions}
          onChange={(employeeId) => onFiltersChange({ ...filters, employeeId, page: 0 })}
        />

        <SelectFilter
          label="San pham"
          value={filters.productId}
          options={productOptions}
          onChange={(productId) => onFiltersChange({ ...filters, productId, page: 0 })}
        />

        <SelectFilter
          label="Khach hang"
          value={filters.customerId}
          options={customerOptions}
          onChange={(customerId) => onFiltersChange({ ...filters, customerId, page: 0 })}
        />

        <SelectFilter
          label="Trang thai"
          value={filters.status}
          options={statusOptions}
          onChange={(status) => onFiltersChange({ ...filters, status, page: 0 })}
        />

        <SelectFilter
          label="Danh muc"
          value={filters.productCategory}
          options={productCategoryOptions}
          onChange={(productCategory) => onFiltersChange({ ...filters, productCategory, page: 0 })}
        />
      </div>
    </section>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-text">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-orange-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
