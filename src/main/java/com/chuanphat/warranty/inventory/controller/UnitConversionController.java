package com.chuanphat.warranty.inventory.controller;

import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.UnitConversion;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.UnitConversionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory/unit-conversions")
@PreAuthorize("hasAnyRole('ADMIN')")
public class UnitConversionController {
    
    private final UnitConversionRepository conversionRepository;
    private final ProductRepository productRepository;

    public UnitConversionController(UnitConversionRepository conversionRepository, ProductRepository productRepository) {
        this.conversionRepository = conversionRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<UnitConversion>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(conversionRepository.findByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<?> createConversion(@RequestBody Map<String, Object> payload) {
        try {
            Long productId = Long.valueOf(payload.get("productId").toString());
            Product p = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            UnitConversion uc = new UnitConversion();
            uc.setProduct(p);
            uc.setLargerUnit(payload.get("largerUnit").toString());
            uc.setBaseUnit(payload.get("baseUnit").toString());
            uc.setConversionRate(new BigDecimal(payload.get("conversionRate").toString()));

            return ResponseEntity.ok(conversionRepository.save(uc));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteConversion(@PathVariable Long id) {
        conversionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}

