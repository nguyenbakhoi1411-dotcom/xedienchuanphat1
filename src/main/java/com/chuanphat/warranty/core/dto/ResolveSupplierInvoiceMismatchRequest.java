package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.NotBlank;

public record ResolveSupplierInvoiceMismatchRequest(
        @NotBlank String reason
) {}
