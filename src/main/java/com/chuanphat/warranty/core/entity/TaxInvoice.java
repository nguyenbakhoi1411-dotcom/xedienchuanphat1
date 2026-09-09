package com.chuanphat.warranty.core.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tax_invoices")
public class TaxInvoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, length = 30)
    private String invoiceNo;
    @Column(length = 20)
    private String invoiceSerial;
    @Column(nullable = false)
    private LocalDate invoiceDate;
    @Column(nullable = false, length = 20)
    private String invoiceType = "OUTPUT";
    @Column(length = 50)
    private String invoiceForm = "Hoa don moi";
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
    @Column(length = 200)
    private String customerName;
    @Column(length = 500)
    private String customerAddress;
    @Column(length = 20)
    private String customerTaxCode;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private SalesOrder order;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private SalesVoucher voucher;
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal taxBaseAmount = BigDecimal.ZERO;
    @Column(precision = 5, scale = 2)
    private BigDecimal vatRate = BigDecimal.TEN;
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal vatAmount = BigDecimal.ZERO;
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;
    @Column(nullable = false, length = 30)
    private String status = "DRAFT";
    @Column(length = 30)
    private String assemblyStatus = "NOT_READY";
    @Column(length = 30)
    private String issueStatus = "NOT_ISSUED";
    @Column(length = 50)
    private String taxAuthorityCode;
    @Column(length = 100)
    private String invalidHandling;
    private Long originalInvoiceId;
    @Column(nullable = false)
    private Long branchId;
    @Column(nullable = false, length = 120)
    private String createdBy;
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
    private OffsetDateTime issuedAt;
    private OffsetDateTime cancelledAt;
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TaxInvoiceLine> lines = new ArrayList<>();
    
    public Long getId() { return id; }
    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String v) { this.invoiceNo = v; }
    public String getInvoiceSerial() { return invoiceSerial; }
    public void setInvoiceSerial(String v) { this.invoiceSerial = v; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate v) { this.invoiceDate = v; }
    public String getInvoiceType() { return invoiceType; }
    public void setInvoiceType(String v) { this.invoiceType = v; }
    public String getInvoiceForm() { return invoiceForm; }
    public void setInvoiceForm(String v) { this.invoiceForm = v; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer v) { this.customer = v; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String v) { this.customerName = v; }
    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String v) { this.customerAddress = v; }
    public String getCustomerTaxCode() { return customerTaxCode; }
    public void setCustomerTaxCode(String v) { this.customerTaxCode = v; }
    public SalesOrder getOrder() { return order; }
    public void setOrder(SalesOrder v) { this.order = v; }
    public SalesVoucher getVoucher() { return voucher; }
    public void setVoucher(SalesVoucher v) { this.voucher = v; }
    public BigDecimal getTaxBaseAmount() { return taxBaseAmount; }
    public void setTaxBaseAmount(BigDecimal v) { this.taxBaseAmount = v; }
    public BigDecimal getVatRate() { return vatRate; }
    public void setVatRate(BigDecimal v) { this.vatRate = v; }
    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal v) { this.vatAmount = v; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal v) { this.totalAmount = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public String getAssemblyStatus() { return assemblyStatus; }
    public void setAssemblyStatus(String v) { this.assemblyStatus = v; }
    public String getIssueStatus() { return issueStatus; }
    public void setIssueStatus(String v) { this.issueStatus = v; }
    public String getTaxAuthorityCode() { return taxAuthorityCode; }
    public void setTaxAuthorityCode(String v) { this.taxAuthorityCode = v; }
    public String getInvalidHandling() { return invalidHandling; }
    public void setInvalidHandling(String v) { this.invalidHandling = v; }
    public Long getOriginalInvoiceId() { return originalInvoiceId; }
    public void setOriginalInvoiceId(Long v) { this.originalInvoiceId = v; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long v) { this.branchId = v; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String v) { this.createdBy = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(OffsetDateTime v) { this.issuedAt = v; }
    public OffsetDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(OffsetDateTime v) { this.cancelledAt = v; }
    public List<TaxInvoiceLine> getLines() { return lines; }
    public void addLine(TaxInvoiceLine line) { lines.add(line); line.setInvoice(this); }
}
