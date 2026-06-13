export type DiskUsage = {
  totalBytes: number;
  freeBytes: number;
  usableBytes: number;
  usedPercent: number;
};

export type SystemHealth = {
  backendStatus: string;
  databaseStatus: string;
  diskUsage: DiskUsage;
  checkedAt: string;
};

export type SystemInfo = {
  appVersion: string;
  buildTime: string;
  activeProfiles: string[];
  javaVersion: string;
  osName: string;
};

export type BackupResponse = {
  fileName: string;
  path: string;
  sizeBytes: number;
  createdAt: string;
  status: string;
  message: string;
};

export type ErrorSeverity = "WARNING" | "ERROR" | "CRITICAL";

export type ErrorLog = {
  id: number;
  severity: ErrorSeverity;
  module: string;
  errorType: string;
  message: string;
  path?: string;
  username?: string;
  stackTrace?: string;
  createdAt: string;
};

export type AuditLog = {
  id: number;
  userId: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type DataIoType =
  | "CUSTOMERS"
  | "PRODUCTS"
  | "SERIALS"
  | "INITIAL_INVENTORY"
  | "SUPPLIERS"
  | "CHART_OF_ACCOUNTS"
  | "EMPLOYEES"
  | "INVENTORY"
  | "ORDERS"
  | "DEBT";

export type ImportRowError = {
  rowNumber: number;
  field: string;
  code: string;
  message: string;
  row: Record<string, string>;
};

export type ImportResult = {
  dataType: string;
  totalRows: number;
  validRows: number;
  importedRows: number;
  imported: boolean;
  hasCriticalErrors: boolean;
  errors: ImportRowError[];
};

export type UploadedFileResponse = {
  originalFileName: string;
  storedFileName: string;
  path: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
};
