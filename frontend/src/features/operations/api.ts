import { api } from "@/lib/api/axios";
import type { AuditLog, BackupResponse, DataIoType, ErrorLog, ErrorSeverity, ImportResult, PageResponse, SystemHealth, SystemInfo, UploadedFileResponse } from "./types";

export const operationsApi = {
  async health(): Promise<SystemHealth> {
    const response = await api.get<SystemHealth>("/api/system/health");
    return response.data;
  },

  async info(): Promise<SystemInfo> {
    const response = await api.get<SystemInfo>("/api/system/info");
    return response.data;
  },

  async backup(): Promise<BackupResponse> {
    const response = await api.post<BackupResponse>("/api/system/backup");
    return response.data;
  },

  async restore(fileName: string, confirmation: string): Promise<BackupResponse> {
    const response = await api.patch<BackupResponse>("/api/system/restore", { fileName, confirmation });
    return response.data;
  },

  async errorLogs(params: { severity?: ErrorSeverity | "ALL"; module?: string; page: number; pageSize: number }): Promise<PageResponse<ErrorLog>> {
    const response = await api.get<PageResponse<ErrorLog>>("/api/system/error-logs", {
      params: {
        severity: params.severity === "ALL" ? undefined : params.severity,
        module: params.module || undefined,
        page: Math.max(params.page - 1, 0),
        pageSize: params.pageSize
      }
    });
    return { ...response.data, page: response.data.page + 1 };
  },

  async auditLogs(params: { module?: string; page: number; pageSize: number }): Promise<PageResponse<AuditLog>> {
    const response = await api.get<PageResponse<AuditLog>>("/api/audit-logs", {
      params: { module: params.module || undefined, page: Math.max(params.page - 1, 0), pageSize: params.pageSize }
    });
    return { ...response.data, page: response.data.page + 1 };
  },

  async exportAuditCsv(params: { module?: string }): Promise<void> {
    const response = await api.get<Blob>("/api/audit-logs/export", {
      params: { module: params.module || undefined },
      responseType: "blob"
    });
    downloadBlob(response.data, response.headers["content-disposition"], "audit-log.csv");
  },

  async downloadTemplate(params: { dataType: DataIoType; format: "xlsx" | "csv" }): Promise<void> {
    const response = await api.get<Blob>("/api/data-io/templates", {
      params,
      responseType: "blob"
    });
    downloadBlob(response.data, response.headers["content-disposition"], `template-${params.dataType}.${params.format}`);
  },

  async importData(params: { dataType: DataIoType; file: File; dryRun: boolean }): Promise<ImportResult> {
    const formData = new FormData();
    formData.append("dataType", params.dataType);
    formData.append("file", params.file);
    formData.append("dryRun", String(params.dryRun));
    const response = await api.post<ImportResult>("/api/data-io/imports", formData);
    return response.data;
  },

  async downloadImportErrors(params: { dataType: DataIoType; file: File }): Promise<void> {
    const formData = new FormData();
    formData.append("dataType", params.dataType);
    formData.append("file", params.file);
    const response = await api.post<Blob>("/api/data-io/imports/error-file", formData, { responseType: "blob" });
    downloadBlob(response.data, response.headers["content-disposition"], `import-errors-${params.dataType}.xlsx`);
  },

  async exportData(params: { dataType: DataIoType; branchId?: string; keyword?: string }): Promise<void> {
    const response = await api.get<Blob>("/api/data-io/exports", {
      params: { dataType: params.dataType, branchId: params.branchId || undefined, keyword: params.keyword || undefined },
      responseType: "blob"
    });
    downloadBlob(response.data, response.headers["content-disposition"], `export-${params.dataType}.xlsx`);
  },

  async uploadFile(params: { file: File; purpose: string }): Promise<UploadedFileResponse> {
    const formData = new FormData();
    formData.append("file", params.file);
    formData.append("purpose", params.purpose);
    const response = await api.post<UploadedFileResponse>("/api/data-io/files", formData);
    return response.data;
  }
};

function downloadBlob(blob: Blob, disposition: string | undefined, fallback: string) {
  const fileName = disposition?.match(/filename="?([^"]+)"?/)?.[1] ?? fallback;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
