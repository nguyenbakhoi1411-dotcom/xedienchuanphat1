package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "customer_debt_ledger")
public class CustomerDebtLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private OffsetDateTime transactionDate = OffsetDateTime.now();

    @Column(length = 50, nullable = false)
    private String transactionType; // e.g., "SALES_INVOICE", "PAYMENT_RECEIVED", "REFUND"

    @Column(length = 100)
    private String referenceNo; // e.g., OrderNo or ReceiptNo

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal increaseAmount = BigDecimal.ZERO; // Phát sinh tăng (Phải thu thêm)

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal decreaseAmount = BigDecimal.ZERO; // Phát sinh giảm (Đã thu)

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO; // Số dư nợ sau giao dịch (Số dư)

    @Column(length = 255)
    private String description;

    // Getters & Setters
    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public OffsetDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(OffsetDateTime transactionDate) { this.transactionDate = transactionDate; }
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    public String getReferenceNo() { return referenceNo; }
    public void setReferenceNo(String referenceNo) { this.referenceNo = referenceNo; }
    public BigDecimal getIncreaseAmount() { return increaseAmount; }
    public void setIncreaseAmount(BigDecimal increaseAmount) { this.increaseAmount = increaseAmount; }
    public BigDecimal getDecreaseAmount() { return decreaseAmount; }
    public void setDecreaseAmount(BigDecimal decreaseAmount) { this.decreaseAmount = decreaseAmount; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

}