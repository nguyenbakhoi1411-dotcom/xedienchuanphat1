package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.enums.AccountMappingTransactionType;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MisaExportService {
    private final SalesOrderRepository salesOrderRepository;
    private final AccountMappingService accountMappingService;

    public MisaExportService(SalesOrderRepository salesOrderRepository, AccountMappingService accountMappingService) {
        this.salesOrderRepository = salesOrderRepository;
        this.accountMappingService = accountMappingService;
    }

    @Transactional(readOnly = true)
    public byte[] exportCsv(LocalDate fromDate, LocalDate toDate) {
        StringBuilder csv = new StringBuilder("orderNo,orderDate,customerId,accountCode,totalAmount\n");
        for (MisaExportRow row : exportRows(fromDate, toDate)) {
            csv.append(escape(row.orderNo())).append(',')
                    .append(row.orderDate()).append(',')
                    .append(row.customerId()).append(',')
                    .append(escape(row.accountCode())).append(',')
                    .append(row.totalAmount()).append('\n');
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateExportRevenueTotal(LocalDate fromDate, LocalDate toDate) {
        return exportRows(fromDate, toDate).stream()
                .map(MisaExportRow::totalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public List<MisaExportRow> exportRows(LocalDate fromDate, LocalDate toDate) {
        String salesAccountCode = accountMappingService.accountCodeFor(AccountMappingTransactionType.SALES_EV);
        return salesOrderRepository.findByOrderDateBetween(fromDate, toDate).stream()
                .filter(order -> order.getStatus() != SalesOrderStatus.CANCELLED)
                .map(order -> new MisaExportRow(
                        order.getOrderNo(),
                        order.getOrderDate(),
                        order.getCustomerId(),
                        salesAccountCode,
                        money(order.getTotalAmount())
                ))
                .toList();
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private static BigDecimal money(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    public record MisaExportRow(
            String orderNo,
            LocalDate orderDate,
            Long customerId,
            String accountCode,
            BigDecimal totalAmount
    ) {
    }
}
