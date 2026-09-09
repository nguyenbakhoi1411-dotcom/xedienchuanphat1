package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "tax_code_lookup_cache")
public class TaxCodeLookupCache {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tax_code", nullable = false, unique = true, length = 20)
    private String taxCode;

    @Column(name = "company_name", length = 255)
    private String companyName;

    @Column(length = 20, nullable = false)
    private String status = "UNKNOWN"; // ACTIVE, INACTIVE, UNKNOWN

    @Column(length = 500)
    private String address;

    @Column(name = "checked_at", nullable = false)
    private OffsetDateTime checkedAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public OffsetDateTime getCheckedAt() { return checkedAt; }
    public void setCheckedAt(OffsetDateTime checkedAt) { this.checkedAt = checkedAt; }
}
