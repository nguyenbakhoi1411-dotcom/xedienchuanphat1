package com.chuanphat.warranty.crm.dto;

import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.crm.entity.CrmAlert;
import com.chuanphat.warranty.crm.entity.CrmCareTask;
import com.chuanphat.warranty.crm.entity.CustomerCareNote;
import com.chuanphat.warranty.crm.entity.Lead;
import com.chuanphat.warranty.crm.entity.SalesOpportunity;
import com.chuanphat.warranty.crm.enums.*;
import com.chuanphat.warranty.entity.ServiceTicket;
import com.chuanphat.warranty.entity.Warranty;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public final class CrmDtos {
    private CrmDtos() {}

    // ── Lead ──────────────────────────────────────────────────────

    public record LeadRequest(
            @NotBlank String leadName,
            @NotBlank String phone,
            String email,
            @NotNull LeadSource source,
            String interestedProduct,
            Long assignedTo,
            Long branchId,
            LocalDate nextFollowUpDate,
            BigDecimal expectedValue,
            LeadStatus status,
            String lostReason,
            String note
    ) {}

    public record LeadResponse(
            Long id,
            String leadName,
            String phone,
            String email,
            LeadSource source,
            String interestedProduct,
            Long assignedTo,
            Long branchId,
            LocalDate nextFollowUpDate,
            BigDecimal expectedValue,
            LeadStatus status,
            String statusLabel,
            String lostReason,
            String note,
            Long convertedCustomerId,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt
    ) {
        public static LeadResponse from(Lead lead) {
            return new LeadResponse(
                    lead.getId(), lead.getLeadName(), lead.getPhone(), lead.getEmail(),
                    lead.getSource(), lead.getInterestedProduct(), lead.getAssignedTo(),
                    lead.getBranchId(), lead.getNextFollowUpDate(), lead.getExpectedValue(),
                    lead.getStatus(), statusLabel(lead.getStatus()),
                    lead.getLostReason(), lead.getNote(),
                    lead.getConvertedCustomerId(), lead.getCreatedAt(), lead.getUpdatedAt()
            );
        }

        private static String statusLabel(LeadStatus s) {
            return switch (s) {
                case NEW       -> "Mới";
                case CONTACTED -> "Đã liên hệ";
                case CONSULTING -> "Đang tư vấn";
                case QUOTED    -> "Đã báo giá";
                case DEPOSITED -> "Đã đặt cọc";
                case WON       -> "Chốt thành công";
                case LOST      -> "Thất bại";
                case CONVERTED -> "Đã chuyển đổi";
            };
        }
    }

    public record LeadAdvanceRequest(LeadStatus targetStatus, String reason) {}

    public record ConvertLeadRequest(Long branchId, Long assignedTo, String email, String address) {}

    // ── Customer ──────────────────────────────────────────────────

    public record CustomerSummary(
            Long id, String customerCode, String phone, String fullName,
            String email, String source, Long branchId, CustomerTier tier, CustomerRank rank,
            int score, BigDecimal totalDebt, BigDecimal lifetimeValue,
            LocalDate lastPurchaseDate, LocalDate lastCareDate, String birthday, OffsetDateTime createdAt
    ) {
        public static CustomerSummary from(Customer c) {
            return new CustomerSummary(c.getId(), c.getCustomerCode(), c.getPhone(), c.getFullName(),
                    c.getEmail(), c.getSource(), c.getBranchId(), c.getTier(), c.getRank(),
                    c.getScore(), c.getTotalDebt(), c.getLifetimeValue(),
                    c.getLastPurchaseDate(), c.getLastCareDate(), c.getBirthday(), c.getCreatedAt());
        }
    }

    // ── Customer 360 ──────────────────────────────────────────────

    public record Customer360Response(
            Long id, String customerCode, String phone, String fullName,
            String email, String address, String source,
            Long branchId, Long assignedTo, Long customerGroupId,
            String birthday, CustomerTier tier, CustomerRank rank, int score,
            BigDecimal totalSpent, BigDecimal debtAmount, boolean overdueDebtWarning,
            List<PurchaseHistoryResponse> purchases,
            List<PaymentHistoryResponse> payments,
            List<WarrantyHistoryResponse> warranties,
            List<RepairHistoryResponse> repairs,
            List<CareNoteResponse> notes,
            List<CareTaskResponse> reminders,
            List<String> usedVouchers,
            List<OpportunityResponse> opportunities,
            List<VehicleSerialResponse> vehicles,
            List<QuotationSummaryResponse> quotations,
            List<DepositSummaryResponse> deposits,
            List<AlertResponse> alerts,
            List<TimelineEvent> timeline,
            OffsetDateTime createdAt
    ) {
        public static Customer360Response of(
                Customer customer,
                BigDecimal totalSpent, BigDecimal debtAmount, boolean overdueDebtWarning,
                List<PurchaseHistoryResponse> purchases,
                List<PaymentHistoryResponse> payments,
                List<WarrantyHistoryResponse> warranties,
                List<RepairHistoryResponse> repairs,
                List<CareNoteResponse> notes,
                List<CareTaskResponse> reminders,
                List<String> usedVouchers,
                List<OpportunityResponse> opportunities,
                List<VehicleSerialResponse> vehicles,
                List<QuotationSummaryResponse> quotations,
                List<DepositSummaryResponse> deposits,
                List<AlertResponse> alerts,
                List<TimelineEvent> timeline
        ) {
            return new Customer360Response(
                    customer.getId(), customer.getCustomerCode(), customer.getPhone(), customer.getFullName(),
                    customer.getEmail(), customer.getAddress(), customer.getSource(),
                    customer.getBranchId(), customer.getAssignedTo(), customer.getCustomerGroupId(),
                    customer.getBirthday(), customer.getTier(), customer.getRank(), customer.getScore(),
                    totalSpent, debtAmount, overdueDebtWarning,
                    purchases, payments, warranties, repairs, notes, reminders,
                    usedVouchers, opportunities, vehicles, quotations, deposits, alerts, timeline,
                    customer.getCreatedAt()
            );
        }
    }

    // ── Timeline ──────────────────────────────────────────────────

    public record TimelineEvent(
            String type,        // ORDER | QUOTATION | DEPOSIT | VEHICLE_SOLD | WARRANTY | REPAIR | CARE_NOTE
            String title,
            String detail,
            OffsetDateTime occurredAt,
            Long referenceId
    ) {}

    // ── Vehicle Serial ────────────────────────────────────────────

    public record VehicleSerialResponse(
            Long id, String serialNumber, String frameNumber, String engineNumber,
            String batterySerial, String productName, String status,
            LocalDate soldDate, LocalDate warrantyStartDate, LocalDate warrantyEndDate
    ) {
        public static VehicleSerialResponse from(ProductSerial s) {
            return new VehicleSerialResponse(
                    s.getId(), s.getSerialNumber(), s.getFrameNumber(), s.getEngineNumber(),
                    s.getBatterySerial(),
                    s.getProduct() != null ? s.getProduct().getProductName() : null,
                    s.getStatus().name(), s.getSoldDate(),
                    s.getWarrantyStartDate(), s.getWarrantyEndDate()
            );
        }
    }

    // ── Quotation Summary ─────────────────────────────────────────

    public record QuotationSummaryResponse(
            Long id, String quotationNo, LocalDate quotationDate,
            LocalDate validUntil, String status, BigDecimal totalAmount
    ) {
        public static QuotationSummaryResponse from(Quotation q) {
            return new QuotationSummaryResponse(
                    q.getId(), q.getQuotationNo(), q.getQuotationDate(),
                    q.getValidUntil(), q.getStatus().name(), q.getTotalAmount()
            );
        }
    }

    // ── Deposit Summary ───────────────────────────────────────────

    public record DepositSummaryResponse(
            Long id, String depositCode, BigDecimal depositAmount,
            String status, String note, OffsetDateTime createdAt
    ) {
        public static DepositSummaryResponse from(Deposit d) {
            return new DepositSummaryResponse(
                    d.getId(), d.getDepositCode(), d.getAmount(),
                    d.getStatus(), d.getNote(), d.getCreatedAt()
            );
        }
    }


    // ── Alert ─────────────────────────────────────────────────────

    public record AlertResponse(
            Long id, String alertType, Long customerId, Long leadId,
            String title, String detail, String severity, OffsetDateTime createdAt
    ) {
        public static AlertResponse from(CrmAlert a) {
            return new AlertResponse(a.getId(), a.getAlertType(), a.getCustomerId(), a.getLeadId(),
                    a.getTitle(), a.getDetail(), a.getSeverity(), a.getCreatedAt());
        }
    }

    // ── Existing DTOs (kept unchanged) ────────────────────────────

    public record OpportunityRequest(
            Long customerId, Long leadId, @NotNull BigDecimal expectedValue,
            LocalDate expectedCloseDate, OpportunityStage stage,
            @Min(0) @Max(100) Integer probability, Long assignedTo
    ) {}

    public record OpportunityResponse(
            Long id, Long customerId, Long leadId, BigDecimal expectedValue,
            LocalDate expectedCloseDate, OpportunityStage stage, int probability,
            Long assignedTo, OffsetDateTime createdAt, OffsetDateTime updatedAt
    ) {
        public static OpportunityResponse from(SalesOpportunity o) {
            return new OpportunityResponse(o.getId(), o.getCustomerId(), o.getLeadId(),
                    o.getExpectedValue(), o.getExpectedCloseDate(), o.getStage(), o.getProbability(),
                    o.getAssignedTo(), o.getCreatedAt(), o.getUpdatedAt());
        }
    }

    public record CareTaskRequest(Long customerId, Long leadId, @NotBlank String title,
            String content, CrmTaskType type, CrmTaskStatus status,
            LocalDate dueDate, Long assignedTo) {}

    public record TaskStatusRequest(@NotNull CrmTaskStatus status) {}

    public record CareTaskResponse(Long id, Long customerId, Long leadId, String title,
            String content, CrmTaskType type, CrmTaskStatus status,
            LocalDate dueDate, Long assignedTo, OffsetDateTime createdAt, OffsetDateTime completedAt) {
        public static CareTaskResponse from(CrmCareTask task) {
            return new CareTaskResponse(task.getId(), task.getCustomerId(), task.getLeadId(),
                    task.getTitle(), task.getContent(), task.getType(), task.getStatus(),
                    task.getDueDate(), task.getAssignedTo(), task.getCreatedAt(), task.getCompletedAt());
        }
    }

    public record CareNoteRequest(@NotBlank String content, String createdBy) {}

    public record CareNoteResponse(Long id, Long customerId, String content, String createdBy, OffsetDateTime createdAt) {
        public static CareNoteResponse from(CustomerCareNote note) {
            return new CareNoteResponse(note.getId(), note.getCustomerId(), note.getContent(),
                    note.getCreatedBy(), note.getCreatedAt());
        }
    }

    public record PurchaseHistoryResponse(Long id, String orderNo, LocalDate orderDate,
            BigDecimal totalAmount, BigDecimal paidAmount, String paymentStatus, String voucherCode) {
        public static PurchaseHistoryResponse from(SalesOrder order) {
            return new PurchaseHistoryResponse(order.getId(), order.getOrderNo(), order.getOrderDate(),
                    order.getTotalAmount(), order.getPaidAmount(), order.getPaymentStatus().name(), order.getVoucherCode());
        }
    }

    public record PaymentHistoryResponse(Long id, String orderNo, LocalDate paymentDate,
            BigDecimal amount, String paymentMethod, String referenceNo) {
        public static PaymentHistoryResponse from(SalesPayment p) {
            return new PaymentHistoryResponse(p.getId(), p.getOrder().getOrderNo(), p.getPaymentDate(),
                    p.getAmount(), p.getPaymentMethod().name(), p.getReferenceNo());
        }
    }

    public record WarrantyHistoryResponse(Long id, String serialNumber, String invoiceNo,
            LocalDate startDate, LocalDate endDate, String status) {
        public static WarrantyHistoryResponse from(Warranty w) {
            return new WarrantyHistoryResponse(w.getId(), w.getSerialNumber(), w.getInvoiceNo(),
                    w.getStartDate(), w.getEndDate(), w.getStatus().name());
        }
    }

    public record RepairHistoryResponse(Long id, String serialNumber, String issueDescription,
            String status, BigDecimal totalCost, OffsetDateTime createdAt) {
        public static RepairHistoryResponse from(ServiceTicket t) {
            return new RepairHistoryResponse(t.getId(), t.getSerialNumber(), t.getIssueDescription(),
                    t.getStatus().name(), t.getTotalCost(), t.getCreatedAt());
        }
    }

    public record SourceMetricResponse(String source, long leads, long customers, BigDecimal revenue) {}
    public record MonthlyNewCustomersResponse(String month, long total) {}
    public record TopCustomerResponse(Long customerId, String fullName, String phone,
            BigDecimal totalSpent, CustomerTier tier) {}
    public record StaleCustomerResponse(Long customerId, String fullName, String phone,
            OffsetDateTime lastCareAt, long daysWithoutCare) {}
    public record CrmReportResponse(List<MonthlyNewCustomersResponse> newCustomersByMonth,
            List<SourceMetricResponse> sourceEffectiveness, double leadConversionRate,
            List<SourceMetricResponse> revenueBySource, List<TopCustomerResponse> topCustomers,
            List<StaleCustomerResponse> staleCustomers, long overdueTaskCount) {}
}
