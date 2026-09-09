package com.chuanphat.warranty.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "debt_collection_batches")
public class DebtCollectionBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_code", nullable = false, unique = true, length = 30)
    private String batchCode;

    @Column(name = "batch_name", length = 255)
    private String batchName;

    @Column(name = "creation_date", nullable = false)
    private LocalDate creationDate;

    @Column(name = "collection_deadline")
    private LocalDate collectionDeadline;

    @Column(name = "total_debt", precision = 18, scale = 2)
    private BigDecimal totalDebt = BigDecimal.ZERO;

    @Column(name = "collected_amount", precision = 18, scale = 2)
    private BigDecimal collectedAmount = BigDecimal.ZERO;

    @Column(name = "remaining_amount", precision = 18, scale = 2)
    private BigDecimal remainingAmount = BigDecimal.ZERO;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "status", length = 20)
    private String status = "OPEN";

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "created_by", length = 255)
    private String createdBy;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String batchCode) { this.batchCode = batchCode; }

    public String getBatchName() { return batchName; }
    public void setBatchName(String batchName) { this.batchName = batchName; }

    public LocalDate getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDate creationDate) { this.creationDate = creationDate; }

    public LocalDate getCollectionDeadline() { return collectionDeadline; }
    public void setCollectionDeadline(LocalDate collectionDeadline) { this.collectionDeadline = collectionDeadline; }

    public BigDecimal getTotalDebt() { return totalDebt; }
    public void setTotalDebt(BigDecimal totalDebt) { this.totalDebt = totalDebt; }

    public BigDecimal getCollectedAmount() { return collectedAmount; }
    public void setCollectedAmount(BigDecimal collectedAmount) { this.collectedAmount = collectedAmount; }

    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
