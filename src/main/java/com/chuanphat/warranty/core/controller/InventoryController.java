package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.InventoryExportRequest;
import com.chuanphat.warranty.core.dto.InventoryImportRequest;
import com.chuanphat.warranty.core.dto.InventoryStockDto;
import com.chuanphat.warranty.core.dto.InventoryStocktakeRequest;
import com.chuanphat.warranty.core.dto.InventoryTransactionDto;
import com.chuanphat.warranty.core.dto.InventoryTransferRequest;
import com.chuanphat.warranty.core.dto.WarehouseDto;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService service;

    public InventoryController(InventoryService service) {
        this.service = service;
    }

    @GetMapping("/stocks")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public PageResponse<InventoryStockDto> list(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        return service.list(branchId, warehouseId, page, pageSize);
    }

    @GetMapping("/warehouses")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public PageResponse<WarehouseDto> warehouses(
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int pageSize
    ) {
        return service.warehouses(branchId, page, pageSize);
    }

    @PutMapping("/stocks")
    @PreAuthorize("hasAuthority('INVENTORY_IMPORT')")
    public InventoryStockDto upsert(@Valid @RequestBody InventoryStockDto request) {
        return service.upsert(request);
    }

    @PostMapping("/import")
    @PreAuthorize("hasAuthority('INVENTORY_IMPORT')")
    public InventoryTransactionDto importStock(@Valid @RequestBody InventoryImportRequest request) {
        return service.importStock(request);
    }

    @PostMapping("/export")
    @PreAuthorize("hasAuthority('INVENTORY_EXPORT')")
    public InventoryTransactionDto exportStock(@Valid @RequestBody InventoryExportRequest request) {
        return service.exportStock(request);
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAuthority('INVENTORY_TRANSFER')")
    public void transfer(@Valid @RequestBody InventoryTransferRequest request) {
        service.transfer(request);
    }

    @PostMapping("/stocktake")
    @PreAuthorize("hasAuthority('INVENTORY_STOCKTAKE')")
    public InventoryTransactionDto stocktake(@Valid @RequestBody InventoryStocktakeRequest request) {
        return service.stocktake(request);
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public PageResponse<InventoryTransactionDto> transactions(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) InventoryTransactionType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        return service.transactions(branchId, type, page, pageSize);
    }
}
