package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.SalesReturn;
import com.chuanphat.warranty.core.enums.SalesReturnStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record SalesReturnResponse(
        Long id,
        String returnNo,
        Long orderId,
        String orderNo,
        Long branchId,
        Long customerId,
        LocalDate returnDate,
        BigDecimal returnAmount,
        BigDecimal refundAmount,
        SalesReturnStatus status,
        String reason,
        OffsetDateTime createdAt,
        List<SalesReturnItemResponse> items
) {
    public static SalesReturnResponse from(SalesReturn salesReturn) {
        return new SalesReturnResponse(
                salesReturn.getId(),
                salesReturn.getReturnNo(),
                salesReturn.getOrder().getId(),
                salesReturn.getOrder().getOrderNo(),
                salesReturn.getBranchId(),
                salesReturn.getCustomerId(),
                salesReturn.getReturnDate(),
                salesReturn.getReturnAmount(),
                salesReturn.getRefundAmount(),
                salesReturn.getStatus(),
                salesReturn.getReason(),
                salesReturn.getCreatedAt(),
                salesReturn.getItems().stream().map(SalesReturnItemResponse::from).toList()
        );
    }
}
