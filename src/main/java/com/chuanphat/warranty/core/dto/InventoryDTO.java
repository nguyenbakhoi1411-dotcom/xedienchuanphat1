package com.chuanphat.warranty.core.dto;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonProperty;

public record InventoryDTO(
        @JsonProperty("san_pham_id") Long sanPhamId,
        @JsonProperty("ma_san_pham") String maSanPham,
        @JsonProperty("ten_san_pham") String tenSanPham,
        @JsonProperty("don_vi_tinh") String donViTinh,
        @JsonProperty("danh_muc_id") Long danhMucId,
        @JsonProperty("loai_san_pham") String loaiSanPham,
        @JsonProperty("ton_kho_hien_tai") int tonKhoHienTai,
        @JsonProperty("ton_kho_toi_thieu") int tonKhoToiThieu,
        @JsonProperty("gia_von_binh_quan") BigDecimal giaVonBinhQuan,
        @JsonProperty("gia_tri_ton_kho") BigDecimal giaTriTonKho,
        @JsonProperty("trang_thai_ton") String trangThaiTon,
        @JsonProperty("available_quantity") int availableQuantity
) {
}
