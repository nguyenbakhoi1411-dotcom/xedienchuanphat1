package com.chuanphat.warranty.marketing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "marketing_campaigns")
public class MarketingCampaign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 50)
    private String source;

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal budget = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String status = "PLANNED";

    @Column(length = 1000)
    private String note;

    public Long getId() { return id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getSource() { return source; }

    public void setSource(String source) { this.source = source; }

    public LocalDate getStartDate() { return startDate; }

    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }

    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getBudget() { return budget; }

    public void setBudget(BigDecimal budget) { this.budget = budget; }

    public String getStatus() { return status; }

    public void setStatus(String status) { this.status = status; }

    public String getNote() { return note; }

    public void setNote(String note) { this.note = note; }
}
