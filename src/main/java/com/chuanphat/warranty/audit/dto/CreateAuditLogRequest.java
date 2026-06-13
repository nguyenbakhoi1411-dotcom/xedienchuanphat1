package com.chuanphat.warranty.audit.dto;

import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;

public record CreateAuditLogRequest(
        String userId,
        AuditAction action,
        AuditModule module,
        String entityType,
        String entityId,
        String oldValue,
        String newValue,
        String ipAddress,
        String userAgent
) {
}
