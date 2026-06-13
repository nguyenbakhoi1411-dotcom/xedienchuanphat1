import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { operationsApi } from "./api";
import type { DataIoType, ErrorSeverity } from "./types";

export function useSystemHealth() {
  return useQuery({ queryKey: ["operations", "health"], queryFn: operationsApi.health, refetchInterval: 30_000 });
}

export function useSystemInfo() {
  return useQuery({ queryKey: ["operations", "info"], queryFn: operationsApi.info });
}

export function useBackupDatabase() {
  return useMutation({
    mutationFn: operationsApi.backup,
    onSuccess: (result) => toast.success(`Backup thanh cong: ${result.fileName}`),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the backup database")
  });
}

export function useRestoreDatabase() {
  return useMutation({
    mutationFn: ({ fileName, confirmation }: { fileName: string; confirmation: string }) => operationsApi.restore(fileName, confirmation),
    onSuccess: () => toast.success("Da gui lenh restore database"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the restore database")
  });
}

export function useErrorLogs(params: { severity?: ErrorSeverity | "ALL"; module?: string; page: number; pageSize: number }) {
  return useQuery({ queryKey: ["operations", "error-logs", params], queryFn: () => operationsApi.errorLogs(params) });
}

export function useAuditLogs(params: { module?: string; page: number; pageSize: number }) {
  return useQuery({ queryKey: ["operations", "audit-logs", params], queryFn: () => operationsApi.auditLogs(params) });
}

export function useExportAuditCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: operationsApi.exportAuditCsv,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["operations", "audit-logs"] });
      toast.success("Da tai audit log");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the export audit log")
  });
}

export function useDownloadDataTemplate() {
  return useMutation({
    mutationFn: (params: { dataType: DataIoType; format: "xlsx" | "csv" }) => operationsApi.downloadTemplate(params),
    onSuccess: () => toast.success("Da tai file mau"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the tai file mau")
  });
}

export function useImportData() {
  return useMutation({
    mutationFn: operationsApi.importData,
    onSuccess: (result) => {
      toast[result.hasCriticalErrors ? "error" : "success"](
        result.hasCriticalErrors ? `Import co ${result.errors.length} loi can sua` : `Da import ${result.importedRows || result.validRows} dong`
      );
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the import du lieu")
  });
}

export function useDownloadImportErrors() {
  return useMutation({
    mutationFn: operationsApi.downloadImportErrors,
    onSuccess: () => toast.success("Da tai file loi import"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the tai file loi")
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: operationsApi.exportData,
    onSuccess: () => toast.success("Da export du lieu"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the export du lieu")
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: operationsApi.uploadFile,
    onSuccess: (result) => toast.success(`Da upload file: ${result.storedFileName}`),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Khong the upload file")
  });
}
