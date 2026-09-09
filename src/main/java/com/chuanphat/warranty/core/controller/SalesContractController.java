package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.core.dto.SalesContractDTO;
import com.chuanphat.warranty.core.service.SalesContractService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/sales-contracts")
@PreAuthorize("hasAnyRole('ADMIN')")
public class SalesContractController {

    private final SalesContractService salesContractService;

    public SalesContractController(SalesContractService salesContractService) {
        this.salesContractService = salesContractService;
    }

    @PostMapping
    public ResponseEntity<SalesContractDTO> create(@RequestBody SalesContractDTO dto) {
        SalesContractDTO created = salesContractService.createContract(dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalesContractDTO> update(@PathVariable Long id, @RequestBody SalesContractDTO dto) {
        SalesContractDTO updated = salesContractService.updateContract(id, dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesContractDTO> get(@PathVariable Long id) {
        SalesContractDTO contract = salesContractService.getContract(id);
        return ResponseEntity.ok(contract);
    }

    @GetMapping
    public ResponseEntity<List<SalesContractDTO>> getAll() {
        List<SalesContractDTO> list = salesContractService.getAllContracts();
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        salesContractService.deleteContract(id);
        return ResponseEntity.noContent().build();
    }
}

