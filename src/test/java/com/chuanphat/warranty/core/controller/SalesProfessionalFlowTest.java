package com.chuanphat.warranty.core.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
class SalesProfessionalFlowTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductSerialRepository serialRepository;

    @Test
    void quotationPaymentInvoiceAndReturnFlow() throws Exception {
        MvcResult quotationResult = mockMvc.perform(post("/api/sales/quotations")
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "branchId", 1,
                                "customerId", 1,
                                "employeeId", 102,
                                "quotationDate", LocalDate.now().toString(),
                                "validUntil", LocalDate.now().plusDays(7).toString(),
                                "discountAmount", BigDecimal.ZERO,
                                "items", List.of(Map.of(
                                        "productId", 1,
                                        "serialId", 61,
                                        "quantity", 1
                                ))
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn();

        long quotationId = objectMapper.readTree(quotationResult.getResponse().getContentAsString()).get("id").asLong();

        MvcResult orderResult = mockMvc.perform(post("/api/sales/quotations/{id}/convert", quotationId)
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "employeeId", 102,
                                "reservationUntil", OffsetDateTime.now().plusHours(2).toString(),
                                "issueInvoice", false,
                                "payments", List.of()
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.paymentStatus").value("UNPAID"))
                .andReturn();

        JsonNode order = objectMapper.readTree(orderResult.getResponse().getContentAsString());
        long orderId = order.get("id").asLong();
        long orderItemId = order.get("items").get(0).get("id").asLong();
        BigDecimal totalAmount = order.get("totalAmount").decimalValue();

        mockMvc.perform(post("/api/sales/orders/{id}/payments", orderId)
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "paymentMethod", "CASH",
                                "amount", totalAmount,
                                "paymentDate", LocalDate.now().toString(),
                                "note", "Customer paid at POS"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(totalAmount.doubleValue()));

        MvcResult invoiceResult = mockMvc.perform(post("/api/sales/orders/{id}/invoice", orderId)
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "ISSUED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ISSUED"))
                .andReturn();

        long invoiceId = objectMapper.readTree(invoiceResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/api/sales/invoices/{id}/pdf", invoiceId)
                        .with(salesUser()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));

        mockMvc.perform(post("/api/sales/returns")
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "orderId", orderId,
                                "refundAmount", new BigDecimal("100.00"),
                                "refundMethod", "CASH",
                                "reason", "Customer return test",
                                "items", List.of(Map.of(
                                        "orderItemId", orderItemId,
                                        "quantity", 1,
                                        "serialDisposition", "RETURNED"
                                ))
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.refundAmount").value(100.00));
    }

    @Test
    void confirmedUnpaidOrderCanReleaseExpiredSerialReservation() throws Exception {
        MvcResult orderResult = mockMvc.perform(post("/api/sales/orders")
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "branchId", 1,
                                "customerId", 1,
                                "employeeId", 102,
                                "orderDate", LocalDate.now().toString(),
                                "discountAmount", BigDecimal.ZERO,
                                "paidAmount", BigDecimal.ZERO,
                                "confirm", true,
                                "issueInvoice", false,
                                "reservationUntil", OffsetDateTime.now().minusMinutes(10).toString(),
                                "items", List.of(Map.of(
                                        "productId", 7,
                                        "serialId", 67,
                                        "quantity", 1
                                ))
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andReturn();

        objectMapper.readTree(orderResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/sales/reservations/release-expired")
                        .with(salesUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.released").value(1));
    }

    @Test
    void quotationDoesNotReserveSerialUntilConvertedToConfirmedOrder() throws Exception {
        long serialId = 73L;

        MvcResult quotationResult = mockMvc.perform(post("/api/sales/quotations")
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "branchId", 1,
                                "customerId", 1,
                                "employeeId", 102,
                                "quotationDate", LocalDate.now().toString(),
                                "validUntil", LocalDate.now().plusDays(7).toString(),
                                "discountAmount", BigDecimal.ZERO,
                                "items", List.of(Map.of(
                                        "productId", 13,
                                        "serialId", serialId,
                                        "quantity", 1
                                ))
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn();

        assertSerialStatus(serialId, SerialStatus.IN_STOCK);

        long quotationId = objectMapper.readTree(quotationResult.getResponse().getContentAsString()).get("id").asLong();
        mockMvc.perform(post("/api/sales/quotations/{id}/convert", quotationId)
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "employeeId", 102,
                                "reservationUntil", OffsetDateTime.now().plusHours(2).toString(),
                                "issueInvoice", false,
                                "payments", List.of()
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.stockIssued").value(false));

        assertSerialStatus(serialId, SerialStatus.RESERVED);
    }

    @Test
    void partialPaymentsAreStoredAsSeparateLedgerRowsAndUpdateOrderStatus() throws Exception {
        MvcResult orderResult = mockMvc.perform(post("/api/sales/orders")
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "branchId", 1,
                                "customerId", 1,
                                "employeeId", 102,
                                "orderDate", LocalDate.now().toString(),
                                "discountAmount", BigDecimal.ZERO,
                                "confirm", true,
                                "issueInvoice", false,
                                "items", List.of(Map.of(
                                        "productId", 31,
                                        "quantity", 1
                                ))
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.paymentStatus").value("UNPAID"))
                .andReturn();

        JsonNode order = objectMapper.readTree(orderResult.getResponse().getContentAsString());
        long orderId = order.get("id").asLong();
        BigDecimal totalAmount = order.get("totalAmount").decimalValue();
        BigDecimal firstPayment = totalAmount.divide(BigDecimal.valueOf(2), 2, java.math.RoundingMode.DOWN);
        BigDecimal secondPayment = totalAmount.subtract(firstPayment);

        mockMvc.perform(post("/api/sales/orders/{id}/payments", orderId)
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "paymentMethod", "CASH",
                                "amount", firstPayment,
                                "paymentDate", LocalDate.now().toString(),
                                "referenceNo", "PAY-TEST-1"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.referenceNo").value("PAY-TEST-1"));

        mockMvc.perform(get("/api/sales/orders/{id}", orderId)
                        .with(salesUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PARTIALLY_PAID"))
                .andExpect(jsonPath("$.paymentStatus").value("PARTIAL"))
                .andExpect(jsonPath("$.paidAmount").value(firstPayment.doubleValue()));

        mockMvc.perform(post("/api/sales/orders/{id}/payments", orderId)
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "paymentMethod", "BANK_TRANSFER",
                                "amount", secondPayment,
                                "paymentDate", LocalDate.now().toString(),
                                "referenceNo", "PAY-TEST-2"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.referenceNo").value("PAY-TEST-2"));

        mockMvc.perform(get("/api/sales/orders/{id}", orderId)
                        .with(salesUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.paymentStatus").value("PAID"))
                .andExpect(jsonPath("$.paidAmount").value(totalAmount.doubleValue()));

        mockMvc.perform(get("/api/sales/orders/{id}/payments", orderId)
                        .with(salesUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void salesStaffDiscountAboveThresholdWaitsForApproval() throws Exception {
        createSalesOrderWaitingDiscountApproval();
    }

    @Test
    void waitingDiscountApprovalBlocksConfirmPaymentDeliverAndInvoiceDirectApis() throws Exception {
        long orderId = createSalesOrderWaitingDiscountApproval();

        mockMvc.perform(patch("/api/sales/orders/{id}/confirm", orderId)
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "reservationUntil", OffsetDateTime.now().plusHours(2).toString(),
                                "reason", "Direct confirm should be blocked"
                        ))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/sales/orders/{id}/payments", orderId)
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "paymentMethod", "CASH",
                                "amount", new BigDecimal("100.00"),
                                "paymentDate", LocalDate.now().toString()
                        ))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(patch("/api/sales/orders/{id}/deliver", orderId)
                        .with(salesUser()))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/sales/orders/{id}/invoice", orderId)
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "ISSUED"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void orderCreatorCannotApproveOwnDiscount() throws Exception {
        long orderId = createSalesOrderWaitingDiscountApproval();

        mockMvc.perform(patch("/api/sales/orders/{id}/approve-discount", orderId)
                        .with(salesSelfApprover())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("note", "Self approval should be blocked"))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(patch("/api/sales/orders/{id}/approve-discount", orderId)
                        .with(discountApprover())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("note", "Approved for test"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.discountApprovalStatus").value("APPROVED"));
    }

    private long createSalesOrderWaitingDiscountApproval() throws Exception {
        MvcResult orderResult = mockMvc.perform(post("/api/sales/orders")
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "branchId", 1,
                                "customerId", 1,
                                "employeeId", 102,
                                "orderDate", LocalDate.now().toString(),
                                "discountAmount", new BigDecimal("1000000.00"),
                                "confirm", true,
                                "issueInvoice", false,
                                "items", List.of(Map.of(
                                        "productId", 31,
                                        "quantity", 1
                                ))
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("WAITING_DISCOUNT_APPROVAL"))
                .andExpect(jsonPath("$.discountApprovalStatus").value("PENDING"))
                .andExpect(jsonPath("$.paidAmount").value(0))
                .andExpect(jsonPath("$.stockIssued").value(false))
                .andReturn();

        JsonNode order = objectMapper.readTree(orderResult.getResponse().getContentAsString());
        return order.get("id").asLong();
    }

    private void assertSerialStatus(long serialId, SerialStatus expected) {
        org.assertj.core.api.Assertions.assertThat(serialRepository.findById(serialId).orElseThrow().getStatus())
                .isEqualTo(expected);
    }

    private RequestPostProcessor salesUser() {
        return user("sales1").authorities(
                List.of(
                        new SimpleGrantedAuthority("ROLE_USER"),
                        new SimpleGrantedAuthority("SALES_VIEW"),
                        new SimpleGrantedAuthority("SALES_CREATE"),
                        new SimpleGrantedAuthority("SALES_UPDATE"),
                        new SimpleGrantedAuthority("SALES_CANCEL"),
                        new SimpleGrantedAuthority("SALES_RETURN"),
                        new SimpleGrantedAuthority("INVOICE_ISSUE"),
                        new SimpleGrantedAuthority("PRODUCT_VIEW"),
                        new SimpleGrantedAuthority("CUSTOMER_VIEW")
                )
        );
    }

    private RequestPostProcessor salesSelfApprover() {
        return user("sales1").authorities(
                List.of(
                        new SimpleGrantedAuthority("ROLE_USER"),
                        new SimpleGrantedAuthority("SALES_VIEW"),
                        new SimpleGrantedAuthority("SALES_UPDATE"),
                        new SimpleGrantedAuthority("SALES_DISCOUNT_APPROVE"),
                        new SimpleGrantedAuthority("PRODUCT_VIEW"),
                        new SimpleGrantedAuthority("CUSTOMER_VIEW")
                )
        );
    }

    private RequestPostProcessor discountApprover() {
        return user("manager1").authorities(
                List.of(
                        new SimpleGrantedAuthority("ROLE_USER"),
                        new SimpleGrantedAuthority("SALES_VIEW"),
                        new SimpleGrantedAuthority("SALES_UPDATE"),
                        new SimpleGrantedAuthority("SALES_DISCOUNT_APPROVE"),
                        new SimpleGrantedAuthority("PRODUCT_VIEW"),
                        new SimpleGrantedAuthority("CUSTOMER_VIEW")
                )
        );
    }
}
