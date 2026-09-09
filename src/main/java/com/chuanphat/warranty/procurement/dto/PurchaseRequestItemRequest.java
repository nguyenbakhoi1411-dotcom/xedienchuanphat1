package com.chuanphat.warranty.procurement.dto;

import java.math.BigDecimal;

public record PurchaseRequestItemRequest(
    Long productId,
    String productName,
    BigDecimal quantity,
    String unit,
    BigDecimal estimatedPrice,
    String note
) {}
