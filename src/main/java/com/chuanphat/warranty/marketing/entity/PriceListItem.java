package com.chuanphat.warranty.marketing.entity;

import com.chuanphat.warranty.core.entity.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_list_items", uniqueConstraints = {
        @UniqueConstraint(name = "uk_pl_product", columnNames = {"price_list_id", "san_pham_id"})
}, indexes = {
        @Index(name = "idx_pli_sp", columnList = "san_pham_id")
})
public class PriceListItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_list_id", nullable = false)
    private PriceList priceList;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "san_pham_id", nullable = false)
    private Product sanPham;

    @Column(name = "ma_san_pham", length = 30)
    private String maSanPham;

    @Column(name = "ten_san_pham")
    private String tenSanPham;

    @Column(name = "don_vi_tinh", length = 50)
    private String donViTinh;

    @Column(name = "gia_ban", nullable = false, precision = 18, scale = 0)
    private BigDecimal giaBan;

    @Column(name = "gia_von", precision = 18, scale = 0)
    private BigDecimal giaVon;

    @Column(name = "ty_le_lai_gop", precision = 5, scale = 2)
    private BigDecimal tyLeLaiGop;

    @Column(name = "gia_toi_thieu", precision = 18, scale = 0)
    private BigDecimal giaToiThieu;

    @Column(columnDefinition = "TEXT")
    private String ghiChu;

    @UpdateTimestamp
    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
    public PriceListItem() {}
    public PriceListItem(Long id, PriceList priceList, Product sanPham, String maSanPham, String tenSanPham, String donViTinh, BigDecimal giaBan, BigDecimal giaVon, BigDecimal tyLeLaiGop, BigDecimal giaToiThieu, String ghiChu, LocalDateTime ngayCapNhat) {
        this.id = id; this.priceList = priceList; this.sanPham = sanPham; this.maSanPham = maSanPham; this.tenSanPham = tenSanPham; this.donViTinh = donViTinh; this.giaBan = giaBan; this.giaVon = giaVon; this.tyLeLaiGop = tyLeLaiGop; this.giaToiThieu = giaToiThieu; this.ghiChu = ghiChu; this.ngayCapNhat = ngayCapNhat;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PriceList getPriceList() { return priceList; }
    public void setPriceList(PriceList priceList) { this.priceList = priceList; }
    public Product getSanPham() { return sanPham; }
    public void setSanPham(Product sanPham) { this.sanPham = sanPham; }
    public String getMaSanPham() { return maSanPham; }
    public void setMaSanPham(String maSanPham) { this.maSanPham = maSanPham; }
    public String getTenSanPham() { return tenSanPham; }
    public void setTenSanPham(String tenSanPham) { this.tenSanPham = tenSanPham; }
    public String getDonViTinh() { return donViTinh; }
    public void setDonViTinh(String donViTinh) { this.donViTinh = donViTinh; }
    public BigDecimal getGiaBan() { return giaBan; }
    public void setGiaBan(BigDecimal giaBan) { this.giaBan = giaBan; }
    public BigDecimal getGiaVon() { return giaVon; }
    public void setGiaVon(BigDecimal giaVon) { this.giaVon = giaVon; }
    public BigDecimal getTyLeLaiGop() { return tyLeLaiGop; }
    public void setTyLeLaiGop(BigDecimal tyLeLaiGop) { this.tyLeLaiGop = tyLeLaiGop; }
    public BigDecimal getGiaToiThieu() { return giaToiThieu; }
    public void setGiaToiThieu(BigDecimal giaToiThieu) { this.giaToiThieu = giaToiThieu; }
    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
    public LocalDateTime getNgayCapNhat() { return ngayCapNhat; }
    public void setNgayCapNhat(LocalDateTime ngayCapNhat) { this.ngayCapNhat = ngayCapNhat; }
}


