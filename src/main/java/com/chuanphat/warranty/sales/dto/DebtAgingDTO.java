package com.chuanphat.warranty.sales.dto;

import java.math.BigDecimal;

public class DebtAgingDTO {
    private Long customerId;
    private String customerName;
    private BigDecimal totalDebt;
    private BigDecimal inDue;
    private BigDecimal overdue1To30Days;
    private BigDecimal overdue31To60Days;
    private BigDecimal overdue61To90Days;
    private BigDecimal overdueOver90Days;

    public DebtAgingDTO() {}

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public BigDecimal getTotalDebt() {
        return totalDebt;
    }

    public void setTotalDebt(BigDecimal totalDebt) {
        this.totalDebt = totalDebt;
    }

    public BigDecimal getInDue() {
        return inDue;
    }

    public void setInDue(BigDecimal inDue) {
        this.inDue = inDue;
    }

    public BigDecimal getOverdue1To30Days() {
        return overdue1To30Days;
    }

    public void setOverdue1To30Days(BigDecimal overdue1To30Days) {
        this.overdue1To30Days = overdue1To30Days;
    }

    public BigDecimal getOverdue31To60Days() {
        return overdue31To60Days;
    }

    public void setOverdue31To60Days(BigDecimal overdue31To60Days) {
        this.overdue31To60Days = overdue31To60Days;
    }

    public BigDecimal getOverdue61To90Days() {
        return overdue61To90Days;
    }

    public void setOverdue61To90Days(BigDecimal overdue61To90Days) {
        this.overdue61To90Days = overdue61To90Days;
    }

    public BigDecimal getOverdueOver90Days() {
        return overdueOver90Days;
    }

    public void setOverdueOver90Days(BigDecimal overdueOver90Days) {
        this.overdueOver90Days = overdueOver90Days;
    }
}
