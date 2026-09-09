package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.core.dto.SalesVoucherDTO;
import com.chuanphat.warranty.core.service.SalesVoucherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController("coreSalesVoucherController")
@RequestMapping("/api/sales-vouchers")
@PreAuthorize("hasAnyRole('ADMIN')")
public class SalesVoucherController {

    private final SalesVoucherService salesVoucherService;

    public SalesVoucherController(@org.springframework.beans.factory.annotation.Qualifier("coreSalesVoucherService") SalesVoucherService salesVoucherService) {
        this.salesVoucherService = salesVoucherService;
    }

    @PostMapping
    public ResponseEntity<SalesVoucherDTO> create(@RequestBody SalesVoucherDTO dto) {
        SalesVoucherDTO created = salesVoucherService.createSalesVoucher(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalesVoucherDTO> update(@PathVariable Long id, @RequestBody SalesVoucherDTO dto) {
        SalesVoucherDTO updated = salesVoucherService.updateSalesVoucher(id, dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesVoucherDTO> get(@PathVariable Long id) {
        SalesVoucherDTO voucher = salesVoucherService.getSalesVoucher(id);
        return ResponseEntity.ok(voucher);
    }

    @GetMapping
    public ResponseEntity<List<SalesVoucherDTO>> getAll() {
        List<SalesVoucherDTO> list = salesVoucherService.getAllSalesVouchers();
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        salesVoucherService.deleteSalesVoucher(id);
        return ResponseEntity.noContent().build();
    }
}

