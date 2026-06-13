package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * FixedAssetDepreciation — Bút toán khấu hao tháng cho từng TSCĐ.
 * Có ràng buộc UNIQUE (asset_id, year, month) để đảm bảo idempotency.
 */
@Entity
@Table(name = "fixed_asset_depreciation",
       uniqueConstraints = @UniqueConstraint(columnNames = {"asset_id", "depreciation_year", "depreciation_month"}))
public class FixedAssetDepreciation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private FixedAsset asset;

    @Column(name = "depreciation_month", nullable = false)
    private Integer depreciationMonth;

    @Column(name = "depreciation_year", nullable = false)
    private Integer depreciationYear;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    /** ID bút toán kế toán được sinh ra */
    private Long journalEntryId;

    @Column(nullable = false, length = 120)
    private String createdBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // Getters & Setters
    public Long getId() { return id; }
    public FixedAsset getAsset() { return asset; }
    public void setAsset(FixedAsset asset) { this.asset = asset; }
    public Integer getDepreciationMonth() { return depreciationMonth; }
    public void setDepreciationMonth(Integer depreciationMonth) { this.depreciationMonth = depreciationMonth; }
    public Integer getDepreciationYear() { return depreciationYear; }
    public void setDepreciationYear(Integer depreciationYear) { this.depreciationYear = depreciationYear; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Long getJournalEntryId() { return journalEntryId; }
    public void setJournalEntryId(Long journalEntryId) { this.journalEntryId = journalEntryId; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
