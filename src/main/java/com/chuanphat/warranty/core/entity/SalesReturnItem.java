package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.ReturnSerialDisposition;
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
import java.math.BigDecimal;

@Entity
@Table(name = "sales_return_items")
public class SalesReturnItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_id", nullable = false)
    private SalesReturn salesReturn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private SalesOrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serial_id")
    private ProductSerial serial;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal lineAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReturnSerialDisposition serialDisposition = ReturnSerialDisposition.RETURNED;

    public Long getId() { return id; }
    public SalesReturn getSalesReturn() { return salesReturn; }
    public void setSalesReturn(SalesReturn salesReturn) { this.salesReturn = salesReturn; }
    public SalesOrderItem getOrderItem() { return orderItem; }
    public void setOrderItem(SalesOrderItem orderItem) { this.orderItem = orderItem; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public ProductSerial getSerial() { return serial; }
    public void setSerial(ProductSerial serial) { this.serial = serial; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getLineAmount() { return lineAmount; }
    public void setLineAmount(BigDecimal lineAmount) { this.lineAmount = lineAmount; }
    public ReturnSerialDisposition getSerialDisposition() { return serialDisposition; }
    public void setSerialDisposition(ReturnSerialDisposition serialDisposition) { this.serialDisposition = serialDisposition; }
    public void setRefundPrice(java.math.BigDecimal p) { this.refundPrice = p; }
    public java.math.BigDecimal getRefundPrice() { return refundPrice; }
    public void setReason(String r) { this.reason = r; }
    public java.math.BigDecimal getTotalRefund() { return totalRefund; }
    private java.math.BigDecimal refundPrice;
    private String reason;
    private java.math.BigDecimal totalRefund;

    public void setTotalRefund(java.math.BigDecimal p) { this.totalRefund = p; }
}



