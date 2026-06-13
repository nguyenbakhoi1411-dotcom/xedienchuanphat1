package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.GoodsIssue;
import com.chuanphat.warranty.core.entity.GoodsIssueItem;
import com.chuanphat.warranty.core.enums.GoodsIssueType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record GoodsIssueDto(
        Long id,
        String issueNo,
        Long branchId,
        Long warehouseId,
        String warehouseName,
        LocalDate issueDate,
        GoodsIssueType issueType,
        String issueTypeLabel,
        String status,
        String referenceType,
        String referenceNo,
        String note,
        String createdBy,
        String issuedBy,
        OffsetDateTime issuedAt,
        OffsetDateTime createdAt,
        BigDecimal totalValue,
        List<GoodsIssueItemDto> items
) {
    public record GoodsIssueItemDto(
            Long id,
            Long productId,
            String productName,
            String productCode,
            int quantity,
            BigDecimal unitCost,
            BigDecimal lineTotal,
            Long serialId,
            String serialNumber,
            String note
    ) {
        public static GoodsIssueItemDto from(GoodsIssueItem item) {
            return new GoodsIssueItemDto(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getProductName(),
                    item.getProduct().getProductCode(),
                    item.getQuantity(),
                    item.getUnitCost(),
                    item.getUnitCost().multiply(BigDecimal.valueOf(item.getQuantity())),
                    item.getSerial() != null ? item.getSerial().getId() : null,
                    item.getSerial() != null ? item.getSerial().getSerialNumber() : null,
                    item.getNote()
            );
        }
    }

    public static GoodsIssueDto from(GoodsIssue issue) {
        List<GoodsIssueItemDto> itemDtos = issue.getItems().stream()
                .map(GoodsIssueItemDto::from).toList();
        BigDecimal total = itemDtos.stream()
                .map(GoodsIssueItemDto::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new GoodsIssueDto(
                issue.getId(),
                issue.getIssueNo(),
                issue.getBranchId(),
                issue.getWarehouse() != null ? issue.getWarehouse().getId() : null,
                issue.getWarehouse() != null ? issue.getWarehouse().getWarehouseName() : null,
                issue.getIssueDate(),
                issue.getIssueType(),
                issue.getIssueType() != null ? issueTypeLabel(issue.getIssueType()) : null,
                issue.getStatus(),
                issue.getReferenceType(),
                issue.getReferenceNo(),
                issue.getNote(),
                issue.getCreatedBy(),
                issue.getIssuedBy(),
                issue.getIssuedAt(),
                issue.getCreatedAt(),
                total,
                itemDtos
        );
    }

    private static String issueTypeLabel(GoodsIssueType type) {
        return switch (type) {
            case SALE -> "Xuất bán hàng";
            case WARRANTY -> "Xuất bảo hành";
            case SERVICE -> "Xuất sửa chữa";
            case TRANSFER -> "Xuất chuyển kho";
            case WRITE_OFF -> "Xuất hủy";
            case OTHER -> "Xuất khác";
        };
    }
}
