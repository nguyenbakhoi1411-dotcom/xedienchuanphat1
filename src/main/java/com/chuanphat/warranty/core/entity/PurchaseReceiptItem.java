package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Dong hang trong phieu nhap kho.
 *
 * Xe dien: quantity = 1, frameNumber/engineNumber/batterySerial bat buoc.
 * Phu tung: quantity >= 1, serial fields co the null.
 */
@Entity
@Table(name = "purchase_receipt_items")
public class PurchaseReceiptItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id", nullable = false)
    private PurchaseReceipt receipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity = 1;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal lineTotal = BigDecimal.ZERO;

    /** So khung xe dien — bat buoc khi product.category = ELECTRIC_MOTORBIKE */
    @Column(length = 80)
    private String frameNumber;

    /** So may xe dien */
    @Column(length = 80)
    private String engineNumber;

    /** So pin xe dien */
    @Column(length = 80)
    private String batterySerial;

    /** Serial xe tao ra sau khi confirm (de trace) */
    @Column(length = 80)
    private String serialNumber;

    @Column(length = 500)
    private String note;

    public Long getId() { return id; }
    public PurchaseReceipt getReceipt() { return receipt; }
    public void setReceipt(PurchaseReceipt receipt) { this.receipt = receipt; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost == null ? BigDecimal.ZERO : unitCost; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
    public String getFrameNumber() { return frameNumber; }
    public void setFrameNumber(String frameNumber) { this.frameNumber = frameNumber; }
    public String getEngineNumber() { return engineNumber; }
    public void setEngineNumber(String engineNumber) { this.engineNumber = engineNumber; }
    public String getBatterySerial() { return batterySerial; }
    public void setBatterySerial(String batterySerial) { this.batterySerial = batterySerial; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
