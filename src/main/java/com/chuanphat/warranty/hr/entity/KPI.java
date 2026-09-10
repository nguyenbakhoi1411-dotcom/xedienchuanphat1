package com.chuanphat.warranty.hr.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "employee_kpis")
public class KPI {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Long employeeId;
    @Column(nullable = false)
    private Integer month;
    @Column(nullable = false)
    private Integer year;
    private Integer leadsHandled = 0;
    private Integer quotationsSent = 0;
    private Integer ordersClosed = 0;
    @Column(precision = 14, scale = 2)
    private BigDecimal revenue = BigDecimal.ZERO;
    @Column(precision = 14, scale = 2)
    private BigDecimal profit = BigDecimal.ZERO;
    @Column(precision = 5, scale = 2)
    private BigDecimal conversionRate = BigDecimal.ZERO;
    private Integer serviceTicketsHandled = 0;
    @Column(precision = 5, scale = 2)
    private BigDecimal kpiScore = BigDecimal.ZERO;
    private String note;
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Integer getLeadsHandled() { return leadsHandled; }
    public void setLeadsHandled(Integer leadsHandled) { this.leadsHandled = leadsHandled == null ? 0 : leadsHandled; }
    public Integer getQuotationsSent() { return quotationsSent; }
    public void setQuotationsSent(Integer quotationsSent) { this.quotationsSent = quotationsSent == null ? 0 : quotationsSent; }
    public Integer getOrdersClosed() { return ordersClosed; }
    public void setOrdersClosed(Integer ordersClosed) { this.ordersClosed = ordersClosed == null ? 0 : ordersClosed; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue == null ? BigDecimal.ZERO : revenue; }
    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit == null ? BigDecimal.ZERO : profit; }
    public BigDecimal getConversionRate() { return conversionRate; }
    public void setConversionRate(BigDecimal conversionRate) { this.conversionRate = conversionRate == null ? BigDecimal.ZERO : conversionRate; }
    public Integer getServiceTicketsHandled() { return serviceTicketsHandled; }
    public void setServiceTicketsHandled(Integer serviceTicketsHandled) { this.serviceTicketsHandled = serviceTicketsHandled == null ? 0 : serviceTicketsHandled; }
    public BigDecimal getKpiScore() { return kpiScore; }
    public void setKpiScore(BigDecimal kpiScore) { this.kpiScore = kpiScore == null ? BigDecimal.ZERO : kpiScore; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
