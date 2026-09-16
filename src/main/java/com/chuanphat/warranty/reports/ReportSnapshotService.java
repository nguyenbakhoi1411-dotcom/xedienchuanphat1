package com.chuanphat.warranty.reports;

import com.chuanphat.warranty.accounting.service.MisaExportService;
import com.chuanphat.warranty.reports.dto.ReportSnapshotDtos;
import com.chuanphat.warranty.reports.entity.ReportExportSnapshot;
import com.chuanphat.warranty.reports.repository.ReportExportSnapshotRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportSnapshotService {
    public static final String MISA_EXPORT = "MISA_EXPORT";

    private final ReportExportSnapshotRepository snapshotRepository;
    private final ObjectMapper objectMapper;
    private final MisaExportService misaExportService;
    private final ReportService reportService;

    public ReportSnapshotService(
            ReportExportSnapshotRepository snapshotRepository,
            ObjectMapper objectMapper,
            MisaExportService misaExportService,
            ReportService reportService
    ) {
        this.snapshotRepository = snapshotRepository;
        this.objectMapper = objectMapper;
        this.misaExportService = misaExportService;
        this.reportService = reportService;
    }

    @Transactional
    public ReportSnapshotDtos.ReportSnapshotResponse createOfficialSnapshot(
            String reportType,
            String format,
            LocalDate fromDate,
            LocalDate toDate,
            Map<String, Object> parameters,
            Object data,
            String exportedBy
    ) {
        String dataJson = json(data);
        ReportExportSnapshot snapshot = new ReportExportSnapshot();
        snapshot.setReportType(reportType);
        snapshot.setFormat(format);
        snapshot.setFromDate(fromDate);
        snapshot.setToDate(toDate);
        snapshot.setParametersJson(json(parameters == null ? Map.of() : parameters));
        snapshot.setDataJson(dataJson);
        snapshot.setContentHash(sha256(dataJson));
        snapshot.setExportedBy(exportedBy == null || exportedBy.isBlank() ? "system" : exportedBy);
        return ReportSnapshotDtos.ReportSnapshotResponse.from(snapshotRepository.save(snapshot));
    }

    @Transactional(readOnly = true)
    public ReportSnapshotDtos.ReportSnapshotComparisonResponse compareWithCurrent(Long snapshotId) {
        ReportExportSnapshot snapshot = snapshotRepository.findById(snapshotId)
                .orElseThrow(() -> new IllegalArgumentException("Report snapshot not found: " + snapshotId));
        String currentJson = json(currentData(snapshot));
        String currentHash = sha256(currentJson);
        return new ReportSnapshotDtos.ReportSnapshotComparisonResponse(
                snapshot.getId(),
                !snapshot.getContentHash().equals(currentHash),
                snapshot.getDataJson(),
                currentJson,
                snapshot.getContentHash(),
                currentHash
        );
    }

    private Object currentData(ReportExportSnapshot snapshot) {
        if (MISA_EXPORT.equals(snapshot.getReportType())) {
            return misaExportService.exportRows(snapshot.getFromDate(), snapshot.getToDate());
        }
        return reportService.snapshotData(snapshot.getReportType(), snapshot.getFromDate(), snapshot.getToDate(), snapshot.getParametersJson());
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize report snapshot", exception);
        }
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
