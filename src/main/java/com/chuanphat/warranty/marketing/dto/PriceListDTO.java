package com.chuanphat.warranty.marketing.dto;

import com.chuanphat.warranty.marketing.enums.PriceListStatus;
import com.chuanphat.warranty.marketing.enums.PriceListType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class PriceListDTO {
    private Long id;
    private String maBangGia;
    private String tenBangGia;
    private PriceListType loaiBangGia;
    private String moTa;
    private String donViTien;
    private LocalDate apDungTu;
    private LocalDate apDungDen;
    private BigDecimal tyLeChietKhauMacDinh;
    private Boolean laBangGiaMacDinh;
    private PriceListStatus trangThai;
    private String ghiChu;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;
    
    // Additional view fields
    private long tongSanPham;
    private long soKhachHangDangDung;

    public PriceListDTO() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMaBangGia() { return maBangGia; }
    public void setMaBangGia(String maBangGia) { this.maBangGia = maBangGia; }
    public String getTenBangGia() { return tenBangGia; }
    public void setTenBangGia(String tenBangGia) { this.tenBangGia = tenBangGia; }
    public PriceListType getLoaiBangGia() { return loaiBangGia; }
    public void setLoaiBangGia(PriceListType loaiBangGia) { this.loaiBangGia = loaiBangGia; }
    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }
    public String getDonViTien() { return donViTien; }
    public void setDonViTien(String donViTien) { this.donViTien = donViTien; }
    public LocalDate getApDungTu() { return apDungTu; }
    public void setApDungTu(LocalDate apDungTu) { this.apDungTu = apDungTu; }
    public LocalDate getApDungDen() { return apDungDen; }
    public void setApDungDen(LocalDate apDungDen) { this.apDungDen = apDungDen; }
    public BigDecimal getTyLeChietKhauMacDinh() { return tyLeChietKhauMacDinh; }
    public void setTyLeChietKhauMacDinh(BigDecimal tyLeChietKhauMacDinh) { this.tyLeChietKhauMacDinh = tyLeChietKhauMacDinh; }
    public Boolean getLaBangGiaMacDinh() { return laBangGiaMacDinh; }
    public void setLaBangGiaMacDinh(Boolean laBangGiaMacDinh) { this.laBangGiaMacDinh = laBangGiaMacDinh; }
    public PriceListStatus getTrangThai() { return trangThai; }
    public void setTrangThai(PriceListStatus trangThai) { this.trangThai = trangThai; }
    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
    public LocalDateTime getNgayTao() { return ngayTao; }
    public void setNgayTao(LocalDateTime ngayTao) { this.ngayTao = ngayTao; }
    public LocalDateTime getNgayCapNhat() { return ngayCapNhat; }
    public void setNgayCapNhat(LocalDateTime ngayCapNhat) { this.ngayCapNhat = ngayCapNhat; }
    public long getTongSanPham() { return tongSanPham; }
    public void setTongSanPham(long tongSanPham) { this.tongSanPham = tongSanPham; }
    public long getSoKhachHangDangDung() { return soKhachHangDangDung; }
    public void setSoKhachHangDangDung(long soKhachHangDangDung) { this.soKhachHangDangDung = soKhachHangDangDung; }
    public PriceListDTO(Long id, String maBangGia, String tenBangGia, PriceListType loaiBangGia, String moTa, String donViTien, LocalDate apDungTu, LocalDate apDungDen, BigDecimal tyLeChietKhauMacDinh, Boolean laBangGiaMacDinh, PriceListStatus trangThai, String ghiChu, LocalDateTime ngayTao, LocalDateTime ngayCapNhat, long tongSanPham, long soKhachHangDangDung) { this.id = id; this.maBangGia = maBangGia; this.tenBangGia = tenBangGia; this.loaiBangGia = loaiBangGia; this.moTa = moTa; this.donViTien = donViTien; this.apDungTu = apDungTu; this.apDungDen = apDungDen; this.tyLeChietKhauMacDinh = tyLeChietKhauMacDinh; this.laBangGiaMacDinh = laBangGiaMacDinh; this.trangThai = trangThai; this.ghiChu = ghiChu; this.ngayTao = ngayTao; this.ngayCapNhat = ngayCapNhat; this.tongSanPham = tongSanPham; this.soKhachHangDangDung = soKhachHangDangDung; }
    public static PriceListDTOBuilder builder() { return new PriceListDTOBuilder(); }
    public static class PriceListDTOBuilder {
        private Long id;
        private String maBangGia;
        private String tenBangGia;
        private PriceListType loaiBangGia;
        private String moTa;
        private String donViTien;
        private LocalDate apDungTu;
        private LocalDate apDungDen;
        private BigDecimal tyLeChietKhauMacDinh;
        private Boolean laBangGiaMacDinh;
        private PriceListStatus trangThai;
        private String ghiChu;
        private LocalDateTime ngayTao;
        private LocalDateTime ngayCapNhat;
        private long tongSanPham;
        private long soKhachHangDangDung;
        public PriceListDTOBuilder id(Long id) { this.id = id; return this; }
        public PriceListDTOBuilder maBangGia(String maBangGia) { this.maBangGia = maBangGia; return this; }
        public PriceListDTOBuilder tenBangGia(String tenBangGia) { this.tenBangGia = tenBangGia; return this; }
        public PriceListDTOBuilder loaiBangGia(PriceListType loaiBangGia) { this.loaiBangGia = loaiBangGia; return this; }
        public PriceListDTOBuilder moTa(String moTa) { this.moTa = moTa; return this; }
        public PriceListDTOBuilder donViTien(String donViTien) { this.donViTien = donViTien; return this; }
        public PriceListDTOBuilder apDungTu(LocalDate apDungTu) { this.apDungTu = apDungTu; return this; }
        public PriceListDTOBuilder apDungDen(LocalDate apDungDen) { this.apDungDen = apDungDen; return this; }
        public PriceListDTOBuilder tyLeChietKhauMacDinh(BigDecimal tyLeChietKhauMacDinh) { this.tyLeChietKhauMacDinh = tyLeChietKhauMacDinh; return this; }
        public PriceListDTOBuilder laBangGiaMacDinh(Boolean laBangGiaMacDinh) { this.laBangGiaMacDinh = laBangGiaMacDinh; return this; }
        public PriceListDTOBuilder trangThai(PriceListStatus trangThai) { this.trangThai = trangThai; return this; }
        public PriceListDTOBuilder ghiChu(String ghiChu) { this.ghiChu = ghiChu; return this; }
        public PriceListDTOBuilder ngayTao(LocalDateTime ngayTao) { this.ngayTao = ngayTao; return this; }
        public PriceListDTOBuilder ngayCapNhat(LocalDateTime ngayCapNhat) { this.ngayCapNhat = ngayCapNhat; return this; }
        public PriceListDTOBuilder tongSanPham(long tongSanPham) { this.tongSanPham = tongSanPham; return this; }
        public PriceListDTOBuilder soKhachHangDangDung(long soKhachHangDangDung) { this.soKhachHangDangDung = soKhachHangDangDung; return this; }
        public PriceListDTO build() { return new PriceListDTO(id, maBangGia, tenBangGia, loaiBangGia, moTa, donViTien, apDungTu, apDungDen, tyLeChietKhauMacDinh, laBangGiaMacDinh, trangThai, ghiChu, ngayTao, ngayCapNhat, tongSanPham, soKhachHangDangDung); }
    }
}

