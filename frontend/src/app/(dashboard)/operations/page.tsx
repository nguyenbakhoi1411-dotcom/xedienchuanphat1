"use client";

import { AlertTriangle, CheckCircle2, DatabaseBackup, Download, FileSpreadsheet, HardDrive, RotateCcw, ShieldAlert, Upload } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useAuditLogs,
  useBackupDatabase,
  useDownloadDataTemplate,
  useDownloadImportErrors,
  useErrorLogs,
  useExportAuditCsv,
  useExportData,
  useImportData,
  useRestoreDatabase,
  useSystemHealth,
  useSystemInfo,
  useUploadFile
} from "@/features/operations/hooks";
import type { AuditLog, DataIoType, ErrorLog, ErrorSeverity } from "@/features/operations/types";

export default function OperationsPage() {
  const [errorSeverity, setErrorSeverity] = useState<ErrorSeverity | "ALL">("ALL");
  const [errorModule, setErrorModule] = useState("");
  const [auditModule, setAuditModule] = useState("");
  const [restoreFile, setRestoreFile] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [importType, setImportType] = useState<DataIoType>("SERIALS");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportType, setExportType] = useState<DataIoType>("CUSTOMERS");
  const [exportBranch, setExportBranch] = useState("");
  const [exportKeyword, setExportKeyword] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPurpose, setUploadPurpose] = useState("DOCUMENT");
  const errorParams = useMemo(() => ({ severity: errorSeverity, module: errorModule, page: 1, pageSize: 10 }), [errorModule, errorSeverity]);
  const auditParams = useMemo(() => ({ module: auditModule, page: 1, pageSize: 10 }), [auditModule]);
  const health = useSystemHealth();
  const info = useSystemInfo();
  const errors = useErrorLogs(errorParams);
  const auditLogs = useAuditLogs(auditParams);
  const backup = useBackupDatabase();
  const restore = useRestoreDatabase();
  const exportAudit = useExportAuditCsv();
  const downloadTemplate = useDownloadDataTemplate();
  const importData = useImportData();
  const downloadImportErrors = useDownloadImportErrors();
  const exportData = useExportData();
  const uploadFileMutation = useUploadFile();

  function restoreSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    restore.mutate({ fileName: restoreFile, confirmation });
  }

  function importSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runImport(true);
  }

  function runImport(dryRun: boolean) {
    if (!importFile) return;
    importData.mutate({ dataType: importType, file: importFile, dryRun });
  }

  function exportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    exportData.mutate({ dataType: exportType, branchId: exportBranch, keyword: exportKeyword });
  }

  function uploadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!uploadFile) return;
    uploadFileMutation.mutate({ file: uploadFile, purpose: uploadPurpose });
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">System operations</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-text">Van hanh he thong</h1>
          <p className="mt-1 text-sm text-slate-500">Theo doi health, backup database, error log va audit log nang cao.</p>
        </div>
        <Button variant="secondary" onClick={() => { void health.refetch(); void info.refetch(); }}>
          <RotateCcw className="h-4 w-4" />
          Lam moi
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard title="Backend" value={health.data?.backendStatus ?? "..."} good={health.data?.backendStatus === "UP"} loading={health.isLoading} />
        <StatusCard title="Database" value={health.data?.databaseStatus ?? "..."} good={health.data?.databaseStatus === "UP"} loading={health.isLoading} />
        <article className="rounded-lg border border-border bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-primary"><HardDrive className="h-5 w-5" /></span>
            <div>
              <p className="text-xs text-slate-500">Disk usage</p>
              {health.isLoading ? <Skeleton className="mt-2 h-6 w-24" /> : <p className="text-xl font-semibold text-text">{health.data?.diskUsage.usedPercent ?? 0}%</p>}
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Usable {formatBytes(health.data?.diskUsage.usableBytes ?? 0)}</p>
        </article>
        <article className="rounded-lg border border-border bg-white p-4 shadow-soft">
          <p className="text-xs text-slate-500">Version</p>
          {info.isLoading ? <Skeleton className="mt-2 h-6 w-28" /> : <p className="mt-2 text-xl font-semibold text-text">{info.data?.appVersion}</p>}
          <p className="mt-2 text-xs text-slate-500">Profile: {info.data?.activeProfiles.join(", ") || "default"}</p>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <article className="rounded-lg border border-border bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-text">Backup database</h2>
                <p className="mt-1 text-xs text-slate-500">Tao file dump PostgreSQL theo ngay trong thu muc cau hinh.</p>
              </div>
              <DatabaseBackup className="h-5 w-5 text-primary" />
            </div>
            <Button className="mt-4 w-full" disabled={backup.isPending} onClick={() => backup.mutate()}>
              <DatabaseBackup className="h-4 w-4" />
              {backup.isPending ? "Dang backup..." : "Backup ngay"}
            </Button>
            {backup.data ? (
              <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
                {backup.data.fileName} - {formatBytes(backup.data.sizeBytes)}
              </div>
            ) : null}
          </article>

          <form onSubmit={restoreSubmit} className="rounded-lg border border-red-200 bg-white p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600"><ShieldAlert className="h-5 w-5" /></span>
              <div>
                <h2 className="text-sm font-semibold text-red-700">Restore database</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">Nguy hiem: restore se ghi de du lieu. Chi admin co quyen thuc hien.</p>
              </div>
            </div>
            <label className="mt-4 block text-sm font-medium text-text">
              Ten file backup
              <input value={restoreFile} onChange={(event) => setRestoreFile(event.target.value)} placeholder="chuanphat-20260608-071500.dump" className={inputClass} />
            </label>
            <label className="mt-3 block text-sm font-medium text-text">
              Xac nhan
              <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="RESTORE DATABASE" className={inputClass} />
            </label>
            <Button className="mt-4 w-full" variant="danger" type="submit" disabled={restore.isPending || confirmation !== "RESTORE DATABASE" || !restoreFile}>
              <AlertTriangle className="h-4 w-4" />
              {restore.isPending ? "Dang restore..." : "Restore"}
            </Button>
          </form>
        </div>

        <article className="rounded-lg border border-border bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text">Error log</h2>
              <p className="text-xs text-slate-500">Loc theo severity va module.</p>
            </div>
            <div className="flex gap-2">
              <select value={errorSeverity} onChange={(event) => setErrorSeverity(event.target.value as ErrorSeverity | "ALL")} className={selectClass}>
                <option value="ALL">Tat ca</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <input value={errorModule} onChange={(event) => setErrorModule(event.target.value)} placeholder="Module" className={inputClassSmall} />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {errors.isLoading ? [1, 2, 3].map((item) => <Skeleton key={item} className="h-20" />) : errors.data?.items.length ? errors.data.items.map((item) => <ErrorRow key={item.id} item={item} />) : <EmptyState title="Chua co error log" />}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <form onSubmit={importSubmit} className="rounded-lg border border-border bg-white p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-text">Import Excel/CSV</h2>
              <p className="mt-1 text-xs text-slate-500">Validate truoc khi ghi du lieu, co file loi theo dong.</p>
            </div>
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </div>
          <label className="mt-4 block text-sm font-medium text-text">
            Loai du lieu
            <select value={importType} onChange={(event) => setImportType(event.target.value as DataIoType)} className={selectWideClass}>
              {importOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-sm font-medium text-text">
            File import
            <input type="file" accept=".xlsx,.csv" onChange={(event) => setImportFile(event.target.files?.[0] ?? null)} className={inputClass} />
          </label>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button type="button" variant="secondary" disabled={downloadTemplate.isPending} onClick={() => downloadTemplate.mutate({ dataType: importType, format: "xlsx" })}>
              <Download className="h-4 w-4" />
              File mau
            </Button>
            <Button type="submit" variant="secondary" disabled={!importFile || importData.isPending}>
              Kiem tra
            </Button>
            <Button type="button" disabled={!importFile || importData.isPending} onClick={() => runImport(false)}>
              Import
            </Button>
            <Button type="button" variant="secondary" disabled={!importFile || downloadImportErrors.isPending} onClick={() => importFile && downloadImportErrors.mutate({ dataType: importType, file: importFile })}>
              Loi XLSX
            </Button>
          </div>
          {importData.data ? (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p>{importData.data.totalRows} dong, hop le {importData.data.validRows}, da import {importData.data.importedRows}</p>
              {importData.data.errors.slice(0, 4).map((error) => (
                <p key={`${error.rowNumber}-${error.field}`} className="mt-1 text-red-600">Dong {error.rowNumber} - {error.field}: {error.message}</p>
              ))}
            </div>
          ) : null}
        </form>

        <form onSubmit={exportSubmit} className="rounded-lg border border-border bg-white p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-text">Export du lieu</h2>
              <p className="mt-1 text-xs text-slate-500">Export theo filter va quyen chi nhanh hien tai.</p>
            </div>
            <Download className="h-5 w-5 text-primary" />
          </div>
          <label className="mt-4 block text-sm font-medium text-text">
            Loai export
            <select value={exportType} onChange={(event) => setExportType(event.target.value as DataIoType)} className={selectWideClass}>
              {exportOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-text">
              Chi nhanh
              <input value={exportBranch} onChange={(event) => setExportBranch(event.target.value)} placeholder="ID" className={inputClass} />
            </label>
            <label className="block text-sm font-medium text-text">
              Tu khoa
              <input value={exportKeyword} onChange={(event) => setExportKeyword(event.target.value)} placeholder="Ten, ma, SDT" className={inputClass} />
            </label>
          </div>
          <Button className="mt-4 w-full" disabled={exportData.isPending} type="submit">
            <Download className="h-4 w-4" />
            Export XLSX
          </Button>
        </form>

        <form onSubmit={uploadSubmit} className="rounded-lg border border-border bg-white p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-text">File upload</h2>
              <p className="mt-1 text-xs text-slate-500">Anh san pham, anh bao hanh, chung tu, hop dong tra gop.</p>
            </div>
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <label className="mt-4 block text-sm font-medium text-text">
            Muc dich
            <select value={uploadPurpose} onChange={(event) => setUploadPurpose(event.target.value)} className={selectWideClass}>
              <option value="PRODUCT_IMAGE">Anh san pham</option>
              <option value="WARRANTY_IMAGE">Anh bao hanh</option>
              <option value="DOCUMENT">Chung tu</option>
              <option value="INSTALLMENT_CONTRACT">Hop dong tra gop</option>
            </select>
          </label>
          <label className="mt-3 block text-sm font-medium text-text">
            File
            <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,.xlsx,.csv" onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} className={inputClass} />
          </label>
          <p className="mt-2 text-xs text-slate-500">Gioi han 10MB. Chan file thuc thi/script nguy hiem.</p>
          <Button className="mt-4 w-full" disabled={!uploadFile || uploadFileMutation.isPending} type="submit">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </form>
      </section>

      <article className="rounded-lg border border-border bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text">Audit log nang cao</h2>
            <p className="text-xs text-slate-500">Xem oldValue/newValue ro rang va export CSV.</p>
          </div>
          <div className="flex gap-2">
            <input value={auditModule} onChange={(event) => setAuditModule(event.target.value)} placeholder="Module" className={inputClassSmall} />
            <Button variant="secondary" disabled={exportAudit.isPending} onClick={() => exportAudit.mutate({ module: auditModule })}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          {auditLogs.isLoading ? <Skeleton className="h-40" /> : auditLogs.data?.items.length ? <AuditTable items={auditLogs.data.items} /> : <EmptyState title="Chua co audit log" />}
        </div>
      </article>
    </div>
  );
}

function StatusCard({ title, value, good, loading }: { title: string; value: string; good: boolean; loading: boolean }) {
  return (
    <article className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${good ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs text-slate-500">{title}</p>
          {loading ? <Skeleton className="mt-2 h-6 w-20" /> : <p className="text-xl font-semibold text-text">{value}</p>}
        </div>
      </div>
    </article>
  );
}

function ErrorRow({ item }: { item: ErrorLog }) {
  return (
    <div className="rounded-lg border border-border bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={item.severity === "CRITICAL" ? "red" : item.severity === "ERROR" ? "amber" : "blue"}>{item.severity}</Badge>
        <Badge tone="slate">{item.module}</Badge>
        <span className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-text">{item.errorType}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{item.message}</p>
      {item.path ? <p className="mt-2 text-xs text-slate-400">{item.path}</p> : null}
    </div>
  );
}

function AuditTable({ items }: { items: AuditLog[] }) {
  return (
    <table className="min-w-full divide-y divide-border text-sm">
      <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
        <tr>
          <th className="px-3 py-2">Thoi gian</th>
          <th className="px-3 py-2">User</th>
          <th className="px-3 py-2">Action</th>
          <th className="px-3 py-2">Entity</th>
          <th className="px-3 py-2">Old</th>
          <th className="px-3 py-2">New</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {items.map((item) => (
          <tr key={item.id}>
            <td className="px-3 py-3 text-slate-500">{formatDateTime(item.createdAt)}</td>
            <td className="px-3 py-3">{item.userId}</td>
            <td className="px-3 py-3"><Badge tone="orange">{item.action}</Badge></td>
            <td className="px-3 py-3">{item.entityType} #{item.entityId}</td>
            <td className="max-w-xs px-3 py-3"><pre className="whitespace-pre-wrap rounded bg-slate-50 p-2 text-xs text-slate-600">{item.oldValue || "-"}</pre></td>
            <td className="max-w-xs px-3 py-3"><pre className="whitespace-pre-wrap rounded bg-orange-50 p-2 text-xs text-slate-700">{item.newValue || "-"}</pre></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatBytes(value: number) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

const importOptions: Array<{ value: DataIoType; label: string }> = [
  { value: "CUSTOMERS", label: "Khach hang" },
  { value: "PRODUCTS", label: "San pham" },
  { value: "SERIALS", label: "Serial xe" },
  { value: "INITIAL_INVENTORY", label: "Ton kho ban dau" },
  { value: "SUPPLIERS", label: "Nha cung cap" },
  { value: "CHART_OF_ACCOUNTS", label: "Danh muc tai khoan" },
  { value: "EMPLOYEES", label: "Nhan vien" }
];

const exportOptions: Array<{ value: DataIoType; label: string }> = [
  { value: "CUSTOMERS", label: "Khach hang" },
  { value: "PRODUCTS", label: "San pham" },
  { value: "INVENTORY", label: "Ton kho" },
  { value: "SERIALS", label: "Serial" },
  { value: "ORDERS", label: "Don hang" },
  { value: "DEBT", label: "Cong no" },
  { value: "SUPPLIERS", label: "Nha cung cap" }
];

const inputClass = "mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
const inputClassSmall = "h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
const selectWideClass = "mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
const selectClass = "h-10 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-orange-100";
