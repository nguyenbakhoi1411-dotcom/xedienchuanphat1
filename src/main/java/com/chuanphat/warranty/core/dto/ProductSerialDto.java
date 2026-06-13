package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.enums.SerialStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Response (va request tao serial) cho ProductSerial.
 *
 * V18: them warehouseId, createdAt, lastServiceTicketNo, lastServicedAt, defectReason.
 */
public record ProductSerialDto(
        Long id,
        @NotNull Long productId,
        String productName,
        @NotBlank String serialNumber,
        @NotNull Long branchId,
        Long warehouseId,           // Id kho — null neu chua gan
        String frameNumber,
        String engineNumber,
        String batterySerial,
        String motorSerial,
        String chargerNumber,
        String color,
        String version,
        LocalDate importDate,
        Long supplierId,
        BigDecimal purchaseCost,
        SerialStatus status,
        String reservedOrderNo,
        Long reservedCustomerId,
        OffsetDateTime reservationUntil,
        Long currentCustomerId,
        LocalDate soldDate,
        LocalDate warrantyStartDate,
        LocalDate warrantyEndDate,
        String lastServiceTicketNo,   // Phieu sua chua cuoi
        LocalDate lastServicedAt,
        String defectReason,          // Ly do loi (neu DEFECTIVE/DAMAGED)
        String note,
        OffsetDateTime createdAt
) {
    public static ProductSerialDto from(ProductSerial s) {
        return new ProductSerialDto(
                s.getId(),
                s.getProduct().getId(),
                s.getProduct().getProductName(),
                s.getSerialNumber(),
                s.getBranchId(),
                s.getWarehouse() != null ? s.getWarehouse().getId() : null,
                s.getFrameNumber(),
                s.getEngineNumber(),
                s.getBatterySerial(),
                s.getMotorSerial(),
                s.getChargerNumber(),
                s.getColor(),
                s.getVersion(),
                s.getImportDate(),
                s.getSupplierId(),
                s.getPurchaseCost(),
                s.getStatus(),
                s.getReservedOrderNo(),
                s.getReservedCustomerId(),
                s.getReservationUntil(),
                s.getCurrentCustomerId(),
                s.getSoldDate(),
                s.getWarrantyStartDate(),
                s.getWarrantyEndDate(),
                s.getLastServiceTicketNo(),
                s.getLastServicedAt(),
                s.getDefectReason(),
                s.getNote(),
                s.getCreatedAt()
        );
    }
}
