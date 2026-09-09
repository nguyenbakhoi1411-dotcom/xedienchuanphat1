package com.chuanphat.warranty.procurement.dto;

import com.chuanphat.warranty.core.enums.PurchaseRequestPriority;
import java.time.LocalDate;
import java.util.List;

public record CreatePurchaseRequestRequest(
    LocalDate prDate,
    String department,
    PurchaseRequestPriority priority,
    String reason,
    LocalDate expectedDate,
    List<PurchaseRequestItemRequest> items
) {}
