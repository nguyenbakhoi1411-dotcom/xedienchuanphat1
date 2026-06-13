package com.chuanphat.warranty.core.enums;

/**
 * Trang thai don mua hang.
 *
 * DRAFT             — Nhap nhay, chua gui duyet
 * PENDING_APPROVAL  — Da gui, cho duyet (vuot han muc)
 * APPROVED          — Da duyet, co the tao phieu nhap
 * PARTIALLY_RECEIVED— Da nhap mot phan
 * RECEIVED          — Da nhap du
 * CANCELLED         — Da huy
 * REJECTED          — Bi tu choi duyet
 */
public enum PurchaseOrderStatus {
    DRAFT,
    PENDING_APPROVAL,
    APPROVED,
    PARTIALLY_RECEIVED,
    RECEIVED,
    CANCELLED,
    REJECTED
}
