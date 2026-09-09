import React, { useState } from 'react';

interface MasterDetailTableProps {
  masterColumns: any[];
  masterData: any[];
  masterTotal?: any;
  onRowClick: (row: any) => void;
  detailColumns: any[];
  detailData: any[];
  detailTotal?: any;
  detailTitle?: string;
  selectedRowId?: any;
}

export function MasterDetailTable({
  masterColumns,
  masterData,
  masterTotal,
  onRowClick,
  detailColumns,
  detailData,
  detailTotal,
  detailTitle = "Chi tiết",
  selectedRowId
}: MasterDetailTableProps) {
  const [showDetail, setShowDetail] = useState(true);

  return (
    <div className="flex flex-col h-full w-full bg-white border overflow-hidden">
      {/* Master Table */}
      <div className={`overflow-auto \${showDetail && selectedRowId ? 'h-[50%]' : 'h-full'} border-b relative`}>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="p-2 border-b w-10 text-center"><input type="checkbox" /></th>
              {masterColumns.map((col, idx) => (
                <th key={idx} className="p-2 border-b">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {masterData.map((row, idx) => (
              <tr 
                key={idx} 
                className={`hover:bg-blue-50 cursor-pointer border-b \${selectedRowId === row.id ? 'bg-blue-100' : ''}`}
                onClick={() => onRowClick(row)}
              >
                <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                {masterColumns.map((col, cIdx) => (
                  <td key={cIdx} className="p-2">{row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
          {masterTotal && (
            <tfoot className="bg-gray-50 sticky bottom-0 font-semibold border-t">
              <tr>
                <td className="p-2 text-center"></td>
                {masterColumns.map((col, idx) => (
                  <td key={idx} className="p-2 text-blue-600">{masterTotal[col.key] || ''}</td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Resizer */}
      {selectedRowId && (
        <div className="h-1 bg-gray-200 cursor-row-resize hover:bg-blue-400" />
      )}

      {/* Detail Table */}
      {selectedRowId && showDetail && (
        <div className="h-[50%] flex flex-col bg-gray-50">
          <div className="flex justify-between items-center bg-gray-100 p-2 border-b">
            <h3 className="font-semibold text-sm">{detailTitle}</h3>
            <button onClick={() => setShowDetail(false)} className="text-gray-500 hover:text-black">
              ▼ 
            </button>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-left bg-white">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 border-b w-10 text-center">#</th>
                  {detailColumns.map((col, idx) => (
                    <th key={idx} className="p-2 border-b">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detailData.map((row, idx) => (
                  <tr key={idx} className={`border-b \${row.isDepositRow ? 'text-red-600' : ''}`}>
                    <td className="p-2 text-center">{idx + 1}</td>
                    {detailColumns.map((col, cIdx) => (
                      <td key={cIdx} className="p-2">{row[col.key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {detailTotal && (
                <tfoot className="bg-gray-50 sticky bottom-0 font-semibold border-t">
                  <tr>
                    <td className="p-2 text-center"></td>
                    {detailColumns.map((col, idx) => (
                      <td key={idx} className="p-2">{detailTotal[col.key] || ''}</td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
      
      {selectedRowId && !showDetail && (
         <div className="flex justify-between items-center bg-gray-100 p-2 border-t cursor-pointer hover:bg-gray-200" onClick={() => setShowDetail(true)}>
            <h3 className="font-semibold text-sm">{detailTitle}</h3>
            <span className="text-gray-500">▲</span>
         </div>
      )}
    </div>
  );
}
