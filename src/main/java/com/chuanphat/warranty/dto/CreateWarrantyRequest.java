package com.chuanphat.warranty.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateWarrantyRequest(
        @NotBlank String serialNumber,
        @NotNull Long vehicleId,
        Long policyId,
        Long customerId,
        @NotBlank String customerName,
        String invoiceNo,
        @NotNull LocalDate purchaseDate,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        LocalDate batteryEndDate,
        LocalDate motorEndDate,
        LocalDate chargerEndDate,
        String mainPartsWarranty
) {
}
