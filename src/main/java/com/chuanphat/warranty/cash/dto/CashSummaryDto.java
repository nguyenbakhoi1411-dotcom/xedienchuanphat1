package com.chuanphat.warranty.cash.dto;

import java.math.BigDecimal;

public record CashSummaryDto(
        BigDecimal tonQuyDauNgay,
        BigDecimal tongThuTrongNgay,
        BigDecimal tongChiTrongNgay,
        BigDecimal tonQuyHienTai,
        boolean isAmQuy
) {}
