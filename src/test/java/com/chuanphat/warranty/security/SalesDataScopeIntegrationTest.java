package com.chuanphat.warranty.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.SalesOrderItem;
import com.chuanphat.warranty.core.entity.SalesPayment;
import com.chuanphat.warranty.core.entity.SalesReturn;
import com.chuanphat.warranty.core.entity.SalesReturnItem;
import com.chuanphat.warranty.core.enums.PaymentStatus;
import com.chuanphat.warranty.core.enums.ReturnSerialDisposition;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import com.chuanphat.warranty.core.enums.SalesReturnReasonCode;
import com.chuanphat.warranty.core.enums.SalesReturnStatus;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.SalesOrderItemRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.SalesPaymentRepository;
import com.chuanphat.warranty.core.repository.SalesReturnRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
class SalesDataScopeIntegrationTest {
    private static final Long SALES_USER_ID = 102L;
    private static final Long COWORKER_ID = 101L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Autowired
    private SalesOrderItemRepository salesOrderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SalesPaymentRepository salesPaymentRepository;

    @Autowired
    private SalesReturnRepository salesReturnRepository;

    @Test
    void salesStaffDashboardOnlyShowsOwnRevenue() throws Exception {
        createOrder(SALES_USER_ID, new BigDecimal("135791"));
        createOrder(COWORKER_ID, new BigDecimal("246802"));

        MvcResult result = mockMvc.perform(get("/api/dashboard")
                        .with(salesUser())
                        .param("branchId", "1")
                        .param("timeRange", "TODAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.topEmployees[*].employeeId", everyItem(is(102))))
                .andReturn();

        JsonNode currentMonth = findByText(
                objectMapper.readTree(result.getResponse().getContentAsString()).get("revenueByMonth"),
                "month",
                YearMonth.now().toString()
        );
        assertThat(currentMonth.get("revenue").decimalValue())
                .isEqualByComparingTo(expectedRevenue(SALES_USER_ID, LocalDate.now().withDayOfMonth(1), LocalDate.now()));
    }

    @Test
    void forgedEmployeeIdCannotExposeCoworkerRevenue() throws Exception {
        createOrder(SALES_USER_ID, new BigDecimal("357913"));
        createOrder(COWORKER_ID, new BigDecimal("468024"));

        mockMvc.perform(get("/api/dashboard")
                        .with(salesUser())
                        .param("branchId", "1")
                        .param("employeeId", COWORKER_ID.toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    void forgedEmployeeIdCannotBypassReportScope() throws Exception {
        mockMvc.perform(get("/api/reports/revenue-time")
                        .with(salesUser())
                        .param("branchId", "1")
                        .param("employeeId", COWORKER_ID.toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    void dashboardSummaryCannotBypassEmployeeScope() throws Exception {
        createOrder(SALES_USER_ID, new BigDecimal("579135"));
        createOrder(COWORKER_ID, new BigDecimal("680246"));

        mockMvc.perform(get("/api/dashboard/summary")
                        .with(salesUser())
                        .param("branchId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.topEmployees").isNotEmpty())
                .andExpect(jsonPath("$.topEmployees[*].employeeId", everyItem(is(102))));
    }

    @Test
    void aiRevenueInsightOnlyUsesAuthenticatedEmployee() throws Exception {
        createOrder(SALES_USER_ID, new BigDecimal("791357"));
        createOrder(COWORKER_ID, new BigDecimal("802468"));

        mockMvc.perform(post("/api/ai-assistant/ask")
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "question", "Doanh thu hom nay",
                                "branchId", 1
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intent").value("REVENUE_TODAY"))
                .andExpect(jsonPath("$.metrics[0].value")
                        .value(expectedRevenue(SALES_USER_ID, LocalDate.now(), LocalDate.now()).doubleValue()));
    }

    @Test
    void privilegedUserCanFilterRevenueByEmployee() throws Exception {
        createOrder(SALES_USER_ID, new BigDecimal("913579"));
        createOrder(COWORKER_ID, new BigDecimal("1024680"));

        mockMvc.perform(get("/api/dashboard")
                        .with(adminUser())
                        .param("branchId", "1")
                        .param("employeeId", COWORKER_ID.toString())
                        .param("timeRange", "TODAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.topEmployees").isNotEmpty())
                .andExpect(jsonPath("$.topEmployees[*].employeeId", everyItem(is(101))));
    }

    @Test
    void revenueByBranchStillRespectsEmployeeScopeForSalesStaff() throws Exception {
        createOrder(SALES_USER_ID, new BigDecimal("1135791"));
        createOrder(COWORKER_ID, new BigDecimal("1246802"));

        MvcResult result = mockMvc.perform(get("/api/dashboard/revenue-by-branch")
                        .with(salesUser())
                        .param("branchId", "1"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode branch = objectMapper.readTree(result.getResponse().getContentAsString()).get(0);
        assertThat(branch.get("revenue").decimalValue())
                .isEqualByComparingTo(expectedRevenue(SALES_USER_ID, LocalDate.now().withDayOfMonth(1), LocalDate.now()));
    }

    @Test
    void topProductsEndpointRespectsEmployeeScopeIfApplicable() throws Exception {
        Product product = productRepository.findById(1L).orElseThrow();
        createOrderWithItem(SALES_USER_ID, product, 1, new BigDecimal("1357913"));
        createOrderWithItem(COWORKER_ID, product, 100, new BigDecimal("2468024"));

        MvcResult result = mockMvc.perform(get("/api/dashboard/top-products")
                        .with(salesUser())
                        .param("branchId", "1"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode productRow = findByLong(
                objectMapper.readTree(result.getResponse().getContentAsString()),
                "productId",
                product.getId()
        );
        BigDecimal expected = jdbcTemplate.queryForObject("""
                select coalesce(sum(soi.line_total), 0)
                from sales_order_items soi
                join sales_orders so on so.id = soi.order_id
                where so.employee_id = ? and soi.product_id = ?
                  and so.order_date >= ? and so.order_date <= ? and so.status <> 'CANCELLED'
                """, BigDecimal.class, SALES_USER_ID, product.getId(),
                LocalDate.now().withDayOfMonth(1), LocalDate.now());
        assertThat(productRow.get("revenue").decimalValue()).isEqualByComparingTo(expected);
    }

    @Test
    void forgedEmployeeIdOnOrderCreationReturnsForbidden() throws Exception {
        mockMvc.perform(post("/api/sales/orders")
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "branchId", 1,
                                "customerId", 1,
                                "employeeId", COWORKER_ID,
                                "orderDate", LocalDate.now().toString(),
                                "discountAmount", BigDecimal.ZERO,
                                "confirm", false,
                                "issueInvoice", false,
                                "items", List.of(Map.of("productId", 1, "quantity", 1))
                        ))))
                .andExpect(status().isForbidden());
    }

    @Test
    void forgedEmployeeIdOnQuotationCreationReturnsForbidden() throws Exception {
        mockMvc.perform(post("/api/sales/quotations")
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "branchId", 1,
                                "customerId", 1,
                                "employeeId", COWORKER_ID,
                                "quotationDate", LocalDate.now().toString(),
                                "validUntil", LocalDate.now().plusDays(7).toString(),
                                "discountAmount", BigDecimal.ZERO,
                                "items", List.of(Map.of("productId", 1, "quantity", 1))
                        ))))
                .andExpect(status().isForbidden());
    }

    @Test
    void salesOrderListIsAlwaysScopedToAuthenticatedSalesUser() throws Exception {
        createOrder(SALES_USER_ID, BigDecimal.TEN);
        createOrder(COWORKER_ID, BigDecimal.TEN);

        mockMvc.perform(get("/api/sales/orders")
                        .with(salesUser())
                        .param("branchId", "1")
                        .param("pageSize", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isNotEmpty())
                .andExpect(jsonPath("$.items[*].employeeId", everyItem(is(102))));
    }

    @Test
    void salesStaffCannotViewOrApproveAnotherStaffOrderEvenByDirectId() throws Exception {
        SalesOrder otherEmployeesOrder = createOrder(106L, BigDecimal.TEN);
        otherEmployeesOrder.setStatus(SalesOrderStatus.WAITING_DISCOUNT_APPROVAL);
        salesOrderRepository.save(otherEmployeesOrder);

        mockMvc.perform(get("/api/sales/orders/{id}", otherEmployeesOrder.getId())
                        .with(salesUser()))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/sales/orders/{id}/approve-discount", otherEmployeesOrder.getId())
                        .with(salesUserWithApprovalPermissions())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("note", "Forged discount approval"))))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/sales/orders/{id}/approve-credit", otherEmployeesOrder.getId())
                        .with(salesUserWithApprovalPermissions())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("note", "Forged credit approval"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void managerCanApproveSalesReturnCreatedByAnotherSalesStaff() throws Exception {
        Product product = productRepository.findById(31L).orElseThrow();
        SalesOrder originalOrder = createDeliveredOrderWithItem(SALES_USER_ID, product);
        SalesReturn salesReturn = createRequestedReturn(originalOrder, "sales1");

        mockMvc.perform(patch("/api/sales/returns/{id}/approve", salesReturn.getId())
                        .with(managerUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "disposition", "REFUND_TO_INVENTORY",
                                "note", "Manager approved subordinate return"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(originalOrder.getId()))
                .andExpect(jsonPath("$.status").value("REFUNDED"))
                .andExpect(jsonPath("$.disposition").value("REFUND_TO_INVENTORY"));
    }

    @Test
    void managerCanExchangeSubordinateOrderWithoutEmployeeScopeBlocking() throws Exception {
        Product product = productRepository.findById(31L).orElseThrow();
        SalesOrder originalOrder = createDeliveredOrderWithItem(SALES_USER_ID, product);
        createPayment(originalOrder);
        SalesOrderItem originalItem = originalOrder.getItems().get(0);

        MvcResult exchangeResult = mockMvc.perform(post("/api/sales/exchanges")
                        .with(managerUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "originalSalesOrderId", originalOrder.getId(),
                                "returnRequest", Map.of(
                                        "orderId", originalOrder.getId(),
                                        "refundAmount", BigDecimal.ZERO,
                                        "refundMethod", "CASH",
                                        "reasonCode", "WRONG_ITEM",
                                        "reasonNote", "Manager exchanges subordinate order",
                                        "items", List.of(Map.of(
                                                "orderItemId", originalItem.getId(),
                                                "quantity", 1,
                                                "serialDisposition", "RETURNED"
                                        ))
                                ),
                                "newOrderRequest", Map.of(
                                        "branchId", 1,
                                        "customerId", 1,
                                        "employeeId", COWORKER_ID,
                                        "orderDate", LocalDate.now().toString(),
                                        "discountAmount", BigDecimal.ZERO,
                                        "confirm", false,
                                        "issueInvoice", false,
                                        "items", List.of(Map.of("productId", product.getId(), "quantity", 1))
                                )
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exchangeGroupId").isNotEmpty())
                .andExpect(jsonPath("$.salesReturn.orderId").value(originalOrder.getId()))
                .andExpect(jsonPath("$.newOrder.employeeId").value(COWORKER_ID))
                .andReturn();

        JsonNode exchange = objectMapper.readTree(exchangeResult.getResponse().getContentAsString());
        long returnId = exchange.get("salesReturn").get("id").asLong();

        mockMvc.perform(patch("/api/sales/returns/{id}/approve", returnId)
                        .with(returnReviewer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "disposition", "REFUND_TO_INVENTORY",
                                "note", "Independent reviewer approved cross-employee exchange return"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(originalOrder.getId()))
                .andExpect(jsonPath("$.status").value("REFUNDED"));
    }

    private SalesOrder createOrder(Long employeeId, BigDecimal totalAmount) {
        SalesOrder order = new SalesOrder();
        order.setOrderNo("SCOPE-" + employeeId + "-" + System.nanoTime());
        order.setBranchId(1L);
        order.setCustomerId(1L);
        order.setEmployeeId(employeeId);
        order.setOrderDate(LocalDate.now());
        order.setVoucherCode("");
        order.setSubtotal(totalAmount);
        order.setTotalAmount(totalAmount);
        return salesOrderRepository.save(order);
    }

    private void createOrderWithItem(Long employeeId, Product product, int quantity, BigDecimal lineTotal) {
        SalesOrder order = createOrder(employeeId, lineTotal);
        SalesOrderItem item = new SalesOrderItem();
        item.setOrder(order);
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setUnitPrice(lineTotal.divide(BigDecimal.valueOf(quantity)));
        item.setListPrice(item.getUnitPrice());
        item.setLineTotal(lineTotal);
        salesOrderItemRepository.save(item);
    }

    private SalesOrder createDeliveredOrderWithItem(Long employeeId, Product product) {
        SalesOrder order = createOrder(employeeId, product.getSalePrice());
        order.setStatus(SalesOrderStatus.DELIVERED);
        order.setStockIssued(true);
        order.setPaidAmount(product.getSalePrice());
        order.setPaymentStatus(PaymentStatus.PAID);

        SalesOrderItem item = new SalesOrderItem();
        item.setProduct(product);
        item.setQuantity(1);
        item.setUnitPrice(product.getSalePrice());
        item.setListPrice(product.getSalePrice());
        item.setLineTotal(product.getSalePrice());
        order.addItem(item);
        return salesOrderRepository.save(order);
    }

    private SalesReturn createRequestedReturn(SalesOrder order, String createdBy) {
        createPayment(order);

        SalesOrderItem orderItem = order.getItems().get(0);
        SalesReturn salesReturn = new SalesReturn();
        salesReturn.setReturnNo("SCOPE-RETURN-" + System.nanoTime());
        salesReturn.setOrder(order);
        salesReturn.setBranchId(order.getBranchId());
        salesReturn.setCustomerId(order.getCustomerId());
        salesReturn.setReturnDate(LocalDate.now());
        salesReturn.setReturnAmount(orderItem.getLineTotal());
        salesReturn.setRefundAmount(BigDecimal.ZERO);
        salesReturn.setReasonCode(SalesReturnReasonCode.WRONG_ITEM);
        salesReturn.setReasonNote("Return created by subordinate sales staff");
        salesReturn.setStatus(SalesReturnStatus.REQUESTED);
        salesReturn.setCreatedBy(createdBy);

        SalesReturnItem returnItem = new SalesReturnItem();
        returnItem.setOrderItem(orderItem);
        returnItem.setProduct(orderItem.getProduct());
        returnItem.setQuantity(1);
        returnItem.setUnitPrice(orderItem.getUnitPrice());
        returnItem.setLineAmount(orderItem.getUnitPrice());
        returnItem.setSerialDisposition(ReturnSerialDisposition.RETURNED);
        salesReturn.addItem(returnItem);
        return salesReturnRepository.save(salesReturn);
    }

    private void createPayment(SalesOrder order) {
        SalesPayment payment = new SalesPayment();
        payment.setOrder(order);
        payment.setPaymentMethod(PaymentMethod.CASH);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentDate(LocalDate.now());
        payment.setReferenceNo("SCOPE-PAY-" + System.nanoTime());
        salesPaymentRepository.save(payment);
    }

    private BigDecimal expectedRevenue(Long employeeId, LocalDate from, LocalDate to) {
        return jdbcTemplate.queryForObject("""
                select coalesce(sum(total_amount), 0)
                from sales_orders
                where employee_id = ? and branch_id = 1
                  and order_date >= ? and order_date <= ? and status <> 'CANCELLED'
                """, BigDecimal.class, employeeId, from, to);
    }

    private JsonNode findByText(JsonNode rows, String field, String expected) {
        for (JsonNode row : rows) {
            if (expected.equals(row.path(field).asText())) {
                return row;
            }
        }
        throw new AssertionError("No row found with " + field + "=" + expected);
    }

    private JsonNode findByLong(JsonNode rows, String field, Long expected) {
        for (JsonNode row : rows) {
            if (expected.equals(row.path(field).asLong())) {
                return row;
            }
        }
        throw new AssertionError("No row found with " + field + "=" + expected);
    }

    private RequestPostProcessor salesUser() {
        return user("sales1").authorities(List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("SALES_VIEW"),
                new SimpleGrantedAuthority("SALES_CREATE"),
                new SimpleGrantedAuthority("SALES_RETURN"),
                new SimpleGrantedAuthority("DASHBOARD_VIEW"),
                new SimpleGrantedAuthority("REPORT_VIEW"),
                new SimpleGrantedAuthority("AI_ASSISTANT_USE"),
                new SimpleGrantedAuthority("CUSTOMER_VIEW"),
                new SimpleGrantedAuthority("PRODUCT_VIEW")
        ));
    }

    private RequestPostProcessor salesUserWithApprovalPermissions() {
        return user("sales1").authorities(List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("SALES_VIEW"),
                new SimpleGrantedAuthority("SALES_DISCOUNT_APPROVE"),
                new SimpleGrantedAuthority("SALES_CREDIT_APPROVE")
        ));
    }

    private RequestPostProcessor adminUser() {
        return user("admin").authorities(List.of(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("DASHBOARD_VIEW")
        ));
    }

    private RequestPostProcessor managerUser() {
        return user("manager1").authorities(List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("SALES_VIEW"),
                new SimpleGrantedAuthority("SALES_CREATE"),
                new SimpleGrantedAuthority("SALES_RETURN"),
                new SimpleGrantedAuthority("SALES_RETURN_APPROVE"),
                new SimpleGrantedAuthority("CUSTOMER_VIEW"),
                new SimpleGrantedAuthority("PRODUCT_VIEW")
        ));
    }

    private RequestPostProcessor returnReviewer() {
        return user("admin").authorities(List.of(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("SALES_RETURN_APPROVE")
        ));
    }
}
