package com.chuanphat.warranty.dataio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;

class DataIoServiceUnitTest {
    private JdbcTemplate jdbcTemplate;
    private BranchSecurity branchSecurity;
    private DataIoService service;

    @BeforeEach
    void setUp() {
        jdbcTemplate = mock(JdbcTemplate.class);
        branchSecurity = mock(BranchSecurity.class);
        service = new DataIoService(jdbcTemplate, mock(AuditLogService.class), branchSecurity, "build/test-uploads");
    }

    @Test
    void serialImportReportsDuplicateSerialWithRowNumber() {
        when(jdbcTemplate.queryForObject("select count(*) from product_serials where lower(serial_number) = lower(?)", Integer.class, "SN-001")).thenReturn(1);
        when(jdbcTemplate.queryForObject("select count(*) from product_serials where lower(frame_number) = lower(?)", Integer.class, "FR-001")).thenReturn(0);
        MockMultipartFile file = csv("serials.csv",
                "productId,serialNumber,branchId,frameNumber\n1,SN-001,2,FR-001\n");

        DataIoDtos.ImportResult result = service.importData("SERIALS", file, true);

        assertThat(result.imported()).isFalse();
        assertThat(result.hasCriticalErrors()).isTrue();
        assertThat(result.errors()).hasSize(1);
        assertThat(result.errors().get(0).rowNumber()).isEqualTo(2);
        assertThat(result.errors().get(0).field()).isEqualTo("serialNumber");
        assertThat(result.errors().get(0).code()).isEqualTo("DUPLICATE");
    }

    @Test
    void customerImportDoesNotWriteWhenCriticalErrorsExist() {
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), any(Object[].class))).thenReturn(0);
        MockMultipartFile file = csv("customers.csv",
                "phone,fullName,branchId\n,Nguyen Van A,1\n");

        DataIoDtos.ImportResult result = service.importData("CUSTOMERS", file, false);

        assertThat(result.importedRows()).isZero();
        assertThat(result.errors()).anySatisfy(error -> {
            assertThat(error.rowNumber()).isEqualTo(2);
            assertThat(error.field()).isEqualTo("phone");
        });
    }

    @Test
    void exportCustomersUsesScopedBranchFilter() {
        when(branchSecurity.scopedBranchId(2L)).thenReturn(2L);
        when(jdbcTemplate.queryForList(anyString(), any(Object[].class))).thenReturn(List.of(Map.of(
                "phone", "0900000000",
                "fullName", "Khach A",
                "branchId", 2L
        )));

        byte[] content = service.exportData("CUSTOMERS", 2L, "khach");

        assertThat(content).isNotEmpty();
        verify(branchSecurity).scopedBranchId(2L);
        verify(jdbcTemplate).queryForList(anyString(), any(Object[].class));
    }

    private MockMultipartFile csv(String fileName, String content) {
        return new MockMultipartFile("file", fileName, "text/csv", content.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}
