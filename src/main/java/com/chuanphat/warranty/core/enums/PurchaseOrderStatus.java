package com.chuanphat.warranty.core.enums;

/**
 * Trang thai don mua hang.
 *
 * DRAFT             — Nhap nhay, chua gui duyet
 * SUBMITTED         — Da gui, cho duyet
 * APPROVED          — Da duyet, co the tao phieu nhap
 * PARTIALLY_RECEIVED— Da nhap mot phan
 * FULLY_RECEIVED    — Da nhap du
 * CANCELLED         — Da huy
 * REJECTED          — Bi tu choi duyet
 */
public enum PurchaseOrderStatus {
    DRAFT,
    SUBMITTED,
    /** Legacy value kept so older rows can still be read during rollout. New workflow uses SUBMITTED. */
    PENDING_APPROVAL,
    APPROVED,
    PARTIALLY_RECEIVED,
    FULLY_RECEIVED,
    /** Legacy value kept so older rows can still be read during rollout. New workflow uses FULLY_RECEIVED. */
    RECEIVED,
    CANCELLED,
    REJECTED
}
