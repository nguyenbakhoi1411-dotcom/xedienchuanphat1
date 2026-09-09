package com.chuanphat.warranty.accounting.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "invoice_serial_config", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"mau_so", "ky_hieu", "nam_su_dung"})
})
public class InvoiceSerialConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mau_so", nullable = false, length = 20)
    private String mauSo;

    @Column(name = "ky_hieu", nullable = false, length = 20)
    private String kyHieu;

    @Column(name = "so_bat_dau")
    private Integer soBatDau = 1;

    @Column(name = "so_hien_tai")
    private Integer soHienTai = 0;

    @Column(name = "so_ket_thuc")
    private Integer soKetThuc = 9999999;

    @Column(name = "loai_hoa_don", length = 20)
    private String loaiHoaDon;

    @Column(name = "nam_su_dung")
    private Integer namSuDung;

    @Column(name = "trang_thai", length = 20)
    private String trangThai;

    @Column(name = "ngay_ky_thong_bao")
    private LocalDate ngayKyThongBao;

    @Column(name = "ngay_tao")
    private OffsetDateTime ngayTao = OffsetDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMauSo() { return mauSo; }
    public void setMauSo(String mauSo) { this.mauSo = mauSo; }
    public String getKyHieu() { return kyHieu; }
    public void setKyHieu(String kyHieu) { this.kyHieu = kyHieu; }
    public Integer getSoBatDau() { return soBatDau; }
    public void setSoBatDau(Integer soBatDau) { this.soBatDau = soBatDau; }
    public Integer getSoHienTai() { return soHienTai; }
    public void setSoHienTai(Integer soHienTai) { this.soHienTai = soHienTai; }
    public Integer getSoKetThuc() { return soKetThuc; }
    public void setSoKetThuc(Integer soKetThuc) { this.soKetThuc = soKetThuc; }
    public String getLoaiHoaDon() { return loaiHoaDon; }
    public void setLoaiHoaDon(String loaiHoaDon) { this.loaiHoaDon = loaiHoaDon; }
    public Integer getNamSuDung() { return namSuDung; }
    public void setNamSuDung(Integer namSuDung) { this.namSuDung = namSuDung; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    public LocalDate getNgayKyThongBao() { return ngayKyThongBao; }
    public void setNgayKyThongBao(LocalDate ngayKyThongBao) { this.ngayKyThongBao = ngayKyThongBao; }
    public OffsetDateTime getNgayTao() { return ngayTao; }
    public void setNgayTao(OffsetDateTime ngayTao) { this.ngayTao = ngayTao; }
}
