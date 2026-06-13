package com.chuanphat.warranty.dto;

import com.chuanphat.warranty.entity.ServiceTicket;
import com.chuanphat.warranty.enums.ComponentType;
import com.chuanphat.warranty.enums.ServiceType;
import com.chuanphat.warranty.enums.ServiceTicketStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record ServiceTicketResponse(
        Long id,
        String ticketNo,
        Long vehicleId,
        Long branchId,
        String serialNumber,
        Long customerId,
        String customerName,
        String phone,
        String issueDescription,
        String customerReportedIssue,
        LocalDate receivedDate,
        LocalDate expectedReturnDate,
        LocalDate actualReturnDate,
        String beforeRepairImages,
        String faultImages,
        String afterRepairImages,
        String documentFiles,
        ServiceType serviceType,
        ServiceTicketStatus status,
        String technicianUsername,
        String diagnosisNote,
        String predictedCause,
        String technicianDiagnosis,
        ComponentType componentType,
        boolean warrantyRepair,
        BigDecimal laborCost,
        BigDecimal partsCost,
        BigDecimal warrantyCost,
        BigDecimal customerPayAmount,
        BigDecimal totalCost,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OffsetDateTime approvedAt,
        OffsetDateTime returnedAt,
        List<ServiceTicketItemResponse> items
) {
    public static ServiceTicketResponse from(ServiceTicket ticket) {
        return new ServiceTicketResponse(
                ticket.getId(),
                "SC-" + String.format("%06d", ticket.getId() == null ? 0 : ticket.getId()),
                ticket.getVehicleId(),
                ticket.getBranchId(),
                ticket.getSerialNumber(),
                ticket.getCustomerId(),
                ticket.getCustomerName(),
                ticket.getCustomerPhone(),
                ticket.getIssueDescription(),
                ticket.getCustomerReportedIssue(),
                ticket.getReceivedDate(),
                ticket.getExpectedReturnDate(),
                ticket.getActualReturnDate(),
                ticket.getBeforeRepairImages(),
                ticket.getFaultImages(),
                ticket.getAfterRepairImages(),
                ticket.getDocumentFiles(),
                ticket.getServiceType(),
                ticket.getStatus(),
                ticket.getTechnicianUsername(),
                ticket.getDiagnosisNote(),
                ticket.getPredictedCause(),
                ticket.getDiagnosisNote(),
                ticket.getComponentType(),
                ticket.isWarrantyRepair(),
                ticket.getLaborCost(),
                ticket.getPartsCost(),
                ticket.getWarrantyCost(),
                ticket.getCustomerPayAmount(),
                ticket.getTotalCost(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getApprovedAt(),
                ticket.getReturnedAt(),
                ticket.getItems().stream().map(ServiceTicketItemResponse::from).toList()
        );
    }

    public static ServiceTicketResponse summary(ServiceTicket ticket) {
        return new ServiceTicketResponse(
                ticket.getId(),
                "SC-" + String.format("%06d", ticket.getId() == null ? 0 : ticket.getId()),
                ticket.getVehicleId(),
                ticket.getBranchId(),
                ticket.getSerialNumber(),
                ticket.getCustomerId(),
                ticket.getCustomerName(),
                ticket.getCustomerPhone(),
                ticket.getIssueDescription(),
                ticket.getCustomerReportedIssue(),
                ticket.getReceivedDate(),
                ticket.getExpectedReturnDate(),
                ticket.getActualReturnDate(),
                ticket.getBeforeRepairImages(),
                ticket.getFaultImages(),
                ticket.getAfterRepairImages(),
                ticket.getDocumentFiles(),
                ticket.getServiceType(),
                ticket.getStatus(),
                ticket.getTechnicianUsername(),
                ticket.getDiagnosisNote(),
                ticket.getPredictedCause(),
                ticket.getDiagnosisNote(),
                ticket.getComponentType(),
                ticket.isWarrantyRepair(),
                ticket.getLaborCost(),
                ticket.getPartsCost(),
                ticket.getWarrantyCost(),
                ticket.getCustomerPayAmount(),
                ticket.getTotalCost(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getApprovedAt(),
                ticket.getReturnedAt(),
                List.of()
        );
    }
}
