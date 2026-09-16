package com.chuanphat.warranty.accounting;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chuanphat.warranty.accounting.controller.MisaExportController;
import com.chuanphat.warranty.accounting.dto.MisaExportReconciliationResult;
import com.chuanphat.warranty.accounting.dto.ReconciliationIssue;
import com.chuanphat.warranty.accounting.service.MisaExportReconciliationService;
import com.chuanphat.warranty.accounting.service.MisaExportService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class MisaExportControllerTest {
    @Test
    void exportSucceedsWhenAllReconciliationChecksPass() throws Exception {
        MisaExportReconciliationService reconciliationService = org.mockito.Mockito.mock(MisaExportReconciliationService.class);
        MisaExportService exportService = org.mockito.Mockito.mock(MisaExportService.class);
        LocalDate from = LocalDate.of(2026, 9, 1);
        LocalDate to = LocalDate.of(2026, 9, 30);
        when(reconciliationService.checkBeforeExport(from, to))
                .thenReturn(MisaExportReconciliationResult.of(List.of()));
        when(exportService.exportCsv(from, to)).thenReturn("orderNo,accountCode,totalAmount\nSO-OK,5111,1000\n".getBytes());

        MockMvcBuilders.standaloneSetup(new MisaExportController(reconciliationService, exportService)).build()
                .perform(get("/api/accounting/misa-export")
                        .param("fromDate", "2026-09-01")
                        .param("toDate", "2026-09-30"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=misa-export-2026-09-01-2026-09-30.csv"))
                .andExpect(content().bytes("orderNo,accountCode,totalAmount\nSO-OK,5111,1000\n".getBytes()));
    }

    @Test
    void misaExportEndpointReturnsConflictAndDoesNotGenerateFileWhenReconciliationHasIssues() throws Exception {
        MisaExportReconciliationService reconciliationService = org.mockito.Mockito.mock(MisaExportReconciliationService.class);
        MisaExportService exportService = org.mockito.Mockito.mock(MisaExportService.class);
        LocalDate from = LocalDate.of(2026, 9, 1);
        LocalDate to = LocalDate.of(2026, 9, 30);
        when(reconciliationService.checkBeforeExport(from, to)).thenReturn(MisaExportReconciliationResult.of(List.of(
                new ReconciliationIssue(MisaExportReconciliationService.PAID_ORDER_MISSING_INVOICE, "SO-409", "missing invoice")
        )));

        MockMvcBuilders.standaloneSetup(new MisaExportController(reconciliationService, exportService)).build()
                .perform(get("/api/accounting/misa-export")
                        .param("fromDate", "2026-09-01")
                        .param("toDate", "2026-09-30"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.hasIssues").value(true))
                .andExpect(jsonPath("$.issues[0].referenceCode").value("SO-409"));

        verify(exportService, never()).exportCsv(any(LocalDate.class), any(LocalDate.class));
    }
}
