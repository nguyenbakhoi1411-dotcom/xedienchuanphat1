package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Expense — Chi phí vận hành (lương, thuê mặt bằng, điện nước, marketing...).
 * Khi POSTED: tự động sinh JournalEntry (Nợ TK chi phí / Có TK tiền/phải trả).
 */
@Entity
@Table(name = "expenses")
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String expenseCode;

    @Column(nullable = false)
    private LocalDate expenseDate;

    /**
     * SALARY | RENT | UTILITIES | MARKETING | MAINTENANCE | DEPRECIATION | OTHER
     */
    @Column(nullable = false, length = 30)
    private String category;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Long branchId;

    /** Tài khoản Nợ (VD: 641, 642, 811) */
    @Column(nullable = false, length = 20)
    private String accountCode;

    /** Tài khoản Có (VD: 111, 112, 334) — null thì dùng 111 mặc định */
    @Column(length = 20)
    private String contraAccount;

    private Long journalEntryId;

    /** DRAFT | POSTED | CANCELLED */
    @Column(nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(nullable = false, length = 120)
    private String createdBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(length = 120)
    private String postedBy;

    private OffsetDateTime postedAt;

    // Getters & Setters
    public Long getId() { return id; }
    public String getExpenseCode() { return expenseCode; }
    public void setExpenseCode(String expenseCode) { this.expenseCode = expenseCode; }
    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
    public String getContraAccount() { return contraAccount; }
    public void setContraAccount(String contraAccount) { this.contraAccount = contraAccount; }
    public Long getJournalEntryId() { return journalEntryId; }
    public void setJournalEntryId(Long journalEntryId) { this.journalEntryId = journalEntryId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }
    public OffsetDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(OffsetDateTime postedAt) { this.postedAt = postedAt; }
}
