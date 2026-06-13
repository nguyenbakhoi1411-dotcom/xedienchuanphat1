"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useExportReport } from "./hooks";
import type { ExportFormat, ReportFilters, ReportType } from "./types";

type ReportExportButtonsProps = {
  reportType: ReportType;
  filters: ReportFilters;
  disabled?: boolean;
};

export function ReportExportButtons({ reportType, filters, disabled }: ReportExportButtonsProps) {
  const exportMutation = useExportReport();
  const isPending = exportMutation.isPending;

  const handleExport = (format: ExportFormat) => {
    exportMutation.mutate(
      { type: reportType, format, filters },
      {
        onSuccess: ({ blob, fileName }) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          toast.success(`Da tai ${fileName}`);
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
        }
      }
    );
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button variant="secondary" disabled={disabled || isPending} onClick={() => handleExport("excel")}>
        <FileSpreadsheet className="h-4 w-4" />
        {isPending ? "Dang export" : "Export Excel"}
      </Button>
      <Button variant="secondary" disabled={disabled || isPending} onClick={() => handleExport("pdf")}>
        <FileText className="h-4 w-4" />
        {isPending ? "Dang export" : "Export PDF"}
      </Button>
    </div>
  );
}
