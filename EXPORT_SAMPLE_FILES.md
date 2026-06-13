# Export Excel/PDF - Mau file va API

## Excel reports

Tat ca report export Excel tra ve `.xlsx` qua Apache POI, gom:

- Tieu de bao cao.
- Thoi gian loc.
- Chi nhanh loc.
- Nguoi xuat va ngay xuat.
- Header bang.
- Dong tong cho cac cot tien.
- Format ngay `dd/mm/yyyy`.
- Format tien VND.

Endpoint mau:

- `GET /api/reports/sales/export/excel`
- `GET /api/reports/sales-report/export/excel`
- `GET /api/reports/inventory/export/excel`
- `GET /api/reports/stock-movement/export/excel`
- `GET /api/reports/customer-debt-aging/export/excel`
- `GET /api/reports/supplier-debt-aging/export/excel`
- `GET /api/reports/profit-loss/export/excel`
- `GET /api/reports/cash-flow/export/excel`
- `GET /api/reports/warranty-repair/export/excel`
- `GET /api/reports/employee-performance/export/excel`

Query mau:

```http
GET /api/reports/sales/export/excel?fromDate=2026-06-01&toDate=2026-06-08&branchId=1
```

Ten file mau:

```text
sales-2026-06-01-2026-06-08.xlsx
profit-loss-2026-06-01-2026-06-08.xlsx
```

## PDF documents

PDF dung OpenPDF, gom:

- Logo text `CP`.
- Thong tin cong ty.
- Thong tin khach hang/nguoi nhan.
- Bang chi tiet.
- Tong tien bang so va dong `Bang chu` dang so doc duoc.
- Chu ky nguoi lap/nguoi nhan.

Endpoint mau:

- `GET /api/invoices/{id}/pdf`
- `GET /api/sales/orders/{id}/pdf`
- `GET /api/sales/quotations/{id}/pdf`
- `GET /api/accounting/receipts/{id}/pdf`
- `GET /api/accounting/payments/{id}/pdf`
- `GET /api/service-tickets/{id}/pdf`
- `GET /api/reports/sales/export/pdf`

## Permission

- Report Excel/PDF: `REPORT_EXPORT`.
- Invoice, sales order, quotation, warranty/service ticket PDF: `INVOICE_EXPORT`.
- Receipt/payment voucher PDF: `ACCOUNTING_EXPORT`.
