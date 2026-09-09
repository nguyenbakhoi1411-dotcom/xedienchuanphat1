package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
public record ARAgingResponse(
    Long customerId, String customerCode, String customerName,
    String address, String taxCode, String customerGroup,
    BigDecimal amountByInvoice, BigDecimal advanceReceived, BigDecimal remainingAmount,
    BigDecimal beforeDue0_30, BigDecimal beforeDue31_60, BigDecimal beforeDue61_90,
    BigDecimal beforeDue91_120, BigDecimal beforeDueOver120, BigDecimal noDue,
    BigDecimal overdue1_30, BigDecimal overdue31_60, BigDecimal overdue61_90,
    BigDecimal overdue91_120, BigDecimal overdueOver120,
    BigDecimal normalDebt, BigDecimal hardDebt, BigDecimal irrecoverableDebt
) {}
