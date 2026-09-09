package com.chuanphat.warranty.security;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.chuanphat.warranty.PostgresIntegrationTest;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.repository.ProductRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class ProductFieldSecurityTest extends PostgresIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    private Long productId;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();

        Product product = new Product();
        product.setProductCode("SEC-PROD-001");
        product.setProductName("Security Product");
        product.setCategory(ProductCategory.SPARE_PART);
        product.setBrand("ChuanPhat");
        product.setImportPrice(BigDecimal.valueOf(12345));
        product.setSalePrice(BigDecimal.valueOf(15000));
        product.setWarrantyMonths(0);
        productId = productRepository.save(product).getId();
    }

    @Test
    void salesStaffCannotSeeCostFieldsInProductList() throws Exception {
        mockMvc.perform(get("/api/inventory/v2/products")
                        .param("page", "0")
                        .param("size", "10")
                        .with(user("sales").authorities(new SimpleGrantedAuthority("ROLE_SALES_STAFF"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].averageCost").doesNotExist())
                .andExpect(jsonPath("$.items[0].stockValue").doesNotExist());
    }

    @Test
    void adminCanSeeCostFieldsInProductList() throws Exception {
        mockMvc.perform(get("/api/inventory/v2/products")
                        .param("page", "0")
                        .param("size", "10")
                        .with(user("admin").authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].averageCost").exists())
                .andExpect(jsonPath("$.items[0].stockValue").exists());
    }

    @Test
    void salesStaffCannotSeeCostFieldsInProductDetail() throws Exception {
        mockMvc.perform(get("/api/inventory/v2/products/{id}", productId)
                        .with(user("sales").authorities(new SimpleGrantedAuthority("ROLE_SALES_STAFF"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageCost").doesNotExist())
                .andExpect(jsonPath("$.stockValue").doesNotExist());
    }

    @Test
    void adminCanSeeCostFieldsInProductDetail() throws Exception {
        mockMvc.perform(get("/api/inventory/v2/products/{id}", productId)
                        .with(user("admin").authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageCost").exists())
                .andExpect(jsonPath("$.stockValue").exists());
    }
}
