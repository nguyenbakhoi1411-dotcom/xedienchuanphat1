import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api/axios";
import type { ExportFormat, ReportFilters, ReportResponse, ReportTableColumn, ReportTableRow, ReportType } from "./types";

const enableMock = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

const monthlyRevenue = [
  { label: "01/06", primaryValue: 118_000_000, secondaryValue: 29_500_000 },
  { label: "02/06", primaryValue: 142_000_000, secondaryValue: 35_900_000 },
  { label: "03/06", primaryValue: 126_000_000, secondaryValue: 30_800_000 },
  { label: "04/06", primaryValue: 174_000_000, secondaryValue: 43_200_000 },
  { label: "05/06", primaryValue: 156_000_000, secondaryValue: 38_700_000 },
  { label: "06/06", primaryValue: 189_000_000, secondaryValue: 48_900_000 }
];

const reportBase: Record<string, Omit<ReportResponse, "updatedAt">> = {
  REVENUE_TIME: {
    title: "Doanh thu theo thoi gian",
    description: "Theo doi doanh thu va loi nhuan gop theo tung ngay trong khoang loc.",
    chartLabel: "Doanh thu",
    secondaryChartLabel: "Loi nhuan",
    summary: [
      { key: "revenue", label: "Tong doanh thu", value: "905.0M", helper: "Da tru hang hoan", tone: "orange" },
      { key: "orders", label: "So don hang", value: "312", helper: "Don thanh cong", tone: "blue" },
      { key: "aov", label: "Gia tri TB/don", value: "2.9M", helper: "AOV trong ky", tone: "slate" }
    ],
    chart: monthlyRevenue,
    tableColumns: [
      { key: "period", label: "Ngay" },
      { key: "orders", label: "Don hang", align: "right", format: "number" },
      { key: "revenue", label: "Doanh thu", align: "right", format: "currency" },
      { key: "grossProfit", label: "Loi nhuan gop", align: "right", format: "currency" }
    ],
    tableRows: [
      { period: "01/06/2026", orders: 42, revenue: 118_000_000, grossProfit: 29_500_000 },
      { period: "02/06/2026", orders: 49, revenue: 142_000_000, grossProfit: 35_900_000 },
      { period: "03/06/2026", orders: 44, revenue: 126_000_000, grossProfit: 30_800_000 },
      { period: "04/06/2026", orders: 61, revenue: 174_000_000, grossProfit: 43_200_000 },
      { period: "05/06/2026", orders: 53, revenue: 156_000_000, grossProfit: 38_700_000 },
      { period: "06/06/2026", orders: 63, revenue: 189_000_000, grossProfit: 48_900_000 }
    ]
  },
  REVENUE_BRANCH: {
    title: "Doanh thu theo chi nhanh",
    description: "So sanh doanh thu, so don va ty trong doanh thu giua cac chi nhanh.",
    chartLabel: "Doanh thu",
    summary: [
      { key: "best", label: "Chi nhanh cao nhat", value: "Go Vap", helper: "420.0M doanh thu", tone: "green" },
      { key: "branches", label: "Chi nhanh co giao dich", value: "4", helper: "Trong ky bao cao", tone: "blue" },
      { key: "avg", label: "TB/chi nhanh", value: "295.0M", helper: "Doanh thu binh quan", tone: "slate" }
    ],
    chart: [
      { label: "Go Vap", primaryValue: 420_000_000 },
      { label: "Thu Duc", primaryValue: 310_000_000 },
      { label: "Quan 7", primaryValue: 265_000_000 },
      { label: "Tan Binh", primaryValue: 185_000_000 }
    ],
    tableColumns: [
      { key: "branch", label: "Chi nhanh" },
      { key: "orders", label: "Don hang", align: "right", format: "number" },
      { key: "revenue", label: "Doanh thu", align: "right", format: "currency" },
      { key: "share", label: "Ty trong", align: "right", format: "percent" }
    ],
    tableRows: [
      { branch: "Go Vap", orders: 145, revenue: 420_000_000, share: 35.6 },
      { branch: "Thu Duc", orders: 116, revenue: 310_000_000, share: 26.3 },
      { branch: "Quan 7", orders: 91, revenue: 265_000_000, share: 22.5 },
      { branch: "Tan Binh", orders: 68, revenue: 185_000_000, share: 15.6 }
    ]
  },
  REVENUE_EMPLOYEE: {
    title: "Doanh thu theo nhan vien",
    description: "Xep hang nhan vien theo doanh thu, so don va ty le chot.",
    chartLabel: "Doanh thu",
    summary: [
      { key: "top", label: "Nhan vien top", value: "Nguyen Hoai An", helper: "238.0M doanh thu", tone: "green" },
      { key: "staff", label: "Nhan vien co ban", value: "5", helper: "Co phat sinh don", tone: "blue" },
      { key: "close", label: "Ty le chot TB", value: "41.2%", helper: "Tu lead sang don", tone: "orange" }
    ],
    chart: [
      { label: "Hoai An", primaryValue: 238_000_000 },
      { label: "Bao Minh", primaryValue: 206_000_000 },
      { label: "Gia Phuc", primaryValue: 174_000_000 },
      { label: "Duy Khoa", primaryValue: 128_000_000 }
    ],
    tableColumns: [
      { key: "employee", label: "Nhan vien" },
      { key: "orders", label: "Don hang", align: "right", format: "number" },
      { key: "revenue", label: "Doanh thu", align: "right", format: "currency" },
      { key: "conversion", label: "Ty le chot", align: "right", format: "percent" }
    ],
    tableRows: [
      { employee: "Nguyen Hoai An", orders: 74, revenue: 238_000_000, conversion: 45.1 },
      { employee: "Le Bao Minh", orders: 61, revenue: 206_000_000, conversion: 42.8 },
      { employee: "Tran Gia Phuc", orders: 49, revenue: 174_000_000, conversion: 39.6 },
      { employee: "Dang Duy Khoa", orders: 38, revenue: 128_000_000, conversion: 36.9 }
    ]
  },
  TOP_PRODUCTS: {
    title: "San pham ban chay",
    description: "Xep hang SKU theo so luong ban va doanh thu.",
    chartLabel: "So luong ban",
    secondaryChartLabel: "Doanh thu",
    summary: [
      { key: "top", label: "SKU ban chay", value: "CP-S1", helper: "58 san pham", tone: "orange" },
      { key: "units", label: "Tong so luong", value: "207", helper: "Tat ca san pham", tone: "blue" },
      { key: "revenue", label: "Doanh thu SKU", value: "1.85B", helper: "Top 5 san pham", tone: "green" }
    ],
    chart: [
      { label: "CP-S1", primaryValue: 58, secondaryValue: 812_000_000 },
      { label: "PIN-LFP", primaryValue: 44, secondaryValue: 286_000_000 },
      { label: "CP-CITY", primaryValue: 39, secondaryValue: 604_000_000 },
      { label: "SAC-NHANH", primaryValue: 35, secondaryValue: 98_000_000 },
      { label: "LOP-XD", primaryValue: 31, secondaryValue: 52_000_000 }
    ],
    tableColumns: [
      { key: "product", label: "San pham" },
      { key: "sku", label: "SKU" },
      { key: "quantity", label: "Da ban", align: "right", format: "number" },
      { key: "revenue", label: "Doanh thu", align: "right", format: "currency" }
    ],
    tableRows: [
      { product: "Xe may dien CP S1", sku: "CP-S1", quantity: 58, revenue: 812_000_000 },
      { product: "Binh ac quy LFP", sku: "PIN-LFP", quantity: 44, revenue: 286_000_000 },
      { product: "Xe may dien CP City", sku: "CP-CITY", quantity: 39, revenue: 604_000_000 },
      { product: "Bo sac nhanh", sku: "SAC-NHANH", quantity: 35, revenue: 98_000_000 },
      { product: "Lop xe dien", sku: "LOP-XD", quantity: 31, revenue: 52_000_000 }
    ]
  },
  INVENTORY: {
    title: "Ton kho",
    description: "Theo doi so luong ton, hang sap het va gia tri ton kho.",
    chartLabel: "So luong ton",
    secondaryChartLabel: "Nguong toi thieu",
    summary: [
      { key: "stock", label: "Tong ton kho", value: "248", helper: "Xe va phu tung", tone: "blue" },
      { key: "low", label: "Sap het hang", value: "19", helper: "Duoi nguong toi thieu", tone: "red" },
      { key: "value", label: "Gia tri kho", value: "2.74B", helper: "Theo gia nhap", tone: "orange" }
    ],
    chart: [
      { label: "CP-S1", primaryValue: 84, secondaryValue: 20 },
      { label: "CP-CITY", primaryValue: 62, secondaryValue: 18 },
      { label: "PIN-LFP", primaryValue: 31, secondaryValue: 25 },
      { label: "SAC-NHANH", primaryValue: 18, secondaryValue: 20 },
      { label: "LOP-XD", primaryValue: 53, secondaryValue: 25 }
    ],
    tableColumns: [
      { key: "product", label: "San pham" },
      { key: "branch", label: "Chi nhanh" },
      { key: "stock", label: "Ton", align: "right", format: "number" },
      { key: "value", label: "Gia tri ton", align: "right", format: "currency" }
    ],
    tableRows: [
      { product: "Xe may dien CP S1", branch: "Go Vap", stock: 84, value: 991_200_000 },
      { product: "Xe may dien CP City", branch: "Thu Duc", stock: 62, value: 607_600_000 },
      { product: "Binh ac quy LFP", branch: "Quan 7", stock: 31, value: 130_200_000 },
      { product: "Bo sac nhanh", branch: "Go Vap", stock: 18, value: 43_200_000 }
    ]
  },
  DEBT: {
    title: "Cong no",
    description: "Tong hop phai thu, phai tra va cac khoan qua han.",
    chartLabel: "Phai thu",
    secondaryChartLabel: "Phai tra",
    summary: [
      { key: "receivable", label: "Phai thu", value: "735.0M", helper: "Khach hang con no", tone: "blue" },
      { key: "payable", label: "Phai tra", value: "518.0M", helper: "Nha cung cap", tone: "slate" },
      { key: "overdue", label: "Qua han", value: "91.0M", helper: "Can thu hoi", tone: "red" }
    ],
    chart: [
      { label: "Go Vap", primaryValue: 240_000_000, secondaryValue: 168_000_000 },
      { label: "Thu Duc", primaryValue: 186_000_000, secondaryValue: 141_000_000 },
      { label: "Quan 7", primaryValue: 174_000_000, secondaryValue: 122_000_000 },
      { label: "Tan Binh", primaryValue: 135_000_000, secondaryValue: 87_000_000 }
    ],
    tableColumns: [
      { key: "name", label: "Doi tuong" },
      { key: "type", label: "Loai" },
      { key: "amount", label: "So tien", align: "right", format: "currency" },
      { key: "dueDate", label: "Han thanh toan", align: "right", format: "date" }
    ],
    tableRows: [
      { name: "Nguyen Van A", type: "Phai thu", amount: 48_000_000, dueDate: "2026-06-12" },
      { name: "Cong ty Pin Viet", type: "Phai tra", amount: 126_000_000, dueDate: "2026-06-18" },
      { name: "Tran Thi B", type: "Phai thu", amount: 23_500_000, dueDate: "2026-06-02" },
      { name: "NCC Phu tung A", type: "Phai tra", amount: 84_000_000, dueDate: "2026-06-20" }
    ]
  },
  PROFIT: {
    title: "Loi nhuan co ban",
    description: "Doanh thu, gia von va loi nhuan gop theo nhom san pham.",
    chartLabel: "Doanh thu",
    secondaryChartLabel: "Loi nhuan",
    summary: [
      { key: "revenue", label: "Doanh thu", value: "1.18B", helper: "Trong ky", tone: "orange" },
      { key: "cogs", label: "Gia von", value: "823.0M", helper: "Theo gia nhap", tone: "slate" },
      { key: "profit", label: "Loi nhuan gop", value: "357.0M", helper: "Bien gop 30.3%", tone: "green" }
    ],
    chart: [
      { label: "Xe dien", primaryValue: 904_000_000, secondaryValue: 268_000_000 },
      { label: "Pin", primaryValue: 154_000_000, secondaryValue: 62_000_000 },
      { label: "Phu tung", primaryValue: 86_000_000, secondaryValue: 19_000_000 },
      { label: "Dich vu", primaryValue: 36_000_000, secondaryValue: 8_000_000 }
    ],
    tableColumns: [
      { key: "group", label: "Nhom" },
      { key: "revenue", label: "Doanh thu", align: "right", format: "currency" },
      { key: "cogs", label: "Gia von", align: "right", format: "currency" },
      { key: "profit", label: "Loi nhuan", align: "right", format: "currency" }
    ],
    tableRows: [
      { group: "Xe dien", revenue: 904_000_000, cogs: 636_000_000, profit: 268_000_000 },
      { group: "Pin", revenue: 154_000_000, cogs: 92_000_000, profit: 62_000_000 },
      { group: "Phu tung", revenue: 86_000_000, cogs: 67_000_000, profit: 19_000_000 },
      { group: "Dich vu", revenue: 36_000_000, cogs: 28_000_000, profit: 8_000_000 }
    ]
  },
  WARRANTY_REPAIR: {
    title: "Bao hanh/sua chua",
    description: "Theo doi phieu bao hanh, sua chua va chi phi linh kien.",
    chartLabel: "So phieu",
    secondaryChartLabel: "Chi phi",
    summary: [
      { key: "tickets", label: "Tong so phieu", value: "87", helper: "Mo trong ky", tone: "blue" },
      { key: "done", label: "Da hoan tat", value: "64", helper: "Ty le 73.6%", tone: "green" },
      { key: "cost", label: "Chi phi sua chua", value: "42.8M", helper: "Linh kien va cong", tone: "orange" }
    ],
    chart: [
      { label: "Tiep nhan", primaryValue: 18, secondaryValue: 6_800_000 },
      { label: "Dang xu ly", primaryValue: 14, secondaryValue: 9_200_000 },
      { label: "Cho LK", primaryValue: 9, secondaryValue: 7_600_000 },
      { label: "Hoan tat", primaryValue: 46, secondaryValue: 19_200_000 }
    ],
    tableColumns: [
      { key: "ticket", label: "Phieu" },
      { key: "customer", label: "Khach hang" },
      { key: "status", label: "Trang thai" },
      { key: "cost", label: "Chi phi", align: "right", format: "currency" }
    ],
    tableRows: [
      { ticket: "SC-2026-0101", customer: "Nguyen Van A", status: "Dang xu ly", cost: 1_250_000 },
      { ticket: "SC-2026-0102", customer: "Tran Thi B", status: "Cho linh kien", cost: 2_800_000 },
      { ticket: "SC-2026-0103", customer: "Pham Quoc C", status: "Da hoan tat", cost: 650_000 },
      { ticket: "SC-2026-0104", customer: "Le Van D", status: "Tiep nhan", cost: 0 }
    ]
  },
  NEW_CUSTOMERS: {
    title: "Khach hang moi",
    description: "Thong ke khach hang tao moi va ty le phat sinh don dau tien.",
    chartLabel: "Khach hang moi",
    secondaryChartLabel: "Co don dau",
    summary: [
      { key: "new", label: "Khach hang moi", value: "72", helper: "Trong ky", tone: "blue" },
      { key: "buyers", label: "Co don dau", value: "39", helper: "Ty le 54.2%", tone: "green" },
      { key: "source", label: "Kenh tot nhat", value: "Facebook", helper: "31 khach moi", tone: "orange" }
    ],
    chart: [
      { label: "Facebook", primaryValue: 31, secondaryValue: 18 },
      { label: "Zalo", primaryValue: 18, secondaryValue: 9 },
      { label: "Gioi thieu", primaryValue: 14, secondaryValue: 8 },
      { label: "Tai cua hang", primaryValue: 9, secondaryValue: 4 }
    ],
    tableColumns: [
      { key: "source", label: "Nguon" },
      { key: "newCustomers", label: "Khach moi", align: "right", format: "number" },
      { key: "firstOrders", label: "Co don dau", align: "right", format: "number" },
      { key: "rate", label: "Ty le", align: "right", format: "percent" }
    ],
    tableRows: [
      { source: "Facebook", newCustomers: 31, firstOrders: 18, rate: 58.1 },
      { source: "Zalo", newCustomers: 18, firstOrders: 9, rate: 50 },
      { source: "Gioi thieu", newCustomers: 14, firstOrders: 8, rate: 57.1 },
      { source: "Tai cua hang", newCustomers: 9, firstOrders: 4, rate: 44.4 }
    ]
  }
};

export const reportsApi = {
  async getReport(type: ReportType, filters: ReportFilters): Promise<ReportResponse> {
    return getReportData(type, filters);
  },

  async exportReport(type: ReportType, format: ExportFormat, filters: ReportFilters): Promise<{ blob: Blob; fileName: string }> {
    if (!enableMock) {
      const response = await api.get<Blob>(`${reportEndpoint(type)}/export/${format === "excel" ? "excel" : "pdf"}`, {
        params: reportParams(filters),
        responseType: "blob"
      });
      return {
        blob: response.data,
        fileName: fileNameFromDisposition(response.headers["content-disposition"]) ?? defaultExportFileName(type, format, filters)
      };
    }
    const report = await getReportData(type, filters);
    await wait(280);

    if (format === "excel") {
      return {
        blob: new Blob([toCsv(report.tableColumns, report.tableRows)], {
          type: "application/vnd.ms-excel;charset=utf-8"
        }),
        fileName: defaultExportFileName(type, format, filters)
      };
    }

    return {
      blob: new Blob([toPdf(report, filters)], {
        type: "application/pdf"
      }),
      fileName: defaultExportFileName(type, format, filters)
    };
  }
};

async function getReportData(type: ReportType, filters: ReportFilters): Promise<ReportResponse> {
  if (!enableMock) {
    const response = await api.get<ReportResponse>(reportEndpoint(type), {
      params: reportParams(filters)
    });
    return response.data;
  }
  await wait(520);

  if (filters.branchId === "empty") {
    const empty = mockBase(type);
    return {
      ...empty,
      summary: empty.summary.map((item) => ({ ...item, value: item.key === "source" ? "-" : "0" })),
      chart: [],
      tableRows: [],
      pagination: paginationMeta(filters, 0),
      updatedAt: new Date().toISOString()
    };
  }

  const source = mockBase(type);
  const multiplier = getFilterMultiplier(filters);
  const rows = source.tableRows.map((row) => scaleRow(row, source.tableColumns, multiplier));

  return {
    ...source,
    summary: source.summary,
    chart: source.chart.map((item) => ({
      ...item,
      primaryValue: scale(item.primaryValue, multiplier),
      secondaryValue: item.secondaryValue === undefined ? undefined : scale(item.secondaryValue, multiplier)
    })),
    tableRows: rows.slice(filters.page * filters.pageSize, filters.page * filters.pageSize + filters.pageSize),
    pagination: paginationMeta(filters, rows.length),
    updatedAt: new Date().toISOString()
  };
}

function reportEndpoint(type: ReportType) {
  return `/api/reports/${type.toLowerCase().replace(/_/g, "-")}`;
}

function reportParams(filters: ReportFilters, format?: ExportFormat) {
  return {
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    branchId: filters.branchId === "all" ? undefined : filters.branchId,
    employeeId: filters.employeeId === "all" ? undefined : filters.employeeId,
    productId: filters.productId === "all" ? undefined : filters.productId,
    customerId: filters.customerId === "all" ? undefined : filters.customerId,
    status: filters.status === "all" ? undefined : filters.status,
    productCategory: filters.productCategory === "all" ? undefined : filters.productCategory,
    page: filters.page,
    pageSize: filters.pageSize,
    format
  };
}

function defaultExportFileName(type: ReportType, format: ExportFormat, filters: ReportFilters) {
  return `${type.toLowerCase().replace(/_/g, "-")}-${filters.fromDate}-${filters.toDate}.${format === "excel" ? "xlsx" : "pdf"}`;
}

function fileNameFromDisposition(disposition?: string) {
  if (!disposition) return null;
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}

function mockBase(type: ReportType) {
  const aliases: Record<ReportType, string> = {
    SALES_REPORT: "REVENUE_TIME",
    INVENTORY_VALUATION: "INVENTORY",
    STOCK_MOVEMENT: "INVENTORY",
    CUSTOMER_DEBT_AGING: "DEBT",
    SUPPLIER_DEBT_AGING: "DEBT",
    PROFIT_LOSS: "PROFIT",
    CASH_FLOW: "PROFIT",
    PRODUCT_PERFORMANCE: "TOP_PRODUCTS",
    BRANCH_PERFORMANCE: "REVENUE_BRANCH",
    EMPLOYEE_PERFORMANCE: "REVENUE_EMPLOYEE",
    WARRANTY_COST: "WARRANTY_REPAIR",
    MARKETING_SOURCE: "NEW_CUSTOMERS",
    INVENTORY_SERIAL: "INVENTORY",
    LOW_STOCK: "INVENTORY",
    SLOW_MOVING_STOCK: "INVENTORY",
    DEFECTIVE_STOCK: "INVENTORY",
    STOCKTAKE_VARIANCE: "INVENTORY",
    WARRANTY_ANALYSIS: "WARRANTY_REPAIR",
    EXECUTIVE_OPERATION: "PROFIT"
  };
  return reportBase[aliases[type]];
}

function getFilterMultiplier(filters: ReportFilters) {
  const branchMultiplier = filters.branchId === "all" ? 1 : 0.48;
  const employeeMultiplier = filters.employeeId === "all" ? 1 : 0.34;
  const productMultiplier = filters.productId === "all" ? 1 : 0.42;
  const categoryMultiplier = filters.productCategory === "all" ? 1 : 0.56;

  return branchMultiplier * employeeMultiplier * productMultiplier * categoryMultiplier;
}

function paginationMeta(filters: ReportFilters, totalItems: number) {
  return {
    page: filters.page,
    pageSize: filters.pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / filters.pageSize)
  };
}

function scale(value: number, multiplier: number) {
  if (value < 1000) {
    return Math.max(1, Math.round(value * multiplier));
  }

  return Math.round(value * multiplier);
}

function scaleRow(row: ReportTableRow, columns: ReportTableColumn[], multiplier: number) {
  return columns.reduce<ReportTableRow>((nextRow, column) => {
    const value = row[column.key];
    nextRow[column.key] =
      typeof value === "number" && ["currency", "number"].includes(column.format ?? "")
        ? scale(value, multiplier)
        : value;
    return nextRow;
  }, {});
}

function toCsv(columns: ReportTableColumn[], rows: ReportTableRow[]) {
  const header = columns.map((column) => escapeCsv(column.label)).join(",");
  const body = rows.map((row) => columns.map((column) => escapeCsv(String(row[column.key] ?? ""))).join(","));

  return [header, ...body].join("\n");
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function toPdf(report: ReportResponse, filters: ReportFilters) {
  const rows = [
    report.title,
    report.description,
    `Tu ngay: ${filters.fromDate} - Den ngay: ${filters.toDate}`,
    "",
    report.tableColumns.map((column) => column.label).join(" | "),
    ...report.tableRows
      .slice(0, 28)
      .map((row) => report.tableColumns.map((column) => formatExportValue(row[column.key], column)).join(" | "))
  ].map((line) => pdfText(line).slice(0, 110));

  const stream = `BT
/F1 10 Tf
50 790 Td
14 TL
${rows.map((line) => `(${line}) Tj T*`).join("\n")}
ET`;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return body;
}

function formatExportValue(value: string | number | undefined, column: ReportTableColumn) {
  if (value === undefined) {
    return "";
  }

  if (typeof value !== "number") {
    return value;
  }

  if (column.format === "currency") {
    return formatCurrency(value);
  }

  if (column.format === "percent") {
    return `${value}%`;
  }

  return new Intl.NumberFormat("vi-VN").format(value);
}

function pdfText(value: string | number) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
