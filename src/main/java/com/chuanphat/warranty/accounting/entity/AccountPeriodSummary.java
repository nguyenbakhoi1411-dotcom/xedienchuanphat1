package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "account_period_summary", 
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_aps", columnNames = {"accountingYear", "accountingMonth", "accountCode", "branchId"})
    },
    indexes = {
        @Index(name = "idx_aps_account", columnList = "accountCode, accountingYear")
    })
public class AccountPeriodSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer accountingYear;

    @Column(nullable = false)
    private Integer accountingMonth;

    @Column(nullable = false, length = 15)
    private String accountCode;

    @Column(precision = 18, scale = 2, nullable = false)
    private BigDecimal debitAmount = BigDecimal.ZERO;

    @Column(precision = 18, scale = 2, nullable = false)
    private BigDecimal creditAmount = BigDecimal.ZERO;

    private Long branchId;

    @Column(nullable = false)
    private OffsetDateTime lastUpdatedAt = OffsetDateTime.now();

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getAccountingYear() { return accountingYear; }
    public void setAccountingYear(Integer accountingYear) { this.accountingYear = accountingYear; }
    public Integer getAccountingMonth() { return accountingMonth; }
    public void setAccountingMonth(Integer accountingMonth) { this.accountingMonth = accountingMonth; }
    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
    public BigDecimal getDebitAmount() { return debitAmount; }
    public void setDebitAmount(BigDecimal debitAmount) { this.debitAmount = debitAmount; }
    public BigDecimal getCreditAmount() { return creditAmount; }
    public void setCreditAmount(BigDecimal creditAmount) { this.creditAmount = creditAmount; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public OffsetDateTime getLastUpdatedAt() { return lastUpdatedAt; }
    public void setLastUpdatedAt(OffsetDateTime lastUpdatedAt) { this.lastUpdatedAt = lastUpdatedAt; }
}
