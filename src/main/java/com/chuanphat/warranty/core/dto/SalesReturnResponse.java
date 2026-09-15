package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.SalesReturn;
import com.chuanphat.warranty.core.enums.SalesReturnDisposition;
import com.chuanphat.warranty.core.enums.SalesReturnReasonCode;
import com.chuanphat.warranty.core.enums.SalesReturnStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

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
        SalesReturnReasonCode reasonCode,
        String reasonNote,
        SalesReturnDisposition disposition,
        UUID exchangeGroupId,
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
                salesReturn.getReasonCode(),
                salesReturn.getReasonNote(),
                salesReturn.getDisposition(),
                salesReturn.getExchangeGroupId(),
                salesReturn.getCreatedAt(),
                salesReturn.getItems().stream().map(SalesReturnItemResponse::from).toList()
        );
    }
}
