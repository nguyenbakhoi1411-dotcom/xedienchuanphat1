package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.PaymentStatus;
import com.chuanphat.warranty.core.enums.DiscountApprovalStatus;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_orders")
public class SalesOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String orderNo;

    @Column(nullable = false)
    private Long branchId;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Long employeeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id")
    private Quotation quotation;

    @Column(nullable = false)
    private LocalDate orderDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SalesOrderStatus status = SalesOrderStatus.DRAFT;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 50)
    private String voucherCode;

    @Column(length = 500)
    private String note;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    // ── VAT ──
    /** Thue suat VAT tinh tren don hang (%) — mac dinh 10. */
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal vatRate = new BigDecimal("10.00");

    /** Tong tien VAT = subtotal_taxable * vatRate / 100. */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal vatAmount = BigDecimal.ZERO;

    /** Lien ket hoa don VAT (TaxInvoice.id) sau khi phat hanh. */
    private Long taxInvoiceId;

    // ── Payment ──
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime reservationUntil;

    private OffsetDateTime confirmedAt;

    private OffsetDateTime deliveredAt;

    private OffsetDateTime cancelledAt;

    private OffsetDateTime returnedAt;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean accountingRecorded = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean stockIssued = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean warrantyCreated = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean voucherConsumed = false;

    @Column(length = 50) private String ecommercePlatform;
    @Column(length = 100) private String shopName;
    @Column(length = 50) private String storeCode;
    @Column(length = 50) private String deliveryStatus;

    // ── Discount Approval ──
    /** Nguong giam gia toi da (%) cho phep ma khong can duyet. Default 5%. */
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal maxDiscountPct = new BigDecimal("5.00");

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DiscountApprovalStatus discountApprovalStatus = DiscountApprovalStatus.NONE;

    @Column(length = 120)
    private String approvedBy;

    private OffsetDateTime approvedAt;

    @Column(length = 500)
    private String approvalNote;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SalesOrderItem> items = new ArrayList<>();

    public Long getId() { return id; }
    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String orderNo) { this.orderNo = orderNo; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public Quotation getQuotation() { return quotation; }
    public void setQuotation(Quotation quotation) { this.quotation = quotation; }
    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }
    public SalesOrderStatus getStatus() { return status; }
    public void setStatus(SalesOrderStatus status) { this.status = status; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getReservationUntil() { return reservationUntil; }
    public void setReservationUntil(OffsetDateTime reservationUntil) { this.reservationUntil = reservationUntil; }
    public OffsetDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(OffsetDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
    public OffsetDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(OffsetDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
    public OffsetDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(OffsetDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public OffsetDateTime getReturnedAt() { return returnedAt; }
    public void setReturnedAt(OffsetDateTime returnedAt) { this.returnedAt = returnedAt; }
    public boolean isAccountingRecorded() { return accountingRecorded; }
    public void setAccountingRecorded(boolean accountingRecorded) { this.accountingRecorded = accountingRecorded; }
    public boolean isStockIssued() { return stockIssued; }
    public void setStockIssued(boolean stockIssued) { this.stockIssued = stockIssued; }
    public boolean isWarrantyCreated() { return warrantyCreated; }
    public void setWarrantyCreated(boolean warrantyCreated) { this.warrantyCreated = warrantyCreated; }
    public boolean isVoucherConsumed() { return voucherConsumed; }
    public void setVoucherConsumed(boolean voucherConsumed) { this.voucherConsumed = voucherConsumed; }
    // VAT
    public BigDecimal getVatRate() { return vatRate; }
    public void setVatRate(BigDecimal vatRate) { this.vatRate = vatRate; }
    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }
    public Long getTaxInvoiceId() { return taxInvoiceId; }
    public void setTaxInvoiceId(Long taxInvoiceId) { this.taxInvoiceId = taxInvoiceId; }
    public String getEcommercePlatform() { return ecommercePlatform; }
    public void setEcommercePlatform(String ecommercePlatform) { this.ecommercePlatform = ecommercePlatform; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getStoreCode() { return storeCode; }
    public void setStoreCode(String storeCode) { this.storeCode = storeCode; }
    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    // Discount Approval
    public BigDecimal getMaxDiscountPct() { return maxDiscountPct; }
    public void setMaxDiscountPct(BigDecimal maxDiscountPct) { this.maxDiscountPct = maxDiscountPct; }
    public DiscountApprovalStatus getDiscountApprovalStatus() { return discountApprovalStatus; }
    public void setDiscountApprovalStatus(DiscountApprovalStatus discountApprovalStatus) { this.discountApprovalStatus = discountApprovalStatus; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public OffsetDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(OffsetDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getApprovalNote() { return approvalNote; }
    public void setApprovalNote(String approvalNote) { this.approvalNote = approvalNote; }
    public List<SalesOrderItem> getItems() { return items; }
    public void addItem(SalesOrderItem item) { items.add(item); item.setOrder(this); }
}
