package com.chuanphat.warranty.security;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@SpringBootTest
@AutoConfigureMockMvc
class SalesDataScopeIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Test
    void forgedEmployeeIdOnOrderCreationReturnsForbidden() throws Exception {
        mockMvc.perform(post("/api/sales/orders")
                        .with(salesUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "branchId", 1,
                                "customerId", 1,
                                "employeeId", 101,
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
                                "employeeId", 101,
                                "quotationDate", LocalDate.now().toString(),
                                "validUntil", LocalDate.now().plusDays(7).toString(),
                                "discountAmount", BigDecimal.ZERO,
                                "items", List.of(Map.of("productId", 1, "quantity", 1))
                        ))))
                .andExpect(status().isForbidden());
    }

    @Test
    void forgedEmployeeDashboardFilterReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                        .with(salesUser())
                        .param("branchId", "1")
                        .param("employeeId", "101"))
                .andExpect(status().isForbidden());
    }

    @Test
    void salesOrderListIsAlwaysScopedToAuthenticatedSalesUser() throws Exception {
        salesOrderRepository.save(order(102L));
        salesOrderRepository.save(order(101L));

        mockMvc.perform(get("/api/sales/orders")
                        .with(salesUser())
                        .param("branchId", "1")
                        .param("pageSize", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isNotEmpty())
                .andExpect(jsonPath("$.items[*].employeeId", everyItem(is(102))));
    }

    @Test
    void salesUserCannotReadAnotherEmployeesOrderInSameBranch() throws Exception {
        SalesOrder otherEmployeesOrder = salesOrderRepository.save(order(101L));

        mockMvc.perform(get("/api/sales/orders/{id}", otherEmployeesOrder.getId())
                        .with(salesUser()))
                .andExpect(status().isForbidden());
    }

    private SalesOrder order(Long employeeId) {
        SalesOrder order = new SalesOrder();
        order.setOrderNo("SCOPE-" + employeeId + "-" + System.nanoTime());
        order.setBranchId(1L);
        order.setCustomerId(1L);
        order.setEmployeeId(employeeId);
        order.setVoucherCode("");
        order.setSubtotal(BigDecimal.TEN);
        order.setTotalAmount(BigDecimal.TEN);
        return order;
    }

    private RequestPostProcessor salesUser() {
        return user("sales1").authorities(List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("SALES_VIEW"),
                new SimpleGrantedAuthority("SALES_CREATE"),
                new SimpleGrantedAuthority("DASHBOARD_VIEW"),
                new SimpleGrantedAuthority("CUSTOMER_VIEW"),
                new SimpleGrantedAuthority("PRODUCT_VIEW")
        ));
    }
}
