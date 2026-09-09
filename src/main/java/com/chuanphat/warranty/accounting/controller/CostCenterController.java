package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.CostCenterDto;
import com.chuanphat.warranty.accounting.dto.CostCenterRequest;
import com.chuanphat.warranty.accounting.service.CostCenterService;
import com.chuanphat.warranty.common.dto.PageResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounting/cost-centers")
@PreAuthorize("hasAnyRole('ADMIN')")
public class CostCenterController {

    private final CostCenterService service;

    public CostCenterController(CostCenterService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public PageResponse<CostCenterDto> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.list(keyword, page, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ACCOUNTING_EDIT')")
    public CostCenterDto create(@Valid @RequestBody CostCenterRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ACCOUNTING_EDIT')")
    public CostCenterDto update(@PathVariable Long id, @Valid @RequestBody CostCenterRequest req) {
        return service.update(id, req);
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('ACCOUNTING_EDIT')")
    public CostCenterDto deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }
}

