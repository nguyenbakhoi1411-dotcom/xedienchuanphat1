package com.chuanphat.warranty.accounting.entity;

import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.PurchaseOrder;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_hoa_don", unique = true, length = 30)
    private String maHoaDon;

    @Column(name = "loai_hoa_don", length = 20)
    private String loaiHoaDon = "VAT";

    @Column(name = "mau_so", length = 20)
    private String mauSo;

    @Column(name = "ky_hieu", length = 20)
    private String kyHieu;

    @Column(name = "so_hoa_don", length = 20)
    private String soHoaDon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "so_hoa_don_goc_id")
    private Invoice soHoaDonGoc;

    @Column(name = "ngay_xuat", nullable = false)
    private LocalDate ngayXuat;

    @Column(name = "ngay_ky")
    private OffsetDateTime ngayKy;

    @Column(name = "ngay_gui_cqt")
    private OffsetDateTime ngayGuiCqt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private SalesOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    @Column(name = "ten_nguoi_ban")
    private String tenNguoiBan;

    @Column(name = "dia_chi_nguoi_ban", columnDefinition = "TEXT")
    private String diaChiNguoiBan;

    @Column(name = "ma_so_thue_nguoi_ban", length = 20)
    private String maSoThueNguoiBan;

    @Column(name = "so_dien_thoai_nguoi_ban", length = 20)
    private String soDienThoaiNguoiBan;

    @Column(name = "ten_nguoi_mua")
    private String tenNguoiMua;

    @Column(name = "dia_chi_nguoi_mua", columnDefinition = "TEXT")
    private String diaChiNguoiMua;

    @Column(name = "ma_so_thue_nguoi_mua", length = 20)
    private String maSoThueNguoiMua;

    @Column(name = "ten_don_vi_mua")
    private String tenDonViMua;

    @Column(name = "hinh_thuc_tt", length = 100)
    private String hinhThucTt;

    @Column(name = "so_tai_khoan_mua", length = 50)
    private String soTaiKhoanMua;

    @Column(name = "ngan_hang_mua")
    private String nganHangMua;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khach_hang_id")
    private Customer customer;

    @Column(name = "tong_tien_hang", precision = 18, scale = 2)
    private BigDecimal tongTienHang = BigDecimal.ZERO;

    @Column(name = "tong_chiet_khau", precision = 18, scale = 2)
    private BigDecimal tongChietKhau = BigDecimal.ZERO;

    @Column(name = "tong_tien_truoc_thue", precision = 18, scale = 2)
    private BigDecimal tongTienTruocThue = BigDecimal.ZERO;

    @Column(name = "tong_thue_gtgt", precision = 18, scale = 2)
    private BigDecimal tongThueGtgt = BigDecimal.ZERO;

    @Column(name = "tong_cong", precision = 18, scale = 2)
    private BigDecimal tongCong = BigDecimal.ZERO;

    @Column(name = "so_tien_bang_chu", columnDefinition = "TEXT")
    private String soTienBangChu;

    @Column(name = "trang_thai", length = 20)
    private String trangThai = "DRAFT";

    @Column(name = "ly_do_huy", columnDefinition = "TEXT")
    private String lyDoHuy;

    @Column(name = "ngay_huy")
    private LocalDate ngayHuy;

    @Column(name = "da_ky_dien_tu")
    private Boolean daKyDienTu = false;

    @Column(name = "chu_ky_nguoi_ban", columnDefinition = "TEXT")
    private String chuKyNguoiBan;

    @Column(name = "ma_cqt", length = 100)
    private String maCqt;

    @Column(name = "file_pdf_path", length = 500)
    private String filePdfPath;

    @Column(name = "file_xml_path", length = 500)
    private String fileXmlPath;

    @Column(name = "chi_nhanh_id")
    private Long chiNhanhId;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "ngay_tao")
    private OffsetDateTime ngayTao = OffsetDateTime.now();

    @Column(name = "ngay_cap_nhat")
    private OffsetDateTime ngayCapNhat = OffsetDateTime.now();

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> items = new ArrayList<>();

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMaHoaDon() { return maHoaDon; }
    public void setMaHoaDon(String maHoaDon) { this.maHoaDon = maHoaDon; }
    public String getLoaiHoaDon() { return loaiHoaDon; }
    public void setLoaiHoaDon(String loaiHoaDon) { this.loaiHoaDon = loaiHoaDon; }
    public String getMauSo() { return mauSo; }
    public void setMauSo(String mauSo) { this.mauSo = mauSo; }
    public String getKyHieu() { return kyHieu; }
    public void setKyHieu(String kyHieu) { this.kyHieu = kyHieu; }
    public String getSoHoaDon() { return soHoaDon; }
    public void setSoHoaDon(String soHoaDon) { this.soHoaDon = soHoaDon; }
    public Invoice getSoHoaDonGoc() { return soHoaDonGoc; }
    public void setSoHoaDonGoc(Invoice soHoaDonGoc) { this.soHoaDonGoc = soHoaDonGoc; }
    public LocalDate getNgayXuat() { return ngayXuat; }
    public void setNgayXuat(LocalDate ngayXuat) { this.ngayXuat = ngayXuat; }
    public OffsetDateTime getNgayKy() { return ngayKy; }
    public void setNgayKy(OffsetDateTime ngayKy) { this.ngayKy = ngayKy; }
    public OffsetDateTime getNgayGuiCqt() { return ngayGuiCqt; }
    public void setNgayGuiCqt(OffsetDateTime ngayGuiCqt) { this.ngayGuiCqt = ngayGuiCqt; }
    public SalesOrder getOrder() { return order; }
    public void setOrder(SalesOrder order) { this.order = order; }
    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }
    public String getTenNguoiBan() { return tenNguoiBan; }
    public void setTenNguoiBan(String tenNguoiBan) { this.tenNguoiBan = tenNguoiBan; }
    public String getDiaChiNguoiBan() { return diaChiNguoiBan; }
    public void setDiaChiNguoiBan(String diaChiNguoiBan) { this.diaChiNguoiBan = diaChiNguoiBan; }
    public String getMaSoThueNguoiBan() { return maSoThueNguoiBan; }
    public void setMaSoThueNguoiBan(String maSoThueNguoiBan) { this.maSoThueNguoiBan = maSoThueNguoiBan; }
    public String getSoDienThoaiNguoiBan() { return soDienThoaiNguoiBan; }
    public void setSoDienThoaiNguoiBan(String soDienThoaiNguoiBan) { this.soDienThoaiNguoiBan = soDienThoaiNguoiBan; }
    public String getTenNguoiMua() { return tenNguoiMua; }
    public void setTenNguoiMua(String tenNguoiMua) { this.tenNguoiMua = tenNguoiMua; }
    public String getDiaChiNguoiMua() { return diaChiNguoiMua; }
    public void setDiaChiNguoiMua(String diaChiNguoiMua) { this.diaChiNguoiMua = diaChiNguoiMua; }
    public String getMaSoThueNguoiMua() { return maSoThueNguoiMua; }
    public void setMaSoThueNguoiMua(String maSoThueNguoiMua) { this.maSoThueNguoiMua = maSoThueNguoiMua; }
    public String getTenDonViMua() { return tenDonViMua; }
    public void setTenDonViMua(String tenDonViMua) { this.tenDonViMua = tenDonViMua; }
    public String getHinhThucTt() { return hinhThucTt; }
    public void setHinhThucTt(String hinhThucTt) { this.hinhThucTt = hinhThucTt; }
    public String getSoTaiKhoanMua() { return soTaiKhoanMua; }
    public void setSoTaiKhoanMua(String soTaiKhoanMua) { this.soTaiKhoanMua = soTaiKhoanMua; }
    public String getNganHangMua() { return nganHangMua; }
    public void setNganHangMua(String nganHangMua) { this.nganHangMua = nganHangMua; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public BigDecimal getTongTienHang() { return tongTienHang; }
    public void setTongTienHang(BigDecimal tongTienHang) { this.tongTienHang = tongTienHang; }
    public BigDecimal getTongChietKhau() { return tongChietKhau; }
    public void setTongChietKhau(BigDecimal tongChietKhau) { this.tongChietKhau = tongChietKhau; }
    public BigDecimal getTongTienTruocThue() { return tongTienTruocThue; }
    public void setTongTienTruocThue(BigDecimal tongTienTruocThue) { this.tongTienTruocThue = tongTienTruocThue; }
    public BigDecimal getTongThueGtgt() { return tongThueGtgt; }
    public void setTongThueGtgt(BigDecimal tongThueGtgt) { this.tongThueGtgt = tongThueGtgt; }
    public BigDecimal getTongCong() { return tongCong; }
    public void setTongCong(BigDecimal tongCong) { this.tongCong = tongCong; }
    public String getSoTienBangChu() { return soTienBangChu; }
    public void setSoTienBangChu(String soTienBangChu) { this.soTienBangChu = soTienBangChu; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    public String getLyDoHuy() { return lyDoHuy; }
    public void setLyDoHuy(String lyDoHuy) { this.lyDoHuy = lyDoHuy; }
    public LocalDate getNgayHuy() { return ngayHuy; }
    public void setNgayHuy(LocalDate ngayHuy) { this.ngayHuy = ngayHuy; }
    public Boolean getDaKyDienTu() { return daKyDienTu; }
    public void setDaKyDienTu(Boolean daKyDienTu) { this.daKyDienTu = daKyDienTu; }
    public String getChuKyNguoiBan() { return chuKyNguoiBan; }
    public void setChuKyNguoiBan(String chuKyNguoiBan) { this.chuKyNguoiBan = chuKyNguoiBan; }
    public String getMaCqt() { return maCqt; }
    public void setMaCqt(String maCqt) { this.maCqt = maCqt; }
    public String getFilePdfPath() { return filePdfPath; }
    public void setFilePdfPath(String filePdfPath) { this.filePdfPath = filePdfPath; }
    public String getFileXmlPath() { return fileXmlPath; }
    public void setFileXmlPath(String fileXmlPath) { this.fileXmlPath = fileXmlPath; }
    public Long getChiNhanhId() { return chiNhanhId; }
    public void setChiNhanhId(Long chiNhanhId) { this.chiNhanhId = chiNhanhId; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public OffsetDateTime getNgayTao() { return ngayTao; }
    public void setNgayTao(OffsetDateTime ngayTao) { this.ngayTao = ngayTao; }
    public OffsetDateTime getNgayCapNhat() { return ngayCapNhat; }
    public void setNgayCapNhat(OffsetDateTime ngayCapNhat) { this.ngayCapNhat = ngayCapNhat; }
    public List<InvoiceItem> getItems() { return items; }
    public void setItems(List<InvoiceItem> items) { this.items = items; }
}
