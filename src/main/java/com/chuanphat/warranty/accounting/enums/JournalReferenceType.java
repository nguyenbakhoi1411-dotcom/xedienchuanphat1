package com.chuanphat.warranty.accounting.enums;

public enum JournalReferenceType {
    MANUAL,
    SALES_ORDER,
    SALES_RETURN,
    PURCHASE_ORDER,
    PURCHASE_RETURN,
    RECEIPT_VOUCHER,
    PAYMENT_VOUCHER,
    SERVICE_TICKET,  // bảo hành / sửa chữa
    DEPOSIT,         // đặt cọc
    ADJUSTMENT,
    EXPENSE,         // chi phí vận hành
    TAX_INVOICE,     // hóa đơn VAT
    DEPRECIATION,    // khấu hao TSCĐ
    PAYROLL,         // bảng lương
    FIXED_ASSET_DISPOSAL // thanh lý TSCĐ
}
