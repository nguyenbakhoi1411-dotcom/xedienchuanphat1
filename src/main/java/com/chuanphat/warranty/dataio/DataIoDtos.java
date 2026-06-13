package com.chuanphat.warranty.dataio;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public final class DataIoDtos {
    private DataIoDtos() {
    }

    public record ImportResult(
            String dataType,
            int totalRows,
            int validRows,
            int importedRows,
            boolean imported,
            boolean hasCriticalErrors,
            List<RowError> errors
    ) {
    }

    public record RowError(int rowNumber, String field, String code, String message, Map<String, String> row) {
    }

    public record UploadedFileResponse(
            String originalFileName,
            String storedFileName,
            String path,
            String contentType,
            long sizeBytes,
            OffsetDateTime uploadedAt
    ) {
    }
}
