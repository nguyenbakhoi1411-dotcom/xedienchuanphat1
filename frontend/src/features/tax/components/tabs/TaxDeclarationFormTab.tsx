import { FileText, Download, Send, RefreshCw, Printer } from "lucide-react";

export function TaxDeclarationFormTab() {
  return (
    <div className="flex flex-col h-full bg-slate-100/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tờ khai thuế GTGT (Mẫu 01/GTGT)</h2>
          <p className="text-sm text-slate-500">Kỳ tính thuế: Tháng 06/2026 - Lần đầu</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
            <RefreshCw className="w-4 h-4" />
            Lấy lại dữ liệu
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
            <Printer className="w-4 h-4" />
            In tờ khai
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
            <Download className="w-4 h-4" />
            Kết xuất XML
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm shadow-amber-500/20 font-medium text-sm">
            <Send className="w-4 h-4" />
            Nộp tờ khai (TVAN)
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 overflow-auto p-6 flex justify-center">
        <div className="w-full max-w-[900px] bg-white shadow-md border border-slate-300 min-h-[1000px] p-10 font-serif">
          {/* Header Mẫu tờ khai */}
          <div className="flex justify-between items-start mb-6">
            <div className="text-xs">
              <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-bold text-center underline">Độc lập - Tự do - Hạnh phúc</p>
            </div>
            <div className="text-xs border border-black p-2 max-w-[200px] text-center">
              <p>Mẫu số: 01/GTGT</p>
              <p>(Ban hành kèm theo Thông tư số 80/2021/TT-BTC ngày 29/9/2021 của Bộ Tài chính)</p>
            </div>
          </div>

          <h1 className="text-xl font-bold text-center uppercase mb-1">TỜ KHAI THUẾ GIÁ TRỊ GIA TĂNG</h1>
          <p className="text-center text-sm mb-6 italic">(Dành cho người nộp thuế tính thuế theo phương pháp khấu trừ)</p>

          <div className="space-y-4 text-sm">
            <div className="flex gap-4">
              <span className="font-bold">[01] Kỳ tính thuế:</span>
              <span>Tháng 06 năm 2026</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold">[02] Tên người nộp thuế:</span>
              <span className="uppercase">CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ CHUẨN PHÁT</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold">[03] Mã số thuế:</span>
              <span className="tracking-[0.5em] font-medium border border-black px-2 py-1">0123456789</span>
            </div>
          </div>

          <table className="w-full mt-8 border-collapse border border-black text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-black p-2 font-bold w-[70%]">CHỈ TIÊU</th>
                <th className="border border-black p-2 font-bold w-[10%] text-center">Mã số</th>
                <th className="border border-black p-2 font-bold w-[20%] text-center">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50" colSpan={3}>A. Không phát sinh hoạt động mua, bán trong kỳ (đánh dấu "X")</td>
              </tr>
              <tr>
                <td className="border border-black p-2 flex justify-between">
                  <span>Trong kỳ không phát sinh hoạt động mua, bán</span>
                </td>
                <td className="border border-black p-2 text-center">[10]</td>
                <td className="border border-black p-2 text-center"></td>
              </tr>
              
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50" colSpan={3}>B. Thuế GTGT còn được khấu trừ kỳ trước chuyển sang</td>
              </tr>
              <tr>
                <td className="border border-black p-2">Thuế GTGT còn được khấu trừ kỳ trước chuyển sang</td>
                <td className="border border-black p-2 text-center">[22]</td>
                <td className="border border-black p-2 text-right">0</td>
              </tr>

              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50" colSpan={3}>C. Kê khai các hoạt động phát sinh trong kỳ tính thuế</td>
              </tr>
              
              <tr>
                <td className="border border-black p-2 italic font-semibold">I. Hàng hóa, dịch vụ mua vào trong kỳ</td>
                <td className="border border-black p-2 text-center"></td>
                <td className="border border-black p-2 text-right"></td>
              </tr>
              <tr>
                <td className="border border-black p-2 pl-4">1. Giá trị và thuế GTGT của hàng hóa, dịch vụ mua vào</td>
                <td className="border border-black p-2 text-center">[23]</td>
                <td className="border border-black p-2 text-right">281,500,000</td>
              </tr>
              <tr>
                <td className="border border-black p-2 pl-4">2. Thuế GTGT của hàng hóa, dịch vụ mua vào</td>
                <td className="border border-black p-2 text-center">[24]</td>
                <td className="border border-black p-2 text-right">28,150,000</td>
              </tr>
              <tr>
                <td className="border border-black p-2 pl-4">3. Tổng số thuế GTGT được khấu trừ kỳ này</td>
                <td className="border border-black p-2 text-center">[25]</td>
                <td className="border border-black p-2 text-right font-bold">28,150,000</td>
              </tr>

              <tr>
                <td className="border border-black p-2 italic font-semibold">II. Hàng hóa, dịch vụ bán ra trong kỳ</td>
                <td className="border border-black p-2 text-center"></td>
                <td className="border border-black p-2 text-right"></td>
              </tr>
              <tr>
                <td className="border border-black p-2 pl-4">1. Hàng hóa, dịch vụ không chịu thuế GTGT</td>
                <td className="border border-black p-2 text-center">[26]</td>
                <td className="border border-black p-2 text-right">0</td>
              </tr>
              <tr>
                <td className="border border-black p-2 pl-4">2. Hàng hóa, dịch vụ chịu thuế GTGT</td>
                <td className="border border-black p-2 text-center">[27]</td>
                <td className="border border-black p-2 text-right">452,300,000</td>
              </tr>
              <tr>
                <td className="border border-black p-2 pl-8">a) Hàng hóa, dịch vụ chịu thuế suất 0%</td>
                <td className="border border-black p-2 text-center">[29]</td>
                <td className="border border-black p-2 text-right">0</td>
              </tr>
              <tr>
                <td className="border border-black p-2 pl-8">b) Hàng hóa, dịch vụ chịu thuế suất 5%</td>
                <td className="border border-black p-2 text-center">[30]</td>
                <td className="border border-black p-2 text-right">0</td>
              </tr>
              <tr>
                <td className="border border-black p-2 pl-8">c) Hàng hóa, dịch vụ chịu thuế suất 10%</td>
                <td className="border border-black p-2 text-center">[32]</td>
                <td className="border border-black p-2 text-right">452,300,000</td>
              </tr>
              <tr>
                <td className="border border-black p-2 pl-8">Thuế GTGT của HH, DV chịu thuế suất 10%</td>
                <td className="border border-black p-2 text-center">[33]</td>
                <td className="border border-black p-2 text-right">45,230,000</td>
              </tr>
              <tr>
                <td className="border border-black p-2 pl-4 font-bold">Tổng doanh thu của HH, DV bán ra</td>
                <td className="border border-black p-2 text-center">[34]</td>
                <td className="border border-black p-2 text-right font-bold">452,300,000</td>
              </tr>
              <tr>
                <td className="border border-black p-2 pl-4 font-bold">Tổng số thuế GTGT của HH, DV bán ra</td>
                <td className="border border-black p-2 text-center">[35]</td>
                <td className="border border-black p-2 text-right font-bold">45,230,000</td>
              </tr>

              <tr>
                <td className="border border-black p-2 italic font-semibold">III. Thuế GTGT phát sinh trong kỳ</td>
                <td className="border border-black p-2 text-center">[36]</td>
                <td className="border border-black p-2 text-right font-bold">17,080,000</td>
              </tr>
              
              <tr>
                <td className="border border-black p-2 font-bold bg-amber-50">Thuế GTGT phải nộp trong kỳ</td>
                <td className="border border-black p-2 text-center bg-amber-50">[40]</td>
                <td className="border border-black p-2 text-right font-bold text-red-600 bg-amber-50">17,080,000</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold bg-slate-50">Thuế GTGT còn được khấu trừ chuyển kỳ sau</td>
                <td className="border border-black p-2 text-center bg-slate-50">[43]</td>
                <td className="border border-black p-2 text-right font-bold bg-slate-50">0</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-12 flex justify-end pr-20">
            <div className="text-center">
              <p className="mb-2 italic text-sm">Ngày 30 tháng 06 năm 2026</p>
              <p className="font-bold mb-20">NGƯỜI NỘP THUẾ hoặc<br/>ĐẠI DIỆN HỢP PHÁP CỦA NGƯỜI NỘP THUẾ</p>
              <p className="font-bold">Lê Văn A</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
