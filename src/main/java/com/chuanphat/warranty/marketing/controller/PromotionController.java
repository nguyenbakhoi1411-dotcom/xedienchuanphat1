package com.chuanphat.warranty.marketing.controller;

import com.chuanphat.warranty.marketing.dto.PromotionCalculateRequest;
import com.chuanphat.warranty.marketing.dto.PromotionCalculateResponse;
import com.chuanphat.warranty.marketing.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/marketing/promotions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN')")
public class PromotionController {

    private final PromotionService service;

    @PostMapping("/calculate")
    public ResponseEntity<PromotionCalculateResponse> calculate(@RequestBody PromotionCalculateRequest request) {
        return ResponseEntity.ok(service.calculate(request));
    }
}


