package com.chuanphat.warranty.auth.controller;

import com.chuanphat.warranty.auth.dto.UserAdminDto;
import com.chuanphat.warranty.auth.dto.UserAdminRequest;
import com.chuanphat.warranty.auth.dto.UserStatusRequest;
import com.chuanphat.warranty.auth.service.UserAdminService;
import com.chuanphat.warranty.common.dto.PageResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserAdminService service;

    public UserController(UserAdminService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public PageResponse<UserAdminDto> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return service.users(page, pageSize);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public UserAdminDto create(@Valid @RequestBody UserAdminRequest request) {
        return service.createUser(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public UserAdminDto update(@PathVariable Long id, @Valid @RequestBody UserAdminRequest request) {
        return service.updateUser(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public UserAdminDto updateStatus(@PathVariable Long id, @Valid @RequestBody UserStatusRequest request) {
        return service.updateStatus(id, request);
    }
}
