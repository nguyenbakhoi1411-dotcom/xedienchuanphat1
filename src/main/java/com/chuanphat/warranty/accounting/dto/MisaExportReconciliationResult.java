package com.chuanphat.warranty.accounting.dto;

import java.util.List;

public record MisaExportReconciliationResult(
        boolean hasIssues,
        List<ReconciliationIssue> issues
) {
    public static MisaExportReconciliationResult of(List<ReconciliationIssue> issues) {
        return new MisaExportReconciliationResult(!issues.isEmpty(), List.copyOf(issues));
    }
}
