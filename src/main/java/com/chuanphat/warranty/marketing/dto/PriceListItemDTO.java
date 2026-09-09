package com.chuanphat.warranty.marketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceListItemDTO {
    private Long id;
    private Long priceListId;
    private Long sanPhamId;
    private String maSanPham;
    private String tenSanPham;
    private String donViTinh;
    private BigDecimal giaBan;
    private BigDecimal giaVon;
    private BigDecimal tyLeLaiGop;
    private BigDecimal giaToiThieu;
    private String ghiChu;
    private LocalDateTime ngayCapNhat;
    public static PriceListItemDTOBuilder builder() { return new PriceListItemDTOBuilder(); }
    public static class PriceListItemDTOBuilder {
        private PriceListItemDTO i = new PriceListItemDTO();
            public PriceListItemDTOBuilder giaBan(java.math.BigDecimal g) { i.giaBan = g; return this; }
        public PriceListItemDTOBuilder giaToiThieu(java.math.BigDecimal g) { return this; }
        public PriceListItemDTO build() { return i; }
    }
}





