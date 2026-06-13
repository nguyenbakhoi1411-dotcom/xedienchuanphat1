package com.chuanphat.warranty.audit.dto;

import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import java.time.OffsetDateTime;

public record AuditLogFilter(
        String userId,
        AuditAction action,
        AuditModule module,
        String entityType,
        String entityId,
        OffsetDateTime fromDate,
        OffsetDateTime toDate
) {
}
