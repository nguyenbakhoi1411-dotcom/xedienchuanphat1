package com.chuanphat.warranty.audit.dto;

import com.chuanphat.warranty.audit.entity.AuditLog;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import java.time.OffsetDateTime;

public record AuditLogResponse(
        Long id,
        String userId,
        AuditAction action,
        AuditModule module,
        String entityType,
        String entityId,
        String oldValue,
        String newValue,
        String ipAddress,
        String userAgent,
        OffsetDateTime createdAt
) {
    public static AuditLogResponse from(AuditLog auditLog) {
        return new AuditLogResponse(
                auditLog.getId(),
                auditLog.getUserId(),
                auditLog.getAction(),
                auditLog.getModule(),
                auditLog.getEntityType(),
                auditLog.getEntityId(),
                auditLog.getOldValue(),
                auditLog.getNewValue(),
                auditLog.getIpAddress(),
                auditLog.getUserAgent(),
                auditLog.getCreatedAt()
        );
    }
}
