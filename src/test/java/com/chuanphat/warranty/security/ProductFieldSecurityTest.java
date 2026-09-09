package com.chuanphat.warranty.security;

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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ProductFieldSecurityTest extends PostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    private Long productId;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();

        Product product = new Product();
        product.setProductCode("AAA-SECURITY-FIELD");
        product.setProductName("Security Field Test Product");
        product.setCategory(ProductCategory.SPARE_PART);
        product.setBrand("Test");
        product.setImportPrice(BigDecimal.valueOf(12345));
        product.setSalePrice(BigDecimal.valueOf(15000));
        product.setWarrantyMonths(0);
        product.setInventoryStockQuantity(BigDecimal.TEN);
        product.setInventoryStockValue(BigDecimal.valueOf(123450));
        productId = productRepository.saveAndFlush(product).getId();
    }

    @Test
    @WithMockUser(roles = "SALES_STAFF")
    public void testSalesUser_CannotSeeAverageCost_InListProducts() throws Exception {
        mockMvc.perform(get("/api/inventory/v2/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].averageCost").doesNotExist())
                .andExpect(jsonPath("$.items[0].stockValue").doesNotExist());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testAdminUser_CanSeeAverageCost_InListProducts() throws Exception {
        mockMvc.perform(get("/api/inventory/v2/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].averageCost").exists())
                .andExpect(jsonPath("$.items[0].stockValue").exists());
    }

    @Test
    @WithMockUser(roles = "SALES_STAFF")
    public void testSalesUser_CannotSeeAverageCost_InGetProductById() throws Exception {
        mockMvc.perform(get("/api/inventory/v2/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageCost").doesNotExist())
                .andExpect(jsonPath("$.stockValue").doesNotExist());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testAdminUser_CanSeeAverageCost_InGetProductById() throws Exception {
        mockMvc.perform(get("/api/inventory/v2/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageCost").exists())
                .andExpect(jsonPath("$.stockValue").exists());
    }
}
