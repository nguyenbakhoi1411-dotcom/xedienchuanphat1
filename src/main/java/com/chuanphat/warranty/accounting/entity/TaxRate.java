package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "tax_rates")
public class TaxRate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 20)
    private String code; // VAT_0, VAT_5, VAT_8, VAT_10, EXEMPT
    
    @Column(nullable = false, length = 100)
    private String name; // "VAT 10%", "Không chịu thuế"
    
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal rate; // 0, 5, 8, 10
    
    @Column(length = 20)
    private String accountCode; // Tài khoản hạch toán: 3331, 1331
    
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean active = true;
    
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
    
    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getRate() { return rate; }
    public void setRate(BigDecimal rate) { this.rate = rate; }
    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
