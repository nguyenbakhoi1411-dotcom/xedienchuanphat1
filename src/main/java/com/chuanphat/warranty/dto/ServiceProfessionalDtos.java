package com.chuanphat.warranty.dto;

import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.entity.RepairQuotation;
import com.chuanphat.warranty.entity.ServiceInvoice;
import com.chuanphat.warranty.entity.ServiceTicketTimeline;
import com.chuanphat.warranty.entity.WarrantyComponent;
import com.chuanphat.warranty.entity.WarrantyPolicy;
import com.chuanphat.warranty.entity.WarrantyPolicyDetail;
import com.chuanphat.warranty.enums.ComponentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public final class ServiceProfessionalDtos {
    private ServiceProfessionalDtos() {
    }

    public record WarrantyPolicyRequest(
            @NotBlank String policyName,
            @NotNull ProductCategory productCategory,
            int warrantyMonths,
            int batteryWarrantyMonths,
            int motorWarrantyMonths,
            String includedParts,
            String excludedCases,
            String laborFeePolicy,
            List<WarrantyPolicyDetailRequest> details
    ) {}

    public record WarrantyPolicyResponse(
            Long id,
            String policyName,
            ProductCategory productCategory,
            int warrantyMonths,
            int batteryWarrantyMonths,
            int motorWarrantyMonths,
            String includedParts,
            String excludedCases,
            String laborFeePolicy,
            List<WarrantyPolicyDetailResponse> details
    ) {
        public static WarrantyPolicyResponse from(WarrantyPolicy policy) {
            return from(policy, List.of());
        }

        public static WarrantyPolicyResponse from(WarrantyPolicy policy, List<WarrantyPolicyDetail> details) {
            return new WarrantyPolicyResponse(
                    policy.getId(),
                    policy.getPolicyName(),
                    policy.getProductCategory(),
                    policy.getWarrantyMonths(),
                    policy.getBatteryWarrantyMonths(),
                    policy.getMotorWarrantyMonths(),
                    policy.getIncludedParts(),
                    policy.getExcludedCases(),
                    policy.getLaborFeePolicy(),
                    details.stream().map(WarrantyPolicyDetailResponse::from).toList()
            );
        }
    }

    public record WarrantyPolicyDetailRequest(
            @NotNull Long productId,
            @NotNull ComponentType componentType,
            int warrantyMonths,
            Integer warrantyKm,
            String conditions,
            String exclusions
    ) {}

    public record WarrantyPolicyDetailResponse(
            Long id,
            Long policyId,
            Long productId,
            ComponentType componentType,
            int warrantyMonths,
            Integer warrantyKm,
            String conditions,
            String exclusions
    ) {
        public static WarrantyPolicyDetailResponse from(WarrantyPolicyDetail detail) {
            return new WarrantyPolicyDetailResponse(
                    detail.getId(),
                    detail.getPolicyId(),
                    detail.getProductId(),
                    detail.getComponentType(),
                    detail.getWarrantyMonths(),
                    detail.getWarrantyKm(),
                    detail.getConditions(),
                    detail.getExclusions()
            );
        }
    }

    public record WarrantyComponentResponse(
            Long id,
            Long warrantyId,
            Long productId,
            Long serialId,
            Long customerId,
            ComponentType componentType,
            LocalDate startDate,
            LocalDate endDate,
            Integer warrantyKm,
            String conditions,
            String exclusions,
            String status,
            boolean valid
    ) {
        public static WarrantyComponentResponse from(WarrantyComponent component, boolean valid) {
            return new WarrantyComponentResponse(
                    component.getId(),
                    component.getWarrantyId(),
                    component.getProductId(),
                    component.getSerialId(),
                    component.getCustomerId(),
                    component.getComponentType(),
                    component.getStartDate(),
                    component.getEndDate(),
                    component.getWarrantyKm(),
                    component.getConditions(),
                    component.getExclusions(),
                    component.getStatus().name(),
                    valid
            );
        }
    }

    public record DiagnosisRequest(
            String diagnosisNote,
            String predictedCause,
            String technicianDiagnosis,
            Boolean warrantyRepair,
            ComponentType componentType
    ) {}

    public record RepairQuotationRequest(String note) {}

    public record RepairQuotationResponse(
            Long id,
            String quotationNo,
            Long ticketId,
            BigDecimal partsAmount,
            BigDecimal laborAmount,
            BigDecimal totalAmount,
            String status,
            String note,
            OffsetDateTime createdAt,
            OffsetDateTime approvedAt
    ) {
        public static RepairQuotationResponse from(RepairQuotation quotation) {
            return new RepairQuotationResponse(
                    quotation.getId(),
                    quotation.getQuotationNo(),
                    quotation.getTicketId(),
                    quotation.getPartsAmount(),
                    quotation.getLaborAmount(),
                    quotation.getTotalAmount(),
                    quotation.getStatus(),
                    quotation.getNote(),
                    quotation.getCreatedAt(),
                    quotation.getApprovedAt()
            );
        }
    }

    public record ServiceInvoiceResponse(Long id, String invoiceNo, Long ticketId, BigDecimal amount, String status, OffsetDateTime createdAt) {
        public static ServiceInvoiceResponse from(ServiceInvoice invoice) {
            return new ServiceInvoiceResponse(invoice.getId(), invoice.getInvoiceNo(), invoice.getTicketId(), invoice.getAmount(), invoice.getStatus(), invoice.getCreatedAt());
        }
    }

    public record TimelineResponse(Long id, Long ticketId, String title, String description, OffsetDateTime eventTime) {
        public static TimelineResponse from(ServiceTicketTimeline timeline) {
            return new TimelineResponse(timeline.getId(), timeline.getTicketId(), timeline.getTitle(), timeline.getDescription(), timeline.getEventTime());
        }
    }

    public record ServiceReportResponse(
            List<StatusCount> ticketsByStatus,
            double averageHandlingHours,
            List<IssueCount> commonIssues,
            List<TechnicianCount> topTechnicians,
            BigDecimal warrantyCost,
            BigDecimal repairRevenue,
            List<IssueCount> topFaultyModels,
            List<IssueCount> topFaultyComponents,
            List<IssueCount> topFaultySuppliers,
            List<IssueCount> warrantyCostByMonth,
            double reworkRate
    ) {}

    public record StatusCount(String status, long total) {}

    public record IssueCount(String issue, long total) {}

    public record TechnicianCount(String technicianUsername, long total) {}
}
