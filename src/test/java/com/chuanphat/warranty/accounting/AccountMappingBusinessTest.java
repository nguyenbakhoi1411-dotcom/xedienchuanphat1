package com.chuanphat.warranty.accounting;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.accounting.controller.AccountMappingController;
import com.chuanphat.warranty.accounting.enums.AccountMappingTransactionType;
import com.chuanphat.warranty.accounting.service.AccountMappingService;
import com.chuanphat.warranty.accounting.service.MisaExportService;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.enums.PaymentStatus;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

class AccountMappingBusinessTest {
    @Test
    void accountMappingIsConfigurableNotHardcoded() {
        SalesOrderRepository salesOrderRepository = org.mockito.Mockito.mock(SalesOrderRepository.class);
        AccountMappingService accountMappingService = org.mockito.Mockito.mock(AccountMappingService.class);
        LocalDate from = LocalDate.of(2026, 9, 1);
        LocalDate to = LocalDate.of(2026, 9, 30);
        when(salesOrderRepository.findByOrderDateBetween(from, to)).thenReturn(List.of(order("SO-CFG", from, "1000")));
        when(accountMappingService.accountCodeFor(AccountMappingTransactionType.SALES_EV)).thenReturn("5999");

        MisaExportService service = new MisaExportService(salesOrderRepository, accountMappingService);

        String csv = new String(service.exportCsv(from, to), StandardCharsets.UTF_8);

        assertThat(csv).contains("SO-CFG,2026-09-01,10,5999,1000");
        assertThat(csv).doesNotContain(",5111,");
    }

    @Test
    void changingMappingDoesNotAffectAlreadyExportedReports() {
        SalesOrderRepository salesOrderRepository = org.mockito.Mockito.mock(SalesOrderRepository.class);
        AccountMappingService accountMappingService = org.mockito.Mockito.mock(AccountMappingService.class);
        LocalDate from = LocalDate.of(2026, 9, 1);
        LocalDate to = LocalDate.of(2026, 9, 30);
        when(salesOrderRepository.findByOrderDateBetween(from, to)).thenReturn(List.of(order("SO-SNAPSHOT", from, "1000")));
        when(accountMappingService.accountCodeFor(AccountMappingTransactionType.SALES_EV)).thenReturn("5111", "5112");

        MisaExportService service = new MisaExportService(salesOrderRepository, accountMappingService);

        byte[] alreadyExported = service.exportCsv(from, to);
        byte[] exportedAfterMappingChange = service.exportCsv(from, to);

        assertThat(new String(alreadyExported, StandardCharsets.UTF_8)).contains("SO-SNAPSHOT,2026-09-01,10,5111,1000");
        assertThat(new String(exportedAfterMappingChange, StandardCharsets.UTF_8)).contains("SO-SNAPSHOT,2026-09-01,10,5112,1000");
        assertThat(new String(alreadyExported, StandardCharsets.UTF_8)).doesNotContain(",5112,");
    }

    @Test
    void onlyAdminOrChiefAccountantCanChangeAccountMapping() throws NoSuchMethodException {
        Method updateMapping = AccountMappingController.class.getDeclaredMethod(
                "updateMapping",
                com.chuanphat.warranty.accounting.dto.AccountMappingDtos.UpdateAccountMappingRequest.class,
                org.springframework.security.core.userdetails.UserDetails.class
        );

        PreAuthorize preAuthorize = updateMapping.getAnnotation(PreAuthorize.class);

        assertThat(preAuthorize).isNotNull();
        assertThat(preAuthorize.value()).isEqualTo("hasAnyRole('ADMIN','CHIEF_ACCOUNTANT')");
    }

    private static SalesOrder order(String orderNo, LocalDate date, String totalAmount) {
        SalesOrder order = new SalesOrder();
        order.setOrderNo(orderNo);
        order.setBranchId(1L);
        order.setCustomerId(10L);
        order.setEmployeeId(20L);
        order.setVoucherCode("");
        order.setOrderDate(date);
        order.setStatus(SalesOrderStatus.DELIVERED);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setTotalAmount(new BigDecimal(totalAmount));
        return order;
    }
}
