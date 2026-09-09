package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.entity.PurchaseOrderItem;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record PurchaseOrderDto(
        Long id,
        String purchaseOrderNo,
        Long supplierId,
        String supplierName,
        String supplierPhone,
        Long branchId,
        PurchaseOrderStatus status,
        String statusLabel,
        LocalDate purchaseDate,
        LocalDate expectedDelivery,
        BigDecimal tongTienHang,
        BigDecimal tongChietKhau,
        BigDecimal tongThueGtgt,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal conLaiPhaiTra,
        String hinhThucTT,
        LocalDate hanThanhToan,
        String trangThaiThanhToan,
        String nguoiPhuTrach,
        String diaChiGiaoHang,
        String fileHoaDonNcc,
        String note,
        String createdBy,
        OffsetDateTime createdAt,
        String approvedBy,
        OffsetDateTime approvedAt,
        String rejectedBy,
        String rejectReason,
        boolean stockReceived,
        boolean accountingRecorded,
        List<PurchaseOrderItemDto> items
) {
    public record PurchaseOrderItemDto(
            Long id,
            Long productId,
            String productName,
            String productCode,
            String tenSanPham,
            String donViTinh,
            int quantity,
            BigDecimal soLuongDaNhan,
            BigDecimal unitCost,
            BigDecimal chietKhauPhanTram,
            BigDecimal thueGtgtPhanTram,
            BigDecimal lineTotal,
            int thuTu
    ) {
        public static PurchaseOrderItemDto from(PurchaseOrderItem item) {
            return new PurchaseOrderItemDto(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getProductName(),
                    item.getProduct().getProductCode(),
                    item.getTenSanPham() != null ? item.getTenSanPham() : item.getProduct().getProductName(),
                    item.getDonViTinh(),
                    item.getQuantity(),
                    item.getSoLuongDaNhan(),
                    item.getUnitCost(),
                    item.getChietKhauPhanTram(),
                    item.getThueGtgtPhanTram(),
                    item.getLineTotal(),
                    item.getThuTu()
            );
        }
    }

    public static PurchaseOrderDto from(PurchaseOrder po) {
        return new PurchaseOrderDto(
                po.getId(), po.getPurchaseOrderNo(),
                po.getSupplier().getId(), po.getSupplier().getName(),
                po.getSupplier().getPhone(),
                po.getBranchId(), po.getStatus(), statusLabel(po.getStatus()),
                po.getPurchaseDate(), po.getExpectedDelivery(),
                po.getTongTienHang(), po.getTongChietKhau(), po.getTongThueGtgt(),
                po.getTotalAmount(), po.getPaidAmount(), po.getConLaiPhaiTra(),
                po.getHinhThucTT(), po.getHanThanhToan(), po.getTrangThaiThanhToan(),
                po.getNguoiPhuTrach(), po.getDiaChiGiaoHang(), po.getFileHoaDonNcc(),
                po.getNote(), po.getCreatedBy(), po.getCreatedAt(),
                po.getApprovedBy(), po.getApprovedAt(),
                po.getRejectedBy(), po.getRejectReason(),
                po.isStockReceived(), po.isAccountingRecorded(),
                po.getItems().stream().map(PurchaseOrderItemDto::from).toList()
        );
    }

    private static String statusLabel(PurchaseOrderStatus s) {
        return switch (s) {
            case DRAFT -> "Nháp";
            case PENDING_APPROVAL -> "Chờ duyệt";
            case APPROVED -> "Đã duyệt";
            case PARTIALLY_RECEIVED -> "Nhập một phần";
            case RECEIVED -> "Đã nhập đủ";
            case CANCELLED -> "Đã hủy";
            case REJECTED -> "Bị từ chối";
        };
    }
}
