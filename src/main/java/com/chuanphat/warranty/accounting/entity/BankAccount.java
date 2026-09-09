package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "bank_accounts")
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 30)
    private String maTaiKhoan; // TK-0001, auto-generated

    @Column(nullable = false, length = 120)
    private String bankName;

    @Column(length = 30)
    private String maNganHang; // BIC/SWIFT

    @Column(length = 255)
    private String chiNhanhNganHang;

    @Column(nullable = false, unique = true, length = 80)
    private String accountNumber; // so_tai_khoan

    @Column(nullable = false, length = 120)
    private String accountHolder; // ten_chu_tai_khoan

    @Column(length = 10)
    private String currency = "VND";

    @Column(length = 10)
    private String accountingCode = "1121"; // TK ke toan

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(precision = 18, scale = 2)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    private LocalDate openingBalanceDate;

    @Column(precision = 18, scale = 2)
    private BigDecimal spendingLimit; // han_muc_chi

    @Column(columnDefinition = "TEXT")
    private String ghiChu;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean isDefault = false;

    private Long branchId;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime updatedAt = OffsetDateTime.now();

    private String createdBy;

    // ── Getters and Setters ──

    public Long getId() { return id; }

    public String getMaTaiKhoan() { return maTaiKhoan; }
    public void setMaTaiKhoan(String maTaiKhoan) { this.maTaiKhoan = maTaiKhoan; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getMaNganHang() { return maNganHang; }
    public void setMaNganHang(String maNganHang) { this.maNganHang = maNganHang; }

    public String getChiNhanhNganHang() { return chiNhanhNganHang; }
    public void setChiNhanhNganHang(String chiNhanhNganHang) { this.chiNhanhNganHang = chiNhanhNganHang; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getAccountHolder() { return accountHolder; }
    public void setAccountHolder(String accountHolder) { this.accountHolder = accountHolder; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getAccountingCode() { return accountingCode; }
    public void setAccountingCode(String accountingCode) { this.accountingCode = accountingCode; }

    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }

    public BigDecimal getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }

    public LocalDate getOpeningBalanceDate() { return openingBalanceDate; }
    public void setOpeningBalanceDate(LocalDate openingBalanceDate) { this.openingBalanceDate = openingBalanceDate; }

    public BigDecimal getSpendingLimit() { return spendingLimit; }
    public void setSpendingLimit(BigDecimal spendingLimit) { this.spendingLimit = spendingLimit; }

    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
