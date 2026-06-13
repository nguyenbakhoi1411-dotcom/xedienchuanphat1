package com.chuanphat.warranty.dto;

import com.chuanphat.warranty.entity.Warranty;
import com.chuanphat.warranty.enums.WarrantyStatus;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record WarrantyResponse(
        Long id,
        String serialNumber,
        Long vehicleId,
        Long policyId,
        Long customerId,
        String customerName,
        String invoiceNo,
        LocalDate purchaseDate,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate batteryEndDate,
        LocalDate motorEndDate,
        LocalDate chargerEndDate,
        String mainPartsWarranty,
        WarrantyStatus status,
        boolean valid,
        OffsetDateTime createdAt,
        List<ServiceProfessionalDtos.WarrantyComponentResponse> components
) {
    public static WarrantyResponse from(Warranty warranty, boolean valid) {
        return from(warranty, valid, List.of());
    }

    public static WarrantyResponse from(Warranty warranty, boolean valid, List<ServiceProfessionalDtos.WarrantyComponentResponse> components) {
        return new WarrantyResponse(
                warranty.getId(),
                warranty.getSerialNumber(),
                warranty.getVehicleId(),
                warranty.getPolicyId(),
                warranty.getCustomerId(),
                warranty.getCustomerName(),
                warranty.getInvoiceNo(),
                warranty.getPurchaseDate(),
                warranty.getStartDate(),
                warranty.getEndDate(),
                warranty.getBatteryEndDate(),
                warranty.getMotorEndDate(),
                warranty.getChargerEndDate(),
                warranty.getMainPartsWarranty(),
                warranty.getStatus(),
                valid,
                warranty.getCreatedAt(),
                components
        );
    }
}
