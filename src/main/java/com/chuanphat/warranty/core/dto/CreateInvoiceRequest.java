package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.enums.InvoiceStatus;

public record CreateInvoiceRequest(
        InvoiceStatus status,
        String templateCode
) {
}
