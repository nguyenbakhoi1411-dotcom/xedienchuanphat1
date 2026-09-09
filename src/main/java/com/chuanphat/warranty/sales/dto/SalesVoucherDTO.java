package com.chuanphat.warranty.sales.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public class SalesVoucherDTO {
    private Long id;
    private String voucherNo;
    private LocalDate voucherDate;
    private LocalDate accountingDate;
    private Long customerId;
    private Long orderId;
    private String salesperson;
    private String description;
    private String paymentMethod;
    private Boolean isExportVoucher;
    private Boolean isTaxInvoice;
    private String taxInvoiceNo;
    private String invoiceIssueStatus;
    private String taxAuthorityCode;
    private BigDecimal totalAmount;
    private BigDecimal totalTaxAmount;
    private BigDecimal totalPayment;
    private Long branchId;
    private OffsetDateTime createdAt;

    private List<SalesVoucherItemDTO> items = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVoucherNo() { return voucherNo; }
    public void setVoucherNo(String voucherNo) { this.voucherNo = voucherNo; }
    public LocalDate getVoucherDate() { return voucherDate; }
    public void setVoucherDate(LocalDate voucherDate) { this.voucherDate = voucherDate; }
    public LocalDate getAccountingDate() { return accountingDate; }
    public void setAccountingDate(LocalDate accountingDate) { this.accountingDate = accountingDate; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getSalesperson() { return salesperson; }
    public void setSalesperson(String salesperson) { this.salesperson = salesperson; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public Boolean getIsExportVoucher() { return isExportVoucher; }
    public void setIsExportVoucher(Boolean isExportVoucher) { this.isExportVoucher = isExportVoucher; }
    public Boolean getIsTaxInvoice() { return isTaxInvoice; }
    public void setIsTaxInvoice(Boolean isTaxInvoice) { this.isTaxInvoice = isTaxInvoice; }
    public String getTaxInvoiceNo() { return taxInvoiceNo; }
    public void setTaxInvoiceNo(String taxInvoiceNo) { this.taxInvoiceNo = taxInvoiceNo; }
    public String getInvoiceIssueStatus() { return invoiceIssueStatus; }
    public void setInvoiceIssueStatus(String invoiceIssueStatus) { this.invoiceIssueStatus = invoiceIssueStatus; }
    public String getTaxAuthorityCode() { return taxAuthorityCode; }
    public void setTaxAuthorityCode(String taxAuthorityCode) { this.taxAuthorityCode = taxAuthorityCode; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getTotalTaxAmount() { return totalTaxAmount; }
    public void setTotalTaxAmount(BigDecimal totalTaxAmount) { this.totalTaxAmount = totalTaxAmount; }
    public BigDecimal getTotalPayment() { return totalPayment; }
    public void setTotalPayment(BigDecimal totalPayment) { this.totalPayment = totalPayment; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public List<SalesVoucherItemDTO> getItems() { return items; }
    public void setItems(List<SalesVoucherItemDTO> items) { this.items = items; }
}
