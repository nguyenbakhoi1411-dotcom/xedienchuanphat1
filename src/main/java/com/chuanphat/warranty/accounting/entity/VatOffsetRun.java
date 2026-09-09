package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "vat_offset_runs")
public class VatOffsetRun {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "run_code", nullable = false, unique = true, length = 30)
    private String runCode;

    @Column(name = "period_month", nullable = false)
    private Integer periodMonth;

    @Column(name = "period_year", nullable = false)
    private Integer periodYear;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "input_vat_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal inputVatAmount = BigDecimal.ZERO;

    @Column(name = "output_vat_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal outputVatAmount = BigDecimal.ZERO;

    @Column(name = "offset_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal offsetAmount = BigDecimal.ZERO;

    @Column(name = "payable_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal payableAmount = BigDecimal.ZERO;

    @Column(name = "carried_forward", nullable = false, precision = 18, scale = 2)
    private BigDecimal carriedForward = BigDecimal.ZERO;

    @Column(name = "journal_entry_id")
    private Long journalEntryId;

    @Column(length = 20, nullable = false)
    private String status = "DRAFT"; // DRAFT, POSTED, CANCELLED

    @Column(name = "created_by", length = 120, nullable = false)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "posted_at")
    private OffsetDateTime postedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getRunCode() { return runCode; }
    public void setRunCode(String runCode) { this.runCode = runCode; }
    
    public Integer getPeriodMonth() { return periodMonth; }
    public void setPeriodMonth(Integer periodMonth) { this.periodMonth = periodMonth; }
    
    public Integer getPeriodYear() { return periodYear; }
    public void setPeriodYear(Integer periodYear) { this.periodYear = periodYear; }
    
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    
    public BigDecimal getInputVatAmount() { return inputVatAmount; }
    public void setInputVatAmount(BigDecimal inputVatAmount) { this.inputVatAmount = inputVatAmount; }
    
    public BigDecimal getOutputVatAmount() { return outputVatAmount; }
    public void setOutputVatAmount(BigDecimal outputVatAmount) { this.outputVatAmount = outputVatAmount; }
    
    public BigDecimal getOffsetAmount() { return offsetAmount; }
    public void setOffsetAmount(BigDecimal offsetAmount) { this.offsetAmount = offsetAmount; }
    
    public BigDecimal getPayableAmount() { return payableAmount; }
    public void setPayableAmount(BigDecimal payableAmount) { this.payableAmount = payableAmount; }
    
    public BigDecimal getCarriedForward() { return carriedForward; }
    public void setCarriedForward(BigDecimal carriedForward) { this.carriedForward = carriedForward; }
    
    public Long getJournalEntryId() { return journalEntryId; }
    public void setJournalEntryId(Long journalEntryId) { this.journalEntryId = journalEntryId; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    
    public OffsetDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(OffsetDateTime postedAt) { this.postedAt = postedAt; }
}
