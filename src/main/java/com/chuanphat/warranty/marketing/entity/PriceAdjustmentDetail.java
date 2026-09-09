package com.chuanphat.warranty.marketing.entity;

import com.chuanphat.warranty.core.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "price_adjustment_details")
public class PriceAdjustmentDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adjustment_id", nullable = false)
    private PriceAdjustment adjustment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "san_pham_id", nullable = false)
    private Product sanPham;

    @Column(name = "ten_san_pham")
    private String tenSanPham;

    @Column(name = "gia_cu", nullable = false, precision = 18, scale = 0)
    private BigDecimal giaCu;

    @Column(name = "gia_moi", nullable = false, precision = 18, scale = 0)
    private BigDecimal giaMoi;

    @org.hibernate.annotations.Generated
    @Column(name = "chenh_lech", precision = 18, scale = 0)
    private BigDecimal chenhLech;

    @Column(name = "phan_tram_thay_doi", precision = 8, scale = 4)
    private BigDecimal phanTramThayDoi;

    public PriceAdjustmentDetail() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PriceAdjustment getAdjustment() { return adjustment; }
    public void setAdjustment(PriceAdjustment adjustment) { this.adjustment = adjustment; }
    public Product getSanPham() { return sanPham; }
    public void setSanPham(Product sanPham) { this.sanPham = sanPham; }
    public String getTenSanPham() { return tenSanPham; }
    public void setTenSanPham(String tenSanPham) { this.tenSanPham = tenSanPham; }
    public BigDecimal getGiaCu() { return giaCu; }
    public void setGiaCu(BigDecimal giaCu) { this.giaCu = giaCu; }
    public BigDecimal getGiaMoi() { return giaMoi; }
    public void setGiaMoi(BigDecimal giaMoi) { this.giaMoi = giaMoi; }
    public BigDecimal getChenhLech() { return chenhLech; }
    public void setChenhLech(BigDecimal chenhLech) { this.chenhLech = chenhLech; }
    public BigDecimal getPhanTramThayDoi() { return phanTramThayDoi; }
    public void setPhanTramThayDoi(BigDecimal phanTramThayDoi) { this.phanTramThayDoi = phanTramThayDoi; }
    public PriceAdjustmentDetail(Long id, PriceAdjustment adjustment, Product sanPham, String tenSanPham, BigDecimal giaCu, BigDecimal giaMoi, BigDecimal chenhLech, BigDecimal phanTramThayDoi) { this.id = id; this.adjustment = adjustment; this.sanPham = sanPham; this.tenSanPham = tenSanPham; this.giaCu = giaCu; this.giaMoi = giaMoi; this.chenhLech = chenhLech; this.phanTramThayDoi = phanTramThayDoi; }
    public static PriceAdjustmentDetailBuilder builder() { return new PriceAdjustmentDetailBuilder(); }
    public static class PriceAdjustmentDetailBuilder {
        private Long id;
        private PriceAdjustment adjustment;
        private Product sanPham;
        private String tenSanPham;
        private BigDecimal giaCu;
        private BigDecimal giaMoi;
        private BigDecimal chenhLech;
        private BigDecimal phanTramThayDoi;
        public PriceAdjustmentDetailBuilder id(Long id) { this.id = id; return this; }
        public PriceAdjustmentDetailBuilder adjustment(PriceAdjustment adjustment) { this.adjustment = adjustment; return this; }
        public PriceAdjustmentDetailBuilder sanPham(Product sanPham) { this.sanPham = sanPham; return this; }
        public PriceAdjustmentDetailBuilder tenSanPham(String tenSanPham) { this.tenSanPham = tenSanPham; return this; }
        public PriceAdjustmentDetailBuilder giaCu(BigDecimal giaCu) { this.giaCu = giaCu; return this; }
        public PriceAdjustmentDetailBuilder giaMoi(BigDecimal giaMoi) { this.giaMoi = giaMoi; return this; }
        public PriceAdjustmentDetailBuilder chenhLech(BigDecimal chenhLech) { this.chenhLech = chenhLech; return this; }
        public PriceAdjustmentDetailBuilder phanTramThayDoi(BigDecimal phanTramThayDoi) { this.phanTramThayDoi = phanTramThayDoi; return this; }
        public PriceAdjustmentDetail build() { return new PriceAdjustmentDetail(id, adjustment, sanPham, tenSanPham, giaCu, giaMoi, chenhLech, phanTramThayDoi); }
    }
}

