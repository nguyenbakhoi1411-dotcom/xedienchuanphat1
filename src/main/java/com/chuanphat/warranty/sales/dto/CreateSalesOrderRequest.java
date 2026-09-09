package com.chuanphat.warranty.sales.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
public record CreateSalesOrderRequest(
    @NotNull LocalDate orderDate,
    Long customerId, String customerCode, String customerName,
    String customerAddress, String taxCode, String phone, String mobilePhone,
    Long salespersonId, String salespersonName, Long warehouseId,
    String paymentTerm, LocalDate deliveryDate, String deliveryAddress,
    BigDecimal depositAmount, String paymentMethod, String note,
    Long quotationId,
    @NotEmpty @Valid List<SalesOrderItemRequest> items
) {}
