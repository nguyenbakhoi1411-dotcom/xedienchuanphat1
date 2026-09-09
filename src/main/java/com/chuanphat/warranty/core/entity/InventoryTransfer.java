package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.TransferStatus;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "inventory_transfers")
public class InventoryTransfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String transferNo;

    @Column(nullable = false)
    private LocalDate transferDate;

    @Column(nullable = false)
    private Long fromBranchId;

    @Column(nullable = false)
    private Long toBranchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_warehouse_id", nullable = false)
    private Warehouse fromWarehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_warehouse_id", nullable = false)
    private Warehouse toWarehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal transferCost = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransferStatus status = TransferStatus.DRAFT;

    @Column(nullable = false)
    private boolean approvalRequired;

    @Column(length = 500)
    private String note;

    /** Bổ sung AMIS fields */
    @Column(length = 120)
    private String transporter; // Người vận chuyển

    @Column(length = 120)
    private String transportVehicle; // Phương tiện vận chuyển

    @Column(length = 120)
    private String transportContract; // Hợp đồng vận chuyển

    @Column(length = 80)
    private String transferType; // Loại xuất chuyển (Nội bộ, Gửi bán đại lý...)

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_id", insertable = false, updatable = false)
    private List<InventoryTransferItem> items = new ArrayList<>();

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    /** Người tạo phiếu chuyển kho */
    @Column(length = 120)
    private String createdBy;

    /** Người duyệt phiếu */
    @Column(length = 120)
    private String approvedBy;

    /** Serial xe cụ thể được chuyển (nếu là xe máy điện) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serial_id")
    private ProductSerial serial;

    private OffsetDateTime approvedAt;

    private OffsetDateTime shippedAt;

    private OffsetDateTime receivedAt;

    public Long getId() { return id; }
    public String getTransferNo() { return transferNo; }
    public void setTransferNo(String transferNo) { this.transferNo = transferNo; }
    public LocalDate getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDate transferDate) { this.transferDate = transferDate; }
    public Long getFromBranchId() { return fromBranchId; }
    public void setFromBranchId(Long fromBranchId) { this.fromBranchId = fromBranchId; }
    public Long getToBranchId() { return toBranchId; }
    public void setToBranchId(Long toBranchId) { this.toBranchId = toBranchId; }
    public Warehouse getFromWarehouse() { return fromWarehouse; }
    public void setFromWarehouse(Warehouse fromWarehouse) { this.fromWarehouse = fromWarehouse; }
    public Warehouse getToWarehouse() { return toWarehouse; }
    public void setToWarehouse(Warehouse toWarehouse) { this.toWarehouse = toWarehouse; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getTransferCost() { return transferCost; }
    public void setTransferCost(BigDecimal transferCost) { this.transferCost = transferCost == null ? BigDecimal.ZERO : transferCost; }
    public TransferStatus getStatus() { return status; }
    public void setStatus(TransferStatus status) { this.status = status; }
    public boolean isApprovalRequired() { return approvalRequired; }
    public void setApprovalRequired(boolean approvalRequired) { this.approvalRequired = approvalRequired; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getTransporter() { return transporter; }
    public void setTransporter(String transporter) { this.transporter = transporter; }
    public String getTransportVehicle() { return transportVehicle; }
    public void setTransportVehicle(String transportVehicle) { this.transportVehicle = transportVehicle; }
    public String getTransportContract() { return transportContract; }
    public void setTransportContract(String transportContract) { this.transportContract = transportContract; }
    public String getTransferType() { return transferType; }
    public void setTransferType(String transferType) { this.transferType = transferType; }
    public java.util.List<InventoryTransferItem> getItems() { return items; }
    public void setItems(java.util.List<InventoryTransferItem> items) { this.items = items; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public ProductSerial getSerial() { return serial; }
    public void setSerial(ProductSerial serial) { this.serial = serial; }
    public OffsetDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(OffsetDateTime approvedAt) { this.approvedAt = approvedAt; }
    public OffsetDateTime getShippedAt() { return shippedAt; }
    public void setShippedAt(OffsetDateTime shippedAt) { this.shippedAt = shippedAt; }
    public OffsetDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(OffsetDateTime receivedAt) { this.receivedAt = receivedAt; }
}
