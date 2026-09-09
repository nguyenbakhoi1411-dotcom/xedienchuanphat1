package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.BranchDto;
import com.chuanphat.warranty.core.service.BranchService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/branches")
@PreAuthorize("hasAnyRole('ADMIN')")
public class BranchController {
    private final BranchService service;

    public BranchController(BranchService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('BRANCH_VIEW')")
    public PageResponse<BranchDto> list(@RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return service.list(keyword, page, pageSize);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('BRANCH_CREATE')")
    public BranchDto create(@Valid @RequestBody BranchDto request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('BRANCH_UPDATE')")
    public BranchDto update(@PathVariable Long id, @Valid @RequestBody BranchDto request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('BRANCH_DELETE')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

