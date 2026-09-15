package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.enums.SupplierCategory;
import jakarta.validation.constraints.NotBlank;
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
        String contactPhone,
        SupplierCategory category,
        String bankAccountNumber,
        String bankName,
        BigDecimal creditLimit,
        int paymentTermsDays,
        Short rating,
        String notes
) {}
