package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tax_declaration_lines")
public class TaxDeclarationLine {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_declaration_id", nullable = false)
    private TaxDeclaration taxDeclaration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_invoice_id", nullable = false)
    private Invoice taxInvoice;

    @Column(name = "line_type", nullable = false, length = 10)
    private String lineType; // OUTPUT, INPUT

    @Column(name = "tax_base_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal taxBaseAmount = BigDecimal.ZERO;

    @Column(name = "vat_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal vatAmount = BigDecimal.ZERO;

    @Column(length = 255)
    private String note;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public TaxDeclaration getTaxDeclaration() { return taxDeclaration; }
    public void setTaxDeclaration(TaxDeclaration taxDeclaration) { this.taxDeclaration = taxDeclaration; }
    
    public Invoice getTaxInvoice() {
        return taxInvoice;
    }

    public void setTaxInvoice(Invoice taxInvoice) {
        this.taxInvoice = taxInvoice;
    }
    public String getLineType() { return lineType; }
    public void setLineType(String lineType) { this.lineType = lineType; }
    
    public BigDecimal getTaxBaseAmount() { return taxBaseAmount; }
    public void setTaxBaseAmount(BigDecimal taxBaseAmount) { this.taxBaseAmount = taxBaseAmount; }
    
    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }
    
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
