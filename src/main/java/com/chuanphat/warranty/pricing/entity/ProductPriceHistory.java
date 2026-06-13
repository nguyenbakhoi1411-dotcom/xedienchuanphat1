package com.chuanphat.warranty.pricing.entity;

import com.chuanphat.warranty.pricing.enums.PriceHistorySourceType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "product_price_history")
public class ProductPriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long productId;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal oldBasePrice = BigDecimal.ZERO;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal newBasePrice = BigDecimal.ZERO;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal oldSellingPrice = BigDecimal.ZERO;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal newSellingPrice = BigDecimal.ZERO;
    @Column(length = 500)
    private String reason;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PriceHistorySourceType sourceType;
    private Long sourceId;
    @Column(nullable = false, length = 120)
    private String changedBy;
    @Column(nullable = false)
    private OffsetDateTime changedAt = OffsetDateTime.now();
    private Long branchId;
    @Column(length = 1000)
    private String note;

    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public BigDecimal getOldBasePrice() { return oldBasePrice; }
    public void setOldBasePrice(BigDecimal oldBasePrice) { this.oldBasePrice = oldBasePrice == null ? BigDecimal.ZERO : oldBasePrice; }
    public BigDecimal getNewBasePrice() { return newBasePrice; }
    public void setNewBasePrice(BigDecimal newBasePrice) { this.newBasePrice = newBasePrice == null ? BigDecimal.ZERO : newBasePrice; }
    public BigDecimal getOldSellingPrice() { return oldSellingPrice; }
    public void setOldSellingPrice(BigDecimal oldSellingPrice) { this.oldSellingPrice = oldSellingPrice == null ? BigDecimal.ZERO : oldSellingPrice; }
    public BigDecimal getNewSellingPrice() { return newSellingPrice; }
    public void setNewSellingPrice(BigDecimal newSellingPrice) { this.newSellingPrice = newSellingPrice == null ? BigDecimal.ZERO : newSellingPrice; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public PriceHistorySourceType getSourceType() { return sourceType; }
    public void setSourceType(PriceHistorySourceType sourceType) { this.sourceType = sourceType; }
    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }
    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
    public OffsetDateTime getChangedAt() { return changedAt; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
