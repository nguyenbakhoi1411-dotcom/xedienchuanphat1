package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.SupplierDto;
import com.chuanphat.warranty.core.dto.SupplierRequest;
import com.chuanphat.warranty.core.entity.SupplierGroup;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.repository.SupplierGroupRepository;
import com.chuanphat.warranty.core.service.SupplierService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasAnyRole('ADMIN')")
public class SupplierController {

    private final SupplierService supplierService;
    private final SupplierGroupRepository groupRepo;

    public SupplierController(SupplierService supplierService,
                               SupplierGroupRepository groupRepo) {
        this.supplierService = supplierService;
        this.groupRepo       = groupRepo;
    }

    @GetMapping("/supplier-groups")
    public List<SupplierGroup> listGroups() {
        return groupRepo.findByStatusNot(RecordStatus.INACTIVE);
    }

    @GetMapping("/suppliers")
    public PageResponse<SupplierDto> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return supplierService.list(keyword, page, size);
    }

    /** Autocomplete — tra ve toi da 10 NCC khop voi q */
    @GetMapping("/suppliers/search")
    public List<SupplierDto> search(@RequestParam(required = false, defaultValue = "") String q) {
        return supplierService.search(q);
    }

    @GetMapping("/suppliers/{id}")
    public SupplierDto get(@PathVariable Long id) {
        return supplierService.get(id);
    }

    @PostMapping("/suppliers")
    @ResponseStatus(HttpStatus.CREATED)
    public SupplierDto create(@Valid @RequestBody SupplierRequest req) {
        return supplierService.create(req);
    }

    @PutMapping("/suppliers/{id}")
    public SupplierDto update(@PathVariable Long id, @Valid @RequestBody SupplierRequest req) {
        return supplierService.update(id, req);
    }

    @PostMapping("/suppliers/{id}/deactivate")
    public SupplierDto deactivate(@PathVariable Long id) {
        return supplierService.deactivate(id);
    }

    @PostMapping("/suppliers/{id}/activate")
    public SupplierDto activate(@PathVariable Long id) {
        return supplierService.activate(id);
    }
}

