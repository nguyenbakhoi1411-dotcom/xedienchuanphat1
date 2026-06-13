package com.chuanphat.warranty.dto;

import com.chuanphat.warranty.enums.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateServiceTicketRequest(
        @NotNull Long vehicleId,
        @NotBlank String serialNumber,
        Long customerId,
        Long branchId,
        @NotBlank String customerName,
        String phone,
        @NotBlank String issueDescription,
        String customerReportedIssue,
        LocalDate receivedDate,
        LocalDate expectedReturnDate,
        String beforeRepairImages,
        String vehicleReceivedImages,
        String faultImages,
        String afterRepairImages,
        String documentFiles,
        ServiceType serviceType,
        Boolean warrantyRepair
) {
}
