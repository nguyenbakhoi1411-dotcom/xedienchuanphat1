import { ArrowUpRight, CircleDollarSign, ClipboardCheck, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ModulePageProps = {
  title: string;
  description: string;
};

const stats = [
  { label: "Tổng bản ghi", value: "1.248", icon: ClipboardCheck },
  { label: "Tăng trưởng", value: "+12,8%", icon: ArrowUpRight },
  { label: "Giá trị", value: "428 triệu", icon: CircleDollarSign },
  { label: "Đang xử lý", value: "36", icon: PackageCheck }
];

export function ModulePage({ title, description }: ModulePageProps) {
  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-text">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
        </div>
        <Button>Thao tác mới</Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="rounded-lg border border-border bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">{stat.label}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-text">{stat.value}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-lg border border-border bg-white shadow-soft">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text">Dữ liệu gần đây</h2>
            <p className="mt-1 text-sm text-slate-500">Bảng mẫu có tìm kiếm, bộ lọc và phân trang cho module.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100"
              placeholder="Tìm kiếm"
            />
            <select className="h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100">
              <option>Tất cả trạng thái</option>
              <option>Đang xử lý</option>
              <option>Hoàn thành</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-background text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Mã</th>
                <th className="px-4 py-3 font-semibold">Tên</th>
                <th className="px-4 py-3 font-semibold">Chi nhánh</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold">Giá trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {["CP-001", "CP-002", "CP-003"].map((code, index) => (
                <tr key={code} className="hover:bg-orange-50/60">
                  <td className="px-4 py-3 font-medium text-text">{code}</td>
                  <td className="px-4 py-3 text-slate-600">{title} {index + 1}</td>
                  <td className="px-4 py-3 text-slate-600">Gò Vấp</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-primary">
                      Đang xử lý
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-text">{(index + 1) * 12},5 triệu</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-slate-500">
          <span>Hiển thị 1-3 trên 3</span>
          <div className="flex gap-2">
            <Button variant="secondary" className="h-9 px-3">Trước</Button>
            <Button variant="secondary" className="h-9 px-3">Sau</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
