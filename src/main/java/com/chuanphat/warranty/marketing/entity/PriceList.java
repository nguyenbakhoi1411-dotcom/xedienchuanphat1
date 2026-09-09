package com.chuanphat.warranty.marketing.entity;

import com.chuanphat.warranty.marketing.enums.PriceListStatus;
import com.chuanphat.warranty.marketing.enums.PriceListType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_lists", indexes = {
        @Index(name = "idx_pl_trang_thai", columnList = "trang_thai, ap_dung_tu, ap_dung_den")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceList {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_bang_gia", length = 30, nullable = false, unique = true)
    private String maBangGia;

    @Column(name = "ten_bang_gia", nullable = false)
    private String tenBangGia;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai_bang_gia", length = 20)
    @Builder.Default
    private PriceListType loaiBangGia = PriceListType.RETAIL;

    @Column(columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "don_vi_tien", length = 10)
    @Builder.Default
    private String donViTien = "VND";

    @Column(name = "ap_dung_tu", nullable = false)
    private LocalDate apDungTu;

    @Column(name = "ap_dung_den")
    private LocalDate apDungDen;

    @Column(name = "ty_le_chiet_khau_mac_dinh", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal tyLeChietKhauMacDinh = BigDecimal.ZERO;

    @Column(name = "la_bang_gia_mac_dinh")
    @Builder.Default
    private Boolean laBangGiaMacDinh = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 20)
    @Builder.Default
    private PriceListStatus trangThai = PriceListStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String ghiChu;

    @CreationTimestamp
    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @UpdateTimestamp
    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @Column(name = "created_by")
    private String createdBy;
    public static PriceListBuilder builder() { return new PriceListBuilder(); }
    public static class PriceListBuilder {
        private PriceList pl = new PriceList();
        public PriceListBuilder id(Long id) { pl.id = id; return this; }
        public PriceListBuilder maBangGia(String maBangGia) { pl.maBangGia = maBangGia; return this; }
        public PriceListBuilder tenBangGia(String tenBangGia) { pl.tenBangGia = tenBangGia; return this; }
        public PriceListBuilder apDungTu(java.time.LocalDate apDungTu) { pl.apDungTu = apDungTu; return this; }
        public PriceListBuilder apDungDen(java.time.LocalDate apDungDen) { pl.apDungDen = apDungDen; return this; }
        public PriceListBuilder laBangGiaMacDinh(Boolean laBangGiaMacDinh) { pl.laBangGiaMacDinh = laBangGiaMacDinh; return this; }
        public PriceListBuilder trangThai(PriceListStatus trangThai) { pl.trangThai = trangThai; return this; }
        public PriceListBuilder ghiChu(String ghiChu) { pl.ghiChu = ghiChu; return this; }
        public PriceListBuilder loaiBangGia(com.chuanphat.warranty.marketing.enums.PriceListType type) { return this; }
        public PriceListBuilder moTa(String m) { return this; }
        public PriceListBuilder tyLeChietKhauMacDinh(java.math.BigDecimal tyLeChietKhauMacDinh) { pl.tyLeChietKhauMacDinh = tyLeChietKhauMacDinh; return this; }
        public PriceList build() { return pl; }
    }
    public Long getId() { return id; }
    public Boolean getLaBangGiaMacDinh() { return laBangGiaMacDinh; }
    public java.time.LocalDate getApDungTu() { return apDungTu; }
    public void setTrangThai(PriceListStatus trangThai) { this.trangThai = trangThai; }
    public PriceListStatus getTrangThai() { return trangThai; }
}







