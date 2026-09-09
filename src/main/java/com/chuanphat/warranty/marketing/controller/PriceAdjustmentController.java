package com.chuanphat.warranty.marketing.controller;

import com.chuanphat.warranty.marketing.dto.CreatePriceAdjustmentRequest;
import com.chuanphat.warranty.marketing.dto.PriceAdjustmentPreviewDTO;
import com.chuanphat.warranty.marketing.entity.PriceAdjustment;
import com.chuanphat.warranty.marketing.service.PriceAdjustmentService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/marketing/price-adjustments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN')")
public class PriceAdjustmentController {

    private final PriceAdjustmentService service;

    @PostMapping
    public ResponseEntity<PriceAdjustment> createAdjustment(@RequestBody CreatePriceAdjustmentRequest req) throws JsonProcessingException {
        return ResponseEntity.ok(service.createAdjustment(req));
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<PriceAdjustmentPreviewDTO> previewAdjustment(@PathVariable Long id) {
        return ResponseEntity.ok(service.previewAdjustment(id));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<Void> applyAdjustment(@PathVariable Long id, @RequestHeader(value = "X-User", defaultValue = "system") String user) {
        service.applyAdjustment(id, user);
        return ResponseEntity.ok().build();
    }
}

