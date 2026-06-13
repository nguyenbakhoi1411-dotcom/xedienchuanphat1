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
    public PageResponse<ProductDto> list(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String sort
    ) {
        return service.list(keyword, category, page, pageSize, sort);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PRODUCT_CREATE')")
    @Audited(action = AuditAction.CREATE_PRODUCT, module = AuditModule.PRODUCT, entityType = "Product")
    public ProductDto create(@Valid @RequestBody ProductDto request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    @Audited(action = AuditAction.UPDATE_PRODUCT, module = AuditModule.PRODUCT, entityType = "Product", entityIdParam = "id")
    public ProductDto update(@PathVariable Long id, @Valid @RequestBody ProductDto request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_DELETE')")
    @Audited(action = AuditAction.DELETE_PRODUCT, module = AuditModule.PRODUCT, entityType = "Product", entityIdParam = "id")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PostMapping("/serials")
    @PreAuthorize("hasAuthority('INVENTORY_IMPORT')")
    @Audited(action = AuditAction.CREATE_PRODUCT, module = AuditModule.PRODUCT, entityType = "ProductSerial")
    public ProductSerialDto createSerial(@Valid @RequestBody ProductSerialDto request) {
        return service.createSerial(request);
    }

    @GetMapping("/serials")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public PageResponse<ProductSerialDto> listSerials(
            @RequestParam Long branchId,
            @RequestParam(defaultValue = "IN_STOCK") com.chuanphat.warranty.core.enums.SerialStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int pageSize,
            @RequestParam(required = false) String sort
    ) {
        return service.listSerials(branchId, status, page, pageSize, sort);
    }

    @GetMapping("/serials/{id}/history")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public java.util.List<com.chuanphat.warranty.core.dto.ProductSerialHistoryDto> getSerialHistory(@PathVariable Long id) {
        return service.getSerialHistory(id);
    }

    @GetMapping("/{id}/price-history")
    @PreAuthorize("hasAuthority('VIEW_PRICE_HISTORY')")
    public java.util.List<PricingDtos.ProductPriceHistoryResponse> priceHistory(@PathVariable Long id) {
        return service.priceHistory(id);
    }
}
