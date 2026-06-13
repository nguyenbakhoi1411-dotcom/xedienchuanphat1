package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO de tao moi mot serial xe.
 * Dung khi nhap hang: moi xe co mot serial rieng biet.
 */
public record CreateSerialRequest(
        @NotNull Long productId,
        @NotBlank String serialNumber,
        @NotNull Long branchId,
        Long warehouseId,
        String frameNumber,        // So khung — unique
        String engineNumber,       // So may
        String batterySerial,      // So pin
        String motorSerial,        // So motor
        String chargerNumber,      // So bo sac
        String color,
        String version,
        LocalDate importDate,
        Long supplierId,
        BigDecimal purchaseCost,
        String note
) {}
