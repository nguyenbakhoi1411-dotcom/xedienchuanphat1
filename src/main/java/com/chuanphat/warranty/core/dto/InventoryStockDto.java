package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.InventoryStock;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record InventoryStockDto(
        @JsonProperty("san_pham_id") Long productId,
        @JsonProperty("ma_san_pham") String productCode,
        @JsonProperty("ten_san_pham") String productName,
        @JsonProperty("don_vi_tinh") String donViTinh,
        @JsonProperty("danh_muc_id") Long danhMucId,
        @JsonProperty("loai_san_pham") String loaiSanPham,
        @JsonProperty("ton_kho_hien_tai") @Min(0) int quantityOnHand,
        @JsonProperty("ton_kho_toi_thieu") @Min(0) int minQuantity,
        @JsonProperty("gia_von_binh_quan") BigDecimal averageCost,
        @JsonProperty("gia_tri_ton_kho") BigDecimal giaTriTonKho,
        @JsonProperty("trang_thai_ton") String trangThaiTon,
        
        // Dữ liệu nội bộ nếu UI cần
        @JsonProperty("available_quantity") @Min(0) int availableQuantity,
        @JsonProperty("reserved_quantity") @Min(0) int reservedQuantity,
        Long id,
        @NotNull Long branchId,
        Long warehouseId,
        String warehouseName,
        @Min(0) int maxQuantity
) {
    public static InventoryStockDto from(InventoryStock stock, BigDecimal averageCost) {
        BigDecimal cost = averageCost == null ? BigDecimal.ZERO : averageCost;
        int q = stock.getQuantityOnHand();
        int minQ = stock.getMinQuantity();
        
        String trangThaiTon = "CON_HANG";
        if (q == 0) {
            trangThaiTon = "HET_HANG";
        } else if (q <= minQ) {
            trangThaiTon = "SAP_HET";
        }

        return new InventoryStockDto(
                stock.getProduct().getId(),
                stock.getProduct().getProductCode(),
                stock.getProduct().getProductName(),
                "Cái", // Default ĐVT nếu ko có trong DB
                null, // Danh muc
                stock.getProduct().getCategory().name(),
                q,
                minQ,
                cost,
                cost.multiply(BigDecimal.valueOf(q)),
                trangThaiTon,
                stock.getAvailableQuantity(),
                stock.getReservedQuantity(),
                stock.getId(),
                stock.getBranchId(),
                stock.getWarehouse() == null ? null : stock.getWarehouse().getId(),
                stock.getWarehouse() == null ? null : stock.getWarehouse().getWarehouseName(),
                stock.getMaxStockLevel()
        );
    }

    public static InventoryStockDto from(InventoryStock stock) {
        return from(stock, BigDecimal.ZERO);
    }
}
