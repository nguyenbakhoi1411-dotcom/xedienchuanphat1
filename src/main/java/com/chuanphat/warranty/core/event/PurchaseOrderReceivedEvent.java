package com.chuanphat.warranty.core.event;

public class PurchaseOrderReceivedEvent {
    private final Long orderId;

    public PurchaseOrderReceivedEvent(Long orderId) {
        this.orderId = orderId;
    }

    public Long getOrderId() {
        return orderId;
    }
}
