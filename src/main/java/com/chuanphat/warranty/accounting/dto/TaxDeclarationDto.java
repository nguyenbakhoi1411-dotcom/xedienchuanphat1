package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public class TaxDeclarationDto {
    private Long id;
    private String declarationCode;
    private Integer month;
    private Integer year;
    private Integer quarter;
    private String declarationType;
    private Long branchId;
    private BigDecimal outputTaxBase;
    private BigDecimal outputVatAmount;
    private BigDecimal inputTaxBase;
    private BigDecimal inputVatAmount;
    private BigDecimal vatPayable;
    private String status;
    private LocalDate dueDate;
    private LocalDate submittedDate;
    private String submittedBy;
    private String note;
    private OffsetDateTime createdAt;
    private List<TaxDeclarationLineDto> lines;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDeclarationCode() { return declarationCode; }
    public void setDeclarationCode(String declarationCode) { this.declarationCode = declarationCode; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Integer getQuarter() { return quarter; }
    public void setQuarter(Integer quarter) { this.quarter = quarter; }
    public String getDeclarationType() { return declarationType; }
    public void setDeclarationType(String declarationType) { this.declarationType = declarationType; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public BigDecimal getOutputTaxBase() { return outputTaxBase; }
    public void setOutputTaxBase(BigDecimal outputTaxBase) { this.outputTaxBase = outputTaxBase; }
    public BigDecimal getOutputVatAmount() { return outputVatAmount; }
    public void setOutputVatAmount(BigDecimal outputVatAmount) { this.outputVatAmount = outputVatAmount; }
    public BigDecimal getInputTaxBase() { return inputTaxBase; }
    public void setInputTaxBase(BigDecimal inputTaxBase) { this.inputTaxBase = inputTaxBase; }
    public BigDecimal getInputVatAmount() { return inputVatAmount; }
    public void setInputVatAmount(BigDecimal inputVatAmount) { this.inputVatAmount = inputVatAmount; }
    public BigDecimal getVatPayable() { return vatPayable; }
    public void setVatPayable(BigDecimal vatPayable) { this.vatPayable = vatPayable; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public LocalDate getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(LocalDate submittedDate) { this.submittedDate = submittedDate; }
    public String getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(String submittedBy) { this.submittedBy = submittedBy; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public List<TaxDeclarationLineDto> getLines() { return lines; }
    public void setLines(List<TaxDeclarationLineDto> lines) { this.lines = lines; }
}
