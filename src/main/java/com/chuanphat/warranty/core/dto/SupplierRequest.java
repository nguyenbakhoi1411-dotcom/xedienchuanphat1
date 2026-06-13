package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SupplierRequest(
        @NotBlank String code,
        @NotBlank String name,
        Long groupId,
        String taxCode,
        String phone,
        String email,
        String website,
        String address,
        String contactPerson,
        BigDecimal creditLimit,
        int paymentTermsDays,
        Short rating,
        String notes
) {}
