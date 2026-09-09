package com.chuanphat.warranty.accounting.dto;

public class TaxCodeLookupDto {
    private String taxCode;
    private String companyName;
    private String status;
    private String address;

    public TaxCodeLookupDto() {}

    public TaxCodeLookupDto(String taxCode, String companyName, String status, String address) {
        this.taxCode = taxCode;
        this.companyName = companyName;
        this.status = status;
        this.address = address;
    }

    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
