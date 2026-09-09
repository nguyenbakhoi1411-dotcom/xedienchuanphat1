package com.chuanphat.warranty.core.enums;

/**
 * Loai phieu giao dich ton kho.
 * V19: Them PURCHASE_RECEIPT, GOODS_ISSUE, WRITE_OFF, COUNT_ADJUSTMENT_IN/OUT.
 */
public enum InventoryTransactionType {
    IMPORT,
    EXPORT,
    TRANSFER_IN,
    TRANSFER_OUT,
    STOCKTAKE,
    ADJUSTMENT_IN,
    ADJUSTMENT_OUT,
    SALE,
    RETURN,
    RESERVE,
    RELEASE_RESERVATION,
    SERVICE_USE,
    // V19 moi
    PURCHASE_RECEIPT,         // Nhap kho tu phieu nhap chinh thuc
    GOODS_ISSUE,              // Xuat kho tu phieu xuat
    WRITE_OFF,                // Huy/xoa so
    COUNT_ADJUSTMENT_IN,      // Dieu chinh tang sau kiem ke
    COUNT_ADJUSTMENT_OUT      // Dieu chinh giam sau kiem ke
    ,TRANSFER
}


