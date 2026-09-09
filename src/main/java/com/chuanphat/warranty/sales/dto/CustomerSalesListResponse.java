package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;
public record CustomerSalesListResponse(
    BigDecimal totalOverdueDebt,
    BigDecimal totalReceivable,
    BigDecimal totalPaid30Days,
    Page<CustomerSalesItem> customers
) {
    public record CustomerSalesItem(
        Long id, String code, String fullName, String phone, String email,
        String customerGroup, String taxCode,
        BigDecimal totalDebt, BigDecimal totalRevenue, String status
    ) {}
}
