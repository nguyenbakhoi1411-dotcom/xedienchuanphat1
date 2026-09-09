package com.chuanphat.warranty.marketing.entity;

import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.marketing.enums.PriceChangeSource;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_history", indexes = {
        @Index(name = "idx_ph_sp", columnList = "san_pham_id, thoi_diem_thay_doi")
})
public class PriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "san_pham_id", nullable = false)
    private Product sanPham;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_list_id", nullable = false)
    private PriceList priceList;

    @Column(name = "gia_cu", nullable = false, precision = 18, scale = 0)
    private BigDecimal giaCu;

    @Column(name = "gia_moi", nullable = false, precision = 18, scale = 0)
    private BigDecimal giaMoi;

    @Column(name = "ly_do_thay_doi")
    private String lyDoThayDoi;

    @Enumerated(EnumType.STRING)
    @Column(name = "nguon_thay_doi", length = 20)
    @Builder.Default
    private PriceChangeSource nguonThayDoi = PriceChangeSource.MANUAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adjustment_id")
    private PriceAdjustment adjustment;

    @Column(name = "nguoi_thay_doi")
    private String nguoiThayDoi;

    @CreationTimestamp
    @Column(name = "thoi_diem_thay_doi", updatable = false)
    private LocalDateTime thoiDiemThayDoi;

    public PriceHistory() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getSanPham() { return sanPham; }
    public void setSanPham(Product sanPham) { this.sanPham = sanPham; }
    public PriceList getPriceList() { return priceList; }
    public void setPriceList(PriceList priceList) { this.priceList = priceList; }
    public BigDecimal getGiaCu() { return giaCu; }
    public void setGiaCu(BigDecimal giaCu) { this.giaCu = giaCu; }
    public BigDecimal getGiaMoi() { return giaMoi; }
    public void setGiaMoi(BigDecimal giaMoi) { this.giaMoi = giaMoi; }
    public String getLyDoThayDoi() { return lyDoThayDoi; }
    public void setLyDoThayDoi(String lyDoThayDoi) { this.lyDoThayDoi = lyDoThayDoi; }
    public PriceChangeSource getNguonThayDoi() { return nguonThayDoi; }
    public void setNguonThayDoi(PriceChangeSource nguonThayDoi) { this.nguonThayDoi = nguonThayDoi; }
    public PriceAdjustment getAdjustment() { return adjustment; }
    public void setAdjustment(PriceAdjustment adjustment) { this.adjustment = adjustment; }
    public String getNguoiThayDoi() { return nguoiThayDoi; }
    public void setNguoiThayDoi(String nguoiThayDoi) { this.nguoiThayDoi = nguoiThayDoi; }
    public LocalDateTime getThoiDiemThayDoi() { return thoiDiemThayDoi; }
    public void setThoiDiemThayDoi(LocalDateTime thoiDiemThayDoi) { this.thoiDiemThayDoi = thoiDiemThayDoi; }
    public PriceHistory(Long id, Product sanPham, PriceList priceList, BigDecimal giaCu, BigDecimal giaMoi, String lyDoThayDoi, PriceChangeSource nguonThayDoi, PriceAdjustment adjustment, String nguoiThayDoi, LocalDateTime thoiDiemThayDoi) { this.id = id; this.sanPham = sanPham; this.priceList = priceList; this.giaCu = giaCu; this.giaMoi = giaMoi; this.lyDoThayDoi = lyDoThayDoi; this.nguonThayDoi = nguonThayDoi; this.adjustment = adjustment; this.nguoiThayDoi = nguoiThayDoi; this.thoiDiemThayDoi = thoiDiemThayDoi; }
    public static PriceHistoryBuilder builder() { return new PriceHistoryBuilder(); }
    public static class PriceHistoryBuilder {
        private Long id;
        private Product sanPham;
        private PriceList priceList;
        private BigDecimal giaCu;
        private BigDecimal giaMoi;
        private String lyDoThayDoi;
        private PriceChangeSource nguonThayDoi;
        private PriceAdjustment adjustment;
        private String nguoiThayDoi;
        private LocalDateTime thoiDiemThayDoi;
        public PriceHistoryBuilder id(Long id) { this.id = id; return this; }
        public PriceHistoryBuilder sanPham(Product sanPham) { this.sanPham = sanPham; return this; }
        public PriceHistoryBuilder priceList(PriceList priceList) { this.priceList = priceList; return this; }
        public PriceHistoryBuilder giaCu(BigDecimal giaCu) { this.giaCu = giaCu; return this; }
        public PriceHistoryBuilder giaMoi(BigDecimal giaMoi) { this.giaMoi = giaMoi; return this; }
        public PriceHistoryBuilder lyDoThayDoi(String lyDoThayDoi) { this.lyDoThayDoi = lyDoThayDoi; return this; }
        public PriceHistoryBuilder nguonThayDoi(PriceChangeSource nguonThayDoi) { this.nguonThayDoi = nguonThayDoi; return this; }
        public PriceHistoryBuilder adjustment(PriceAdjustment adjustment) { this.adjustment = adjustment; return this; }
        public PriceHistoryBuilder nguoiThayDoi(String nguoiThayDoi) { this.nguoiThayDoi = nguoiThayDoi; return this; }
        public PriceHistoryBuilder thoiDiemThayDoi(LocalDateTime thoiDiemThayDoi) { this.thoiDiemThayDoi = thoiDiemThayDoi; return this; }
        public PriceHistory build() { return new PriceHistory(id, sanPham, priceList, giaCu, giaMoi, lyDoThayDoi, nguonThayDoi, adjustment, nguoiThayDoi, thoiDiemThayDoi); }
    }
}

