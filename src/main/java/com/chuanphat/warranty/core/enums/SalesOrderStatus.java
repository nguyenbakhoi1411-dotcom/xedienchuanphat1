package com.chuanphat.warranty.core.enums;

public enum SalesOrderStatus {
    DRAFT,
    /** Don dang cho quan ly duyet giam gia (discount > nguong cho phep). */
    WAITING_DISCOUNT_APPROVAL,
    /** Don dang cho duyet vi cong no du kien vuot han muc tin dung cua khach. */
    WAITING_CREDIT_APPROVAL,
    CONFIRMED,
    PARTIALLY_PAID,
    PAID,
    DELIVERED,
    CANCELLED,
    RETURNED
}
