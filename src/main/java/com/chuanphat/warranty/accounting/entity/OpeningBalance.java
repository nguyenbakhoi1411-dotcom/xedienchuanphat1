package com.chuanphat.warranty.accounting.entity;

import com.chuanphat.warranty.core.entity.Branch;
import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.Supplier;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "opening_balances")
public class OpeningBalance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "period_id", nullable = false)
    private AccountingPeriod period;

    @Column(nullable = false, length = 20)
    private String accountCode;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal debitBalance = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal creditBalance = BigDecimal.ZERO;

    @Column(length = 255)
    private String note;

    @ManyToOne
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(length = 120)
    private String createdBy;

    private OffsetDateTime lockedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AccountingPeriod getPeriod() { return period; }
    public void setPeriod(AccountingPeriod period) { this.period = period; }

    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public BigDecimal getDebitBalance() { return debitBalance; }
    public void setDebitBalance(BigDecimal debitBalance) { this.debitBalance = debitBalance; }

    public BigDecimal getCreditBalance() { return creditBalance; }
    public void setCreditBalance(BigDecimal creditBalance) { this.creditBalance = creditBalance; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public OffsetDateTime getLockedAt() { return lockedAt; }
    public void setLockedAt(OffsetDateTime lockedAt) { this.lockedAt = lockedAt; }
}
