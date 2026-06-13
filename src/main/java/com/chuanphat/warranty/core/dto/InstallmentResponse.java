package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.InstallmentApplication;
import com.chuanphat.warranty.core.enums.InstallmentStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record InstallmentResponse(
        Long id,
        Long orderId,
        String applicationNo,
        String financeCompany,
        BigDecimal downPaymentAmount,
        BigDecimal loanAmount,
        int termMonths,
        BigDecimal interestRate,
        InstallmentStatus status,
        BigDecimal disbursedAmount,
        OffsetDateTime disbursedAt,
        String note,
        OffsetDateTime createdAt
) {
    public static InstallmentResponse from(InstallmentApplication installment) {
        return new InstallmentResponse(
                installment.getId(),
                installment.getOrder().getId(),
                installment.getApplicationNo(),
                installment.getFinanceCompany(),
                installment.getDownPaymentAmount(),
                installment.getLoanAmount(),
                installment.getTermMonths(),
                installment.getInterestRate(),
                installment.getStatus(),
                installment.getDisbursedAmount(),
                installment.getDisbursedAt(),
                installment.getNote(),
                installment.getCreatedAt()
        );
    }
}
