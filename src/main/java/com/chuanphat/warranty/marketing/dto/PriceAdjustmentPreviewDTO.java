package com.chuanphat.warranty.marketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PriceAdjustmentPreviewDTO {
    private long tongSanPham;
    private BigDecimal giaTriTrungBinhCu;
    private BigDecimal giaTriTrungBinhMoi;
    private int soSanPhamDuoiGiaToiThieu;
    private int soSanPhamLaiGopThap;
    private List<PriceAdjustmentPreviewItemDTO> preview;

    public PriceAdjustmentPreviewDTO() {}
    public long getTongSanPham() { return tongSanPham; }
    public void setTongSanPham(long tongSanPham) { this.tongSanPham = tongSanPham; }
    public BigDecimal getGiaTriTrungBinhCu() { return giaTriTrungBinhCu; }
    public void setGiaTriTrungBinhCu(BigDecimal giaTriTrungBinhCu) { this.giaTriTrungBinhCu = giaTriTrungBinhCu; }
    public BigDecimal getGiaTriTrungBinhMoi() { return giaTriTrungBinhMoi; }
    public void setGiaTriTrungBinhMoi(BigDecimal giaTriTrungBinhMoi) { this.giaTriTrungBinhMoi = giaTriTrungBinhMoi; }
    public int getSoSanPhamDuoiGiaToiThieu() { return soSanPhamDuoiGiaToiThieu; }
    public void setSoSanPhamDuoiGiaToiThieu(int soSanPhamDuoiGiaToiThieu) { this.soSanPhamDuoiGiaToiThieu = soSanPhamDuoiGiaToiThieu; }
    public int getSoSanPhamLaiGopThap() { return soSanPhamLaiGopThap; }
    public void setSoSanPhamLaiGopThap(int soSanPhamLaiGopThap) { this.soSanPhamLaiGopThap = soSanPhamLaiGopThap; }
    public List<PriceAdjustmentPreviewItemDTO> getPreview() { return preview; }
    public void setPreview(List<PriceAdjustmentPreviewItemDTO> preview) { this.preview = preview; }
    public PriceAdjustmentPreviewDTO(long tongSanPham, BigDecimal giaTriTrungBinhCu, BigDecimal giaTriTrungBinhMoi, int soSanPhamDuoiGiaToiThieu, int soSanPhamLaiGopThap, List<PriceAdjustmentPreviewItemDTO> preview) { this.tongSanPham = tongSanPham; this.giaTriTrungBinhCu = giaTriTrungBinhCu; this.giaTriTrungBinhMoi = giaTriTrungBinhMoi; this.soSanPhamDuoiGiaToiThieu = soSanPhamDuoiGiaToiThieu; this.soSanPhamLaiGopThap = soSanPhamLaiGopThap; this.preview = preview; }
    public static PriceAdjustmentPreviewDTOBuilder builder() { return new PriceAdjustmentPreviewDTOBuilder(); }
    public static class PriceAdjustmentPreviewDTOBuilder {
        private long tongSanPham;
        private BigDecimal giaTriTrungBinhCu;
        private BigDecimal giaTriTrungBinhMoi;
        private int soSanPhamDuoiGiaToiThieu;
        private int soSanPhamLaiGopThap;
        private List<PriceAdjustmentPreviewItemDTO> preview;
        public PriceAdjustmentPreviewDTOBuilder tongSanPham(long tongSanPham) { this.tongSanPham = tongSanPham; return this; }
        public PriceAdjustmentPreviewDTOBuilder giaTriTrungBinhCu(BigDecimal giaTriTrungBinhCu) { this.giaTriTrungBinhCu = giaTriTrungBinhCu; return this; }
        public PriceAdjustmentPreviewDTOBuilder giaTriTrungBinhMoi(BigDecimal giaTriTrungBinhMoi) { this.giaTriTrungBinhMoi = giaTriTrungBinhMoi; return this; }
        public PriceAdjustmentPreviewDTOBuilder soSanPhamDuoiGiaToiThieu(int soSanPhamDuoiGiaToiThieu) { this.soSanPhamDuoiGiaToiThieu = soSanPhamDuoiGiaToiThieu; return this; }
        public PriceAdjustmentPreviewDTOBuilder soSanPhamLaiGopThap(int soSanPhamLaiGopThap) { this.soSanPhamLaiGopThap = soSanPhamLaiGopThap; return this; }
        public PriceAdjustmentPreviewDTOBuilder preview(List<PriceAdjustmentPreviewItemDTO> preview) { this.preview = preview; return this; }
        public PriceAdjustmentPreviewDTO build() { return new PriceAdjustmentPreviewDTO(tongSanPham, giaTriTrungBinhCu, giaTriTrungBinhMoi, soSanPhamDuoiGiaToiThieu, soSanPhamLaiGopThap, preview); }
    }
}

