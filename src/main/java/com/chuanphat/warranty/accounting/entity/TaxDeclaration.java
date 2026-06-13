package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "tax_declarations")
public class TaxDeclaration {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 30)
    private String declarationCode;
    
    @Column(name = "\"month\"", nullable = false)
    private Integer month;
    
    @Column(name = "\"year\"", nullable = false)
    private Integer year;
    
    @Column(nullable = false)
    private Long branchId;
    
    // Thuế đầu ra (bán hàng)
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal outputTaxBase = BigDecimal.ZERO;   // Doanh thu chịu thuế
    
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal outputVatAmount = BigDecimal.ZERO; // VAT đầu ra
    
    // Thuế đầu vào (mua hàng)
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal inputTaxBase = BigDecimal.ZERO;    // Giá trị mua vào
    
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal inputVatAmount = BigDecimal.ZERO;  // VAT đầu vào được khấu trừ
    
    // VAT phải nộp = outputVatAmount - inputVatAmount
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal vatPayable = BigDecimal.ZERO;
    
    @Column(length = 20)
    private String status; // DRAFT, SUBMITTED, ACCEPTED
    
    private LocalDate submittedDate;
    
    @Column(length = 120)
    private String submittedBy;
    
    @Column(length = 500)
    private String note;
    
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
    
    public Long getId() { return id; }
    public String getDeclarationCode() { return declarationCode; }
    public void setDeclarationCode(String declarationCode) { this.declarationCode = declarationCode; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
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
    public LocalDate getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(LocalDate submittedDate) { this.submittedDate = submittedDate; }
    public String getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(String submittedBy) { this.submittedBy = submittedBy; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
