package com.chuanphat.warranty.procurement.dto;

import com.chuanphat.warranty.core.entity.PurchaseRequest;
import com.chuanphat.warranty.core.enums.PurchaseRequestPriority;
import com.chuanphat.warranty.core.enums.PurchaseRequestStatus;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record PurchaseRequestResponse(
    Long id,
    String prNo,
    LocalDate prDate,
    Long requestedBy,
    String requestedByName,
    String department,
    PurchaseRequestPriority priority,
    String reason,
    LocalDate expectedDate,
    PurchaseRequestStatus status,
    List<PurchaseRequestItemResponse> items,
    Long approvedBy,
    String approvedByName,
    OffsetDateTime approvedAt,
    String rejectedReason,
    Long branchId
) {
    public static PurchaseRequestResponse from(PurchaseRequest pr) {
        return new PurchaseRequestResponse(
            pr.getId(),
            pr.getPrNo(),
            pr.getPrDate(),
            pr.getRequestedBy() != null ? pr.getRequestedBy().getId() : null,
            pr.getRequestedBy() != null ? pr.getRequestedBy().getFullName() : null,
            pr.getDepartment(),
            pr.getPriority(),
            pr.getReason(),
            pr.getExpectedDate(),
            pr.getStatus(),
            pr.getItems().stream().map(PurchaseRequestItemResponse::from).collect(Collectors.toList()),
            pr.getApprovedBy() != null ? pr.getApprovedBy().getId() : null,
            pr.getApprovedBy() != null ? pr.getApprovedBy().getFullName() : null,
            pr.getApprovedAt(),
            pr.getRejectedReason(),
            pr.getBranchId()
        );
    }
}
