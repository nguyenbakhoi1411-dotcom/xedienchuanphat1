package com.chuanphat.warranty.audit.dto;

import java.util.List;

public record AuditLogPageResponse(
        List<AuditLogResponse> items,
        int page,
        int pageSize,
        long totalItems,
        int totalPages
) {
}
