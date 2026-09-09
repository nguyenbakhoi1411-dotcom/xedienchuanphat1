package com.chuanphat.warranty.marketing.controller;

import com.chuanphat.warranty.marketing.dto.PriceListDTO;
import com.chuanphat.warranty.marketing.dto.PriceListItemDTO;
import com.chuanphat.warranty.marketing.entity.PriceList;
import com.chuanphat.warranty.marketing.enums.PriceListStatus;
import com.chuanphat.warranty.marketing.service.PriceListService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/marketing/price-lists")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN')")
public class PriceListController {

    private final PriceListService priceListService;

    @GetMapping
    public ResponseEntity<Page<PriceList>> getAllPriceLists(
            @RequestParam(required = false) PriceListStatus trangThai,
            Pageable pageable) {
        return ResponseEntity.ok(priceListService.getAllPriceLists(trangThai, pageable));
    }

    @PostMapping
    public ResponseEntity<PriceList> createPriceList(@RequestBody PriceListDTO dto) {
        return ResponseEntity.ok(priceListService.createPriceList(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PriceList> getPriceList(@PathVariable Long id) {
        return ResponseEntity.ok(priceListService.getPriceList(id));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activatePriceList(@PathVariable Long id) {
        priceListService.activatePriceList(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/active-for-customer/{customerId}")
    public ResponseEntity<PriceList> getActiveForCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(priceListService.getActivePriceListForCustomer(customerId));
    }

    @GetMapping("/get-price")
    public ResponseEntity<PriceListItemDTO> getPrice(
            @RequestParam Long sanPhamId,
            @RequestParam Long customerId) {
        PriceListItemDTO price = priceListService.getPriceForProductAndCustomer(sanPhamId, customerId);
        if (price == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(price);
    }
}

