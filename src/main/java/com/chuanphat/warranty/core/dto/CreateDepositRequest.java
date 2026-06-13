package com.chuanphat.warranty.core.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request để tạo phiếu đặt cọc mới.
 */
public record CreateDepositRequest(
        Long customerId,
        Long branchId,
        Long productId,
        Long serialId,
        BigDecimal amount,
        LocalDate depositDate,
        LocalDate expiredAt,
        String paymentMethod,   // CASH | BANK_TRANSFER | MOMO
        String note
) {}
