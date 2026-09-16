package com.chuanphat.warranty.accounting;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.accounting.dto.MisaExportReconciliationResult;
import com.chuanphat.warranty.accounting.service.MisaExportReconciliationService;
import com.chuanphat.warranty.accounting.service.MisaExportService;
import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.entity.Invoice;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.SalesOrderItem;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.enums.PaymentStatus;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import com.chuanphat.warranty.core.repository.InventoryTransactionRepository;
import com.chuanphat.warranty.core.repository.InvoiceRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MisaExportReconciliationServiceBusinessTest {
    @Mock
    private SalesOrderRepository salesOrderRepository;
    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;
    @Mock
    private MisaExportService misaExportService;

    private MisaExportReconciliationService service;

    @BeforeEach
    void setUp() {
        service = new MisaExportReconciliationService(
                salesOrderRepository,
                invoiceRepository,
                inventoryTransactionRepository,
                misaExportService
        );
    }

    @Test
    void exportBlockedWhenPaidOrderHasNoCorrespondingInvoice() {
        LocalDate from = LocalDate.of(2026, 9, 1);
        LocalDate to = LocalDate.of(2026, 9, 30);
        SalesOrder order = order("SO-001", from, "1000", PaymentStatus.PAID, true, null, item("500", 2));
        when(salesOrderRepository.findByOrderDateBetween(from, to)).thenReturn(List.of(order));
        when(inventoryTransactionRepository.findByTypeAndTransactionDateBetween(InventoryTransactionType.SALE, from, to))
                .thenReturn(List.of(saleTransaction("SO-001", from, "1000")));
        when(misaExportService.calculateExportRevenueTotal(from, to)).thenReturn(new BigDecimal("1000"));

        MisaExportReconciliationResult result = service.checkBeforeExport(from, to);

        assertThat(result.hasIssues()).isTrue();
        assertThat(result.issues()).anySatisfy(issue -> {
            assertThat(issue.type()).isEqualTo(MisaExportReconciliationService.PAID_ORDER_MISSING_INVOICE);
            assertThat(issue.referenceCode()).isEqualTo("SO-001");
        });
    }

    @Test
    void exportBlockedWhenInventoryValueDoesNotMatchOrderCostBasis() {
        LocalDate from = LocalDate.of(2026, 9, 1);
        LocalDate to = LocalDate.of(2026, 9, 30);
        SalesOrder order = order("SO-002", from, "1500", PaymentStatus.PAID, true, 55L, item("600", 2));
        when(salesOrderRepository.findByOrderDateBetween(from, to)).thenReturn(List.of(order));
        when(inventoryTransactionRepository.findByTypeAndTransactionDateBetween(InventoryTransactionType.SALE, from, to))
                .thenReturn(List.of(saleTransaction("SO-002", from, "1199")));
        when(misaExportService.calculateExportRevenueTotal(from, to)).thenReturn(new BigDecimal("1500"));

        MisaExportReconciliationResult result = service.checkBeforeExport(from, to);

        assertThat(result.hasIssues()).isTrue();
        assertThat(result.issues()).anySatisfy(issue -> {
            assertThat(issue.type()).isEqualTo(MisaExportReconciliationService.INVENTORY_VALUE_MISMATCH);
            assertThat(issue.referenceCode()).isEqualTo("SO-002");
            assertThat(issue.description()).contains("1199", "1200");
        });
    }

    @Test
    void exportBlockedWhenRevenueTotalDoesNotMatchExportFileTotal() {
        LocalDate from = LocalDate.of(2026, 9, 1);
        LocalDate to = LocalDate.of(2026, 9, 30);
        SalesOrder order = order("SO-003", from, "2000", PaymentStatus.PAID, true, 55L, item("700", 1));
        when(salesOrderRepository.findByOrderDateBetween(from, to)).thenReturn(List.of(order));
        when(inventoryTransactionRepository.findByTypeAndTransactionDateBetween(InventoryTransactionType.SALE, from, to))
                .thenReturn(List.of(saleTransaction("SO-003", from, "700")));
        when(misaExportService.calculateExportRevenueTotal(from, to)).thenReturn(new BigDecimal("1999"));

        MisaExportReconciliationResult result = service.checkBeforeExport(from, to);

        assertThat(result.hasIssues()).isTrue();
        assertThat(result.issues()).anySatisfy(issue -> {
            assertThat(issue.type()).isEqualTo(MisaExportReconciliationService.REVENUE_TOTAL_MISMATCH);
            assertThat(issue.description()).contains("2000", "1999");
        });
    }

    @Test
    void reconciliationErrorResponseListsSpecificProblematicOrderCodes() {
        LocalDate from = LocalDate.of(2026, 9, 1);
        LocalDate to = LocalDate.of(2026, 9, 30);
        SalesOrder missingInvoice = order("SO-MISSING-INVOICE", from, "1000", PaymentStatus.PARTIAL, false, null, item("400", 1));
        SalesOrder costMismatch = order("SO-COST-MISMATCH", from, "2000", PaymentStatus.PAID, true, 66L, item("300", 3));
        when(salesOrderRepository.findByOrderDateBetween(from, to)).thenReturn(List.of(missingInvoice, costMismatch));
        when(inventoryTransactionRepository.findByTypeAndTransactionDateBetween(InventoryTransactionType.SALE, from, to))
                .thenReturn(List.of(saleTransaction("SO-COST-MISMATCH", from, "901")));
        when(misaExportService.calculateExportRevenueTotal(from, to)).thenReturn(new BigDecimal("3000"));

        MisaExportReconciliationResult result = service.checkBeforeExport(from, to);

        assertThat(result.issues())
                .extracting("referenceCode")
                .contains("SO-MISSING-INVOICE", "SO-COST-MISMATCH");
    }

    @Test
    void checkBeforeExportDoesNotModifyAnyDataItIsReadOnly() {
        LocalDate from = LocalDate.of(2026, 9, 1);
        LocalDate to = LocalDate.of(2026, 9, 30);
        SalesOrder order = order("SO-READONLY", from, "1000", PaymentStatus.PAID, true, 77L, item("500", 2));
        when(salesOrderRepository.findByOrderDateBetween(from, to)).thenReturn(List.of(order));
        when(inventoryTransactionRepository.findByTypeAndTransactionDateBetween(InventoryTransactionType.SALE, from, to))
                .thenReturn(List.of(saleTransaction("SO-READONLY", from, "1000")));
        when(misaExportService.calculateExportRevenueTotal(from, to)).thenReturn(new BigDecimal("1000"));

        MisaExportReconciliationResult result = service.checkBeforeExport(from, to);

        assertThat(result.hasIssues()).isFalse();
        verify(salesOrderRepository, never()).save(any(SalesOrder.class));
        verify(inventoryTransactionRepository, never()).save(any(InventoryTransaction.class));
        verify(invoiceRepository, never()).save(any(Invoice.class));
    }

    private static SalesOrder order(String orderNo, LocalDate date, String totalAmount, PaymentStatus paymentStatus,
                                    boolean stockIssued, Long taxInvoiceId, SalesOrderItem item) {
        SalesOrder order = new SalesOrder();
        order.setOrderNo(orderNo);
        order.setBranchId(1L);
        order.setCustomerId(10L);
        order.setEmployeeId(20L);
        order.setVoucherCode("");
        order.setOrderDate(date);
        order.setStatus(SalesOrderStatus.DELIVERED);
        order.setTotalAmount(new BigDecimal(totalAmount));
        order.setPaymentStatus(paymentStatus);
        order.setStockIssued(stockIssued);
        order.setTaxInvoiceId(taxInvoiceId);
        order.addItem(item);
        return order;
    }

    private static SalesOrderItem item(String importPrice, int quantity) {
        Product product = new Product();
        product.setImportPrice(new BigDecimal(importPrice));
        SalesOrderItem item = new SalesOrderItem();
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setUnitPrice(BigDecimal.ZERO);
        item.setLineTotal(BigDecimal.ZERO);
        return item;
    }

    private static InventoryTransaction saleTransaction(String orderNo, LocalDate date, String totalCost) {
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setType(InventoryTransactionType.SALE);
        transaction.setTransactionNo("SALE-" + orderNo);
        transaction.setTransactionDate(date);
        transaction.setNote("Sale order " + orderNo);
        transaction.setQuantity(1);
        transaction.setTotalCost(new BigDecimal(totalCost));
        return transaction;
    }
}
