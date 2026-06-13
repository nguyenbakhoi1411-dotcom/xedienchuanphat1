package com.chuanphat.warranty.auth.controller;

import com.chuanphat.warranty.auth.dto.PermissionDto;
import com.chuanphat.warranty.auth.service.UserAdminService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {
    private final UserAdminService service;

    public PermissionController(UserAdminService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_VIEW','MANAGE_PERMISSIONS')")
    public List<PermissionDto> list() {
        return service.permissions();
    }
}
