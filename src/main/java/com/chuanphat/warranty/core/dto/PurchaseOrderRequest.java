package com.chuanphat.warranty.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PurchaseOrderRequest(
        @NotNull Long supplierId,
        @NotNull Long branchId,
        LocalDate purchaseDate,
        LocalDate expectedDelivery,
        String hinhThucTT,          // CASH | BANK | DEBT
        Integer paymentTermsDays,   // So ngay den han TT (override NCC default)
        String nguoiPhuTrach,
        String diaChiGiaoHang,
        String note,
        @NotEmpty @Valid List<PurchaseOrderItemRequest> items
) {
    public record PurchaseOrderItemRequest(
            @NotNull Long productId,
            @Min(1) int quantity,
            @NotNull BigDecimal unitCost,
            BigDecimal chietKhauPhanTram,  // % chiet khau
            BigDecimal thueGtgtPhanTram,   // % thue GTGT
            String tenSanPham,             // Snapshot ten san pham
            String donViTinh,
            int thuTu
    ) {}
}
