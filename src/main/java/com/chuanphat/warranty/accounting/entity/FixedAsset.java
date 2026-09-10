package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * FixedAsset — Tài sản cố định (TSCĐ).
 * Khấu hao tự động theo tháng bằng phương pháp đường thẳng (STRAIGHT_LINE)
 * hoặc số dư giảm dần (DECLINING_BALANCE).
 */
@Entity
@Table(name = "fixed_assets")
public class FixedAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String assetCode;

    @Column(nullable = false, length = 200)
    private String assetName;

    /**
     * VEHICLE | MACHINE | EQUIPMENT | BUILDING | OTHER
     */
    @Column(nullable = false, length = 40)
    private String category;

    /**
     * ACTIVE | DISPOSED | FULLY_DEPRECIATED
     */
    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(nullable = false)
    private LocalDate purchaseDate;

    /** Nguyên giá (giá mua + chi phí đưa vào sử dụng) */
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal costAmount;

    /** Giá trị thanh lý ước tính */
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal residualValue = BigDecimal.ZERO;

    /** Thời gian khấu hao (tháng) */
    @Column(nullable = false)
    private Integer usefulLifeMonths;

    /** STRAIGHT_LINE | DECLINING_BALANCE */
    @Column(nullable = false, length = 20)
    private String depreciationMethod = "STRAIGHT_LINE";

    /** Khấu hao lũy kế */
    @Column(name = "accumulated_depr", nullable = false, precision = 18, scale = 2)
    private BigDecimal accumulatedDepreciation = BigDecimal.ZERO;

    /** Giá trị còn lại = costAmount - accumulatedDepreciation */
    public BigDecimal getBookValue() {
        return costAmount.subtract(accumulatedDepreciation);
    }

    @Column(nullable = false)
    private Long branchId;

    /** TK TSCĐ hữu hình (VD: 211) */
    @Column(nullable = false, length = 20)
    private String accountCode = "211";

    /** TK hao mòn lũy kế (VD: 214) */
    @Column(name = "depr_account_code", nullable = false, length = 20)
    private String depreciationAccountCode = "214";

    /** TK chi phí khấu hao (VD: 642) */
    @Column(name = "expense_account", nullable = false, length = 20)
    private String expenseAccountCode = "642";

    @Column(length = 80)
    private String purchaseOrderNo;

    @Column(length = 200)
    private String supplierName;

    @Column(length = 500)
    private String note;

    // Thanh lý
    private LocalDate disposedAt;

    @Column(length = 120)
    private String disposedBy;

    @Column(precision = 18, scale = 2)
    private BigDecimal disposalAmount;

    @Column(nullable = false, length = 120)
    private String createdBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // ── Getters & Setters ──
    public Long getId() { return id; }
    public String getAssetCode() { return assetCode; }
    public void setAssetCode(String assetCode) { this.assetCode = assetCode; }
    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }
    public BigDecimal getCostAmount() { return costAmount; }
    public void setCostAmount(BigDecimal costAmount) { this.costAmount = costAmount; }
    public BigDecimal getResidualValue() { return residualValue; }
    public void setResidualValue(BigDecimal residualValue) { this.residualValue = residualValue; }
    public Integer getUsefulLifeMonths() { return usefulLifeMonths; }
    public void setUsefulLifeMonths(Integer usefulLifeMonths) { this.usefulLifeMonths = usefulLifeMonths; }
    public String getDepreciationMethod() { return depreciationMethod; }
    public void setDepreciationMethod(String depreciationMethod) { this.depreciationMethod = depreciationMethod; }
    public BigDecimal getAccumulatedDepreciation() { return accumulatedDepreciation; }
    public void setAccumulatedDepreciation(BigDecimal accumulatedDepreciation) { this.accumulatedDepreciation = accumulatedDepreciation; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
    public String getDepreciationAccountCode() { return depreciationAccountCode; }
    public void setDepreciationAccountCode(String depreciationAccountCode) { this.depreciationAccountCode = depreciationAccountCode; }
    public String getExpenseAccountCode() { return expenseAccountCode; }
    public void setExpenseAccountCode(String expenseAccountCode) { this.expenseAccountCode = expenseAccountCode; }
    public String getPurchaseOrderNo() { return purchaseOrderNo; }
    public void setPurchaseOrderNo(String purchaseOrderNo) { this.purchaseOrderNo = purchaseOrderNo; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public LocalDate getDisposedAt() { return disposedAt; }
    public void setDisposedAt(LocalDate disposedAt) { this.disposedAt = disposedAt; }
    public String getDisposedBy() { return disposedBy; }
    public void setDisposedBy(String disposedBy) { this.disposedBy = disposedBy; }
    public BigDecimal getDisposalAmount() { return disposalAmount; }
    public void setDisposalAmount(BigDecimal disposalAmount) { this.disposalAmount = disposalAmount; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
