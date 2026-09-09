package com.chuanphat.warranty.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "sales_order_items")
public class SalesOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private SalesOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Optional override for multi-warehouse sales
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serial_id")
    private ProductSerial serial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private ProductBatch batch;

    // Removed duplicate warehouse

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int returnedQuantity = 0;

    @Column(precision = 10, scale = 2)
    private BigDecimal quantitySold = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal quantityIssued = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal unitPrice;

    @Column(precision = 14, scale = 2)
    private BigDecimal listPrice;

    private Long pricePolicyId;

    @Column(length = 60)
    private String pricePolicyCode;

    @Column(length = 160)
    private String pricePolicyName;

    @Column(precision = 14, scale = 2)
    private BigDecimal policyDiscountAmount = BigDecimal.ZERO;

    @Column(name = "is_promotional_item")
    private Boolean isPromotionalItem = false;

    @Column(name = "has_commercial_discount")
    private Boolean hasCommercialDiscount = false;

    @Column(name = "commercial_discount_rate", precision = 5, scale = 2)
    private BigDecimal commercialDiscountRate = BigDecimal.ZERO;

    @Column(name = "commercial_discount_amount", precision = 14, scale = 2)
    private BigDecimal commercialDiscountAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal lineTotal;

    @Column(precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(length = 100)
    private String controlPlate;

    @Column(nullable = false)
    private boolean isDepositRow = false;

    public Long getId() { return id; }
    public SalesOrder getOrder() { return order; }
    public void setOrder(SalesOrder order) { this.order = order; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public ProductSerial getSerial() { return serial; }
    public void setSerial(ProductSerial serial) { this.serial = serial; }
    public ProductBatch getBatch() { return batch; }
    public void setBatch(ProductBatch batch) { this.batch = batch; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public int getReturnedQuantity() { return returnedQuantity; }
    public void setReturnedQuantity(int returnedQuantity) { this.returnedQuantity = returnedQuantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getListPrice() { return listPrice; }
    public void setListPrice(BigDecimal listPrice) { this.listPrice = listPrice; }
    public Long getPricePolicyId() { return pricePolicyId; }
    public void setPricePolicyId(Long pricePolicyId) { this.pricePolicyId = pricePolicyId; }
    public String getPricePolicyCode() { return pricePolicyCode; }
    public void setPricePolicyCode(String pricePolicyCode) { this.pricePolicyCode = pricePolicyCode; }
    public String getPricePolicyName() { return pricePolicyName; }
    public void setPricePolicyName(String pricePolicyName) { this.pricePolicyName = pricePolicyName; }
    public BigDecimal getPolicyDiscountAmount() { return policyDiscountAmount; }
    public void setPolicyDiscountAmount(BigDecimal policyDiscountAmount) { this.policyDiscountAmount = policyDiscountAmount == null ? BigDecimal.ZERO : policyDiscountAmount; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public Boolean getIsPromotionalItem() { return isPromotionalItem; }
    public void setIsPromotionalItem(Boolean isPromotionalItem) { this.isPromotionalItem = isPromotionalItem; }
    public Boolean getHasCommercialDiscount() { return hasCommercialDiscount; }
    public void setHasCommercialDiscount(Boolean hasCommercialDiscount) { this.hasCommercialDiscount = hasCommercialDiscount; }
    public BigDecimal getCommercialDiscountRate() { return commercialDiscountRate; }
    public void setCommercialDiscountRate(BigDecimal commercialDiscountRate) { this.commercialDiscountRate = commercialDiscountRate; }
    public BigDecimal getCommercialDiscountAmount() { return commercialDiscountAmount; }
    public void setCommercialDiscountAmount(BigDecimal commercialDiscountAmount) { this.commercialDiscountAmount = commercialDiscountAmount; }
    
    public BigDecimal getQuantitySold() { return quantitySold; }
    public void setQuantitySold(BigDecimal quantitySold) { this.quantitySold = quantitySold; }
    public BigDecimal getQuantityIssued() { return quantityIssued; }
    public void setQuantityIssued(BigDecimal quantityIssued) { this.quantityIssued = quantityIssued; }
    public String getControlPlate() { return controlPlate; }
    public void setControlPlate(String controlPlate) { this.controlPlate = controlPlate; }
    public boolean isDepositRow() { return isDepositRow; }
    public void setDepositRow(boolean isDepositRow) { this.isDepositRow = isDepositRow; }
}
