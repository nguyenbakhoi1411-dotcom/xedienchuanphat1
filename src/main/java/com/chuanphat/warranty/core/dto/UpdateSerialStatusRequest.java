package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.enums.SerialStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO de cap nhat trang thai cua mot serial xe.
 */
public record UpdateSerialStatusRequest(
        @NotNull SerialStatus newStatus,
        String sourceDocumentType,  // SALES_ORDER, DEPOSIT, SERVICE_TICKET, etc.
        String sourceDocumentId,
        String note
) {}
