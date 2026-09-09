package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Dong mat hang trong phieu chuyen kho (multi-item).
 * InventoryTransfer goc chi co 1 product; entity nay mo rong thanh nhieu dong.
 */
@Entity
@Table(name = "inventory_transfer_items")
public class InventoryTransferItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transfer_id", nullable = false)
    private Long transferId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity = 1;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;

    /** Serial xe (null cho phu tung) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serial_id")
    private ProductSerial serial;

    @Column(length = 500)
    private String note;

    public Long getId() { return id; }
    public Long getTransferId() { return transferId; }
    public void setTransferId(Long transferId) { this.transferId = transferId; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost == null ? BigDecimal.ZERO : unitCost; }
    public ProductSerial getSerial() { return serial; }
    public void setSerial(ProductSerial serial) { this.serial = serial; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
