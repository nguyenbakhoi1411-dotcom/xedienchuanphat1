package com.chuanphat.warranty.reports;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
class ManagementReportControllerTest {
    private static final String[] MANAGEMENT_REPORT_TYPES = {
            "sales-report",
            "inventory-valuation",
            "stock-movement",
            "customer-debt-aging",
            "supplier-debt-aging",
            "profit-loss",
            "cash-flow",
            "product-performance",
            "branch-performance",
            "employee-performance",
            "warranty-cost",
            "marketing-source"
    };

    @Autowired
    private MockMvc mockMvc;

    @Test
    void salesReportUsesDefaultDatesAndPagination() throws Exception {
        mockMvc.perform(get("/api/reports/sales-report")
                        .param("page", "0")
                        .param("pageSize", "10")
                        .with(reportViewer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Sales Report"))
                .andExpect(jsonPath("$.pagination.page").value(0))
                .andExpect(jsonPath("$.pagination.pageSize").value(10))
                .andExpect(jsonPath("$.pagination.totalItems").exists())
                .andExpect(jsonPath("$.tableRows").isArray());
    }

    @Test
    void allManagementReportsAreAvailableWithDefaultDates() throws Exception {
        for (String reportType : MANAGEMENT_REPORT_TYPES) {
            mockMvc.perform(get("/api/reports/{type}", reportType)
                            .param("page", "0")
                            .param("pageSize", "10")
                            .with(reportViewer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").exists())
                    .andExpect(jsonPath("$.tableColumns").isArray())
                    .andExpect(jsonPath("$.tableRows").isArray());
        }
    }

    @Test
    void reportExportRequiresPermissionAndReturnsNamedFile() throws Exception {
        mockMvc.perform(get("/api/reports/profit-loss/export")
                        .param("format", "excel")
                        .with(reportViewer()))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/reports/profit-loss/export")
                        .param("format", "excel")
                        .with(reportExporter()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("profit-loss")));

        mockMvc.perform(get("/api/reports/sales-report/export")
                        .param("format", "pdf")
                        .with(reportExporter()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("sales-report")))
                .andExpect(header().string("Content-Type", org.hamcrest.Matchers.containsString("application/pdf")));
    }

    private RequestPostProcessor reportViewer() {
        return user("admin").authorities(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("REPORT_VIEW")
        );
    }

    private RequestPostProcessor reportExporter() {
        return user("admin").authorities(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("REPORT_VIEW"),
                new SimpleGrantedAuthority("REPORT_EXPORT")
        );
    }
}
