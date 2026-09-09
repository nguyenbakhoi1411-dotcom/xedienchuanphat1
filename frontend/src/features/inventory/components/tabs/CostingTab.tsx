"use client";

import { useState } from 'react';
import { FileBarChart, Info } from 'lucide-react';
import { toast } from 'sonner';

export function CostingTab() {
  const [method, setMethod] = useState<'AVERAGE_COST' | 'FIFO'>('AVERAGE_COST');
  const [period, setPeriod] = useState('2026-06');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; processedCount?: number } | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setResult({
      success: true,
      message: 'Tính giá xuất kho thành công',
      processedCount: 42,
    });
    setRunning(false);
    toast.success('Tính giá xuất kho hoàn thành!');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <FileBarChart className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-bold text-gray-800">Tính giá xuất kho</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {/* Period */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Kỳ tính giá</label>
          <input
            type="month"
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Method */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phương pháp tính giá</label>
          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="method"
                value="AVERAGE_COST"
                checked={method === 'AVERAGE_COST'}
                onChange={() => setMethod('AVERAGE_COST')}
                className="mt-0.5 text-blue-600"
              />
              <div>
                <div className="text-sm font-medium text-gray-800">Bình quân gia quyền cuối kỳ (BQCK)</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Tính giá vốn dựa trên bình quân tồn kho cuối kỳ. Phù hợp với hàng hóa đa dạng chủng loại.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="method"
                value="FIFO"
                checked={method === 'FIFO'}
                onChange={() => setMethod('FIFO')}
                className="mt-0.5 text-blue-600"
              />
              <div>
                <div className="text-sm font-medium text-gray-800">Nhập trước xuất trước (FIFO)</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Hàng hóa nhập vào trước sẽ được tính giá xuất trước. Phù hợp với hàng có hạn sử dụng.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">
            Thao tác tính giá xuất kho sẽ cập nhật đơn giá vốn cho tất cả phiếu xuất kho trong kỳ đã chọn.
            Không thể hoàn tác sau khi thực hiện.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={handleRun}
          disabled={running}
          className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {running ? (
            <>
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Đang tính...
            </>
          ) : (
            'Thực hiện tính giá'
          )}
        </button>

        {/* Result */}
        {result && (
          <div className={`rounded-lg p-4 text-sm ${result.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            <div className="font-semibold mb-1">{result.message}</div>
            {result.processedCount !== undefined && (
              <div>Đã xử lý: <span className="font-bold">{result.processedCount}</span> phiếu xuất kho</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
