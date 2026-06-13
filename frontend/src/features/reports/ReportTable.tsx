import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import type { ReportTableColumn, ReportTableRow } from "./types";

type ReportTableProps = {
  columns: ReportTableColumn[];
  rows: ReportTableRow[];
};

export function ReportTable({ columns, rows }: ReportTableProps) {
  return (
    <section className="rounded-lg border border-border bg-white shadow-soft">
      <div className="border-b border-border p-4">
        <h2 className="text-base font-semibold text-text">Bang chi tiet</h2>
        <p className="mt-1 text-sm text-slate-500">Du lieu theo bo loc hien tai, san sang xuat file.</p>
      </div>

      {rows.length === 0 ? (
        <div className="p-4">
          <EmptyState title="Khong co du lieu bang" description="Chua co ban ghi phu hop voi bo loc da chon." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-background text-xs uppercase text-slate-500">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={column.align === "right" ? "px-4 py-3 text-right font-semibold" : "px-4 py-3 font-semibold"}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-orange-50/60">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.align === "right" ? "px-4 py-3 text-right text-slate-700" : "px-4 py-3 text-slate-700"}
                    >
                      {formatCell(row[column.key], column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function formatCell(value: string | number | undefined, column: ReportTableColumn) {
  if (value === undefined) {
    return "";
  }

  if (typeof value !== "number") {
    return value;
  }

  if (column.format === "currency") {
    return formatCurrency(value);
  }

  if (column.format === "percent") {
    return `${value}%`;
  }

  return new Intl.NumberFormat("vi-VN").format(value);
}
