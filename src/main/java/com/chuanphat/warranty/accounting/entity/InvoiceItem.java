package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "invoice_items")
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(name = "thu_tu")
    private Integer thuTu = 1;

    @Column(name = "ten_hang_hoa", nullable = false, length = 500)
    private String tenHangHoa;

    @Column(name = "don_vi_tinh", length = 50)
    private String donViTinh;

    @Column(name = "so_luong", precision = 10, scale = 3)
    private BigDecimal soLuong;

    @Column(name = "don_gia", precision = 18, scale = 2)
    private BigDecimal donGia;

    @Column(name = "chiet_khau_phan_tram", precision = 5, scale = 2)
    private BigDecimal chietKhauPhanTram = BigDecimal.ZERO;

    @Column(name = "thanh_tien_truoc_thue", precision = 18, scale = 2)
    private BigDecimal thanhTienTruocThue;

    @Column(name = "thue_suat", precision = 5, scale = 2)
    private BigDecimal thueSuat = new BigDecimal("10.00");

    @Column(name = "tien_thue", precision = 18, scale = 2)
    private BigDecimal tienThue;

    @Column(name = "thanh_tien", precision = 18, scale = 2)
    private BigDecimal thanhTien;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice invoice) { this.invoice = invoice; }
    public Integer getThuTu() { return thuTu; }
    public void setThuTu(Integer thuTu) { this.thuTu = thuTu; }
    public String getTenHangHoa() { return tenHangHoa; }
    public void setTenHangHoa(String tenHangHoa) { this.tenHangHoa = tenHangHoa; }
    public String getDonViTinh() { return donViTinh; }
    public void setDonViTinh(String donViTinh) { this.donViTinh = donViTinh; }
    public BigDecimal getSoLuong() { return soLuong; }
    public void setSoLuong(BigDecimal soLuong) { this.soLuong = soLuong; }
    public BigDecimal getDonGia() { return donGia; }
    public void setDonGia(BigDecimal donGia) { this.donGia = donGia; }
    public BigDecimal getChietKhauPhanTram() { return chietKhauPhanTram; }
    public void setChietKhauPhanTram(BigDecimal chietKhauPhanTram) { this.chietKhauPhanTram = chietKhauPhanTram; }
    public BigDecimal getThanhTienTruocThue() { return thanhTienTruocThue; }
    public void setThanhTienTruocThue(BigDecimal thanhTienTruocThue) { this.thanhTienTruocThue = thanhTienTruocThue; }
    public BigDecimal getThueSuat() { return thueSuat; }
    public void setThueSuat(BigDecimal thueSuat) { this.thueSuat = thueSuat; }
    public BigDecimal getTienThue() { return tienThue; }
    public void setTienThue(BigDecimal tienThue) { this.tienThue = tienThue; }
    public BigDecimal getThanhTien() { return thanhTien; }
    public void setThanhTien(BigDecimal thanhTien) { this.thanhTien = thanhTien; }
}
