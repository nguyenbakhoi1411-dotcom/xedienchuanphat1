package com.chuanphat.warranty.cash.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CashLedgerDto(
        BigDecimal soDuDauKy,
        BigDecimal tongThuTrongKy,
        BigDecimal tongChiTrongKy,
        BigDecimal soDuCuoiKy,
        List<LedgerRow> transactions
) {
    public record LedgerRow(
            LocalDate ngay,
            String loai,           // "RECEIPT" | "PAYMENT"
            String maChungTu,
            String dienGiai,
            BigDecimal thu,
            BigDecimal chi,
            BigDecimal soDuSauGd
    ) {}
}
