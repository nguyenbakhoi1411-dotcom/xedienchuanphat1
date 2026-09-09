package com.chuanphat.warranty.marketing.entity;

import com.chuanphat.warranty.marketing.enums.PriceAdjustmentRounding;
import com.chuanphat.warranty.marketing.enums.PriceAdjustmentScope;
import com.chuanphat.warranty.marketing.enums.PriceAdjustmentStatus;
import com.chuanphat.warranty.marketing.enums.PriceAdjustmentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_adjustments")
public class PriceAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_dieu_chinh", length = 30, nullable = false, unique = true)
    private String maDieuChinh;

    @Column(name = "ten_dieu_chinh", nullable = false)
    private String tenDieuChinh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_list_id", nullable = false)
    private PriceList priceList;

    @Enumerated(EnumType.STRING)
    @Column(name = "pham_vi", length = 20, nullable = false)
    private PriceAdjustmentScope phamVi;

    @Column(name = "category_ids", columnDefinition = "JSON")
    private String categoryIds;

    @Column(name = "product_ids", columnDefinition = "JSON")
    private String productIds;

    @Enumerated(EnumType.STRING)
    @Column(name = "kieu_dieu_chinh", length = 20, nullable = false)
    private PriceAdjustmentType kieuDieuChinh;

    @Column(name = "gia_tri", nullable = false, precision = 18, scale = 4)
    private BigDecimal giaTri;

    @Enumerated(EnumType.STRING)
    @Column(name = "lam_tron", length = 20)
    @Builder.Default
    private PriceAdjustmentRounding lamTron = PriceAdjustmentRounding.THOUSAND;

    @Column(name = "ap_dung_tu", nullable = false)
    private LocalDate apDungTu;

    @Column(name = "ap_dung_den")
    private LocalDate apDungDen;

    @Column(columnDefinition = "TEXT")
    private String ghiChu;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 20)
    @Builder.Default
    private PriceAdjustmentStatus trangThai = PriceAdjustmentStatus.DRAFT;

    @Column(name = "ngay_ap_dung")
    private LocalDateTime ngayApDung;

    @Column(name = "applied_by")
    private String appliedBy;

    @CreationTimestamp
    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "created_by")
    private String createdBy;

    public PriceAdjustment() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMaDieuChinh() { return maDieuChinh; }
    public void setMaDieuChinh(String maDieuChinh) { this.maDieuChinh = maDieuChinh; }
    public String getTenDieuChinh() { return tenDieuChinh; }
    public void setTenDieuChinh(String tenDieuChinh) { this.tenDieuChinh = tenDieuChinh; }
    public PriceList getPriceList() { return priceList; }
    public void setPriceList(PriceList priceList) { this.priceList = priceList; }
    public PriceAdjustmentScope getPhamVi() { return phamVi; }
    public void setPhamVi(PriceAdjustmentScope phamVi) { this.phamVi = phamVi; }
    public String getCategoryIds() { return categoryIds; }
    public void setCategoryIds(String categoryIds) { this.categoryIds = categoryIds; }
    public String getProductIds() { return productIds; }
    public void setProductIds(String productIds) { this.productIds = productIds; }
    public PriceAdjustmentType getKieuDieuChinh() { return kieuDieuChinh; }
    public void setKieuDieuChinh(PriceAdjustmentType kieuDieuChinh) { this.kieuDieuChinh = kieuDieuChinh; }
    public BigDecimal getGiaTri() { return giaTri; }
    public void setGiaTri(BigDecimal giaTri) { this.giaTri = giaTri; }
    public PriceAdjustmentRounding getLamTron() { return lamTron; }
    public void setLamTron(PriceAdjustmentRounding lamTron) { this.lamTron = lamTron; }
    public LocalDate getApDungTu() { return apDungTu; }
    public void setApDungTu(LocalDate apDungTu) { this.apDungTu = apDungTu; }
    public LocalDate getApDungDen() { return apDungDen; }
    public void setApDungDen(LocalDate apDungDen) { this.apDungDen = apDungDen; }
    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
    public PriceAdjustmentStatus getTrangThai() { return trangThai; }
    public void setTrangThai(PriceAdjustmentStatus trangThai) { this.trangThai = trangThai; }
    public LocalDateTime getNgayApDung() { return ngayApDung; }
    public void setNgayApDung(LocalDateTime ngayApDung) { this.ngayApDung = ngayApDung; }
    public String getAppliedBy() { return appliedBy; }
    public void setAppliedBy(String appliedBy) { this.appliedBy = appliedBy; }
    public LocalDateTime getNgayTao() { return ngayTao; }
    public void setNgayTao(LocalDateTime ngayTao) { this.ngayTao = ngayTao; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public PriceAdjustment(Long id, String maDieuChinh, String tenDieuChinh, PriceList priceList, PriceAdjustmentScope phamVi, String categoryIds, String productIds, PriceAdjustmentType kieuDieuChinh, BigDecimal giaTri, PriceAdjustmentRounding lamTron, LocalDate apDungTu, LocalDate apDungDen, String ghiChu, PriceAdjustmentStatus trangThai, LocalDateTime ngayApDung, String appliedBy, LocalDateTime ngayTao, String createdBy) { this.id = id; this.maDieuChinh = maDieuChinh; this.tenDieuChinh = tenDieuChinh; this.priceList = priceList; this.phamVi = phamVi; this.categoryIds = categoryIds; this.productIds = productIds; this.kieuDieuChinh = kieuDieuChinh; this.giaTri = giaTri; this.lamTron = lamTron; this.apDungTu = apDungTu; this.apDungDen = apDungDen; this.ghiChu = ghiChu; this.trangThai = trangThai; this.ngayApDung = ngayApDung; this.appliedBy = appliedBy; this.ngayTao = ngayTao; this.createdBy = createdBy; }
    public static PriceAdjustmentBuilder builder() { return new PriceAdjustmentBuilder(); }
    public static class PriceAdjustmentBuilder {
        private Long id;
        private String maDieuChinh;
        private String tenDieuChinh;
        private PriceList priceList;
        private PriceAdjustmentScope phamVi;
        private String categoryIds;
        private String productIds;
        private PriceAdjustmentType kieuDieuChinh;
        private BigDecimal giaTri;
        private PriceAdjustmentRounding lamTron;
        private LocalDate apDungTu;
        private LocalDate apDungDen;
        private String ghiChu;
        private PriceAdjustmentStatus trangThai;
        private LocalDateTime ngayApDung;
        private String appliedBy;
        private LocalDateTime ngayTao;
        private String createdBy;
        public PriceAdjustmentBuilder id(Long id) { this.id = id; return this; }
        public PriceAdjustmentBuilder maDieuChinh(String maDieuChinh) { this.maDieuChinh = maDieuChinh; return this; }
        public PriceAdjustmentBuilder tenDieuChinh(String tenDieuChinh) { this.tenDieuChinh = tenDieuChinh; return this; }
        public PriceAdjustmentBuilder priceList(PriceList priceList) { this.priceList = priceList; return this; }
        public PriceAdjustmentBuilder phamVi(PriceAdjustmentScope phamVi) { this.phamVi = phamVi; return this; }
        public PriceAdjustmentBuilder categoryIds(String categoryIds) { this.categoryIds = categoryIds; return this; }
        public PriceAdjustmentBuilder productIds(String productIds) { this.productIds = productIds; return this; }
        public PriceAdjustmentBuilder kieuDieuChinh(PriceAdjustmentType kieuDieuChinh) { this.kieuDieuChinh = kieuDieuChinh; return this; }
        public PriceAdjustmentBuilder giaTri(BigDecimal giaTri) { this.giaTri = giaTri; return this; }
        public PriceAdjustmentBuilder lamTron(PriceAdjustmentRounding lamTron) { this.lamTron = lamTron; return this; }
        public PriceAdjustmentBuilder apDungTu(LocalDate apDungTu) { this.apDungTu = apDungTu; return this; }
        public PriceAdjustmentBuilder apDungDen(LocalDate apDungDen) { this.apDungDen = apDungDen; return this; }
        public PriceAdjustmentBuilder ghiChu(String ghiChu) { this.ghiChu = ghiChu; return this; }
        public PriceAdjustmentBuilder trangThai(PriceAdjustmentStatus trangThai) { this.trangThai = trangThai; return this; }
        public PriceAdjustmentBuilder ngayApDung(LocalDateTime ngayApDung) { this.ngayApDung = ngayApDung; return this; }
        public PriceAdjustmentBuilder appliedBy(String appliedBy) { this.appliedBy = appliedBy; return this; }
        public PriceAdjustmentBuilder ngayTao(LocalDateTime ngayTao) { this.ngayTao = ngayTao; return this; }
        public PriceAdjustmentBuilder createdBy(String createdBy) { this.createdBy = createdBy; return this; }
        public PriceAdjustment build() { return new PriceAdjustment(id, maDieuChinh, tenDieuChinh, priceList, phamVi, categoryIds, productIds, kieuDieuChinh, giaTri, lamTron, apDungTu, apDungDen, ghiChu, trangThai, ngayApDung, appliedBy, ngayTao, createdBy); }
    }
}

