"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type StocktakeItem = {
  id: number;
  productId: number;
  productName: string;
  expectedQuantity: number;
  actualQuantity: number;
  note?: string;
};

type StocktakeTableProps = {
  items: StocktakeItem[];
  onUpdateActual: (id: number, actual: number, note?: string) => void;
  readOnly?: boolean;
};

export function StocktakeTable({ items, onUpdateActual, readOnly = false }: StocktakeTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editVal, setEditVal] = useState<number>(0);
  const [editNote, setEditNote] = useState<string>("");

  const startEdit = (item: StocktakeItem) => {
    if (readOnly) return;
    setEditingId(item.id);
    setEditVal(item.actualQuantity);
    setEditNote(item.note || "");
  };

  const saveEdit = (id: number) => {
    onUpdateActual(id, editVal, editNote);
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-border text-slate-500">
          <tr>
            <th className="p-4 font-medium">Mã / Tên sản phẩm</th>
            <th className="p-4 font-medium text-right w-32">Tồn hệ thống</th>
            <th className="p-4 font-medium text-right w-40">Tồn thực tế</th>
            <th className="p-4 font-medium text-right w-32">Chênh lệch</th>
            <th className="p-4 font-medium">Ghi chú</th>
            {!readOnly && <th className="p-4 font-medium w-32 text-center">Thao tác</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => {
            const isEditing = editingId === item.id;
            const diff = isEditing ? editVal - item.expectedQuantity : item.actualQuantity - item.expectedQuantity;
            const diffClass = diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-slate-500";
            
            return (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-text">{item.productName}</div>
                  <div className="text-xs text-slate-500">SP-{item.productId.toString().padStart(4, "0")}</div>
                </td>
                <td className="p-4 text-right text-slate-600 font-medium">{item.expectedQuantity}</td>
                <td className="p-4 text-right">
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="w-full rounded border p-1 text-right text-sm outline-none focus:border-primary"
                      value={editVal}
                      onChange={(e) => setEditVal(Number(e.target.value))}
                      autoFocus
                    />
                  ) : (
                    <span className="font-bold text-text cursor-pointer hover:underline" onClick={() => startEdit(item)}>
                      {item.actualQuantity}
                    </span>
                  )}
                </td>
                <td className={`p-4 text-right font-medium ${diffClass}`}>
                  {diff > 0 ? `+${diff}` : diff}
                </td>
                <td className="p-4 text-slate-500">
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="w-full rounded border p-1 text-sm outline-none focus:border-primary"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="Ghi chú..."
                    />
                  ) : (
                    item.note || "-"
                  )}
                </td>
                {!readOnly && (
                  <td className="p-4 text-center">
                    {isEditing ? (
                      <div className="flex justify-center gap-1">
                        <Button size="sm" onClick={() => saveEdit(item.id)}>Lưu</Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit}>Hủy</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Sửa</Button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={readOnly ? 5 : 6} className="p-8 text-center text-slate-500">Không có sản phẩm nào</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
