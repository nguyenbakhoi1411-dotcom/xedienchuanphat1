package com.chuanphat.warranty.accounting.entity;

import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.entity.Supplier;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "invoice_input")
public class InvoiceInput {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_hoa_don_vao", unique = true, length = 30)
    private String maHoaDonVao;

    @Column(name = "mau_so_ncc", length = 20)
    private String mauSoNcc;

    @Column(name = "ky_hieu_ncc", length = 20)
    private String kyHieuNcc;

    @Column(name = "so_hoa_don_ncc", length = 20)
    private String soHoaDonNcc;

    @Column(name = "ngay_hoa_don", nullable = false)
    private LocalDate ngayHoaDon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nha_cung_cap_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    @Column(name = "ten_ncc")
    private String tenNcc;

    @Column(name = "ma_so_thue_ncc", length = 20)
    private String maSoThueNcc;

    @Column(name = "tong_tien_hang", precision = 18, scale = 2)
    private BigDecimal tongTienHang;

    @Column(name = "tong_thue_gtgt", precision = 18, scale = 2)
    private BigDecimal tongThueGtgt;

    @Column(name = "tong_cong", precision = 18, scale = 2)
    private BigDecimal tongCong;

    @Column(name = "thue_suat", precision = 5, scale = 2)
    private BigDecimal thueSuat = new BigDecimal("10.00");

    @Column(name = "da_khai_thue")
    private Boolean daKhaiThue = false;

    @Column(name = "file_hoa_don", length = 500)
    private String fileHoaDon;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "trang_thai", length = 20)
    private String trangThai = "PENDING";

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "ngay_tao")
    private OffsetDateTime ngayTao = OffsetDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMaHoaDonVao() { return maHoaDonVao; }
    public void setMaHoaDonVao(String maHoaDonVao) { this.maHoaDonVao = maHoaDonVao; }
    public String getMauSoNcc() { return mauSoNcc; }
    public void setMauSoNcc(String mauSoNcc) { this.mauSoNcc = mauSoNcc; }
    public String getKyHieuNcc() { return kyHieuNcc; }
    public void setKyHieuNcc(String kyHieuNcc) { this.kyHieuNcc = kyHieuNcc; }
    public String getSoHoaDonNcc() { return soHoaDonNcc; }
    public void setSoHoaDonNcc(String soHoaDonNcc) { this.soHoaDonNcc = soHoaDonNcc; }
    public LocalDate getNgayHoaDon() { return ngayHoaDon; }
    public void setNgayHoaDon(LocalDate ngayHoaDon) { this.ngayHoaDon = ngayHoaDon; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }
    public String getTenNcc() { return tenNcc; }
    public void setTenNcc(String tenNcc) { this.tenNcc = tenNcc; }
    public String getMaSoThueNcc() { return maSoThueNcc; }
    public void setMaSoThueNcc(String maSoThueNcc) { this.maSoThueNcc = maSoThueNcc; }
    public BigDecimal getTongTienHang() { return tongTienHang; }
    public void setTongTienHang(BigDecimal tongTienHang) { this.tongTienHang = tongTienHang; }
    public BigDecimal getTongThueGtgt() { return tongThueGtgt; }
    public void setTongThueGtgt(BigDecimal tongThueGtgt) { this.tongThueGtgt = tongThueGtgt; }
    public BigDecimal getTongCong() { return tongCong; }
    public void setTongCong(BigDecimal tongCong) { this.tongCong = tongCong; }
    public BigDecimal getThueSuat() { return thueSuat; }
    public void setThueSuat(BigDecimal thueSuat) { this.thueSuat = thueSuat; }
    public Boolean getDaKhaiThue() { return daKhaiThue; }
    public void setDaKhaiThue(Boolean daKhaiThue) { this.daKhaiThue = daKhaiThue; }
    public String getFileHoaDon() { return fileHoaDon; }
    public void setFileHoaDon(String fileHoaDon) { this.fileHoaDon = fileHoaDon; }
    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getNgayTao() { return ngayTao; }
    public void setNgayTao(OffsetDateTime ngayTao) { this.ngayTao = ngayTao; }
}
