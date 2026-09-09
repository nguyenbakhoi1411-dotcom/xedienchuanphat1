package com.chuanphat.warranty.core.event;

public class SalesOrderDeliveredEvent {
    private final Long orderId;

    public SalesOrderDeliveredEvent(Long orderId) {
        this.orderId = orderId;
    }

    public Long getOrderId() {
        return orderId;
    }
}
