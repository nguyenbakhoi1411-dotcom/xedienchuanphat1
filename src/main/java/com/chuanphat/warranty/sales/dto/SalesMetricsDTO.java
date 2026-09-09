package com.chuanphat.warranty.sales.dto;

import java.math.BigDecimal;

public class SalesMetricsDTO {
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal remainingDebt;

    public SalesMetricsDTO() {}

    public SalesMetricsDTO(Long totalOrders, BigDecimal totalRevenue, BigDecimal remainingDebt) {
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.remainingDebt = remainingDebt;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getRemainingDebt() {
        return remainingDebt;
    }

    public void setRemainingDebt(BigDecimal remainingDebt) {
        this.remainingDebt = remainingDebt;
    }
}
