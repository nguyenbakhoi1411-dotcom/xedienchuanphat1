package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.enums.SalesReturnDisposition;
import jakarta.validation.constraints.NotNull;

public record ApproveSalesReturnRequest(
        @NotNull SalesReturnDisposition disposition,
        String note
) {
}
