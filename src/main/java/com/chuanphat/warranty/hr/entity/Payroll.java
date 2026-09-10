package com.chuanphat.warranty.hr.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payrolls")
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 30)
    private String payrollCode;
    @Column(nullable = false)
    private Long employeeId;
    @Column(nullable = false)
    private Long branchId;
    @Column(nullable = false)
    private Integer month;
    @Column(nullable = false)
    private Integer year;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal baseSalary = BigDecimal.ZERO;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal allowance = BigDecimal.ZERO;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal commission = BigDecimal.ZERO;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal kpiBonus = BigDecimal.ZERO;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal overtimePay = BigDecimal.ZERO;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal deductionLate = BigDecimal.ZERO;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal advanceTaken = BigDecimal.ZERO;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal grossSalary = BigDecimal.ZERO;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal netSalary = BigDecimal.ZERO;
    @Column(nullable = false, length = 20)
    private String status = "DRAFT";
    private String approvedBy;
    private OffsetDateTime approvedAt;
    private OffsetDateTime paidAt;
    private String note;
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(nullable = false)
    private String createdBy = "system";
    @OneToMany(mappedBy = "payroll", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PayrollItem> items = new ArrayList<>();

    public void addItem(PayrollItem item) { items.add(item); item.setPayroll(this); }
    public Long getId() { return id; }
    public String getPayrollCode() { return payrollCode; }
    public void setPayrollCode(String payrollCode) { this.payrollCode = payrollCode; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary == null ? BigDecimal.ZERO : baseSalary; }
    public BigDecimal getAllowance() { return allowance; }
    public void setAllowance(BigDecimal allowance) { this.allowance = allowance == null ? BigDecimal.ZERO : allowance; }
    public BigDecimal getCommission() { return commission; }
    public void setCommission(BigDecimal commission) { this.commission = commission == null ? BigDecimal.ZERO : commission; }
    public BigDecimal getKpiBonus() { return kpiBonus; }
    public void setKpiBonus(BigDecimal kpiBonus) { this.kpiBonus = kpiBonus == null ? BigDecimal.ZERO : kpiBonus; }
    public BigDecimal getOvertimePay() { return overtimePay; }
    public void setOvertimePay(BigDecimal overtimePay) { this.overtimePay = overtimePay == null ? BigDecimal.ZERO : overtimePay; }
    public BigDecimal getDeductionLate() { return deductionLate; }
    public void setDeductionLate(BigDecimal deductionLate) { this.deductionLate = deductionLate == null ? BigDecimal.ZERO : deductionLate; }
    public BigDecimal getAdvanceTaken() { return advanceTaken; }
    public void setAdvanceTaken(BigDecimal advanceTaken) { this.advanceTaken = advanceTaken == null ? BigDecimal.ZERO : advanceTaken; }
    public BigDecimal getGrossSalary() { return grossSalary; }
    public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary == null ? BigDecimal.ZERO : grossSalary; }
    public BigDecimal getNetSalary() { return netSalary; }
    public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary == null ? BigDecimal.ZERO : netSalary; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public OffsetDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(OffsetDateTime approvedAt) { this.approvedAt = approvedAt; }
    public OffsetDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(OffsetDateTime paidAt) { this.paidAt = paidAt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public List<PayrollItem> getItems() { return items; }
}
