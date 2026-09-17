package com.chuanphat.warranty.reports;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.accounting.service.MisaExportService;
import com.chuanphat.warranty.reports.entity.ReportExportSnapshot;
import com.chuanphat.warranty.reports.repository.ReportExportSnapshotRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class ReportSnapshotServiceBusinessTest {
    private ReportExportSnapshotRepository snapshotRepository;
    private ReportService reportService;
    private ReportSnapshotService snapshotService;
    private final AtomicReference<ReportExportSnapshot> savedSnapshot = new AtomicReference<>();

    @BeforeEach
    void setUp() {
        snapshotRepository = org.mockito.Mockito.mock(ReportExportSnapshotRepository.class);
        reportService = org.mockito.Mockito.mock(ReportService.class);
        MisaExportService misaExportService = org.mockito.Mockito.mock(MisaExportService.class);
        ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
        snapshotService = new ReportSnapshotService(snapshotRepository, objectMapper, misaExportService, reportService);
        when(snapshotRepository.save(any(ReportExportSnapshot.class))).thenAnswer(invocation -> {
            ReportExportSnapshot snapshot = invocation.getArgument(0);
            ReflectionTestUtils.setField(snapshot, "id", 100L);
            savedSnapshot.set(snapshot);
            return snapshot;
        });
        when(snapshotRepository.findById(100L)).thenAnswer(invocation -> Optional.ofNullable(savedSnapshot.get()));
    }

    @Test
    void exportingReportCreatesImmutableSnapshot() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("revenue", 100);

        var snapshot = snapshotService.createOfficialSnapshot(
                "SALES",
                "excel",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 30),
                Map.of("branchId", 1L),
                data,
                "accountant"
        );

        assertThat(snapshot.id()).isEqualTo(100L);
        assertThat(snapshot.dataJson()).contains("\"revenue\":100");
        assertThat(snapshot.contentHash()).hasSize(64);
        assertThat(savedSnapshot.get().getExportedBy()).isEqualTo("accountant");
    }

    @Test
    void laterAdjustmentDoesNotChangeAlreadyExportedSnapshot() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("revenue", 100);
        var snapshot = snapshotService.createOfficialSnapshot(
                "SALES",
                "excel",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 30),
                Map.of(),
                data,
                "accountant"
        );

        data.put("revenue", 999);

        assertThat(snapshot.dataJson()).contains("\"revenue\":100");
        assertThat(snapshot.dataJson()).doesNotContain("999");
        assertThat(savedSnapshot.get().getDataJson()).contains("\"revenue\":100");
    }

    @Test
    void comparisonApiShowsDeltaBetweenSnapshotAndCurrentData() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("revenue", 100);
        snapshotService.createOfficialSnapshot(
                "SALES",
                "excel",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 30),
                Map.of(),
                data,
                "accountant"
        );
        when(reportService.snapshotData("SALES", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 30), "{}"))
                .thenReturn(Map.of("revenue", 120));

        var comparison = snapshotService.compareWithCurrent(100L);

        assertThat(comparison.hasDelta()).isTrue();
        assertThat(comparison.snapshotDataJson()).contains("\"revenue\":100");
        assertThat(comparison.currentDataJson()).contains("\"revenue\":120");
        assertThat(comparison.snapshotHash()).isNotEqualTo(comparison.currentHash());
    }

    @Test
    void tamperedSnapshotDataIsDetectedByStoredHash() {
        snapshotService.createOfficialSnapshot(
                "SALES",
                "excel",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 30),
                Map.of(),
                Map.of("revenue", 100),
                "accountant"
        );
        savedSnapshot.get().setDataJson("{\"revenue\":999}");

        assertThatThrownBy(() -> snapshotService.compareWithCurrent(100L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Report snapshot integrity check failed: 100");
    }
}
