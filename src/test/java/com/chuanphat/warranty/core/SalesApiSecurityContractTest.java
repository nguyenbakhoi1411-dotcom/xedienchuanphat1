package com.chuanphat.warranty.core;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.controller.SalesController;
import com.chuanphat.warranty.core.service.SalesService;
import java.lang.reflect.Method;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class SalesApiSecurityContractTest {
    @Test
    void listOrdersApiReturnsPaginatedShape() throws Exception {
        SalesService service = org.mockito.Mockito.mock(SalesService.class);
        when(service.list(1L, 0, 20)).thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0));

        MockMvcBuilders.standaloneSetup(new SalesController(service)).build()
                .perform(get("/api/sales/orders").param("branchId", "1").param("page", "0").param("pageSize", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.pageSize").value(20));
    }

    @Test
    void sensitiveSalesEndpointsRequirePermissions() {
        for (String methodName : List.of("createOrder", "approveDiscount", "createReturn", "createInvoice", "salesOrderPdf")) {
            Method method = findMethod(SalesController.class, methodName);
            PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);
            assertThat(preAuthorize).as(methodName).isNotNull();
            assertThat(preAuthorize.value()).as(methodName).isNotBlank();
        }
    }

    private Method findMethod(Class<?> type, String name) {
        return java.util.Arrays.stream(type.getDeclaredMethods())
                .filter(method -> method.getName().equals(name))
                .findFirst()
                .orElseThrow();
    }
}
