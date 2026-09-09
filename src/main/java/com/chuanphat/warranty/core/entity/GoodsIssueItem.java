package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Dong mat hang trong phieu xuat kho.
 * Xe dien: serialId bat buoc, quantity = 1.
 * Phu tung: serialId = null, quantity >= 1.
 */
@Entity
@Table(name = "goods_issue_items")
public class GoodsIssueItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private GoodsIssue goodsIssue;

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

    /** Lô hàng (dành cho thực phẩm) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private ProductBatch batch;

    @Column(length = 500)
    private String note;

    public Long getId() { return id; }
    public GoodsIssue getGoodsIssue() { return goodsIssue; }
    public void setGoodsIssue(GoodsIssue goodsIssue) { this.goodsIssue = goodsIssue; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost == null ? BigDecimal.ZERO : unitCost; }
    public ProductSerial getSerial() { return serial; }
    public void setSerial(ProductSerial serial) { this.serial = serial; }
    public ProductBatch getBatch() { return batch; }
    public void setBatch(ProductBatch batch) { this.batch = batch; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
