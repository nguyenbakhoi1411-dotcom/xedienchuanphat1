package com.chuanphat.warranty.core.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
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
class ProductControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    void listsProductsWithAllowListedSortAndRejectsUnsupportedSort() throws Exception {
        String suffix = Long.toString(System.nanoTime());
        createProduct("CP-SORT-A-" + suffix, "CP Sort Test " + suffix + " A", "10000000.00");
        createProduct("CP-SORT-B-" + suffix, "CP Sort Test " + suffix + " B", "20000000.00");

        mockMvc.perform(get("/api/products")
                        .with(productUser())
                        .param("keyword", "CP Sort Test " + suffix)
                        .param("page", "0")
                        .param("pageSize", "2")
                        .param("sort", "salePrice,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].productCode").value("CP-SORT-B-" + suffix))
                .andExpect(jsonPath("$.items[1].productCode").value("CP-SORT-A-" + suffix));

        mockMvc.perform(get("/api/products")
                        .with(productUser())
                        .param("sort", "password,asc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unsupported sort field: password"));
    }

    @Test
    void auditsProductLifecycleChanges() throws Exception {
        String suffix = Long.toString(System.nanoTime());
        MvcResult createResult = createProduct("CP-AUDIT-" + suffix, "CP Audit Test " + suffix, "15000000.00");
        long productId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(delete("/api/products/{id}", productId)
                        .with(productUser()))
                .andExpect(status().isOk());

        assertThat(auditLogRepository.findAll()).anySatisfy(log -> {
            assertThat(log.getAction()).isEqualTo(AuditAction.CREATE_PRODUCT);
            assertThat(log.getEntityType()).isEqualTo("Product");
            assertThat(log.getEntityId()).isEqualTo(Long.toString(productId));
        });
        assertThat(auditLogRepository.findAll()).anySatisfy(log -> {
            assertThat(log.getAction()).isEqualTo(AuditAction.DELETE_PRODUCT);
            assertThat(log.getEntityType()).isEqualTo("Product");
            assertThat(log.getEntityId()).isEqualTo(Long.toString(productId));
        });
    }

    private MvcResult createProduct(String productCode, String productName, String salePrice) throws Exception {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("productCode", productCode);
        payload.put("productName", productName);
        payload.put("category", "ELECTRIC_MOTORBIKE");
        payload.put("brand", "Chuan Phat");
        payload.put("model", "Test");
        payload.put("color", "White");
        payload.put("batteryCapacity", "72V");
        payload.put("motorPower", "1200W");
        payload.put("importPrice", new BigDecimal("9000000.00"));
        payload.put("salePrice", new BigDecimal(salePrice));
        payload.put("warrantyMonths", 24);

        return mockMvc.perform(post("/api/products")
                        .with(productUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andReturn();
    }

    private RequestPostProcessor productUser() {
        return user("product-admin").authorities(List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("PRODUCT_VIEW"),
                new SimpleGrantedAuthority("PRODUCT_CREATE"),
                new SimpleGrantedAuthority("PRODUCT_DELETE")
        ));
    }
}
