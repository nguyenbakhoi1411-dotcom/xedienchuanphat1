package com.chuanphat.warranty.core.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_discounts")
public class SalesDiscount {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 30)
    private String discountNo;
    @Column(nullable = false)
    private LocalDate discountDate;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
    @Column(length = 200)
    private String customerName;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private TaxInvoice invoice;
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;
    @Column(nullable = false, length = 20)
    private String status = "DRAFT";
    @Column(nullable = false)
    private Long branchId;
    @Column(nullable = false, length = 120)
    private String createdBy;
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
    @OneToMany(mappedBy = "discount", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SalesDiscountLine> lines = new ArrayList<>();
    
    public Long getId() { return id; }
    public String getDiscountNo() { return discountNo; }
    public void setDiscountNo(String v) { this.discountNo = v; }
    public LocalDate getDiscountDate() { return discountDate; }
    public void setDiscountDate(LocalDate v) { this.discountDate = v; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer v) { this.customer = v; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String v) { this.customerName = v; }
    public TaxInvoice getInvoice() { return invoice; }
    public void setInvoice(TaxInvoice v) { this.invoice = v; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal v) { this.totalAmount = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long v) { this.branchId = v; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String v) { this.createdBy = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public List<SalesDiscountLine> getLines() { return lines; }
    public void addLine(SalesDiscountLine line) { lines.add(line); line.setDiscount(this); }
}
