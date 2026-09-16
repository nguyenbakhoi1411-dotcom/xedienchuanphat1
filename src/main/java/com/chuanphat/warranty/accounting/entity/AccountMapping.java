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
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;

@Entity
@Table(name = "account_mappings", uniqueConstraints = @UniqueConstraint(columnNames = "transaction_type"))
public class AccountMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 50)
    private AccountMappingTransactionType transactionType;

    @Column(name = "account_code", nullable = false, length = 30)
    private String accountCode;

    @Column(name = "updated_by", nullable = false, length = 120)
    private String updatedBy = "system";

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public AccountMapping() {
    }

    public AccountMapping(AccountMappingTransactionType transactionType, String accountCode, String updatedBy) {
        this.transactionType = transactionType;
        updateAccountCode(accountCode, updatedBy);
    }

    public Long getId() { return id; }
    public AccountMappingTransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(AccountMappingTransactionType transactionType) { this.transactionType = transactionType; }
    public String getAccountCode() { return accountCode; }
    public String getUpdatedBy() { return updatedBy; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public void updateAccountCode(String accountCode, String updatedBy) {
        this.accountCode = accountCode;
        this.updatedBy = updatedBy == null || updatedBy.isBlank() ? "system" : updatedBy;
        this.updatedAt = OffsetDateTime.now();
    }
}
