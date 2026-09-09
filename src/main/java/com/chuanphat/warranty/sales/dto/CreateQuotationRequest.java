package com.chuanphat.warranty.sales.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
public record CreateQuotationRequest(
    @NotNull LocalDate quotationDate,
    Long customerId, String customerCode, String customerName,
    String customerAddress, String taxCode, String contactPerson,
    String note, String paymentTerm, LocalDate validUntil, Long warehouseId,
    @NotEmpty @Valid List<QuotationLineRequest> lines
) {}
