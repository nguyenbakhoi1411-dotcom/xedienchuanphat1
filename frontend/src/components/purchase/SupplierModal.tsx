"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCreateSupplier, useUpdateSupplier } from "@/features/purchasing/hooks";
import type { Supplier, SupplierRequest } from "@/features/purchasing/types";
import { cn } from "@/lib/cn";

interface Props {
  supplier?: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_FORM: SupplierRequest = {
  code: "",
  name: "",
  tenVietTat: "",
  taxCode: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  tinhThanh: "",
  contactPerson: "",
  chucVuNguoiLH: "",
  dienThoaiNguoiLH: "",
  emailNguoiLH: "",
  soTaiKhoanNH: "",
  tenNganHang: "",
  chiNhanhNH: "",
  creditLimit: 0,
  paymentTermsDays: 30,
  phuongThucTT: "BANK",
  rating: 5,
  notes: "",
};

export function SupplierModal({ supplier, isOpen, onClose }: Props) {
  const [form, setForm] = useState<SupplierRequest>(DEFAULT_FORM);
  const createReq = useCreateSupplier();
  const updateReq = useUpdateSupplier();

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setForm({
          code: supplier.code || "",
          name: supplier.name || "",
          tenVietTat: supplier.tenVietTat || "",
          taxCode: supplier.taxCode || "",
          phone: supplier.phone || "",
          email: supplier.email || "",
          website: supplier.website || "",
          address: supplier.address || "",
          tinhThanh: supplier.tinhThanh || "",
          contactPerson: supplier.contactPerson || "",
          chucVuNguoiLH: supplier.chucVuNguoiLH || "",
          dienThoaiNguoiLH: supplier.dienThoaiNguoiLH || "",
          emailNguoiLH: supplier.emailNguoiLH || "",
          soTaiKhoanNH: supplier.soTaiKhoanNH || "",
          tenNganHang: supplier.tenNganHang || "",
          chiNhanhNH: supplier.chiNhanhNH || "",
          creditLimit: supplier.creditLimit || 0,
          paymentTermsDays: supplier.paymentTermsDays || 30,
          phuongThucTT: supplier.phuongThucTT || "BANK",
          rating: supplier.rating || 5,
          notes: supplier.notes || "",
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [isOpen, supplier]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supplier) {
      updateReq.mutate(
        { id: supplier.id, req: form },
        { onSuccess: () => onClose() }
      );
    } else {
      createReq.mutate(form, { onSuccess: () => onClose() });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {supplier ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="supplier-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin chung */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-800 border-b pb-2">Thông tin chung</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Mã NCC <span className="text-slate-400 font-normal">(để trống tự sinh)</span></label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="VD: NCC-0001"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Tên NCC <span className="text-red-500">*</span></label>
                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Tên viết tắt</label>
                  <input
                    name="tenVietTat"
                    value={form.tenVietTat}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Mã số thuế</label>
                  <input
                    name="taxCode"
                    value={form.taxCode}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Liên hệ */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-800 border-b pb-2">Liên hệ & Địa chỉ</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Điện thoại</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Tỉnh/Thành phố</label>
                  <input
                    name="tinhThanh"
                    value={form.tinhThanh}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Địa chỉ</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Người đại diện</label>
                  <input
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">SĐT người liên hệ</label>
                  <input
                    name="dienThoaiNguoiLH"
                    value={form.dienThoaiNguoiLH}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Thanh toán & Ngân hàng */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-800 border-b pb-2">Tài chính & Ngân hàng</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Phương thức TT mặc định</label>
                  <select
                    name="phuongThucTT"
                    value={form.phuongThucTT}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="BANK">Chuyển khoản (BANK)</option>
                    <option value="CASH">Tiền mặt (CASH)</option>
                    <option value="BOTH">Cả hai</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Số ngày công nợ mặc định (hạn TT)</label>
                  <input
                    type="number"
                    name="paymentTermsDays"
                    value={form.paymentTermsDays}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Tên ngân hàng</label>
                  <input
                    name="tenNganHang"
                    value={form.tenNganHang}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Số tài khoản</label>
                  <input
                    name="soTaiKhoanNH"
                    value={form.soTaiKhoanNH}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-700">Ghi chú</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="supplier-form"
            disabled={createReq.isPending || updateReq.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createReq.isPending || updateReq.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
