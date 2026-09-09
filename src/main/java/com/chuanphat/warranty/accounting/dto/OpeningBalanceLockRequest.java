package com.chuanphat.warranty.accounting.dto;

import jakarta.validation.constraints.NotNull;

public record OpeningBalanceLockRequest(
        @NotNull Long periodId
) {}
