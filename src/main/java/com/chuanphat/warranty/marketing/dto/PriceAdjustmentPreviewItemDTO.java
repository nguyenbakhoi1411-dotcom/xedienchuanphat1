package com.chuanphat.warranty.marketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
public class PriceAdjustmentPreviewItemDTO {
    private Long sanPhamId;
    private String maSanPham;
    private String tenSanPham;
    private BigDecimal giaCu;
    private BigDecimal giaMoi;
    private BigDecimal chenhLech;
    private BigDecimal phanTramThayDoi;
    private BigDecimal giaVon;
    private BigDecimal tyLeLaiGopMoi;

    public PriceAdjustmentPreviewItemDTO() {}
    public Long getSanPhamId() { return sanPhamId; }
    public void setSanPhamId(Long sanPhamId) { this.sanPhamId = sanPhamId; }
    public String getMaSanPham() { return maSanPham; }
    public void setMaSanPham(String maSanPham) { this.maSanPham = maSanPham; }
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
    public BigDecimal getGiaVon() { return giaVon; }
    public void setGiaVon(BigDecimal giaVon) { this.giaVon = giaVon; }
    public BigDecimal getTyLeLaiGopMoi() { return tyLeLaiGopMoi; }
    public void setTyLeLaiGopMoi(BigDecimal tyLeLaiGopMoi) { this.tyLeLaiGopMoi = tyLeLaiGopMoi; }
    public PriceAdjustmentPreviewItemDTO(Long sanPhamId, String maSanPham, String tenSanPham, BigDecimal giaCu, BigDecimal giaMoi, BigDecimal chenhLech, BigDecimal phanTramThayDoi, BigDecimal giaVon, BigDecimal tyLeLaiGopMoi) { this.sanPhamId = sanPhamId; this.maSanPham = maSanPham; this.tenSanPham = tenSanPham; this.giaCu = giaCu; this.giaMoi = giaMoi; this.chenhLech = chenhLech; this.phanTramThayDoi = phanTramThayDoi; this.giaVon = giaVon; this.tyLeLaiGopMoi = tyLeLaiGopMoi; }
    public static PriceAdjustmentPreviewItemDTOBuilder builder() { return new PriceAdjustmentPreviewItemDTOBuilder(); }
    public static class PriceAdjustmentPreviewItemDTOBuilder {
        private Long sanPhamId;
        private String maSanPham;
        private String tenSanPham;
        private BigDecimal giaCu;
        private BigDecimal giaMoi;
        private BigDecimal chenhLech;
        private BigDecimal phanTramThayDoi;
        private BigDecimal giaVon;
        private BigDecimal tyLeLaiGopMoi;
        public PriceAdjustmentPreviewItemDTOBuilder sanPhamId(Long sanPhamId) { this.sanPhamId = sanPhamId; return this; }
        public PriceAdjustmentPreviewItemDTOBuilder maSanPham(String maSanPham) { this.maSanPham = maSanPham; return this; }
        public PriceAdjustmentPreviewItemDTOBuilder tenSanPham(String tenSanPham) { this.tenSanPham = tenSanPham; return this; }
        public PriceAdjustmentPreviewItemDTOBuilder giaCu(BigDecimal giaCu) { this.giaCu = giaCu; return this; }
        public PriceAdjustmentPreviewItemDTOBuilder giaMoi(BigDecimal giaMoi) { this.giaMoi = giaMoi; return this; }
        public PriceAdjustmentPreviewItemDTOBuilder chenhLech(BigDecimal chenhLech) { this.chenhLech = chenhLech; return this; }
        public PriceAdjustmentPreviewItemDTOBuilder phanTramThayDoi(BigDecimal phanTramThayDoi) { this.phanTramThayDoi = phanTramThayDoi; return this; }
        public PriceAdjustmentPreviewItemDTOBuilder giaVon(BigDecimal giaVon) { this.giaVon = giaVon; return this; }
        public PriceAdjustmentPreviewItemDTOBuilder tyLeLaiGopMoi(BigDecimal tyLeLaiGopMoi) { this.tyLeLaiGopMoi = tyLeLaiGopMoi; return this; }
        public PriceAdjustmentPreviewItemDTO build() { return new PriceAdjustmentPreviewItemDTO(sanPhamId, maSanPham, tenSanPham, giaCu, giaMoi, chenhLech, phanTramThayDoi, giaVon, tyLeLaiGopMoi); }
    }
}

