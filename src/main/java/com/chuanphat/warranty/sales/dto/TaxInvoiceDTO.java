package com.chuanphat.warranty.sales.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TaxInvoiceDTO {
    private Long id;
    private String invoiceNumber;
    private String taxSymbol;
    private Long customerId;
    private LocalDate invoiceDate;
    private BigDecimal totalAmountBeforeTax;
    private BigDecimal taxAmount;
    private BigDecimal totalAmountAfterTax;
    
    private List<SalesVoucherItemDTO> items = new ArrayList<>();

    public TaxInvoiceDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public String getTaxSymbol() { return taxSymbol; }
    public void setTaxSymbol(String taxSymbol) { this.taxSymbol = taxSymbol; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
    public BigDecimal getTotalAmountBeforeTax() { return totalAmountBeforeTax; }
    public void setTotalAmountBeforeTax(BigDecimal totalAmountBeforeTax) { this.totalAmountBeforeTax = totalAmountBeforeTax; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public BigDecimal getTotalAmountAfterTax() { return totalAmountAfterTax; }
    public void setTotalAmountAfterTax(BigDecimal totalAmountAfterTax) { this.totalAmountAfterTax = totalAmountAfterTax; }
    public List<SalesVoucherItemDTO> getItems() { return items; }
    public void setItems(List<SalesVoucherItemDTO> items) { this.items = items; }
}
