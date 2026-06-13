package com.chuanphat.warranty.core.dto;

import java.math.BigDecimal;

public record VoucherPreviewResponse(
        String voucherCode,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        String message
) {
}
