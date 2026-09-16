package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.MisaExportReconciliationResult;
import com.chuanphat.warranty.accounting.dto.ReconciliationIssue;
import com.chuanphat.warranty.core.entity.InventoryTransaction;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MisaExportReconciliationService {
    public static final String PAID_ORDER_MISSING_INVOICE = "PAID_ORDER_MISSING_INVOICE";
    public static final String INVENTORY_VALUE_MISMATCH = "INVENTORY_VALUE_MISMATCH";
    public static final String REVENUE_TOTAL_MISMATCH = "REVENUE_TOTAL_MISMATCH";

    private final SalesOrderRepository salesOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final MisaExportService misaExportService;

    public MisaExportReconciliationService(
            SalesOrderRepository salesOrderRepository,
            InvoiceRepository invoiceRepository,
            InventoryTransactionRepository inventoryTransactionRepository,
            MisaExportService misaExportService
    ) {
        this.salesOrderRepository = salesOrderRepository;
        this.invoiceRepository = invoiceRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.misaExportService = misaExportService;
    }

    @Transactional(readOnly = true)
    public MisaExportReconciliationResult checkBeforeExport(LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null || toDate == null || fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("Invalid MISA export date range");
        }

        List<SalesOrder> orders = salesOrderRepository.findByOrderDateBetween(fromDate, toDate);
        List<InventoryTransaction> saleTransactions = inventoryTransactionRepository.findByTypeAndTransactionDateBetween(
                InventoryTransactionType.SALE,
                fromDate,
                toDate
        );

        List<ReconciliationIssue> issues = new ArrayList<>();
        issues.addAll(missingInvoiceIssues(orders));
        issues.addAll(inventoryMismatchIssues(orders, saleTransactions));
        revenueMismatchIssue(orders, fromDate, toDate).forEach(issues::add);

        return MisaExportReconciliationResult.of(issues);
    }

    private List<ReconciliationIssue> missingInvoiceIssues(List<SalesOrder> orders) {
        return orders.stream()
                .filter(this::isPaidOrPartiallyPaid)
                .filter(order -> !hasInvoice(order))
                .map(order -> new ReconciliationIssue(
                        PAID_ORDER_MISSING_INVOICE,
                        order.getOrderNo(),
                        "Paid sales order " + order.getOrderNo() + " has no TaxInvoice link and no Invoice record."
                ))
                .toList();
    }

    private List<ReconciliationIssue> inventoryMismatchIssues(List<SalesOrder> orders, List<InventoryTransaction> saleTransactions) {
        Map<String, SalesOrder> ordersByNo = orders.stream()
                .filter(SalesOrder::isStockIssued)
                .filter(order -> order.getOrderNo() != null)
                .collect(Collectors.toMap(SalesOrder::getOrderNo, Function.identity(), (first, ignored) -> first));

        List<ReconciliationIssue> issues = new ArrayList<>();
        for (SalesOrder order : ordersByNo.values()) {
            BigDecimal orderCostBasis = orderCostBasis(order);
            BigDecimal inventoryCost = saleTransactions.stream()
                    .filter(transaction -> belongsToOrder(transaction, order.getOrderNo()))
                    .map(transaction -> money(transaction.getTotalCost()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (inventoryCost.compareTo(orderCostBasis) != 0) {
                issues.add(new ReconciliationIssue(
                        INVENTORY_VALUE_MISMATCH,
                        order.getOrderNo(),
                        "Inventory SALE totalCost " + inventoryCost + " does not match sales order cost basis " + orderCostBasis + "."
                ));
            }
        }
        return issues;
    }

    private List<ReconciliationIssue> revenueMismatchIssue(List<SalesOrder> orders, LocalDate fromDate, LocalDate toDate) {
        BigDecimal salesModuleTotal = orders.stream()
                .filter(order -> order.getStatus() != SalesOrderStatus.CANCELLED)
                .map(order -> money(order.getTotalAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal exportFileTotal = misaExportService.calculateExportRevenueTotal(fromDate, toDate);
        if (salesModuleTotal.compareTo(exportFileTotal) == 0) {
            return List.of();
        }
        return List.of(new ReconciliationIssue(
                REVENUE_TOTAL_MISMATCH,
                fromDate + ".." + toDate,
                "Sales module revenue " + salesModuleTotal + " does not match MISA export total " + exportFileTotal + "."
        ));
    }

    private boolean isPaidOrPartiallyPaid(SalesOrder order) {
        return order.getPaymentStatus() == PaymentStatus.PAID || order.getPaymentStatus() == PaymentStatus.PARTIAL;
    }

    private boolean hasInvoice(SalesOrder order) {
        return order.getTaxInvoiceId() != null || (order.getId() != null && invoiceRepository.findByOrder_Id(order.getId()).isPresent());
    }

    private boolean belongsToOrder(InventoryTransaction transaction, String orderNo) {
        return orderNo.equals(transaction.getReferenceNo()) || ("Sale order " + orderNo).equals(transaction.getNote());
    }

    private BigDecimal orderCostBasis(SalesOrder order) {
        return order.getItems().stream()
                .map(this::itemCostBasis)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal itemCostBasis(SalesOrderItem item) {
        BigDecimal importPrice = item.getProduct() == null ? BigDecimal.ZERO : money(item.getProduct().getImportPrice());
        return importPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
    }

    private static BigDecimal money(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
