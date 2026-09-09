"use client";

import { useState, useRef, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, X, Plus, Trash2, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cashApi } from "@/features/cash/api";
import { PaymentType } from "@/features/cash/types";
import { soTienBangChu } from "@/lib/utils/numberToWords";

type PaymentLine = {
  id: string;
  dienGiai: string;
  tkNo: string;
  tkCo: string;
  soTien: number;
  nghiepVu: string;
  doiTuong: string;
  tenDoiTuong: string;
  tkNganHang: string;
};

export default function NewPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [maDoiTuong, setMaDoiTuong] = useState("");
  const [tenDoiTuong, setTenDoiTuong] = useState("");
  const [nguoiNhan, setNguoiNhan] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [nhanVien, setNhanVien] = useState("");
  const [lyDoChi, setLyDoChi] = useState("Chi tiền cho");
  const [kemTheo, setKemTheo] = useState("");
  
  const [ngayHachToan, setNgayHachToan] = useState(() => new Date().toISOString().slice(0, 10));
  const [ngayPhieuChi, setNgayPhieuChi] = useState(() => new Date().toISOString().slice(0, 10));
  const [soPhieuChi, setSoPhieuChi] = useState("PC_AUTO");

  // Grid State
  const [lines, setLines] = useState<PaymentLine[]>([
    {
      id: crypto.randomUUID(),
      dienGiai: "Chi tiền cho",
      tkNo: "",
      tkCo: "1111",
      soTien: 0,
      nghiepVu: "",
      doiTuong: "",
      tenDoiTuong: "",
      tkNganHang: "",
    }
  ]);

  const tongTien = lines.reduce((acc, l) => acc + (l.soTien || 0), 0);

  const addLine = () => {
    setLines([...lines, {
      id: crypto.randomUUID(),
      dienGiai: lyDoChi,
      tkNo: "",
      tkCo: "1111",
      soTien: 0,
      nghiepVu: "",
      doiTuong: "",
      tenDoiTuong: "",
      tkNganHang: "",
    }]);
  };

  const removeAllLines = () => {
    setLines([]);
  };

  const removeLine = (id: string) => {
    setLines(lines.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: keyof PaymentLine, value: any) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handlePasteExcel = (e: ClipboardEvent<HTMLTableSectionElement>) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const pastedText = clipboardData.getData("Text");
    if (!pastedText) return;

    e.preventDefault();
    const rows = pastedText.split(/\r?\n/).filter(row => row.trim() !== "");
    
    // Check if user pasted on a specific row
    const target = e.target as HTMLElement;
    const tr = target.closest("tr");
    let startIndex = lines.length;
    
    if (tr && tr.dataset.index) {
      startIndex = parseInt(tr.dataset.index, 10);
    }

    const newLines = [...lines];
    
    rows.forEach((rowStr, i) => {
      const cols = rowStr.split("\t");
      const rIndex = startIndex + i;
      
      const parsedSoTien = cols[3] ? parseFloat(cols[3].replace(/[^\d.-]/g, "")) || 0 : 0;
      
      const newLineObj: PaymentLine = {
        id: crypto.randomUUID(),
        dienGiai: cols[0] || lyDoChi,
        tkNo: cols[1] || "",
        tkCo: cols[2] || "1111",
        soTien: parsedSoTien,
        nghiepVu: cols[4] || "",
        doiTuong: cols[5] || "",
        tenDoiTuong: cols[6] || "",
        tkNganHang: cols[7] || "",
      };

      if (rIndex < newLines.length) {
        newLines[rIndex] = { ...newLines[rIndex], ...newLineObj };
      } else {
        newLines.push(newLineObj);
      }
    });

    setLines(newLines);
    toast.success(`Đã dán ${rows.length} dòng từ Excel`);
  };

  const handleSave = async (confirmNow: boolean) => {
    if (tongTien <= 0) {
      toast.error("Tổng số tiền phải lớn hơn 0");
      return;
    }

    // Determine PaymentType based on the first line's debit account
    let paymentType: PaymentType = "OTHER";
    const mainDebit = lines[0]?.tkNo || "";
    if (mainDebit.startsWith("331")) paymentType = "PURCHASE";
    else if (mainDebit.startsWith("334")) paymentType = "SALARY";
    else if (mainDebit.startsWith("642")) paymentType = "OPERATING";

    // Combine lines description if multiple
    let combinedDesc = lyDoChi;
    if (lines.length > 1) {
      combinedDesc += " (Gồm " + lines.length + " bút toán)";
    }

    setLoading(true);
    try {
      const payload = {
        paymentDate: ngayPhieuChi,
        paymentType,
        amount: tongTien,
        payeeName: nguoiNhan || tenDoiTuong,
        description: combinedDesc,
        confirmNow,
      };
      
      await cashApi.createPayment(payload);
      toast.success(confirmNow ? "Đã xác nhận phiếu chi" : "Đã lưu nháp");
      router.push("/cash?tab=phieu-chi");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi lưu phiếu chi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-full bg-[#f4f5f8]">
      {/* HEADER */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/cash?tab=phieu-chi")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-1.5 rounded-full">
              <Plus className="w-4 h-4 text-orange-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800">Phiếu chi</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/cash?tab=phieu-chi")}>Hủy</Button>
          <Button 
            disabled={loading} 
            onClick={() => handleSave(false)} 
            className="bg-slate-800 hover:bg-slate-900 text-white"
          >
            Lưu nháp
          </Button>
          <Button 
            disabled={loading} 
            onClick={() => handleSave(true)} 
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" /> Ghi sổ
          </Button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-[#fff7ed] rounded-t-lg border border-b-0 p-4 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          
          <div className="lg:col-span-8 grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex items-center gap-2">
              <label className="w-28 text-sm font-medium text-slate-700">Mã đối tượng</label>
              <input value={maDoiTuong} onChange={e => setMaDoiTuong(e.target.value)} className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-orange-500 bg-white" placeholder="Mã KH/NCC/NV..." />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-sm font-medium text-slate-700">Tên đối tượng</label>
              <input value={tenDoiTuong} onChange={e => setTenDoiTuong(e.target.value)} className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-orange-500 bg-white" />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-28 text-sm font-medium text-slate-700">Người nhận</label>
              <input value={nguoiNhan} onChange={e => setNguoiNhan(e.target.value)} className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-orange-500 bg-white" />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-sm font-medium text-slate-700">Địa chỉ</label>
              <input value={diaChi} onChange={e => setDiaChi(e.target.value)} className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-orange-500 bg-white" />
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <label className="w-28 text-sm font-medium text-slate-700">Lý do chi</label>
              <input value={lyDoChi} onChange={e => setLyDoChi(e.target.value)} className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-orange-500 bg-white" />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-28 text-sm font-medium text-slate-700">Nhân viên</label>
              <input value={nhanVien} onChange={e => setNhanVien(e.target.value)} className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-orange-500 bg-white" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="w-28 text-sm font-medium text-slate-700">Kèm theo</label>
              <input type="number" value={kemTheo} onChange={e => setKemTheo(e.target.value)} className="w-20 border border-slate-300 rounded px-2 py-1.5 text-sm outline-none focus:border-orange-500 bg-white" placeholder="SL" />
              <span className="text-sm text-slate-600">chứng từ gốc</span>
            </div>
          </div>

          <div className="lg:col-span-4 border-l border-orange-200 pl-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Ngày hạch toán</label>
              <input type="date" value={ngayHachToan} onChange={e => setNgayHachToan(e.target.value)} className="border border-slate-300 rounded px-2 py-1.5 text-sm w-40 outline-none focus:border-orange-500 bg-white" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Ngày phiếu chi</label>
              <input type="date" value={ngayPhieuChi} onChange={e => setNgayPhieuChi(e.target.value)} className="border border-slate-300 rounded px-2 py-1.5 text-sm w-40 outline-none focus:border-orange-500 bg-white" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Số phiếu chi</label>
              <input type="text" disabled value={soPhieuChi} className="border border-slate-300 rounded px-2 py-1.5 text-sm w-40 bg-orange-50 outline-none focus:border-orange-500" />
            </div>
            
            <div className="pt-4 text-right">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Tổng tiền</div>
              <div className="text-3xl font-bold text-slate-800">
                {new Intl.NumberFormat("vi-VN").format(tongTien)}
              </div>
              <div className="text-xs text-orange-600 font-medium mt-1 italic">
                {tongTien > 0 ? soTienBangChu(tongTien) : ""}
              </div>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="bg-white rounded-b-lg border border-slate-300 shadow-sm">
          <div className="px-4 py-2 border-b border-slate-300 bg-slate-50 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-600">Hạch toán. Bạn có thể copy dữ liệu từ Excel và dán (Ctrl+V) trực tiếp vào bảng.</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-[#fcd34d] text-slate-800">
                  <th className="border border-slate-300 px-2 py-2 w-10 text-center">#</th>
                  <th className="border border-slate-300 px-2 py-2 text-left min-w-[200px]">Diễn giải</th>
                  <th className="border border-slate-300 px-2 py-2 text-center w-24">TK Nợ</th>
                  <th className="border border-slate-300 px-2 py-2 text-center w-24">TK Có</th>
                  <th className="border border-slate-300 px-2 py-2 text-right w-36">Số tiền</th>
                  <th className="border border-slate-300 px-2 py-2 text-left">Nghiệp vụ</th>
                  <th className="border border-slate-300 px-2 py-2 text-left">Mã đối tượng</th>
                  <th className="border border-slate-300 px-2 py-2 text-left">Tên đối tượng</th>
                  <th className="border border-slate-300 px-2 py-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody onPaste={handlePasteExcel}>
                {lines.map((line, i) => (
                  <tr key={line.id} data-index={i} className="hover:bg-orange-50/50 transition-colors group">
                    <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-400">{i + 1}</td>
                    <td className="border border-slate-300 px-0 py-0">
                      <input 
                        value={line.dienGiai} 
                        onChange={e => updateLine(line.id, "dienGiai", e.target.value)} 
                        className="w-full h-full min-h-[32px] px-2 outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white bg-transparent" 
                      />
                    </td>
                    <td className="border border-slate-300 px-0 py-0">
                      <input 
                        value={line.tkNo} 
                        onChange={e => updateLine(line.id, "tkNo", e.target.value)} 
                        className="w-full h-full min-h-[32px] px-2 text-center outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white bg-transparent" 
                      />
                    </td>
                    <td className="border border-slate-300 px-0 py-0">
                      <input 
                        value={line.tkCo} 
                        onChange={e => updateLine(line.id, "tkCo", e.target.value)} 
                        className="w-full h-full min-h-[32px] px-2 text-center outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white bg-transparent" 
                      />
                    </td>
                    <td className="border border-slate-300 px-0 py-0">
                      <input 
                        value={line.soTien === 0 ? "" : new Intl.NumberFormat("vi-VN").format(line.soTien)} 
                        onChange={e => {
                          const val = Number(e.target.value.replace(/\D/g, ""));
                          updateLine(line.id, "soTien", val);
                        }} 
                        className="w-full h-full min-h-[32px] px-2 text-right font-medium text-orange-600 outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white bg-transparent" 
                      />
                    </td>
                    <td className="border border-slate-300 px-0 py-0">
                      <input 
                        value={line.nghiepVu} 
                        onChange={e => updateLine(line.id, "nghiepVu", e.target.value)} 
                        className="w-full h-full min-h-[32px] px-2 outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white bg-transparent" 
                      />
                    </td>
                    <td className="border border-slate-300 px-0 py-0">
                      <input 
                        value={line.doiTuong} 
                        onChange={e => updateLine(line.id, "doiTuong", e.target.value)} 
                        className="w-full h-full min-h-[32px] px-2 outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white bg-transparent" 
                      />
                    </td>
                    <td className="border border-slate-300 px-0 py-0">
                      <input 
                        value={line.tenDoiTuong} 
                        onChange={e => updateLine(line.id, "tenDoiTuong", e.target.value)} 
                        className="w-full h-full min-h-[32px] px-2 outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white bg-transparent" 
                      />
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center">
                      <button onClick={() => removeLine(line.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 bg-slate-50 border-t border-slate-300 flex items-center justify-between rounded-b-lg">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addLine} className="bg-white">
                Thêm dòng
              </Button>
              <Button variant="outline" size="sm" onClick={removeAllLines} className="bg-white text-red-600 hover:text-red-700">
                Xóa hết dòng
              </Button>
            </div>
            <div className="text-sm text-slate-500">
              Tổng số: <span className="font-semibold text-slate-800">{lines.length}</span> bản ghi
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
