package com.chuanphat.warranty.marketing.entity;

import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.marketing.enums.PromotionConditionType;
import com.chuanphat.warranty.marketing.enums.PromotionStatus;
import com.chuanphat.warranty.marketing.enums.PromotionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "promotions", indexes = {
        @Index(name = "idx_promo_trang_thai", columnList = "trang_thai, ap_dung_tu, ap_dung_den")
})
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_khuyen_mai", length = 30, nullable = false, unique = true)
    private String maKhuyenMai;

    @Column(name = "ten_khuyen_mai", nullable = false)
    private String tenKhuyenMai;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai_km", length = 30, nullable = false)
    private PromotionType loaiKm;

    @Column(columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "hinh_anh", length = 500)
    private String hinhAnh;

    // Conditions
    @Enumerated(EnumType.STRING)
    @Column(name = "dieu_kien_loai", length = 30)
    @Builder.Default
    private PromotionConditionType dieuKienLoai = PromotionConditionType.ALL_PRODUCTS;

    @Column(name = "dieu_kien_ids", columnDefinition = "JSON")
    private String dieuKienIds;

    @Column(name = "gia_tri_don_toi_thieu", precision = 18, scale = 0)
    @Builder.Default
    private BigDecimal giaTriDonToiThieu = BigDecimal.ZERO;

    @Column(name = "so_lan_su_dung_max")
    private Integer soLanSuDungMax;

    @Column(name = "so_lan_da_su_dung")
    @Builder.Default
    private Integer soLanDaSuDung = 0;

    @Column(name = "moi_kh_max_lan")
    @Builder.Default
    private Integer moiKhMaxLan = 1;

    // Values
    @Column(name = "gia_tri_chiet_khau", precision = 18, scale = 4)
    private BigDecimal giaTriChietKhau;

    @Column(name = "gia_tri_km_toi_da", precision = 18, scale = 0)
    private BigDecimal giaTriKmToiDa;

    // BUY_X_GET_Y
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sp_mua_id")
    private Product spMua;

    @Column(name = "so_luong_mua", precision = 10, scale = 2)
    private BigDecimal soLuongMua;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sp_tang_id")
    private Product spTang;

    @Column(name = "so_luong_tang", precision = 10, scale = 2)
    private BigDecimal soLuongTang;

    // Timing
    @Column(name = "ap_dung_tu", nullable = false)
    private LocalDateTime apDungTu;

    @Column(name = "ap_dung_den")
    private LocalDateTime apDungDen;

    @Column(name = "gio_ap_dung_tu")
    private LocalTime gioApDungTu;

    @Column(name = "gio_ap_dung_den")
    private LocalTime gioApDungDen;

    @Column(name = "ngay_trong_tuan", columnDefinition = "JSON")
    private String ngayTrongTuan;

    // Target
    @Column(name = "nhom_gia_ids", columnDefinition = "JSON")
    private String nhomGiaIds;

    @Column(name = "khach_hang_ids", columnDefinition = "JSON")
    private String khachHangIds;

    // Status
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", length = 20)
    @Builder.Default
    private PromotionStatus trangThai = PromotionStatus.DRAFT;

    @Column(name = "uu_tien")
    @Builder.Default
    private Integer uuTien = 0;

    @Column(name = "co_the_cong_don")
    @Builder.Default
    private Boolean coTheCongDon = false;

    @CreationTimestamp
    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "created_by")
    private String createdBy;

    public Promotion() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMaKhuyenMai() { return maKhuyenMai; }
    public void setMaKhuyenMai(String maKhuyenMai) { this.maKhuyenMai = maKhuyenMai; }
    public String getTenKhuyenMai() { return tenKhuyenMai; }
    public void setTenKhuyenMai(String tenKhuyenMai) { this.tenKhuyenMai = tenKhuyenMai; }
    public PromotionType getLoaiKm() { return loaiKm; }
    public void setLoaiKm(PromotionType loaiKm) { this.loaiKm = loaiKm; }
    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }
    public String getHinhAnh() { return hinhAnh; }
    public void setHinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; }
    public PromotionConditionType getDieuKienLoai() { return dieuKienLoai; }
    public void setDieuKienLoai(PromotionConditionType dieuKienLoai) { this.dieuKienLoai = dieuKienLoai; }
    public String getDieuKienIds() { return dieuKienIds; }
    public void setDieuKienIds(String dieuKienIds) { this.dieuKienIds = dieuKienIds; }
    public BigDecimal getGiaTriDonToiThieu() { return giaTriDonToiThieu; }
    public void setGiaTriDonToiThieu(BigDecimal giaTriDonToiThieu) { this.giaTriDonToiThieu = giaTriDonToiThieu; }
    public Integer getSoLanSuDungMax() { return soLanSuDungMax; }
    public void setSoLanSuDungMax(Integer soLanSuDungMax) { this.soLanSuDungMax = soLanSuDungMax; }
    public Integer getSoLanDaSuDung() { return soLanDaSuDung; }
    public void setSoLanDaSuDung(Integer soLanDaSuDung) { this.soLanDaSuDung = soLanDaSuDung; }
    public Integer getMoiKhMaxLan() { return moiKhMaxLan; }
    public void setMoiKhMaxLan(Integer moiKhMaxLan) { this.moiKhMaxLan = moiKhMaxLan; }
    public BigDecimal getGiaTriChietKhau() { return giaTriChietKhau; }
    public void setGiaTriChietKhau(BigDecimal giaTriChietKhau) { this.giaTriChietKhau = giaTriChietKhau; }
    public BigDecimal getGiaTriKmToiDa() { return giaTriKmToiDa; }
    public void setGiaTriKmToiDa(BigDecimal giaTriKmToiDa) { this.giaTriKmToiDa = giaTriKmToiDa; }
    public Product getSpMua() { return spMua; }
    public void setSpMua(Product spMua) { this.spMua = spMua; }
    public BigDecimal getSoLuongMua() { return soLuongMua; }
    public void setSoLuongMua(BigDecimal soLuongMua) { this.soLuongMua = soLuongMua; }
    public Product getSpTang() { return spTang; }
    public void setSpTang(Product spTang) { this.spTang = spTang; }
    public BigDecimal getSoLuongTang() { return soLuongTang; }
    public void setSoLuongTang(BigDecimal soLuongTang) { this.soLuongTang = soLuongTang; }
    public LocalDateTime getApDungTu() { return apDungTu; }
    public void setApDungTu(LocalDateTime apDungTu) { this.apDungTu = apDungTu; }
    public LocalDateTime getApDungDen() { return apDungDen; }
    public void setApDungDen(LocalDateTime apDungDen) { this.apDungDen = apDungDen; }
    public LocalTime getGioApDungTu() { return gioApDungTu; }
    public void setGioApDungTu(LocalTime gioApDungTu) { this.gioApDungTu = gioApDungTu; }
    public LocalTime getGioApDungDen() { return gioApDungDen; }
    public void setGioApDungDen(LocalTime gioApDungDen) { this.gioApDungDen = gioApDungDen; }
    public String getNgayTrongTuan() { return ngayTrongTuan; }
    public void setNgayTrongTuan(String ngayTrongTuan) { this.ngayTrongTuan = ngayTrongTuan; }
    public String getNhomGiaIds() { return nhomGiaIds; }
    public void setNhomGiaIds(String nhomGiaIds) { this.nhomGiaIds = nhomGiaIds; }
    public String getKhachHangIds() { return khachHangIds; }
    public void setKhachHangIds(String khachHangIds) { this.khachHangIds = khachHangIds; }
    public PromotionStatus getTrangThai() { return trangThai; }
    public void setTrangThai(PromotionStatus trangThai) { this.trangThai = trangThai; }
    public Integer getUuTien() { return uuTien; }
    public void setUuTien(Integer uuTien) { this.uuTien = uuTien; }
    public Boolean getCoTheCongDon() { return coTheCongDon; }
    public void setCoTheCongDon(Boolean coTheCongDon) { this.coTheCongDon = coTheCongDon; }
    public LocalDateTime getNgayTao() { return ngayTao; }
    public void setNgayTao(LocalDateTime ngayTao) { this.ngayTao = ngayTao; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Promotion(Long id, String maKhuyenMai, String tenKhuyenMai, PromotionType loaiKm, String moTa, String hinhAnh, PromotionConditionType dieuKienLoai, String dieuKienIds, BigDecimal giaTriDonToiThieu, Integer soLanSuDungMax, Integer soLanDaSuDung, Integer moiKhMaxLan, BigDecimal giaTriChietKhau, BigDecimal giaTriKmToiDa, Product spMua, BigDecimal soLuongMua, Product spTang, BigDecimal soLuongTang, LocalDateTime apDungTu, LocalDateTime apDungDen, LocalTime gioApDungTu, LocalTime gioApDungDen, String ngayTrongTuan, String nhomGiaIds, String khachHangIds, PromotionStatus trangThai, Integer uuTien, Boolean coTheCongDon, LocalDateTime ngayTao, String createdBy) { this.id = id; this.maKhuyenMai = maKhuyenMai; this.tenKhuyenMai = tenKhuyenMai; this.loaiKm = loaiKm; this.moTa = moTa; this.hinhAnh = hinhAnh; this.dieuKienLoai = dieuKienLoai; this.dieuKienIds = dieuKienIds; this.giaTriDonToiThieu = giaTriDonToiThieu; this.soLanSuDungMax = soLanSuDungMax; this.soLanDaSuDung = soLanDaSuDung; this.moiKhMaxLan = moiKhMaxLan; this.giaTriChietKhau = giaTriChietKhau; this.giaTriKmToiDa = giaTriKmToiDa; this.spMua = spMua; this.soLuongMua = soLuongMua; this.spTang = spTang; this.soLuongTang = soLuongTang; this.apDungTu = apDungTu; this.apDungDen = apDungDen; this.gioApDungTu = gioApDungTu; this.gioApDungDen = gioApDungDen; this.ngayTrongTuan = ngayTrongTuan; this.nhomGiaIds = nhomGiaIds; this.khachHangIds = khachHangIds; this.trangThai = trangThai; this.uuTien = uuTien; this.coTheCongDon = coTheCongDon; this.ngayTao = ngayTao; this.createdBy = createdBy; }
    public static PromotionBuilder builder() { return new PromotionBuilder(); }
    public static class PromotionBuilder {
        private Long id;
        private String maKhuyenMai;
        private String tenKhuyenMai;
        private PromotionType loaiKm;
        private String moTa;
        private String hinhAnh;
        private PromotionConditionType dieuKienLoai;
        private String dieuKienIds;
        private BigDecimal giaTriDonToiThieu;
        private Integer soLanSuDungMax;
        private Integer soLanDaSuDung;
        private Integer moiKhMaxLan;
        private BigDecimal giaTriChietKhau;
        private BigDecimal giaTriKmToiDa;
        private Product spMua;
        private BigDecimal soLuongMua;
        private Product spTang;
        private BigDecimal soLuongTang;
        private LocalDateTime apDungTu;
        private LocalDateTime apDungDen;
        private LocalTime gioApDungTu;
        private LocalTime gioApDungDen;
        private String ngayTrongTuan;
        private String nhomGiaIds;
        private String khachHangIds;
        private PromotionStatus trangThai;
        private Integer uuTien;
        private Boolean coTheCongDon;
        private LocalDateTime ngayTao;
        private String createdBy;
        public PromotionBuilder id(Long id) { this.id = id; return this; }
        public PromotionBuilder maKhuyenMai(String maKhuyenMai) { this.maKhuyenMai = maKhuyenMai; return this; }
        public PromotionBuilder tenKhuyenMai(String tenKhuyenMai) { this.tenKhuyenMai = tenKhuyenMai; return this; }
        public PromotionBuilder loaiKm(PromotionType loaiKm) { this.loaiKm = loaiKm; return this; }
        public PromotionBuilder moTa(String moTa) { this.moTa = moTa; return this; }
        public PromotionBuilder hinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; return this; }
        public PromotionBuilder dieuKienLoai(PromotionConditionType dieuKienLoai) { this.dieuKienLoai = dieuKienLoai; return this; }
        public PromotionBuilder dieuKienIds(String dieuKienIds) { this.dieuKienIds = dieuKienIds; return this; }
        public PromotionBuilder giaTriDonToiThieu(BigDecimal giaTriDonToiThieu) { this.giaTriDonToiThieu = giaTriDonToiThieu; return this; }
        public PromotionBuilder soLanSuDungMax(Integer soLanSuDungMax) { this.soLanSuDungMax = soLanSuDungMax; return this; }
        public PromotionBuilder soLanDaSuDung(Integer soLanDaSuDung) { this.soLanDaSuDung = soLanDaSuDung; return this; }
        public PromotionBuilder moiKhMaxLan(Integer moiKhMaxLan) { this.moiKhMaxLan = moiKhMaxLan; return this; }
        public PromotionBuilder giaTriChietKhau(BigDecimal giaTriChietKhau) { this.giaTriChietKhau = giaTriChietKhau; return this; }
        public PromotionBuilder giaTriKmToiDa(BigDecimal giaTriKmToiDa) { this.giaTriKmToiDa = giaTriKmToiDa; return this; }
        public PromotionBuilder spMua(Product spMua) { this.spMua = spMua; return this; }
        public PromotionBuilder soLuongMua(BigDecimal soLuongMua) { this.soLuongMua = soLuongMua; return this; }
        public PromotionBuilder spTang(Product spTang) { this.spTang = spTang; return this; }
        public PromotionBuilder soLuongTang(BigDecimal soLuongTang) { this.soLuongTang = soLuongTang; return this; }
        public PromotionBuilder apDungTu(LocalDateTime apDungTu) { this.apDungTu = apDungTu; return this; }
        public PromotionBuilder apDungDen(LocalDateTime apDungDen) { this.apDungDen = apDungDen; return this; }
        public PromotionBuilder gioApDungTu(LocalTime gioApDungTu) { this.gioApDungTu = gioApDungTu; return this; }
        public PromotionBuilder gioApDungDen(LocalTime gioApDungDen) { this.gioApDungDen = gioApDungDen; return this; }
        public PromotionBuilder ngayTrongTuan(String ngayTrongTuan) { this.ngayTrongTuan = ngayTrongTuan; return this; }
        public PromotionBuilder nhomGiaIds(String nhomGiaIds) { this.nhomGiaIds = nhomGiaIds; return this; }
        public PromotionBuilder khachHangIds(String khachHangIds) { this.khachHangIds = khachHangIds; return this; }
        public PromotionBuilder trangThai(PromotionStatus trangThai) { this.trangThai = trangThai; return this; }
        public PromotionBuilder uuTien(Integer uuTien) { this.uuTien = uuTien; return this; }
        public PromotionBuilder coTheCongDon(Boolean coTheCongDon) { this.coTheCongDon = coTheCongDon; return this; }
        public PromotionBuilder ngayTao(LocalDateTime ngayTao) { this.ngayTao = ngayTao; return this; }
        public PromotionBuilder createdBy(String createdBy) { this.createdBy = createdBy; return this; }
        public Promotion build() { return new Promotion(id, maKhuyenMai, tenKhuyenMai, loaiKm, moTa, hinhAnh, dieuKienLoai, dieuKienIds, giaTriDonToiThieu, soLanSuDungMax, soLanDaSuDung, moiKhMaxLan, giaTriChietKhau, giaTriKmToiDa, spMua, soLuongMua, spTang, soLuongTang, apDungTu, apDungDen, gioApDungTu, gioApDungDen, ngayTrongTuan, nhomGiaIds, khachHangIds, trangThai, uuTien, coTheCongDon, ngayTao, createdBy); }
    }
}
