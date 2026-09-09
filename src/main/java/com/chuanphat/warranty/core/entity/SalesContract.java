package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_contracts")
public class SalesContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_no", unique = true, length = 50)
    private String contractNo;

    @Column(name = "contract_date")
    private LocalDate contractDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private SalesOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "status", length = 50)
    private String status = "Chưa thực hiện";

    @Column(name = "delivery_status", length = 50)
    private String deliveryStatus = "Chưa giao";

    @Column(name = "project_name")
    private String projectName;

    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "liquidated_amount", precision = 18, scale = 2)
    private BigDecimal liquidatedAmount = BigDecimal.ZERO;

    @Column(name = "liquidation_date")
    private LocalDate liquidationDate;

    @Column(name = "payment_term_date")
    private LocalDate paymentTermDate;

    @Column(name = "auto_liquidate")
    private Boolean autoLiquidate = false;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "ecommerce_platform", length = 100)
    private String ecommercePlatform;

    @Column(name = "shop_name", length = 200)
    private String shopName;

    @Column(name = "store_code", length = 50)
    private String storeCode;

    private LocalDate validUntil;

    private Long employeeId;

    @Column(precision = 18, scale = 2)
    private BigDecimal invoicedAmount = BigDecimal.ZERO;

    @Column(precision = 18, scale = 2)
    private BigDecimal actualPaid = BigDecimal.ZERO;

    @Column(precision = 18, scale = 2)
    private BigDecimal actualCollected = BigDecimal.ZERO;

    @Column(precision = 18, scale = 2)
    private BigDecimal remainingToCollect = BigDecimal.ZERO;

    @Column(length = 500)
    private String attachmentUrl;

    @Column(length = 255)
    private String createdBy;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesContractItem> items = new ArrayList<>();

    public void addItem(SalesContractItem item) {
        items.add(item);
        item.setContract(this);
    }

    public void removeItem(SalesContractItem item) {
        items.remove(item);
        item.setContract(null);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContractNo() { return contractNo; }
    public void setContractNo(String contractNo) { this.contractNo = contractNo; }
    public LocalDate getContractDate() { return contractDate; }
    public void setContractDate(LocalDate contractDate) { this.contractDate = contractDate; }
    public SalesOrder getOrder() { return order; }
    public void setOrder(SalesOrder order) { this.order = order; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getLiquidatedAmount() { return liquidatedAmount; }
    public void setLiquidatedAmount(BigDecimal liquidatedAmount) { this.liquidatedAmount = liquidatedAmount; }
    public LocalDate getLiquidationDate() { return liquidationDate; }
    public void setLiquidationDate(LocalDate liquidationDate) { this.liquidationDate = liquidationDate; }
    public LocalDate getPaymentTermDate() { return paymentTermDate; }
    public void setPaymentTermDate(LocalDate paymentTermDate) { this.paymentTermDate = paymentTermDate; }
    public Boolean getAutoLiquidate() { return autoLiquidate; }
    public void setAutoLiquidate(Boolean autoLiquidate) { this.autoLiquidate = autoLiquidate; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public List<SalesContractItem> getItems() { return items; }
    public void setItems(List<SalesContractItem> items) { this.items = items; }

    public String getEcommercePlatform() { return ecommercePlatform; }
    public void setEcommercePlatform(String ecommercePlatform) { this.ecommercePlatform = ecommercePlatform; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getStoreCode() { return storeCode; }
    public void setStoreCode(String storeCode) { this.storeCode = storeCode; }

    public LocalDate getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDate validUntil) { this.validUntil = validUntil; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public BigDecimal getInvoicedAmount() { return invoicedAmount; }
    public void setInvoicedAmount(BigDecimal invoicedAmount) { this.invoicedAmount = invoicedAmount; }
    public BigDecimal getActualPaid() { return actualPaid; }
    public void setActualPaid(BigDecimal actualPaid) { this.actualPaid = actualPaid; }
    public BigDecimal getActualCollected() { return actualCollected; }
    public void setActualCollected(BigDecimal actualCollected) { this.actualCollected = actualCollected; }
    public BigDecimal getRemainingToCollect() { return remainingToCollect; }
    public void setRemainingToCollect(BigDecimal remainingToCollect) { this.remainingToCollect = remainingToCollect; }
    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
