package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
public record SalesDashboardResponse(
    BigDecimal todayRevenue,
    BigDecimal yesterdayRevenue,
    Double revenueGrowthPct,
    Long newOrders,
    Long activeOrders,
    BigDecimal totalReceivable,
    BigDecimal totalByInvoice,
    BigDecimal totalAdvance,
    BigDecimal totalContractValue,
    Long pendingInvoices,
    Long lowStockProducts
) {}
