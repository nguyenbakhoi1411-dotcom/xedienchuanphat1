package com.chuanphat.warranty.cash.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CashBookResponse(
    String voucherNo,
    LocalDate voucherDate,
    String description,
    String objectName,
    BigDecimal debit,
    BigDecimal credit,
    BigDecimal runningBalance
) {}
