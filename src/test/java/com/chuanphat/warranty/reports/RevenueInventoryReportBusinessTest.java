package com.chuanphat.warranty.reports;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

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
import com.chuanphat.warranty.reports.dto.RevenueReportDtos;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class RevenueInventoryReportBusinessTest {
    @Test
    void revenueReportSplitsByCategoryAndWarehouseCorrectly() {
        SalesOrderRepository repository = org.mockito.Mockito.mock(SalesOrderRepository.class);
        LocalDate from = LocalDate.of(2026, 9, 1);
        LocalDate to = LocalDate.of(2026, 9, 7);
        Warehouse main = warehouse(1L, "Main");
        Warehouse cold = warehouse(2L, "Cold");
        SalesOrder order = order("SO-1", from, 101L,
                item(product(11L, "EV-1", ProductCategory.ELECTRIC_MOTORBIKE), main, "1000"),
                item(product(12L, "FOOD-1", ProductCategory.ACCESSORY), cold, "250"));
        when(repository.findByOrderDateBetween(from, to)).thenReturn(List.of(order));
        when(repository.findByOrderDateBetween(LocalDate.of(2026, 8, 25), LocalDate.of(2026, 8, 31))).thenReturn(List.of());

        RevenueReportService service = new RevenueReportService(repository);

        RevenueReportDtos.RevenueReportResponse report = service.report(from, to, RevenueReportDtos.PeriodGrouping.DAY);

        assertThat(report.totalRevenue()).isEqualByComparingTo("1250");
        assertThat(report.rows()).anySatisfy(row -> {
            assertThat(row.businessLine()).isEqualTo(RevenueReportDtos.BusinessLine.EV);
            assertThat(row.warehouseName()).isEqualTo("Main");
            assertThat(row.employeeId()).isEqualTo(101L);
            assertThat(row.revenue()).isEqualByComparingTo("1000");
        });
        assertThat(report.rows()).anySatisfy(row -> {
            assertThat(row.businessLine()).isEqualTo(RevenueReportDtos.BusinessLine.FOOD);
            assertThat(row.warehouseName()).isEqualTo("Cold");
            assertThat(row.revenue()).isEqualByComparingTo("250");
        });
    }

    @Test
    void revenueReportComparisonWithPreviousPeriodIsAccurate() {
        SalesOrderRepository repository = org.mockito.Mockito.mock(SalesOrderRepository.class);
        LocalDate from = LocalDate.of(2026, 9, 8);
        LocalDate to = LocalDate.of(2026, 9, 14);
        when(repository.findByOrderDateBetween(from, to)).thenReturn(List.of(
                order("SO-CUR", from, 101L, item(product(11L, "EV-1", ProductCategory.ELECTRIC_MOTORBIKE), warehouse(1L, "Main"), "1500"))
        ));
        when(repository.findByOrderDateBetween(LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 7))).thenReturn(List.of(
                order("SO-PREV", LocalDate.of(2026, 9, 1), 101L, item(product(12L, "FOOD-1", ProductCategory.ACCESSORY), warehouse(1L, "Main"), "900"))
        ));

        RevenueReportService service = new RevenueReportService(repository);

        RevenueReportDtos.RevenueReportResponse report = service.report(from, to, RevenueReportDtos.PeriodGrouping.WEEK);

        assertThat(report.totalRevenue()).isEqualByComparingTo("1500");
        assertThat(report.previousPeriodRevenue()).isEqualByComparingTo("900");
        assertThat(report.changeAmount()).isEqualByComparingTo("600");
        assertThat(report.rows()).singleElement().satisfies(row -> assertThat(row.periodStart()).isEqualTo(LocalDate.of(2026, 9, 7)));
    }

    @Test
    void inventoryValuationUsesSameCostMethodAsInventoryModule() {
        InventoryStockRepository stockRepository = org.mockito.Mockito.mock(InventoryStockRepository.class);
        InventoryAverageCostRepository averageCostRepository = org.mockito.Mockito.mock(InventoryAverageCostRepository.class);
        Warehouse warehouse = warehouse(1L, "Main");
        Product product = product(100L, "EV-100", ProductCategory.ELECTRIC_MOTORBIKE);
        when(stockRepository.findAll()).thenReturn(List.of(stock(1L, warehouse, product, 3)));
        when(averageCostRepository.findAll()).thenReturn(List.of(averageCost(1L, warehouse, product, "123.45")));

        InventoryValuationReportService service = new InventoryValuationReportService(stockRepository, averageCostRepository);

        var report = service.report();

        assertThat(report.costingMethod()).isEqualTo(InventoryValuationReportService.COSTING_METHOD);
        assertThat(report.perWarehouseValues()).singleElement().satisfies(row -> {
            assertThat(row.averageCost()).isEqualByComparingTo("123.45");
            assertThat(row.stockValue()).isEqualByComparingTo("370.35");
        });
    }

    @Test
    void inventoryValuationTotalMatchesSumOfPerWarehouseValues() {
        InventoryStockRepository stockRepository = org.mockito.Mockito.mock(InventoryStockRepository.class);
        InventoryAverageCostRepository averageCostRepository = org.mockito.Mockito.mock(InventoryAverageCostRepository.class);
        Product product = product(100L, "EV-100", ProductCategory.ELECTRIC_MOTORBIKE);
        Warehouse main = warehouse(1L, "Main");
        Warehouse branch = warehouse(2L, "Branch");
        when(stockRepository.findAll()).thenReturn(List.of(
                stock(1L, main, product, 2),
                stock(1L, branch, product, 5)
        ));
        when(averageCostRepository.findAll()).thenReturn(List.of(
                averageCost(1L, main, product, "100"),
                averageCost(1L, branch, product, "80")
        ));

        InventoryValuationReportService service = new InventoryValuationReportService(stockRepository, averageCostRepository);

        var report = service.report();
        BigDecimal sumOfRows = report.perWarehouseValues().stream()
                .map(com.chuanphat.warranty.reports.dto.InventoryValuationReportDtos.InventoryValuationWarehouseRow::stockValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertThat(report.totalValue()).isEqualByComparingTo("600");
        assertThat(report.totalValue()).isEqualByComparingTo(sumOfRows);
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
