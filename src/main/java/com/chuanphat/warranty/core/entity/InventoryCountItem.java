package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;

/**
 * Dong mat hang trong phieu kiem ke.
 * varianceQty = countedQuantity - systemQuantity (tinh toan trong app, luu DB).
 */
@Entity
@Table(name = "inventory_count_items",
       uniqueConstraints = @UniqueConstraint(columnNames = {"count_id", "product_id"}))
public class InventoryCountItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "count_id", nullable = false)
    private InventoryCount count;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Ton kho he thong tai thoi diem tao phieu */
    @Column(nullable = false)
    private int systemQuantity = 0;

    /** So luong kiem thuc te (null = chua kiem) */
    private Integer countedQuantity;

    /** Chenh lech = counted - system (am = thieu, duong = thua) */
    @Column(nullable = false)
    private int varianceQty = 0;

    /** Ly do chenh lech */
    @Column(length = 500)
    private String varianceReason;

    /** Da ap dung dieu chinh vao kho chua */
    @Column(nullable = false)
    private boolean adjustmentApplied = false;

    @Column(length = 500)
    private String note;

    public Long getId() { return id; }
    public InventoryCount getCount() { return count; }
    public void setCount(InventoryCount count) { this.count = count; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public int getSystemQuantity() { return systemQuantity; }
    public void setSystemQuantity(int systemQuantity) { this.systemQuantity = systemQuantity; }
    public Integer getCountedQuantity() { return countedQuantity; }
    public void setCountedQuantity(Integer countedQuantity) {
        this.countedQuantity = countedQuantity;
        this.varianceQty = countedQuantity == null ? 0 : countedQuantity - systemQuantity;
    }
    public int getVarianceQty() { return varianceQty; }
    public String getVarianceReason() { return varianceReason; }
    public void setVarianceReason(String varianceReason) { this.varianceReason = varianceReason; }
    public boolean isAdjustmentApplied() { return adjustmentApplied; }
    public void setAdjustmentApplied(boolean adjustmentApplied) { this.adjustmentApplied = adjustmentApplied; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
