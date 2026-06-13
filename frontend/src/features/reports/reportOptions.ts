import type { ReportOption, ReportType } from "./types";

export const reportTypes: Array<{ value: ReportType; label: string; description: string }> = [
  { value: "SALES_REPORT", label: "Sales Report", description: "Doanh thu, don hang va loi nhuan theo ngay" },
  { value: "INVENTORY_VALUATION", label: "Inventory Valuation", description: "Gia tri ton kho hien tai" },
  { value: "STOCK_MOVEMENT", label: "Stock Movement", description: "Nhap xuat chuyen kho trong ky" },
  { value: "CUSTOMER_DEBT_AGING", label: "Customer Debt Aging", description: "Tuoi no phai thu khach hang" },
  { value: "SUPPLIER_DEBT_AGING", label: "Supplier Debt Aging", description: "Tuoi no phai tra nha cung cap" },
  { value: "PROFIT_LOSS", label: "Profit & Loss", description: "Doanh thu, gia von va loi nhuan" },
  { value: "CASH_FLOW", label: "Cash Flow", description: "Dong tien vao ra" },
  { value: "PRODUCT_PERFORMANCE", label: "Product Performance", description: "Hieu qua san pham" },
  { value: "BRANCH_PERFORMANCE", label: "Branch Performance", description: "Hieu suat chi nhanh" },
  { value: "EMPLOYEE_PERFORMANCE", label: "Employee Performance", description: "Hieu suat nhan vien" },
  { value: "WARRANTY_COST", label: "Warranty Cost", description: "Chi phi bao hanh/sua chua" },
  { value: "WARRANTY_ANALYSIS", label: "Warranty Analysis", description: "Mau xe, bo phan, nha cung cap loi nhieu" },
  { value: "MARKETING_SOURCE", label: "Marketing Source", description: "Nguon khach va doanh thu" },
  { value: "INVENTORY_SERIAL", label: "Inventory Serial", description: "Ton kho chi tiet theo serial" },
  { value: "LOW_STOCK", label: "Low Stock", description: "Hang sap het can nhap" },
  { value: "SLOW_MOVING_STOCK", label: "Slow Moving Stock", description: "Hang ton lau/cham ban" },
  { value: "DEFECTIVE_STOCK", label: "Defective Stock", description: "Hang loi, bao hanh, dang sua" },
  { value: "STOCKTAKE_VARIANCE", label: "Stocktake Variance", description: "Chenh lech kiem ke" },
  { value: "EXECUTIVE_OPERATION", label: "Executive Operation", description: "Lai lo, dong tien va canh bao dieu hanh" }
];

export const branchOptions: ReportOption[] = [
  { value: "all", label: "Tat ca chi nhanh" },
  { value: "1", label: "Chi nhanh Go Vap" },
  { value: "2", label: "Chi nhanh Thu Duc" },
  { value: "3", label: "Chi nhanh Binh Thanh" },
  { value: "empty", label: "Chi nhanh khong co du lieu" }
];

export const employeeOptions: ReportOption[] = [
  { value: "all", label: "Tat ca nhan vien" },
  { value: "102", label: "Demo Sales 1" },
  { value: "103", label: "Demo Warehouse 1" },
  { value: "104", label: "Demo Accountant 1" }
];

export const productOptions: ReportOption[] = [
  { value: "all", label: "Tat ca san pham" },
  { value: "1", label: "San pham #1" },
  { value: "2", label: "San pham #2" },
  { value: "3", label: "San pham #3" },
  { value: "4", label: "San pham #4" }
];

export const productCategoryOptions: ReportOption[] = [
  { value: "all", label: "Tat ca danh muc" },
  { value: "ELECTRIC_MOTORBIKE", label: "Xe may dien" },
  { value: "BATTERY", label: "Pin/ac quy" },
  { value: "SPARE_PART", label: "Phu tung" },
  { value: "ACCESSORY", label: "Phu kien" }
];

export const customerOptions: ReportOption[] = [
  { value: "all", label: "Tat ca khach hang" },
  { value: "1", label: "Khach hang #1" },
  { value: "2", label: "Khach hang #2" },
  { value: "3", label: "Khach hang #3" }
];

export const statusOptions: ReportOption[] = [
  { value: "all", label: "Tat ca trang thai" },
  { value: "COMPLETED", label: "Hoan tat" },
  { value: "CONFIRMED", label: "Da xac nhan" },
  { value: "CANCELLED", label: "Da huy" },
  { value: "RETURNED", label: "Da tra" },
  { value: "IN_STOCK", label: "Con ton" },
  { value: "DEFECTIVE", label: "Hang loi" },
  { value: "WARRANTY", label: "Bao hanh" },
  { value: "IN_SERVICE", label: "Dang sua" }
];
