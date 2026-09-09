package com.chuanphat.warranty.cash.dto;

import java.math.BigDecimal;

public record CashBalanceResponse(
    BigDecimal currentBalance,
    BigDecimal todayReceipt,
    BigDecimal todayPayment
) {}
