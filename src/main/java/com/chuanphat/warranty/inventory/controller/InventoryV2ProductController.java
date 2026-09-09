package com.chuanphat.warranty.inventory.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory/v2/products")
@PreAuthorize("hasAnyRole('ADMIN', 'CHIEF_ACCOUNTANT', 'INVENTORY_MANAGER', 'SALES_STAFF')")
public class InventoryV2ProductController {
    private final ProductRepository productRepository;

    public InventoryV2ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public PageResponse<Map<String, Object>> listProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "") String keyword,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("productCode").ascending());
        Page<Product> products = productRepository.findByStatusNotAndProductNameContainingIgnoreCase(
                RecordStatus.INACTIVE,
                keyword == null ? "" : keyword,
                pageable
        );
        boolean includeCostFields = canViewCost(authentication);
        List<Map<String, Object>> items = products.getContent().stream()
                .map(product -> productPayload(product, includeCostFields))
                .toList();
        return new PageResponse<>(items, page, size, products.getTotalElements(), products.getTotalPages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProduct(@PathVariable Long id, Authentication authentication) {
        return productRepository.findById(id)
                .map(product -> ResponseEntity.ok(productPayload(product, canViewCost(authentication))))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private Map<String, Object> productPayload(Product product, boolean includeCostFields) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", product.getId());
        payload.put("productCode", product.getProductCode());
        payload.put("productName", product.getProductName());
        payload.put("category", product.getCategory());
        payload.put("brand", product.getBrand());
        payload.put("model", product.getModel());
        payload.put("salePrice", product.getSalePrice());
        payload.put("warrantyMonths", product.getWarrantyMonths());
        payload.put("status", product.getStatus());

        if (includeCostFields) {
            BigDecimal cost = product.getImportPrice() == null ? BigDecimal.ZERO : product.getImportPrice();
            payload.put("averageCost", cost);
            payload.put("stockValue", cost);
        }

        return payload;
    }

    private boolean canViewCost(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_CHIEF_ACCOUNTANT"));
    }
}
