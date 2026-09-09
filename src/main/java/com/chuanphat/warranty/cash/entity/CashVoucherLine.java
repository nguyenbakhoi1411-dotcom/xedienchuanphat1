package com.chuanphat.warranty.cash.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cash_voucher_lines")
public class CashVoucherLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    private CashVoucher cashVoucher;

    @Column(name = "line_no", nullable = false)
    private Integer lineNo;

    @Column(name = "account_code", nullable = false, length = 20)
    private String accountCode;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(length = 255)
    private String description;

    @Column(name = "cost_center_id")
    private Long costCenterId;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CashVoucher getCashVoucher() {
        return cashVoucher;
    }

    public void setCashVoucher(CashVoucher cashVoucher) {
        this.cashVoucher = cashVoucher;
    }

    public Integer getLineNo() {
        return lineNo;
    }

    public void setLineNo(Integer lineNo) {
        this.lineNo = lineNo;
    }

    public String getAccountCode() {
        return accountCode;
    }

    public void setAccountCode(String accountCode) {
        this.accountCode = accountCode;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCostCenterId() {
        return costCenterId;
    }

    public void setCostCenterId(Long costCenterId) {
        this.costCenterId = costCenterId;
    }
}
