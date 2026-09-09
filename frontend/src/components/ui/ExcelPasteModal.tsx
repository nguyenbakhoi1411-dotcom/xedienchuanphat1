"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "./Modal";
import { ClipboardPaste, AlertCircle } from "lucide-react";

type ExcelPasteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPasteData: (rows: string[][]) => void;
  expectedColumns?: string[]; // Gợi ý tên các cột
};

export function ExcelPasteModal({
  isOpen,
  onClose,
  onPasteData,
  expectedColumns = [],
}: ExcelPasteModalProps) {
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      // Focus textarea immediately when opened so user can just Ctrl+V
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData.getData("Text");

    if (!clipboardData) {
      setError("Không tìm thấy dữ liệu trong bộ nhớ tạm.");
      return;
    }

    try {
      // Parse TSV (Tab-Separated Values)
      const rows = clipboardData
        .split(/\r?\n/)
        .filter((row) => row.trim() !== "")
        .map((row) => row.split("\t"));

      if (rows.length === 0) {
        setError("Dữ liệu trống.");
        return;
      }

      onPasteData(rows);
      onClose();
    } catch (err) {
      setError("Lỗi khi xử lý dữ liệu. Vui lòng thử lại.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dán dữ liệu từ Excel"
      size="md"
    >
      <div className="space-y-4">
        {expectedColumns.length > 0 && (
          <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-800">
            <p className="font-semibold mb-1">Thứ tự cột khuyến nghị trong Excel:</p>
            <div className="flex flex-wrap gap-2">
              {expectedColumns.map((col, idx) => (
                <span key={idx} className="bg-white px-2 py-0.5 rounded border border-orange-200 text-xs">
                  {col}
                </span>
              ))}
            </div>
            <p className="text-xs mt-2 opacity-80">
              * Bạn có thể copy cả tiêu đề cột hoặc chỉ dữ liệu. Hệ thống sẽ tự động thêm vào dòng trắng.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nhấn <kbd className="bg-slate-100 border border-slate-300 rounded px-1 font-mono text-xs">Ctrl</kbd> + <kbd className="bg-slate-100 border border-slate-300 rounded px-1 font-mono text-xs">V</kbd> vào ô bên dưới:
          </label>
          <textarea
            ref={textareaRef}
            onPaste={handlePaste}
            className="w-full h-32 rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors resize-none"
            placeholder="Dán dữ liệu Excel của bạn vào đây..."
            readOnly
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </Modal>
  );
}
