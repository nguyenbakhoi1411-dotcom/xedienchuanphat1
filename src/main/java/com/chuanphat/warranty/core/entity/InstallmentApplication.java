package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.InstallmentStatus;
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
import java.time.OffsetDateTime;

@Entity
@Table(name = "installment_applications")
public class InstallmentApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private SalesOrder order;

    @Column(nullable = false, unique = true, length = 80)
    private String applicationNo;

    @Column(nullable = false, length = 160)
    private String financeCompany;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal downPaymentAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal loanAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private int termMonths;

    @Column(nullable = false, precision = 8, scale = 4)
    private BigDecimal interestRate = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InstallmentStatus status = InstallmentStatus.PENDING;

    @Column(precision = 14, scale = 2)
    private BigDecimal disbursedAmount;

    private OffsetDateTime disbursedAt;

    @Column(length = 500)
    private String note;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public SalesOrder getOrder() { return order; }
    public void setOrder(SalesOrder order) { this.order = order; }
    public String getApplicationNo() { return applicationNo; }
    public void setApplicationNo(String applicationNo) { this.applicationNo = applicationNo; }
    public String getFinanceCompany() { return financeCompany; }
    public void setFinanceCompany(String financeCompany) { this.financeCompany = financeCompany; }
    public BigDecimal getDownPaymentAmount() { return downPaymentAmount; }
    public void setDownPaymentAmount(BigDecimal downPaymentAmount) { this.downPaymentAmount = downPaymentAmount; }
    public BigDecimal getLoanAmount() { return loanAmount; }
    public void setLoanAmount(BigDecimal loanAmount) { this.loanAmount = loanAmount; }
    public int getTermMonths() { return termMonths; }
    public void setTermMonths(int termMonths) { this.termMonths = termMonths; }
    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }
    public InstallmentStatus getStatus() { return status; }
    public void setStatus(InstallmentStatus status) { this.status = status; }
    public BigDecimal getDisbursedAmount() { return disbursedAmount; }
    public void setDisbursedAmount(BigDecimal disbursedAmount) { this.disbursedAmount = disbursedAmount; }
    public OffsetDateTime getDisbursedAt() { return disbursedAt; }
    public void setDisbursedAt(OffsetDateTime disbursedAt) { this.disbursedAt = disbursedAt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
