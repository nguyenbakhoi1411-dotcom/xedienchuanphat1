import React from 'react';

export function ProcessTab() {
  return (
    <div className="p-8 h-full bg-gray-50 flex justify-center items-start">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl w-full">
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">Nghiệp vụ Bán hàng</h2>
        
        <div className="flex justify-between items-center relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-10 right-10 h-1 bg-blue-200 -z-10 -translate-y-1/2"></div>
          
          <ProcessNode title="Báo giá" icon="📝" />
          <ProcessNode title="Đơn đặt hàng" icon="🛒" />
          <ProcessNode title="Hợp đồng" icon="🤝" />
          <ProcessNode title="Bán hàng" icon="📦" highlight />
          <ProcessNode title="Xuất hóa đơn" icon="🧾" />
          <ProcessNode title="Thu tiền" icon="💰" />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8">
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-700 border-b pb-2 mb-3">Nghiệp vụ khác</h3>
            <ul className="space-y-2 text-sm text-blue-600">
              <li className="hover:underline cursor-pointer">Trả lại hàng bán</li>
              <li className="hover:underline cursor-pointer">Giảm giá hàng bán</li>
              <li className="hover:underline cursor-pointer">Đối trừ công nợ</li>
              <li className="hover:underline cursor-pointer">Lập kế hoạch thu nợ</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-700 border-b pb-2 mb-3">Báo cáo</h3>
            <ul className="space-y-2 text-sm text-blue-600">
              <li className="hover:underline cursor-pointer">Tổng hợp bán hàng</li>
              <li className="hover:underline cursor-pointer">Sổ chi tiết bán hàng</li>
              <li className="hover:underline cursor-pointer">Công nợ phải thu</li>
              <li className="hover:underline cursor-pointer">Phân tích doanh thu</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessNode({ title, icon, highlight = false }: { title: string, icon: string, highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-white">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 transition-all hover:scale-110 cursor-pointer \${highlight ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300'}`}>
        {icon}
      </div>
      <span className={`text-sm font-medium \${highlight ? 'text-blue-600' : 'text-gray-600'}`}>{title}</span>
    </div>
  );
}
