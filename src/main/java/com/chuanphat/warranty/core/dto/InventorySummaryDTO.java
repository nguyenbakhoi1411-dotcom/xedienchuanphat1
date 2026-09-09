package com.chuanphat.warranty.core.dto;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;

public record InventorySummaryDTO(
        @JsonProperty("tong_san_pham") long tongSanPham,
        @JsonProperty("tong_gia_tri_ton_kho") BigDecimal tongGiaTriTonKho,
        @JsonProperty("so_san_pham_het_hang") long soSanPhamHetHang,
        @JsonProperty("so_san_pham_sap_het") long soSanPhamSapHet
) {
}
