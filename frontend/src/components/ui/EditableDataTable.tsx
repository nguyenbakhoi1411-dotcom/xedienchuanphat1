import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  type: 'text' | 'number' | 'select';
  options?: { label: string; value: string | number }[]; // for select
  width?: string;
  readOnly?: boolean;
}

interface EditableDataTableProps<T> {
  columns: Column<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  defaultRow: T;
}

export function EditableDataTable<T extends Record<string, any>>({
  columns,
  value,
  onChange,
  defaultRow,
}: EditableDataTableProps<T>) {
  const tableRef = useRef<HTMLTableElement>(null);

  const updateRow = (index: number, key: string, val: any) => {
    const newData = [...value];
    newData[index] = { ...newData[index], [key]: val };
    onChange(newData);
  };

  const addRow = () => {
    onChange([...value, { ...defaultRow }]);
  };

  const removeRow = (index: number) => {
    const newData = value.filter((_, i) => i !== index);
    onChange(newData);
  };

  // Handle Paste from Excel
  const handlePaste = (e: React.ClipboardEvent<HTMLTableElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData('Text');
    if (!clipboardData) return;

    // Parse Excel data (tab-separated)
    const rows = clipboardData
      .split('\n')
      .map((row) => row.trim())
      .filter((row) => row !== '');

    if (rows.length === 0) return;

    // Find the active cell where paste happened
    const target = e.target as HTMLElement;
    const cell = target.closest('td');
    const row = target.closest('tr');
    
    if (!cell || !row) return;

    const startRowIdx = Array.from(row.parentNode?.children || []).indexOf(row);
    const startColIdx = Array.from(row.children).indexOf(cell);

    const newData = [...value];

    rows.forEach((rowData, i) => {
      const targetRowIdx = startRowIdx + i;
      const columnsData = rowData.split('\t');

      // Ensure row exists
      if (!newData[targetRowIdx]) {
        newData[targetRowIdx] = { ...defaultRow };
      }

      columnsData.forEach((cellData, j) => {
        const targetColIdx = startColIdx + j;
        const colDef = columns[targetColIdx - 1]; // -1 because of Action column (or depends on layout)
        
        // Actually, we should map correctly. 
        // Assuming Action column is last. 
        if (colDef && !colDef.readOnly) {
           let parsedVal: any = cellData.trim();
           if (colDef.type === 'number') {
               parsedVal = Number(parsedVal.replace(/,/g, ''));
               if (isNaN(parsedVal)) parsedVal = 0;
           }
           newData[targetRowIdx] = { ...newData[targetRowIdx], [colDef.key as string]: parsedVal };
        }
      });
    });

    onChange(newData);
  };

  // Ensure at least one row
  useEffect(() => {
    if (value.length === 0) {
      onChange([{ ...defaultRow }]);
    }
  }, [value, defaultRow, onChange]);

  return (
    <div className="w-full overflow-x-auto rounded-md border border-gray-200 shadow-sm">
      <table 
        ref={tableRef}
        className="min-w-full divide-y divide-gray-200 text-sm"
        onPaste={handlePaste}
      >
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-500 w-10">#</th>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className="px-3 py-2 text-left font-medium text-gray-500"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
            <th className="px-3 py-2 text-center font-medium text-gray-500 w-12">
              <Plus 
                className="w-4 h-4 cursor-pointer text-blue-600 mx-auto hover:bg-blue-50 rounded" 
                onClick={addRow}
              />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {value.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-gray-50 group">
              <td className="px-3 py-1 text-gray-500 text-center">{rowIdx + 1}</td>
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-1 py-1">
                  {col.type === 'select' ? (
                    <select
                      value={row[col.key as string] || ''}
                      onChange={(e) => updateRow(rowIdx, col.key as string, e.target.value)}
                      disabled={col.readOnly}
                      className="w-full px-2 py-1 text-sm border-transparent bg-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded transition-all"
                    >
                      <option value="">--</option>
                      {col.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={col.type === 'number' ? 'text' : 'text'}
                      value={row[col.key as string] ?? ''}
                      onChange={(e) => {
                        let val: any = e.target.value;
                        if (col.type === 'number') {
                          // Allow typing numbers, we can format on blur later if needed
                          val = val.replace(/[^0-9.-]/g, '');
                        }
                        updateRow(rowIdx, col.key as string, val);
                      }}
                      onBlur={(e) => {
                          if (col.type === 'number') {
                              const num = parseFloat(e.target.value || '0');
                              updateRow(rowIdx, col.key as string, isNaN(num) ? 0 : num);
                          }
                      }}
                      readOnly={col.readOnly}
                      placeholder={col.header}
                      className="w-full px-2 py-1 text-sm border-transparent bg-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded transition-all"
                    />
                  )}
                </td>
              ))}
              <td className="px-3 py-1 text-center">
                <Trash2
                  className="w-4 h-4 text-gray-400 hover:text-red-600 cursor-pointer mx-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeRow(rowIdx)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
