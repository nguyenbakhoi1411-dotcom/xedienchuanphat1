package com.chuanphat.warranty.core.enums;

/**
 * Trang thai cong no phai tra.
 *
 * OPEN      — Chua thanh toan
 * PARTIAL   — Da thanh toan mot phan
 * PAID      — Da thanh toan du
 * OVERDUE   — Qua han chua tra
 * CANCELLED — Huy (tra hang, boi tru)
 */
public enum PayableStatus {
    OPEN,
    PARTIAL,
    PAID,
    OVERDUE,
    CANCELLED
}
