package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.enums.ReturnSerialDisposition;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateSalesReturnItemRequest(
        @NotNull Long orderItemId,
        @Min(1) int quantity,
        ReturnSerialDisposition serialDisposition
) {
}
