import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, Min, Max } from 'class-validator';

// ============ Report Enums ============

export enum ReportGroup {
  FINANCIAL = 'financial',
  GENERAL_LEDGER = 'general_ledger',
  SALES = 'sales',
  PURCHASE = 'purchase',
  INVENTORY = 'inventory',
  CASH = 'cash',
  RECEIVABLES = 'receivables',
  PAYABLES = 'payables',
  TAX = 'tax',
  PAYROLL = 'payroll',
  MANAGEMENT = 'management',
}

export enum PeriodType {
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export enum ComparisonType {
  PREV_PERIOD = 'prev_period',
  SAME_PERIOD_LAST_YEAR = 'same_period_last_year',
  NONE = 'none',
}

export enum CurrencyUnit {
  VND = 'VND',
  THOUSANDS = 'thousands',
  MILLIONS = 'millions',
}

export enum ExportFormat {
  EXCEL = 'excel',
  PDF = 'pdf',
  CSV = 'csv',
}

// ============ Report Metadata ============

export class ReportInfo {
  id: string;
  code: string;                    // VD: B01-DN, B02-DN
  name: string;
  description?: string;
  group: ReportGroup;
  icon: string;                    // Tabler icon name
  accentColor: string;             // CSS color
  isNew?: boolean;
  isPopular?: boolean;
  tags?: string[];
  requiredDimensions?: string[];   // VD: ['month', 'year']
}

export class ReportList {
  reports: ReportInfo[];
  total: number;
  groups: Map<ReportGroup, number>;
}

// ============ Period & Filter DTOs ============

export class PeriodSelectorDto {
  type: PeriodType;
  year: number;
  month?: number;
  quarter?: number;
  dateFrom?: Date;
  dateTo?: Date;
  compareWith?: ComparisonType;
}

export class ReportFilterDto {
  periodSelector: PeriodSelectorDto;
  currencyUnit: CurrencyUnit;
  limitRows?: number;
  offset?: number;
}

// ============ Report Request/Response ============

export class GetReportRequest {
  @IsOptional()
  @IsString()
  reportId?: string;

  @IsOptional()
  @IsDateString()
  asOf?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(PeriodType)
  periodType?: PeriodType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  quarter?: number;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsEnum(ComparisonType)
  compareWith?: ComparisonType;

  @IsOptional()
  @IsEnum(CurrencyUnit)
  currencyUnit?: CurrencyUnit;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class ReportRowDto {
  code?: string;
  name: string;
  level?: number;
  currentValue: number;
  previousValue?: number;
  difference?: number;
  percentChange?: number;
  note?: string;
  [key: string]: any;
}

export class ReportDataDto {
  id: string;
  name: string;
  generatedAt: Date;
  period: {
    from: Date;
    to: Date;
  };
  data: ReportRowDto[];
  summary?: {
    totalRows: number;
    totalValue?: number;
  };
  metadata?: {
    [key: string]: any;
  };
}

// ============ Favorite & Recent ============

export class ReportFavoriteDto {
  userId: string;
  reportId: string;
  isFavorite: boolean;
  position?: number;
}

export class RecentReportDto {
  reportId: string;
  viewedAt: Date;
  viewCount: number;
}

// ============ Export Preferences ============

export class SaveFilterPresetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  reportId: string;

  @IsOptional()
  filters?: any;

  isDefault?: boolean;
}

export class FilterPresetDto {
  id: string;
  userId: string;
  reportId: string;
  name: string;
  description?: string;
  filters: any;
  isDefault: boolean;
  createdAt: Date;
}

// ============ Report Template ============

export class ReportTemplateDto {
  id: string;
  reportId: string;
  userId: string;
  name: string;
  config: {
    visibleColumns?: string[];
    columnOrder?: string[];
    computedColumns?: Array<{
      name: string;
      formula: string;
      label: string;
    }>;
    summaryRows?: Array<{
      type: 'sum' | 'avg' | 'count';
      columns: string[];
    }>;
    groupBy?: string;
    title?: string;
    subtitle?: string;
  };
  isDefault: boolean;
  sharedWith?: string[];
  createdAt: Date;
}

// ============ Deadline Tracker ============

export interface DeadlineItem {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  urgency: 'low' | 'medium' | 'high';
  type: 'tax' | 'insurance' | 'financial' | 'other';
  completed: boolean;
}

export const ACCOUNTING_DEADLINES: DeadlineItem[] = [
  {
    id: 'vat-filing',
    title: 'Nộp thuế GTGT',
    description: 'Nộp tờ khai thuế GTGT',
    dueDate: new Date(), // Ngày 20 tháng sau
    urgency: 'high',
    type: 'tax',
    completed: false,
  },
  {
    id: 'pit-quarterly',
    title: 'Nộp thuế TNDN tạm tính',
    description: 'Nộp tờ khai thuế TNDN quý',
    dueDate: new Date(),
    urgency: 'high',
    type: 'tax',
    completed: false,
  },
  {
    id: 'financial-statements',
    title: 'Nộp BCTC năm',
    description: 'Nộp Báo cáo tài chính năm',
    dueDate: new Date(),
    urgency: 'high',
    type: 'financial',
    completed: false,
  },
  {
    id: 'insurance-payment',
    title: 'Đóng BHXH',
    description: 'Đóng bảo hiểm xã hội',
    dueDate: new Date(),
    urgency: 'medium',
    type: 'insurance',
    completed: false,
  },
];
