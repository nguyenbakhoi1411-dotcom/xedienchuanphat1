import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import type { TopProduct } from "./types";

export function TopProductsTable({ data }: { data: TopProduct[] }) {
  return (
    <section className="rounded-lg border border-border bg-white shadow-soft">
      <div className="border-b border-border p-4">
        <h2 className="text-base font-semibold text-text">Sản phẩm bán chạy</h2>
        <p className="mt-1 text-sm text-slate-500">Xếp hạng theo số lượng bán.</p>
      </div>

      {data.length === 0 ? (
        <div className="p-4">
          <EmptyState title="Chưa có sản phẩm bán chạy" description="Dữ liệu sẽ hiển thị khi có đơn hàng." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-background text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Sản phẩm</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 text-right font-semibold">Đã bán</th>
                <th className="px-4 py-3 text-right font-semibold">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((item) => (
                <tr key={item.productId} className="hover:bg-orange-50/60">
                  <td className="px-4 py-3 font-medium text-text">{item.productName}</td>
                  <td className="px-4 py-3 text-slate-500">{item.sku}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{item.quantitySold}</td>
                  <td className="px-4 py-3 text-right font-medium text-text">{formatCurrency(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
