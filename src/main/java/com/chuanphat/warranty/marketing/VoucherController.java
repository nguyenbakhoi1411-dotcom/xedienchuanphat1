package com.chuanphat.warranty.marketing;

import com.chuanphat.warranty.marketing.dto.VoucherRequest;
import com.chuanphat.warranty.marketing.dto.VoucherResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketing/vouchers")
@PreAuthorize("hasAnyRole('ADMIN')")
public class VoucherController {
    private final VoucherService service;

    public VoucherController(VoucherService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MARKETING_VIEW')")
    public List<VoucherResponse> list() {
        return service.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('MARKETING_CREATE')")
    public VoucherResponse create(@Valid @RequestBody VoucherRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MARKETING_UPDATE')")
    public VoucherResponse update(@PathVariable Long id, @Valid @RequestBody VoucherRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('MARKETING_UPDATE')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

