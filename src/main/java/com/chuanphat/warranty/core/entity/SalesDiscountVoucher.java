package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_discount_vouchers")
public class SalesDiscountVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "voucher_no", unique = true, length = 50)
    private String voucherNo;

    @Column(name = "accounting_date")
    private LocalDate accountingDate;

    @Column(name = "voucher_date")
    private LocalDate voucherDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_voucher_id")
    private SalesVoucher salesVoucher;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "total_tax_amount", precision = 18, scale = 2)
    private BigDecimal totalTaxAmount = BigDecimal.ZERO;

    @Column(name = "total_discount", precision = 18, scale = 2)
    private BigDecimal totalDiscount = BigDecimal.ZERO;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(length = 255)
    private String createdBy;

    @Column(length = 50)
    private String invoiceNo;

    @Column(name = "is_invoice_published")
    private Boolean isInvoicePublished = false;

    @Column(name = "invoice_id")
    private Long invoiceId;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesDiscountVoucherItem> items = new ArrayList<>();

    public void addItem(SalesDiscountVoucherItem item) {
        items.add(item);
        item.setVoucher(this);
    }

    public void removeItem(SalesDiscountVoucherItem item) {
        items.remove(item);
        item.setVoucher(null);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVoucherNo() { return voucherNo; }
    public void setVoucherNo(String voucherNo) { this.voucherNo = voucherNo; }
    public LocalDate getAccountingDate() { return accountingDate; }
    public void setAccountingDate(LocalDate accountingDate) { this.accountingDate = accountingDate; }
    public LocalDate getVoucherDate() { return voucherDate; }
    public void setVoucherDate(LocalDate voucherDate) { this.voucherDate = voucherDate; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public SalesVoucher getSalesVoucher() { return salesVoucher; }
    public void setSalesVoucher(SalesVoucher salesVoucher) { this.salesVoucher = salesVoucher; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getTotalTaxAmount() { return totalTaxAmount; }
    public void setTotalTaxAmount(BigDecimal totalTaxAmount) { this.totalTaxAmount = totalTaxAmount; }
    public BigDecimal getTotalDiscount() { return totalDiscount; }
    public void setTotalDiscount(BigDecimal totalDiscount) { this.totalDiscount = totalDiscount; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public List<SalesDiscountVoucherItem> getItems() { return items; }
    public void setItems(List<SalesDiscountVoucherItem> items) { this.items = items; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }
    public Boolean getIsInvoicePublished() { return isInvoicePublished; }
    public void setIsInvoicePublished(Boolean isInvoicePublished) { this.isInvoicePublished = isInvoicePublished; }
    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
}
