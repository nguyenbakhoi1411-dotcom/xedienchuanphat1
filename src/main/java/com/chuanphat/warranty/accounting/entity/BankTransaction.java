package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bank_transactions")
public class BankTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 30)
    private String maGiaoDich; // TNH-YYYYMMDD-XXX or CNH-YYYYMMDD-XXX

    @Column(nullable = false, length = 20)
    private String loaiGiaoDich; // RECEIPT or PAYMENT

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id", nullable = false)
    private BankAccount bankAccount;

    @Column(nullable = false)
    private LocalDate ngayGiaoDich;

    @Column(length = 100)
    private String soThamChieuNH; // reference from bank

    @Column(length = 255)
    private String nganHangDoiUng;

    @Column(length = 50)
    private String soTkDoiUng;

    @Column(length = 255)
    private String tenChuTkDoiUng;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal soTien;

    @Column(length = 500)
    private String dienGiai;

    @Column(length = 50)
    private String loaiThuChi; // SALE, DEBT, PURCHASE, SALARY, OPERATING, OTHER

    private Long donHangId;
    private Long nhaCungCapId;
    private Long khachHangId;

    @Column(length = 10)
    private String taiKhoanKeToanNo; // debit account, e.g. 1121

    @Column(length = 10)
    private String taiKhoanKeToanCo; // credit account, e.g. 131

    // New Fields for Master-Detail support
    private Long doiTuongId;

    @Column(length = 20)
    private String loaiDoiTuong; // CUSTOMER, SUPPLIER, EMPLOYEE, OTHER

    @Column(length = 255)
    private String tenDoiTuong;

    @Column(length = 500)
    private String diaChi;

    @Column(length = 500)
    private String lyDo;

    private Long nhanVienId;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BankTransactionItem> items = new ArrayList<>();

    @Column(length = 20)
    private String trangThaiDoiChieu = "UNMATCHED"; // UNMATCHED, MATCHED, DISCREPANCY

    private Long bankStatementLineId;

    @Column(length = 20)
    private String trangThai = "DRAFT"; // DRAFT, CONFIRMED, CANCELLED

    private Long branchId;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime updatedAt = OffsetDateTime.now();

    private String createdBy;

    // ── Getters and Setters ──

    public Long getId() { return id; }

    public String getMaGiaoDich() { return maGiaoDich; }
    public void setMaGiaoDich(String maGiaoDich) { this.maGiaoDich = maGiaoDich; }

    public String getLoaiGiaoDich() { return loaiGiaoDich; }
    public void setLoaiGiaoDich(String loaiGiaoDich) { this.loaiGiaoDich = loaiGiaoDich; }

    public BankAccount getBankAccount() { return bankAccount; }
    public void setBankAccount(BankAccount bankAccount) { this.bankAccount = bankAccount; }

    public LocalDate getNgayGiaoDich() { return ngayGiaoDich; }
    public void setNgayGiaoDich(LocalDate ngayGiaoDich) { this.ngayGiaoDich = ngayGiaoDich; }

    public String getSoThamChieuNH() { return soThamChieuNH; }
    public void setSoThamChieuNH(String soThamChieuNH) { this.soThamChieuNH = soThamChieuNH; }

    public String getNganHangDoiUng() { return nganHangDoiUng; }
    public void setNganHangDoiUng(String nganHangDoiUng) { this.nganHangDoiUng = nganHangDoiUng; }

    public String getSoTkDoiUng() { return soTkDoiUng; }
    public void setSoTkDoiUng(String soTkDoiUng) { this.soTkDoiUng = soTkDoiUng; }

    public String getTenChuTkDoiUng() { return tenChuTkDoiUng; }
    public void setTenChuTkDoiUng(String tenChuTkDoiUng) { this.tenChuTkDoiUng = tenChuTkDoiUng; }

    public BigDecimal getSoTien() { return soTien; }
    public void setSoTien(BigDecimal soTien) { this.soTien = soTien; }

    public String getDienGiai() { return dienGiai; }
    public void setDienGiai(String dienGiai) { this.dienGiai = dienGiai; }

    public String getLoaiThuChi() { return loaiThuChi; }
    public void setLoaiThuChi(String loaiThuChi) { this.loaiThuChi = loaiThuChi; }

    public Long getDonHangId() { return donHangId; }
    public void setDonHangId(Long donHangId) { this.donHangId = donHangId; }

    public Long getNhaCungCapId() { return nhaCungCapId; }
    public void setNhaCungCapId(Long nhaCungCapId) { this.nhaCungCapId = nhaCungCapId; }

    public Long getKhachHangId() { return khachHangId; }
    public void setKhachHangId(Long khachHangId) { this.khachHangId = khachHangId; }

    public String getTaiKhoanKeToanNo() { return taiKhoanKeToanNo; }
    public void setTaiKhoanKeToanNo(String taiKhoanKeToanNo) { this.taiKhoanKeToanNo = taiKhoanKeToanNo; }

    public String getTaiKhoanKeToanCo() { return taiKhoanKeToanCo; }
    public void setTaiKhoanKeToanCo(String taiKhoanKeToanCo) { this.taiKhoanKeToanCo = taiKhoanKeToanCo; }

    public String getTrangThaiDoiChieu() { return trangThaiDoiChieu; }
    public void setTrangThaiDoiChieu(String trangThaiDoiChieu) { this.trangThaiDoiChieu = trangThaiDoiChieu; }

    public Long getBankStatementLineId() { return bankStatementLineId; }
    public void setBankStatementLineId(Long bankStatementLineId) { this.bankStatementLineId = bankStatementLineId; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    // New Getters and Setters
    public Long getDoiTuongId() { return doiTuongId; }
    public void setDoiTuongId(Long doiTuongId) { this.doiTuongId = doiTuongId; }

    public String getLoaiDoiTuong() { return loaiDoiTuong; }
    public void setLoaiDoiTuong(String loaiDoiTuong) { this.loaiDoiTuong = loaiDoiTuong; }

    public String getTenDoiTuong() { return tenDoiTuong; }
    public void setTenDoiTuong(String tenDoiTuong) { this.tenDoiTuong = tenDoiTuong; }

    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }

    public String getLyDo() { return lyDo; }
    public void setLyDo(String lyDo) { this.lyDo = lyDo; }

    public Long getNhanVienId() { return nhanVienId; }
    public void setNhanVienId(Long nhanVienId) { this.nhanVienId = nhanVienId; }

    public List<BankTransactionItem> getItems() { return items; }
    public void setItems(List<BankTransactionItem> items) { 
        this.items.clear();
        if (items != null) {
            this.items.addAll(items);
        }
    }
}
