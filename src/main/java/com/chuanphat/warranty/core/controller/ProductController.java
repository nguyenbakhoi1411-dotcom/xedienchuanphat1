package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.audit.annotation.Audited;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.ProductDto;
import com.chuanphat.warranty.core.dto.ProductSerialDto;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.service.ProductService;
import com.chuanphat.warranty.pricing.dto.PricingDtos;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ResponseEntity<PageResponse<ProductDto>> list(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String sort
    ) {
        return ResponseEntity.ok(service.list(keyword, category, page, pageSize, sort));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PRODUCT_CREATE')")
    @Audited(action = AuditAction.CREATE_PRODUCT, module = AuditModule.PRODUCT, entityType = "Product")
    public ResponseEntity<ProductDto> create(@Valid @RequestBody ProductDto request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    @Audited(action = AuditAction.UPDATE_PRODUCT, module = AuditModule.PRODUCT, entityType = "Product", entityIdParam = "id")
    public ResponseEntity<ProductDto> update(@PathVariable Long id, @Valid @RequestBody ProductDto request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_DELETE')")
    @Audited(action = AuditAction.DELETE_PRODUCT, module = AuditModule.PRODUCT, entityType = "Product", entityIdParam = "id")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/serials")
    @PreAuthorize("hasAuthority('INVENTORY_IMPORT')")
    @Audited(action = AuditAction.CREATE_PRODUCT, module = AuditModule.PRODUCT, entityType = "ProductSerial")
    public ResponseEntity<ProductSerialDto> createSerial(@Valid @RequestBody ProductSerialDto request) {
        return ResponseEntity.ok(service.createSerial(request));
    }

    @GetMapping("/serials")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ResponseEntity<PageResponse<ProductSerialDto>> listSerials(
            @RequestParam Long branchId,
            @RequestParam(defaultValue = "IN_STOCK") com.chuanphat.warranty.core.enums.SerialStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int pageSize,
            @RequestParam(required = false) String sort
    ) {
        return ResponseEntity.ok(service.listSerials(branchId, status, page, pageSize, sort));
    }

    @GetMapping("/serials/{id}/history")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ResponseEntity<java.util.List<com.chuanphat.warranty.core.dto.ProductSerialHistoryDto>> getSerialHistory(@PathVariable Long id) {
        return ResponseEntity.ok(service.getSerialHistory(id));
    }

    @GetMapping("/{id}/price-history")
    @PreAuthorize("hasAuthority('VIEW_PRICE_HISTORY')")
    public ResponseEntity<java.util.List<PricingDtos.ProductPriceHistoryResponse>> priceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(service.priceHistory(id));
    }
}

