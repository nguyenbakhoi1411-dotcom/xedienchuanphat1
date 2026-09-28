package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejectInventoryTransferRequest(
        @NotBlank @Size(max = 500) String reason
) {
}
