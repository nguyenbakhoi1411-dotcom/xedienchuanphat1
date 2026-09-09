package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_vouchers")
public class SalesVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "voucher_no", unique = true, length = 50)
    private String voucherNo;

    @Column(name = "voucher_date")
    private LocalDate voucherDate;

    @Column(name = "accounting_date")
    private LocalDate accountingDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private SalesOrder order;

    @Column(name = "salesperson")
    private String salesperson;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // UNPAID, CASH, BANK

    @Column(name = "is_export_voucher")
    private Boolean isExportVoucher = false;

    @Column(name = "is_tax_invoice")
    private Boolean isTaxInvoice = false;

    @Column(name = "tax_invoice_no", length = 50)
    private String taxInvoiceNo;

    @Column(name = "invoice_issue_status", length = 30)
    private String invoiceIssueStatus = "CHUA_PHAT_HANH"; // CHUA_PHAT_HANH, DA_PHAT_HANH

    @Column(name = "tax_authority_code", length = 100)
    private String taxAuthorityCode;

    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "total_tax_amount", precision = 18, scale = 2)
    private BigDecimal totalTaxAmount = BigDecimal.ZERO;

    @Column(name = "total_payment", precision = 18, scale = 2)
    private BigDecimal totalPayment = BigDecimal.ZERO;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "payment_term", length = 100)
    private String paymentTerm;

    @Column(name = "ecommerce_platform", length = 100)
    private String ecommercePlatform;

    @Column(name = "shop_name", length = 200)
    private String shopName;

    @Column(name = "store_code", length = 50)
    private String storeCode;

    @Column(name = "delivery_status", length = 50)
    private String deliveryStatus;

    @Column(name = "invoice_search_code", length = 100)
    private String invoiceSearchCode;

    @Column(name = "is_cash_payment")
    private Boolean isCashPayment;

    @Column(length = 255)
    private String customerName;

    @Column(length = 20)
    private String taxCode;

    @Column(length = 500)
    private String address;

    @Column(name = "contract_id")
    private Long contractId;

    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(precision = 18, scale = 2)
    private BigDecimal totalDiscountAmount = BigDecimal.ZERO;

    @Column(length = 50)
    private String revenueRecordStatus = "CHUA_GHI";

    @Column(length = 50)
    private String voucherType = "SALE";

    @Column(length = 255)
    private String createdBy;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesVoucherItem> items = new ArrayList<>();

    public void addItem(SalesVoucherItem item) {
        items.add(item);
        item.setVoucher(this);
    }

    public void removeItem(SalesVoucherItem item) {
        items.remove(item);
        item.setVoucher(null);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVoucherNo() { return voucherNo; }
    public void setVoucherNo(String voucherNo) { this.voucherNo = voucherNo; }
    public LocalDate getVoucherDate() { return voucherDate; }
    public void setVoucherDate(LocalDate voucherDate) { this.voucherDate = voucherDate; }
    public LocalDate getAccountingDate() { return accountingDate; }
    public void setAccountingDate(LocalDate accountingDate) { this.accountingDate = accountingDate; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public SalesOrder getOrder() { return order; }
    public void setOrder(SalesOrder order) { this.order = order; }
    public String getSalesperson() { return salesperson; }
    public void setSalesperson(String salesperson) { this.salesperson = salesperson; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public Boolean getIsExportVoucher() { return isExportVoucher; }
    public void setIsExportVoucher(Boolean isExportVoucher) { this.isExportVoucher = isExportVoucher; }
    public Boolean getIsTaxInvoice() { return isTaxInvoice; }
    public void setIsTaxInvoice(Boolean isTaxInvoice) { this.isTaxInvoice = isTaxInvoice; }
    public String getTaxInvoiceNo() { return taxInvoiceNo; }
    public void setTaxInvoiceNo(String taxInvoiceNo) { this.taxInvoiceNo = taxInvoiceNo; }
    public String getInvoiceIssueStatus() { return invoiceIssueStatus; }
    public void setInvoiceIssueStatus(String invoiceIssueStatus) { this.invoiceIssueStatus = invoiceIssueStatus; }
    public String getTaxAuthorityCode() { return taxAuthorityCode; }
    public void setTaxAuthorityCode(String taxAuthorityCode) { this.taxAuthorityCode = taxAuthorityCode; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getTotalTaxAmount() { return totalTaxAmount; }
    public void setTotalTaxAmount(BigDecimal totalTaxAmount) { this.totalTaxAmount = totalTaxAmount; }
    public BigDecimal getTotalPayment() { return totalPayment; }
    public void setTotalPayment(BigDecimal totalPayment) { this.totalPayment = totalPayment; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public List<SalesVoucherItem> getItems() { return items; }
    public void setItems(List<SalesVoucherItem> items) { this.items = items; }

    public String getPaymentTerm() { return paymentTerm; }
    public void setPaymentTerm(String paymentTerm) { this.paymentTerm = paymentTerm; }
    public String getEcommercePlatform() { return ecommercePlatform; }
    public void setEcommercePlatform(String ecommercePlatform) { this.ecommercePlatform = ecommercePlatform; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getStoreCode() { return storeCode; }
    public void setStoreCode(String storeCode) { this.storeCode = storeCode; }
    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    public String getInvoiceSearchCode() { return invoiceSearchCode; }
    public void setInvoiceSearchCode(String invoiceSearchCode) { this.invoiceSearchCode = invoiceSearchCode; }
    public Boolean getIsCashPayment() { return isCashPayment; }
    public void setIsCashPayment(Boolean isCashPayment) { this.isCashPayment = isCashPayment; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
    public BigDecimal getTotalDiscountAmount() { return totalDiscountAmount; }
    public void setTotalDiscountAmount(BigDecimal totalDiscountAmount) { this.totalDiscountAmount = totalDiscountAmount; }
    public String getRevenueRecordStatus() { return revenueRecordStatus; }
    public void setRevenueRecordStatus(String revenueRecordStatus) { this.revenueRecordStatus = revenueRecordStatus; }
    public String getVoucherType() { return voucherType; }
    public void setVoucherType(String voucherType) { this.voucherType = voucherType; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
