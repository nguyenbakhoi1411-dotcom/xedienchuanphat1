package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class VatOffsetRunDto {
    private Long id;
    private String runCode;
    private Integer periodMonth;
    private Integer periodYear;
    private Long branchId;
    private BigDecimal inputVatAmount;
    private BigDecimal outputVatAmount;
    private BigDecimal offsetAmount;
    private BigDecimal payableAmount;
    private BigDecimal carriedForward;
    private Long journalEntryId;
    private String status;
    private String createdBy;
    private OffsetDateTime createdAt;
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
