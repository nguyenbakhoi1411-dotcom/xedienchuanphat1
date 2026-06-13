package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.InvoiceStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "invoices")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String invoiceNo;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private SalesOrder order;

    @Column(nullable = false)
    private LocalDate invoiceDate = LocalDate.now();

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal vatAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(length = 80)
    private String templateCode;

    @Column(length = 2000)
    private String templateSnapshot;

    @Column(length = 80)
    private String electronicInvoiceProvider;

    @Column(length = 40)
    private String electronicInvoiceStatus;

    @Column(length = 120)
    private String electronicInvoiceRef;

    private OffsetDateTime issuedAt;

    private OffsetDateTime cancelledAt;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }
    public SalesOrder getOrder() { return order; }
    public void setOrder(SalesOrder order) { this.order = order; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }
    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus status) { this.status = status; }
    public String getTemplateCode() { return templateCode; }
    public void setTemplateCode(String templateCode) { this.templateCode = templateCode; }
    public String getTemplateSnapshot() { return templateSnapshot; }
    public void setTemplateSnapshot(String templateSnapshot) { this.templateSnapshot = templateSnapshot; }
    public String getElectronicInvoiceProvider() { return electronicInvoiceProvider; }
    public void setElectronicInvoiceProvider(String electronicInvoiceProvider) { this.electronicInvoiceProvider = electronicInvoiceProvider; }
    public String getElectronicInvoiceStatus() { return electronicInvoiceStatus; }
    public void setElectronicInvoiceStatus(String electronicInvoiceStatus) { this.electronicInvoiceStatus = electronicInvoiceStatus; }
    public String getElectronicInvoiceRef() { return electronicInvoiceRef; }
    public void setElectronicInvoiceRef(String electronicInvoiceRef) { this.electronicInvoiceRef = electronicInvoiceRef; }
    public OffsetDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(OffsetDateTime issuedAt) { this.issuedAt = issuedAt; }
    public OffsetDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(OffsetDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
