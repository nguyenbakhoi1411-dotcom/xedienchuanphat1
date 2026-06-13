package com.chuanphat.warranty.operations;

import java.time.OffsetDateTime;
import java.util.List;

public final class OperationDtos {
    private OperationDtos() {
    }

    public record SystemHealthResponse(
            String backendStatus,
            String databaseStatus,
            DiskUsage diskUsage,
            OffsetDateTime checkedAt
    ) {
    }

    public record DiskUsage(long totalBytes, long freeBytes, long usableBytes, double usedPercent) {
    }

    public record SystemInfoResponse(String appVersion, String buildTime, List<String> activeProfiles, String javaVersion, String osName) {
    }

    public record BackupResponse(String fileName, String path, long sizeBytes, OffsetDateTime createdAt, String status, String message) {
    }

    public record RestoreRequest(String fileName, String confirmation) {
    }

    public record ErrorLogResponse(
            Long id,
            ErrorSeverity severity,
            String module,
            String errorType,
            String message,
            String path,
            String username,
            String stackTrace,
            OffsetDateTime createdAt
    ) {
        static ErrorLogResponse from(SystemErrorLog log) {
            return new ErrorLogResponse(
                    log.getId(),
                    log.getSeverity(),
                    log.getModule(),
                    log.getErrorType(),
                    log.getMessage(),
                    log.getPath(),
                    log.getUsername(),
                    log.getStackTrace(),
                    log.getCreatedAt()
            );
        }
    }
}
