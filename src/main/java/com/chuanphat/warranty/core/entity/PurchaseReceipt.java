package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.ReceiptStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Phieu nhap kho — ghi nhan hang vat ly di vao kho.
 *
 * Co the tao tu:
 *   - Don mua hang (purchaseOrderId != null)
 *   - Nhap tu nha cung cap truc tiep (purchaseOrderId == null)
 *
 * Luong: DRAFT → CONFIRMED → cap nhat ton kho + tao serial xe.
 */
@Entity
@Table(name = "purchase_receipts")
public class PurchaseReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(nullable = false, unique = true, length = 80)
    private String receiptNo;

    /** Don mua hang goc (co the null khi nhap ngoai ke hoach) */
    private Long purchaseOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(nullable = false)
    private Long branchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(nullable = false)
    private LocalDate receiptDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReceiptStatus status = ReceiptStatus.DRAFT;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(length = 500)
    private String note;

    @Column(nullable = false, length = 120)
    private String createdBy;

    @Column(length = 120)
    private String confirmedBy;

    private OffsetDateTime confirmedAt;

    /** Bổ sung AMIS fields */
    @Column(length = 120)
    private String deliverer; // Người giao hàng

    @Column(length = 80)
    private String objectCode; // Mã đối tượng

    @Column(length = 255)
    private String objectAddress; // Địa chỉ

    @Column(length = 80)
    private String receiptType; // Loại phiếu nhập (Thành phẩm sản xuất, Hàng bán trả lại...)

    /** Da sinh but toan ke toan chua — idempotency guard */
    @Column(nullable = false)
    private boolean accountingRecorded = false;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseReceiptItem> items = new ArrayList<>();

    public Long getId() { return id; }
    public String getReceiptNo() { return receiptNo; }
    public void setReceiptNo(String receiptNo) { this.receiptNo = receiptNo; }
    public Long getPurchaseOrderId() { return purchaseOrderId; }
    public void setPurchaseOrderId(Long purchaseOrderId) { this.purchaseOrderId = purchaseOrderId; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public LocalDate getReceiptDate() { return receiptDate; }
    public void setReceiptDate(LocalDate receiptDate) { this.receiptDate = receiptDate; }
    public ReceiptStatus getStatus() { return status; }
    public void setStatus(ReceiptStatus status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getConfirmedBy() { return confirmedBy; }
    public void setConfirmedBy(String confirmedBy) { this.confirmedBy = confirmedBy; }
    public OffsetDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(OffsetDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
    public boolean isAccountingRecorded() { return accountingRecorded; }
    public void setAccountingRecorded(boolean accountingRecorded) { this.accountingRecorded = accountingRecorded; }
    public String getDeliverer() { return deliverer; }
    public void setDeliverer(String deliverer) { this.deliverer = deliverer; }
    public String getObjectCode() { return objectCode; }
    public void setObjectCode(String objectCode) { this.objectCode = objectCode; }
    public String getObjectAddress() { return objectAddress; }
    public void setObjectAddress(String objectAddress) { this.objectAddress = objectAddress; }
    public String getReceiptType() { return receiptType; }
    public void setReceiptType(String receiptType) { this.receiptType = receiptType; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public List<PurchaseReceiptItem> getItems() { return items; }
    public void addItem(PurchaseReceiptItem item) { items.add(item); item.setReceipt(this); }
}
