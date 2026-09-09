package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.RecordStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Nha cung cap xe dien / phu tung / dich vu.
 * V20: them group, email, website, currentDebt, creditLimit, paymentTermsDays, rating.
 */
@Entity
@Table(name = "suppliers")
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @Column(nullable = false, length = 160)
    private String name;

    // Nhom nha cung cap
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private SupplierGroup group;

    @Column(length = 30)
    private String taxCode;

    @Column(length = 30)
    private String phone;

    @Column(length = 120)
    private String email;

    @Column(length = 200)
    private String website;

    @Column(length = 100)
    private String tenVietTat;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String tinhThanh;

    @Column(length = 120)
    private String contactPerson;

    @Column(length = 100)
    private String chucVuNguoiLH;

    @Column(length = 20)
    private String dienThoaiNguoiLH;

    @Column(length = 255)
    private String emailNguoiLH;

    @Column(length = 50)
    private String soTaiKhoanNH;

    @Column(length = 255)
    private String tenNganHang;

    @Column(length = 255)
    private String chiNhanhNH;

    @Column(length = 10)
    private String phuongThucTT = "BOTH";

    /** Cong no hien tai (tu dong cap nhat khi nhap/tra hang/thanh toan) */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal currentDebt = BigDecimal.ZERO;

    /** Han muc tin dung toi da duoc phep no */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal creditLimit = BigDecimal.ZERO;

    /** So ngay thanh toan theo hop dong (mac dinh 30 ngay) */
    @Column(nullable = false)
    private int paymentTermsDays = 30;

    /** Danh gia 1-5 sao */
    private Short rating;

    @Column(length = 1000)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecordStatus status = RecordStatus.ACTIVE;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // ── Getters & Setters ──────────────────────────────────────────
    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public SupplierGroup getGroup() { return group; }
    public void setGroup(SupplierGroup group) { this.group = group; }
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getTenVietTat() { return tenVietTat; }
    public void setTenVietTat(String tenVietTat) { this.tenVietTat = tenVietTat; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getTinhThanh() { return tinhThanh; }
    public void setTinhThanh(String tinhThanh) { this.tinhThanh = tinhThanh; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getChucVuNguoiLH() { return chucVuNguoiLH; }
    public void setChucVuNguoiLH(String chucVuNguoiLH) { this.chucVuNguoiLH = chucVuNguoiLH; }
    public String getDienThoaiNguoiLH() { return dienThoaiNguoiLH; }
    public void setDienThoaiNguoiLH(String v) { this.dienThoaiNguoiLH = v; }
    public String getEmailNguoiLH() { return emailNguoiLH; }
    public void setEmailNguoiLH(String v) { this.emailNguoiLH = v; }
    public String getSoTaiKhoanNH() { return soTaiKhoanNH; }
    public void setSoTaiKhoanNH(String v) { this.soTaiKhoanNH = v; }
    public String getTenNganHang() { return tenNganHang; }
    public void setTenNganHang(String v) { this.tenNganHang = v; }
    public String getChiNhanhNH() { return chiNhanhNH; }
    public void setChiNhanhNH(String v) { this.chiNhanhNH = v; }
    public String getPhuongThucTT() { return phuongThucTT; }
    public void setPhuongThucTT(String v) { this.phuongThucTT = v; }
    public BigDecimal getCurrentDebt() { return currentDebt; }
    public void setCurrentDebt(BigDecimal currentDebt) { this.currentDebt = currentDebt; }
    public BigDecimal getCreditLimit() { return creditLimit; }
    public void setCreditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; }
    public int getPaymentTermsDays() { return paymentTermsDays; }
    public void setPaymentTermsDays(int paymentTermsDays) { this.paymentTermsDays = paymentTermsDays; }
    public Short getRating() { return rating; }
    public void setRating(Short rating) { this.rating = rating; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public RecordStatus getStatus() { return status; }
    public void setStatus(RecordStatus status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
