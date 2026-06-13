package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * TaxInvoice — Hóa đơn VAT (đầu vào / đầu ra).
 *
 * Thiết kế mở rộng để tích hợp e-invoice API (MISA/VIETTEL/VNPT) về sau.
 * Khi tích hợp: điền eInvoiceProvider, gọi API, lưu eInvoiceNo và eInvoiceStatus.
 */
@Entity
@Table(name = "tax_invoices")
public class TaxInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String invoiceCode;

    @Column(length = 10)
    private String invoiceSerial;

    @Column(nullable = false)
    private LocalDate invoiceDate;

    /** OUTPUT = hóa đơn bán ra | INPUT = hóa đơn mua vào */
    @Column(nullable = false, length = 10)
    private String invoiceType;

    /** DRAFT | ISSUED | ADJUSTED | REPLACED | CANCELLED */
    @Column(nullable = false, length = 20)
    private String status = "DRAFT";

    // ── Đối tác ──
    private Long customerId;
    private Long supplierId;

    // ── E-Invoice extensibility ──
    /** Nhà cung cấp hóa đơn điện tử: MISA, VIETTEL, VNPT, null = chưa dùng */
    @Column(length = 30)
    private String eInvoiceProvider;

    /** Số hóa đơn điện tử do provider cấp */
    @Column(length = 50)
    private String eInvoiceNo;

    /** PENDING | ISSUED | FAILED */
    @Column(length = 20)
    private String eInvoiceStatus;

    private OffsetDateTime eInvoiceIssuedAt;

    // ── Giá trị ──
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal taxBaseAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal vatRate = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal vatAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    // ── Liên kết chứng từ ──
    @Column(length = 80)
    private String relatedOrderNo;

    @Column(length = 80)
    private String relatedReturnNo;

    private Long taxDeclarationId;

    /** ID hóa đơn gốc nếu đây là hóa đơn điều chỉnh/thay thế */
    private Long adjustedInvoiceId;

    @Column(nullable = false)
    private Long branchId;

    // ── Audit ──
    @Column(nullable = false, length = 120)
    private String createdBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime issuedAt;

    @Column(length = 120)
    private String cancelledBy;

    private OffsetDateTime cancelledAt;

    @Column(length = 500)
    private String note;

    // Getters & Setters
    public Long getId() { return id; }
    public String getInvoiceCode() { return invoiceCode; }
    public void setInvoiceCode(String invoiceCode) { this.invoiceCode = invoiceCode; }
    public String getInvoiceSerial() { return invoiceSerial; }
    public void setInvoiceSerial(String invoiceSerial) { this.invoiceSerial = invoiceSerial; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
    public String getInvoiceType() { return invoiceType; }
    public void setInvoiceType(String invoiceType) { this.invoiceType = invoiceType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getEInvoiceProvider() { return eInvoiceProvider; }
    public void setEInvoiceProvider(String eInvoiceProvider) { this.eInvoiceProvider = eInvoiceProvider; }
    public String getEInvoiceNo() { return eInvoiceNo; }
    public void setEInvoiceNo(String eInvoiceNo) { this.eInvoiceNo = eInvoiceNo; }
    public String getEInvoiceStatus() { return eInvoiceStatus; }
    public void setEInvoiceStatus(String eInvoiceStatus) { this.eInvoiceStatus = eInvoiceStatus; }
    public OffsetDateTime getEInvoiceIssuedAt() { return eInvoiceIssuedAt; }
    public void setEInvoiceIssuedAt(OffsetDateTime eInvoiceIssuedAt) { this.eInvoiceIssuedAt = eInvoiceIssuedAt; }
    public BigDecimal getTaxBaseAmount() { return taxBaseAmount; }
    public void setTaxBaseAmount(BigDecimal taxBaseAmount) { this.taxBaseAmount = taxBaseAmount; }
    public BigDecimal getVatRate() { return vatRate; }
    public void setVatRate(BigDecimal vatRate) { this.vatRate = vatRate; }
    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getRelatedOrderNo() { return relatedOrderNo; }
    public void setRelatedOrderNo(String relatedOrderNo) { this.relatedOrderNo = relatedOrderNo; }
    public String getRelatedReturnNo() { return relatedReturnNo; }
    public void setRelatedReturnNo(String relatedReturnNo) { this.relatedReturnNo = relatedReturnNo; }
    public Long getTaxDeclarationId() { return taxDeclarationId; }
    public void setTaxDeclarationId(Long taxDeclarationId) { this.taxDeclarationId = taxDeclarationId; }
    public Long getAdjustedInvoiceId() { return adjustedInvoiceId; }
    public void setAdjustedInvoiceId(Long adjustedInvoiceId) { this.adjustedInvoiceId = adjustedInvoiceId; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(OffsetDateTime issuedAt) { this.issuedAt = issuedAt; }
    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }
    public OffsetDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(OffsetDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
