package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.enums.GoodsIssueType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

/**
 * Request tao phieu xuat kho.
 */
public record GoodsIssueRequest(
        @NotNull Long branchId,
        Long warehouseId,
        LocalDate issueDate,
        @NotNull GoodsIssueType issueType,
        String referenceType,
        String referenceNo,
        String note,
        @NotEmpty @Valid List<GoodsIssueItemRequest> items
) {}
