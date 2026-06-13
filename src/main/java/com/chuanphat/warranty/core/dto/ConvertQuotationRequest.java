package com.chuanphat.warranty.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;

public record ConvertQuotationRequest(
        @NotNull Long employeeId,
        OffsetDateTime reservationUntil,
        Boolean issueInvoice,
        @Valid List<PaymentEntryRequest> payments
) {
}
