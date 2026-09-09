package com.chuanphat.warranty.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "purchase_order_items")
public class PurchaseOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Snapshot ten san pham luc tao don */
    @Column(length = 255)
    private String tenSanPham;

    /** Don vi tinh */
    @Column(length = 50)
    private String donViTinh;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 18, scale = 0)
    private BigDecimal unitCost = BigDecimal.ZERO;

    /** Chiet khau % */
    @Column(precision = 5, scale = 2)
    private BigDecimal chietKhauPhanTram = BigDecimal.ZERO;

    /** Thue GTGT % */
    @Column(precision = 5, scale = 2)
    private BigDecimal thueGtgtPhanTram = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 0)
    private BigDecimal lineTotal = BigDecimal.ZERO;

    /** So luong da nhan (cap nhat khi nhap kho) */
    @Column(precision = 10, scale = 2)
    private BigDecimal soLuongDaNhan = BigDecimal.ZERO;

    /** Thu tu hien thi */
    @Column
    private int thuTu = 1;

    // ── Getters & Setters ──────────────────────────────────────────
    public Long getId() { return id; }
    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getTenSanPham() { return tenSanPham; }
    public void setTenSanPham(String tenSanPham) { this.tenSanPham = tenSanPham; }
    public String getDonViTinh() { return donViTinh; }
    public void setDonViTinh(String donViTinh) { this.donViTinh = donViTinh; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost == null ? BigDecimal.ZERO : unitCost; }
    public BigDecimal getChietKhauPhanTram() { return chietKhauPhanTram; }
    public void setChietKhauPhanTram(BigDecimal v) { this.chietKhauPhanTram = v == null ? BigDecimal.ZERO : v; }
    public BigDecimal getThueGtgtPhanTram() { return thueGtgtPhanTram; }
    public void setThueGtgtPhanTram(BigDecimal v) { this.thueGtgtPhanTram = v == null ? BigDecimal.ZERO : v; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal == null ? BigDecimal.ZERO : lineTotal; }
    public BigDecimal getSoLuongDaNhan() { return soLuongDaNhan; }
    public void setSoLuongDaNhan(BigDecimal v) { this.soLuongDaNhan = v == null ? BigDecimal.ZERO : v; }
    public int getThuTu() { return thuTu; }
    public void setThuTu(int thuTu) { this.thuTu = thuTu; }

    /** SL con lai chua nhan */
    public BigDecimal getSoLuongConLai() {
        BigDecimal ordered = BigDecimal.valueOf(quantity);
        BigDecimal received = soLuongDaNhan == null ? BigDecimal.ZERO : soLuongDaNhan;
        return ordered.subtract(received).max(BigDecimal.ZERO);
    }

    /** Tinh thanh_tien tu so luong, don gia, chiet khau, VAT */
    public void calcLineTotal() {
        BigDecimal ck = chietKhauPhanTram == null ? BigDecimal.ZERO : chietKhauPhanTram;
        BigDecimal vat = thueGtgtPhanTram == null ? BigDecimal.ZERO : thueGtgtPhanTram;
        BigDecimal base = unitCost.multiply(BigDecimal.valueOf(quantity));
        BigDecimal afterDiscount = base.multiply(BigDecimal.ONE.subtract(ck.divide(BigDecimal.valueOf(100))));
        BigDecimal withVat = afterDiscount.multiply(BigDecimal.ONE.add(vat.divide(BigDecimal.valueOf(100))));
        this.lineTotal = withVat.setScale(0, java.math.RoundingMode.HALF_UP);
    }
}
