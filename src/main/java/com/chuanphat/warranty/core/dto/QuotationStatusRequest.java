package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.enums.QuotationStatus;
import jakarta.validation.constraints.NotNull;

public record QuotationStatusRequest(
        @NotNull QuotationStatus status
) {
}
