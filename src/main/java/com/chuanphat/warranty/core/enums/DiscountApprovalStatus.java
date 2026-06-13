package com.chuanphat.warranty.core.enums;

/**
 * Trang thai duyet giam gia tren SalesOrder.
 *
 * NONE     — Don hang khong can duyet (giam gia nam trong nguong cho phep).
 * PENDING  — Dang cho nguoi co quyen APPROVE_DISCOUNT duyet.
 * APPROVED — Da duoc duyet. Don tiep tuc xu ly binh thuong.
 * REJECTED — Bi tu choi. Nhan vien can dieu chinh lai muc giam gia.
 */
public enum DiscountApprovalStatus {
    NONE,
    PENDING,
    APPROVED,
    REJECTED
}
