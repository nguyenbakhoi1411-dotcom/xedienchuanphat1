package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;

public class TaxDeclarationLineDto {
    private Long id;
    private Long taxInvoiceId;
    private String invoiceNo;
    private String lineType;
    private BigDecimal taxBaseAmount;
    private BigDecimal vatAmount;
    private String note;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTaxInvoiceId() { return taxInvoiceId; }
    public void setTaxInvoiceId(Long taxInvoiceId) { this.taxInvoiceId = taxInvoiceId; }
    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }
    public String getLineType() { return lineType; }
    public void setLineType(String lineType) { this.lineType = lineType; }
    public BigDecimal getTaxBaseAmount() { return taxBaseAmount; }
    public void setTaxBaseAmount(BigDecimal taxBaseAmount) { this.taxBaseAmount = taxBaseAmount; }
    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
