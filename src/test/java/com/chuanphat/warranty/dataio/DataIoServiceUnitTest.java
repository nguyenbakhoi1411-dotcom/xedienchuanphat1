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
import com.chuanphat.warranty.core.service.InventoryService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import static org.mockito.Mockito.never;

class DataIoServiceUnitTest {
    private JdbcTemplate jdbcTemplate;
    private BranchSecurity branchSecurity;
    private InventoryService inventoryService;
    private DataIoService service;

    @BeforeEach
    void setUp() {
        jdbcTemplate = mock(JdbcTemplate.class);
        branchSecurity = mock(BranchSecurity.class);
        inventoryService = mock(InventoryService.class);
        service = new DataIoService(jdbcTemplate, mock(AuditLogService.class), branchSecurity, inventoryService, "build/test-uploads");
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
    void dataIoInitialInventoryGoesThroughMutationServiceNotDirectSql() {
        MockMultipartFile file = csv("opening.csv",
                "branchId,productId,quantityOnHand,minQuantity,averageCost\n2,7,12,3,250000\n");

        DataIoDtos.ImportResult result = service.importData("INITIAL_INVENTORY", file, false);

        assertThat(result.importedRows()).isEqualTo(1);
        verify(inventoryService).importOpeningBalance(eq(2L), eq(7L), eq(12), eq(3),
                eq(new java.math.BigDecimal("250000")), anyString());
        verify(jdbcTemplate, never()).update(org.mockito.ArgumentMatchers.contains("inventory_stocks"), any(Object[].class));
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
