package com.chuanphat.warranty.accounting.entity;

import com.chuanphat.warranty.accounting.enums.AccountMappingTransactionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "account_mapping_history")
public class AccountMappingHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 50)
    private AccountMappingTransactionType transactionType;

    @Column(name = "old_account_code", length = 30)
    private String oldAccountCode;

    @Column(name = "new_account_code", nullable = false, length = 30)
    private String newAccountCode;

    @Column(name = "changed_by", nullable = false, length = 120)
    private String changedBy;

    @Column(name = "changed_at", nullable = false)
    private OffsetDateTime changedAt = OffsetDateTime.now();

    protected AccountMappingHistory() {
    }

    public AccountMappingHistory(AccountMappingTransactionType transactionType, String oldAccountCode, String newAccountCode, String changedBy) {
        this.transactionType = transactionType;
        this.oldAccountCode = oldAccountCode;
        this.newAccountCode = newAccountCode;
        this.changedBy = changedBy == null || changedBy.isBlank() ? "system" : changedBy;
    }

    public Long getId() { return id; }
    public AccountMappingTransactionType getTransactionType() { return transactionType; }
    public String getOldAccountCode() { return oldAccountCode; }
    public String getNewAccountCode() { return newAccountCode; }
    public String getChangedBy() { return changedBy; }
    public OffsetDateTime getChangedAt() { return changedAt; }
}
