package com.chuanphat.warranty.reports;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.accounting.controller.AccountMappingController;
import com.chuanphat.warranty.accounting.controller.AccountingPeriodController;
import com.chuanphat.warranty.accounting.controller.MisaExportController;
import com.chuanphat.warranty.accounting.dto.AccountMappingDtos;
import com.chuanphat.warranty.accounting.dto.AccountingPeriodDtos;
import com.chuanphat.warranty.audit.annotation.Audited;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.core.entity.InventoryAverageCost;
import com.chuanphat.warranty.core.entity.InventoryStock;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.SalesOrderItem;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.PaymentStatus;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import com.chuanphat.warranty.core.repository.InventoryAverageCostRepository;
import com.chuanphat.warranty.core.repository.InventoryStockRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.EmployeeWarehouseRepository;
import com.chuanphat.warranty.reports.dto.InventoryValuationReportDtos;
import com.chuanphat.warranty.reports.dto.RevenueReportDtos;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

class ReportPermissionBusinessTest {
    @Test
    void salesStaffOnlySeesOwnRevenueNotCompanyWide() {
        SalesOrderRepository repository = org.mockito.Mockito.mock(SalesOrderRepository.class);
        ReportAccessService access = org.mockito.Mockito.mock(ReportAccessService.class);
        LocalDate from = LocalDate.of(2026, 9, 1);
        LocalDate to = LocalDate.of(2026, 9, 30);
        when(repository.findByOrderDateBetween(from, to)).thenReturn(List.of(
                order("SO-MINE", from, 101L, item(product(1L, "FOOD-1", ProductCategory.ACCESSORY), warehouse(1L, "Main"), "700")),
                order("SO-OTHER", from, 202L, item(product(2L, "EV-1", ProductCategory.ELECTRIC_MOTORBIKE), warehouse(1L, "Main"), "900"))
        ));
        when(repository.findByOrderDateBetween(LocalDate.of(2026, 8, 2), LocalDate.of(2026, 8, 31))).thenReturn(List.of());
        when(access.canViewAllReports()).thenReturn(false);
        when(access.currentEmployeeId()).thenReturn(Optional.of(101L));

        RevenueReportService service = new RevenueReportService(repository, access);

        RevenueReportDtos.RevenueReportResponse report = service.report(from, to, RevenueReportDtos.PeriodGrouping.MONTH);

        assertThat(report.totalRevenue()).isEqualByComparingTo("700");
        assertThat(report.rows()).singleElement().satisfies(row -> {
            assertThat(row.employeeId()).isEqualTo(101L);
            assertThat(row.revenue()).isEqualByComparingTo("700");
        });
    }

    @Test
    void warehouseStaffOnlySeesAssignedWarehouseInventoryReport() throws NoSuchFieldException {
        InventoryStockRepository stockRepository = org.mockito.Mockito.mock(InventoryStockRepository.class);
        InventoryAverageCostRepository averageCostRepository = org.mockito.Mockito.mock(InventoryAverageCostRepository.class);
        ReportAccessService access = org.mockito.Mockito.mock(ReportAccessService.class);
        Product product = product(10L, "EV-10", ProductCategory.ELECTRIC_MOTORBIKE);
        Warehouse blocked = warehouse(1L, "Blocked");
        Warehouse assigned = warehouse(2L, "Assigned");
        when(stockRepository.findAll()).thenReturn(List.of(
                stock(1L, blocked, product, 4),
                stock(1L, assigned, product, 3)
        ));
        when(averageCostRepository.findAll()).thenReturn(List.of(
                averageCost(1L, blocked, product, "100"),
                averageCost(1L, assigned, product, "80")
        ));
        when(access.canViewAllReports()).thenReturn(false);
        when(access.accessibleWarehouseIds()).thenReturn(Set.of(2L));

        InventoryValuationReportService service = new InventoryValuationReportService(stockRepository, averageCostRepository, access);

        InventoryValuationReportDtos.InventoryValuationReportResponse report = service.report();

        assertThat(report.totalValue()).isEqualByComparingTo("240");
        assertThat(report.perWarehouseValues()).singleElement().satisfies(row -> {
            assertThat(row.warehouseId()).isEqualTo(2L);
            assertThat(row.warehouseName()).isEqualTo("Assigned");
        });
        assertThat(ReportAccessService.class.getDeclaredField("employeeWarehouseRepository").getType())
                .isEqualTo(EmployeeWarehouseRepository.class);
    }

    @Test
    void onlyAdminOrChiefAccountantCanLockOrUnlockPeriod() throws NoSuchMethodException {
        Method lockByMonth = AccountingPeriodController.class.getDeclaredMethod(
                "lockByMonth", int.class, int.class, AccountingPeriodDtos.LockUnlockRequest.class, UserDetails.class);
        Method unlockByMonth = AccountingPeriodController.class.getDeclaredMethod(
                "unlockByMonth", int.class, int.class, AccountingPeriodDtos.LockUnlockRequest.class, UserDetails.class);

        assertThat(lockByMonth.getAnnotation(PreAuthorize.class).value()).contains("ADMIN", "CHIEF_ACCOUNTANT");
        assertThat(unlockByMonth.getAnnotation(PreAuthorize.class).value()).contains("ADMIN", "CHIEF_ACCOUNTANT");
    }

    @Test
    void allReportSensitiveActionsAreAuditLogged() throws NoSuchMethodException {
        Method lockByMonth = AccountingPeriodController.class.getDeclaredMethod(
                "lockByMonth", int.class, int.class, AccountingPeriodDtos.LockUnlockRequest.class, UserDetails.class);
        Method unlockByMonth = AccountingPeriodController.class.getDeclaredMethod(
                "unlockByMonth", int.class, int.class, AccountingPeriodDtos.LockUnlockRequest.class, UserDetails.class);
        Method updateMapping = AccountMappingController.class.getDeclaredMethod(
                "updateMapping", AccountMappingDtos.UpdateAccountMappingRequest.class, UserDetails.class);

        assertThat(lockByMonth.getAnnotation(Audited.class).action()).isEqualTo(AuditAction.LOCK_ACCOUNTING_PERIOD);
        assertThat(unlockByMonth.getAnnotation(Audited.class).action()).isEqualTo(AuditAction.UNLOCK_ACCOUNTING_PERIOD);
        assertThat(updateMapping.getAnnotation(Audited.class).action()).isEqualTo(AuditAction.UPDATE_ACCOUNT);
        assertThat(hasAuditServiceField(ReportController.class)).isTrue();
        assertThat(hasAuditServiceField(MisaExportController.class)).isTrue();
    }

    private static boolean hasAuditServiceField(Class<?> type) {
        return Arrays.stream(type.getDeclaredFields()).anyMatch(field -> field.getType().equals(AuditLogService.class));
    }

    private static SalesOrder order(String orderNo, LocalDate date, Long employeeId, SalesOrderItem... items) {
        SalesOrder order = new SalesOrder();
        order.setOrderNo(orderNo);
        order.setBranchId(1L);
        order.setCustomerId(10L);
        order.setEmployeeId(employeeId);
        order.setVoucherCode("");
        order.setOrderDate(date);
        order.setStatus(SalesOrderStatus.DELIVERED);
        order.setPaymentStatus(PaymentStatus.PAID);
        for (SalesOrderItem item : items) {
            order.addItem(item);
        }
        return order;
    }

    private static SalesOrderItem item(Product product, Warehouse warehouse, String lineTotal) {
        SalesOrderItem item = new SalesOrderItem();
        item.setProduct(product);
        item.setWarehouse(warehouse);
        item.setQuantity(1);
        item.setUnitPrice(new BigDecimal(lineTotal));
        item.setLineTotal(new BigDecimal(lineTotal));
        return item;
    }

    private static InventoryStock stock(Long branchId, Warehouse warehouse, Product product, int quantity) {
        InventoryStock stock = new InventoryStock();
        stock.setBranchId(branchId);
        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        stock.setQuantityOnHand(quantity);
        return stock;
    }

    private static InventoryAverageCost averageCost(Long branchId, Warehouse warehouse, Product product, String averageCost) {
        InventoryAverageCost cost = new InventoryAverageCost();
        cost.setBranchId(branchId);
        cost.setWarehouse(warehouse);
        cost.setProduct(product);
        cost.setAverageCost(new BigDecimal(averageCost));
        return cost;
    }

    private static Warehouse warehouse(Long id, String name) {
        Warehouse warehouse = new Warehouse();
        ReflectionTestUtils.setField(warehouse, "id", id);
        warehouse.setWarehouseCode("WH-" + id);
        warehouse.setWarehouseName(name);
        warehouse.setBranchId(1L);
        return warehouse;
    }

    private static Product product(Long id, String code, ProductCategory category) {
        Product product = new Product();
        ReflectionTestUtils.setField(product, "id", id);
        product.setProductCode(code);
        product.setProductName(code);
        product.setCategory(category);
        product.setBrand("Brand");
        product.setImportPrice(BigDecimal.ZERO);
        product.setSalePrice(BigDecimal.ZERO);
        return product;
    }
}
