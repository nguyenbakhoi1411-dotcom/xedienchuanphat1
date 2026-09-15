package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.SupplierReceivableStatus;
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
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "supplier_receivables")
public class SupplierReceivable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_return_id", nullable = false)
    private PurchaseReturn purchaseReturn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_invoice_id")
    private SupplierInvoice supplierInvoice;

    @Column(nullable = false)
    private Long branchId;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate receivableDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SupplierReceivableStatus status = SupplierReceivableStatus.OPEN;

    @Column(length = 500)
    private String note;

    @Column(nullable = false, length = 120)
    private String createdBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public PurchaseReturn getPurchaseReturn() { return purchaseReturn; }
    public void setPurchaseReturn(PurchaseReturn purchaseReturn) { this.purchaseReturn = purchaseReturn; }
    public SupplierInvoice getSupplierInvoice() { return supplierInvoice; }
    public void setSupplierInvoice(SupplierInvoice supplierInvoice) { this.supplierInvoice = supplierInvoice; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getReceivableDate() { return receivableDate; }
    public void setReceivableDate(LocalDate receivableDate) { this.receivableDate = receivableDate; }
    public SupplierReceivableStatus getStatus() { return status; }
    public void setStatus(SupplierReceivableStatus status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
