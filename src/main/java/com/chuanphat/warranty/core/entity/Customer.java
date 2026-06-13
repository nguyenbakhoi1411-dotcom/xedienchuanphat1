package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.crm.enums.CustomerRank;
import com.chuanphat.warranty.crm.enums.CustomerTier;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 30)
    private String customerCode;

    @Column(nullable = false, unique = true, length = 30)
    private String phone;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(length = 120)
    private String email;

    @Column(length = 255)
    private String address;

    @Column(length = 50)
    private String source;

    @Column(nullable = false)
    private Long branchId;

    private Long assignedTo;

    private Long customerGroupId;

    @Column(length = 40)
    private String birthday;  // format: MM-DD or YYYY-MM-DD

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CustomerTier tier = CustomerTier.NEW;

    /** Rank (mới, tiềm năng, bình thường, VIP, không hoạt động) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CustomerRank rank = CustomerRank.NEW;

    /** Điểm tích lũy CRM */
    @Column(nullable = false)
    private int score = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecordStatus status = RecordStatus.ACTIVE;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // ── Customer 360 — Aggregated stats ──────────────────────────
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalPurchaseAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private int totalPurchaseCount = 0;

    private LocalDate lastPurchaseDate;

    private LocalDate lastServiceDate;

    /** Ngày chăm sóc gần nhất */
    private LocalDate lastCareDate;

    /** Tổng công nợ hiện tại (derived, updated by SalesOrder events) */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalDebt = BigDecimal.ZERO;

    /** Lifetime Value = tổng doanh thu từ khách hàng này */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal lifetimeValue = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String note;

    // ── Getters / Setters ──────────────────────────────────────────
    public Long getId() { return id; }
    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }
    public Long getCustomerGroupId() { return customerGroupId; }
    public void setCustomerGroupId(Long customerGroupId) { this.customerGroupId = customerGroupId; }
    public String getBirthday() { return birthday; }
    public void setBirthday(String birthday) { this.birthday = birthday; }
    public CustomerTier getTier() { return tier; }
    public void setTier(CustomerTier tier) { this.tier = tier; }
    public CustomerRank getRank() { return rank; }
    public void setRank(CustomerRank rank) { this.rank = rank; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public RecordStatus getStatus() { return status; }
    public void setStatus(RecordStatus status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public BigDecimal getTotalPurchaseAmount() { return totalPurchaseAmount; }
    public void setTotalPurchaseAmount(BigDecimal v) { this.totalPurchaseAmount = v == null ? BigDecimal.ZERO : v; }
    public int getTotalPurchaseCount() { return totalPurchaseCount; }
    public void setTotalPurchaseCount(int v) { this.totalPurchaseCount = v; }
    public LocalDate getLastPurchaseDate() { return lastPurchaseDate; }
    public void setLastPurchaseDate(LocalDate v) { this.lastPurchaseDate = v; }
    public LocalDate getLastServiceDate() { return lastServiceDate; }
    public void setLastServiceDate(LocalDate v) { this.lastServiceDate = v; }
    public LocalDate getLastCareDate() { return lastCareDate; }
    public void setLastCareDate(LocalDate v) { this.lastCareDate = v; }
    public BigDecimal getTotalDebt() { return totalDebt; }
    public void setTotalDebt(BigDecimal v) { this.totalDebt = v == null ? BigDecimal.ZERO : v; }
    public BigDecimal getLifetimeValue() { return lifetimeValue; }
    public void setLifetimeValue(BigDecimal v) { this.lifetimeValue = v == null ? BigDecimal.ZERO : v; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
