package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.StocktakeStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "inventory_stocktakes")
public class InventoryStocktake {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String stocktakeNo;

    @Column(nullable = false)
    private LocalDate stocktakeDate;

    @Column(nullable = false)
    private Long branchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int systemQuantity;

    @Column(nullable = false)
    private int countedQuantity;

    @Column(nullable = false)
    private int varianceQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StocktakeStatus status = StocktakeStatus.PENDING_ADJUSTMENT;

    @Column(length = 500)
    private String note;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime adjustedAt;

    public Long getId() { return id; }
    public String getStocktakeNo() { return stocktakeNo; }
    public void setStocktakeNo(String stocktakeNo) { this.stocktakeNo = stocktakeNo; }
    public LocalDate getStocktakeDate() { return stocktakeDate; }
    public void setStocktakeDate(LocalDate stocktakeDate) { this.stocktakeDate = stocktakeDate; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public int getSystemQuantity() { return systemQuantity; }
    public void setSystemQuantity(int systemQuantity) { this.systemQuantity = systemQuantity; }
    public int getCountedQuantity() { return countedQuantity; }
    public void setCountedQuantity(int countedQuantity) { this.countedQuantity = countedQuantity; }
    public int getVarianceQuantity() { return varianceQuantity; }
    public void setVarianceQuantity(int varianceQuantity) { this.varianceQuantity = varianceQuantity; }
    public StocktakeStatus getStatus() { return status; }
    public void setStatus(StocktakeStatus status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getAdjustedAt() { return adjustedAt; }
    public void setAdjustedAt(OffsetDateTime adjustedAt) { this.adjustedAt = adjustedAt; }
}
